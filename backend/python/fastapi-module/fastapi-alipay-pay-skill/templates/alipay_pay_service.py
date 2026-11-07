"""
Alipay Pay Service Template
============================

复制到: services/alipay_pay_service.py

依赖:
    pip install python-alipay-sdk pycryptodome
"""
from decimal import Decimal
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from alipay import AliPay

from config import settings
from models import AlipayPayOrder, AlipayRefundOrder, PayStatus, RefundStatus, PayScene
from common.exceptions import BusinessException


class AlipayPayService:
    """支付宝服务（单实例复用，DB session 由调用方注入）"""

    def __init__(self, db: Session):
        self.db = db
        self._client: Optional[AliPay] = None

    def _get_client(self) -> AliPay:
        if self._client is None:
            self._client = AliPay(
                appid=settings.alipay_app_id,
                app_notify_url=settings.alipay_notify_url,
                app_private_key_string=settings.alipay_private_key,
                alipay_public_key_string=settings.alipay_public_key,
                sign_type=settings.alipay_sign_type,  # RSA2
                debug=settings.alipay_debug,
            )
        return self._client

    # ============== 统一下单 ==============

    def precreate(self, order_no: str, amount: Decimal, subject: str) -> str:
        """当面付 — 返回二维码内容"""
        if self.db.query(AlipayPayOrder).filter(AlipayPayOrder.order_no == order_no).first():
            raise BusinessException(-3004, "订单号已存在")
        try:
            qr_code = self._get_client().api_alipay_trade_precreate(
                out_trade_no=order_no,
                total_amount=str(amount),
                subject=subject,
                notify_url=settings.alipay_notify_url,
            )
        except Exception as e:
            raise BusinessException(-3001, f"当面付预创建失败: {e}")
        order = AlipayPayOrder(
            order_no=order_no, scene=PayScene.PRECREATE,
            amount=amount, subject=subject, qr_code=qr_code, status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()
        return qr_code

    def wap_pay(self, order_no: str, amount: Decimal, subject: str) -> str:
        """手机网站支付 — 返回 form HTML"""
        try:
            form_html = self._get_client().api_alipay_trade_wap_pay(
                out_trade_no=order_no, total_amount=str(amount), subject=subject,
                return_url=settings.alipay_return_url,
                notify_url=settings.alipay_notify_url,
                product_code="QUICK_WAP_WAY",
            )
        except Exception as e:
            raise BusinessException(-3001, f"WAP 支付失败: {e}")
        self._persist(order_no, PayScene.WAP, amount, subject)
        return form_html

    def page_pay(self, order_no: str, amount: Decimal, subject: str) -> str:
        """PC 网站支付 — 返回 form HTML"""
        try:
            form_html = self._get_client().api_alipay_trade_page_pay(
                out_trade_no=order_no, total_amount=str(amount), subject=subject,
                return_url=settings.alipay_return_url,
                notify_url=settings.alipay_notify_url,
            )
        except Exception as e:
            raise BusinessException(-3001, f"PC 支付失败: {e}")
        self._persist(order_no, PayScene.PAGE, amount, subject)
        return form_html

    def app_pay(self, order_no: str, amount: Decimal, subject: str) -> str:
        """App 支付 — 返回 orderStr"""
        try:
            order_str = self._get_client().api_alipay_trade_app_pay(
                out_trade_no=order_no, total_amount=str(amount), subject=subject,
                notify_url=settings.alipay_notify_url,
                product_code="QUICK_MSECURITY_PAY",
            )
        except Exception as e:
            raise BusinessException(-3001, f"App 支付失败: {e}")
        self._persist(order_no, PayScene.APP, amount, subject)
        return order_str

    def _persist(self, order_no: str, scene: PayScene, amount: Decimal, subject: str):
        if self.db.query(AlipayPayOrder).filter(AlipayPayOrder.order_no == order_no).first():
            raise BusinessException(-3004, "订单号已存在")
        order = AlipayPayOrder(
            order_no=order_no, scene=scene,
            amount=amount, subject=subject, status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()

    # ============== 退款 ==============

    def refund(self, order_no: str, refund_no: str, refund_amount: Decimal, reason: str = "") -> dict:
        order = self.db.query(AlipayPayOrder).filter(AlipayPayOrder.order_no == order_no).first()
        if not order:
            raise BusinessException(-3003, "原订单不存在")
        if order.status != PayStatus.PAID:
            raise BusinessException(-3005, "订单未支付")
        if refund_amount > order.amount:
            raise BusinessException(-3005, "退款金额超限")

        ro = AlipayRefundOrder(
            refund_no=refund_no, order_no=order_no,
            refund_amount=refund_amount, total_amount=order.amount,
            reason=reason, status=RefundStatus.PENDING,
        )
        self.db.add(ro)
        self.db.commit()

        try:
            result = self._get_client().api_alipay_trade_refund(
                out_trade_no=order_no,
                refund_amount=str(refund_amount),
                out_request_no=refund_no,
                refund_reason=reason,
            )
            if result.get("code") == "10000":
                return {"refundNo": refund_no, "status": "PROCESSING"}
            ro.status = RefundStatus.FAILED
            self.db.commit()
            raise BusinessException(-3005, f"退款失败: {result.get('sub_msg')}")
        except BusinessException:
            raise
        except Exception as e:
            ro.status = RefundStatus.FAILED
            self.db.commit()
            raise BusinessException(-3005, f"退款异常: {e}")

    # ============== 查询 / 关单 ==============

    def query_order(self, order_no: str) -> AlipayPayOrder:
        order = self.db.query(AlipayPayOrder).filter(AlipayPayOrder.order_no == order_no).first()
        if not order:
            raise BusinessException(-3003, "订单不存在")
        return order

    def close_order(self, order_no: str) -> None:
        order = self.db.query(AlipayPayOrder).filter(AlipayPayOrder.order_no == order_no).first()
        if not order:
            raise BusinessException(-3003, "订单不存在")
        try:
            result = self._get_client().api_alipay_trade_close(out_trade_no=order_no)
            if result.get("code") == "10000":
                order.status = PayStatus.CLOSED
                self.db.commit()
            else:
                raise BusinessException(-3006, f"关单失败: {result.get('sub_msg')}")
        except BusinessException:
            raise
        except Exception as e:
            raise BusinessException(-3006, f"关单异常: {e}")


# ponytail: -3001 下单 -3002 验签 -3003 订单不存在 -3004 重单 -3005 退款 -3006 关单 -3007 密钥错
