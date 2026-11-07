"""
WeChat Pay V3 Service Template
==============================

复制到: services/wechat_pay_service.py

依赖:
    pip install wechatpayv3-py cryptography httpx
"""
import time
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from wechatpayv3 import WechatPay, WechatPayType
from wechatpayv3.sign import sign as wechat_sign
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import load_pem_private_key

from config import settings
from models import WechatPayOrder, WechatRefundOrder, PayStatus, RefundStatus, PayScene
from common.exceptions import BusinessException


class WechatPayService:
    """微信支付 V3 服务（单实例复用，DB session 由调用方注入）"""

    def __init__(self, db: Session):
        self.db = db
        self._client: Optional[WechatPay] = None

    # ============== 客户端 ==============

    def _get_client(self) -> WechatPay:
        if self._client is None:
            with open(settings.wechat_private_key_path, "rb") as f:
                private_key = load_pem_private_key(f.read(), password=None)
            self._client = WechatPay(
                wechatpay_public_key_id=settings.wechat_api_cert_serial_no,
                wechatpay_public_key=settings.wechat_api_v3_key,  # SDK 会自动下载平台证书
                private_key=private_key,
                mchid=settings.wechat_mch_id,
                appid=settings.wechat_app_id,
                apiv3_key=settings.wechat_api_v3_key,
            )
        return self._client

    # ============== 统一下单 ==============

    async def create_jsapi_order(self, order_no: str, amount: int, description: str, openid: str) -> dict:
        if self.db.query(WechatPayOrder).filter(WechatPayOrder.order_no == order_no).first():
            raise BusinessException(-3004, "订单号已存在")

        body = {
            "appid": settings.wechat_app_id,
            "mchid": settings.wechat_mch_id,
            "description": description,
            "out_trade_no": order_no,
            "notify_url": settings.wechat_notify_url,
            "amount": {"total": amount, "currency": "CNY"},
            "payer": {"openid": openid},
        }
        try:
            client = self._get_client()
            prepay_id = client.pay.create(body, type_=WechatPayType.JSAPI)
        except Exception as e:
            raise BusinessException(-3001, f"JSAPI 下单失败: {e}")

        order = WechatPayOrder(
            order_no=order_no, scene=PayScene.JSAPI,
            amount=amount, description=description,
            openid=openid, prepay_id=prepay_id, status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()

        # 前端调起支付签名
        timestamp = int(time.time())
        nonce_str = uuid.uuid4().hex
        package = f"prepay_id={prepay_id}"
        with open(settings.wechat_private_key_path, "rb") as f:
            pk = load_pem_private_key(f.read(), password=None)
        sign_str = f"{settings.wechat_app_id}\n{timestamp}\n{nonce_str}\n{package}\n"
        signature = wechat_sign(sign_str.encode("utf-8"), pk)
        return {
            "prepayId": prepay_id, "timestamp": timestamp, "nonceStr": nonce_str,
            "package": package, "sign": signature, "signType": "RSA",
        }

    async def create_h5_order(self, order_no: str, amount: int, description: str, client_ip: str) -> str:
        body = {
            "appid": settings.wechat_app_id, "mchid": settings.wechat_mch_id,
            "description": description, "out_trade_no": order_no,
            "notify_url": settings.wechat_notify_url,
            "amount": {"total": amount, "currency": "CNY"},
            "scene_info": {"payer_client_ip": client_ip, "h5_info": {"type": "Wap"}},
        }
        try:
            client = self._get_client()
            h5_url = client.pay.create(body, type_=WechatPayType.H5)
        except Exception as e:
            raise BusinessException(-3001, f"H5 下单失败: {e}")

        order = WechatPayOrder(
            order_no=order_no, scene=PayScene.H5,
            amount=amount, description=description, status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()
        return h5_url

    async def create_native_order(self, order_no: str, amount: int, description: str) -> str:
        body = {
            "appid": settings.wechat_app_id, "mchid": settings.wechat_mch_id,
            "description": description, "out_trade_no": order_no,
            "notify_url": settings.wechat_notify_url,
            "amount": {"total": amount, "currency": "CNY"},
        }
        try:
            client = self._get_client()
            code_url = client.pay.create(body, type_=WechatPayType.NATIVE)
        except Exception as e:
            raise BusinessException(-3001, f"Native 下单失败: {e}")

        order = WechatPayOrder(
            order_no=order_no, scene=PayScene.NATIVE,
            amount=amount, description=description,
            code_url=code_url, status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()
        return code_url

    # ============== 退款 ==============

    async def refund(self, order_no: str, refund_no: str, refund_amount: int, reason: str) -> dict:
        order = self.db.query(WechatPayOrder).filter(WechatPayOrder.order_no == order_no).first()
        if not order:
            raise BusinessException(-3003, "原订单不存在")
        if order.status != PayStatus.PAID:
            raise BusinessException(-3005, "订单未支付")
        if refund_amount > order.amount:
            raise BusinessException(-3005, "退款金额超限")

        ro = WechatRefundOrder(
            refund_no=refund_no, order_no=order_no,
            refund_amount=refund_amount, total_amount=order.amount,
            reason=reason, status=RefundStatus.PENDING,
        )
        self.db.add(ro)
        self.db.commit()

        try:
            client = self._get_client()
            body = {
                "out_trade_no": order_no, "out_refund_no": refund_no,
                "reason": reason,
                "notify_url": settings.wechat_refund_notify_url or settings.wechat_notify_url,
                "amount": {"refund": refund_amount, "total": order.amount, "currency": "CNY"},
            }
            client.refund.create(body)
            return {"refundNo": refund_no, "status": "PROCESSING"}
        except Exception as e:
            ro.status = RefundStatus.FAILED
            self.db.commit()
            raise BusinessException(-3005, f"退款失败: {e}")

    # ============== 查询 / 关单 ==============

    async def query_order(self, order_no: str) -> WechatPayOrder:
        order = self.db.query(WechatPayOrder).filter(WechatPayOrder.order_no == order_no).first()
        if not order:
            raise BusinessException(-3003, "订单不存在")
        return order

    async def close_order(self, order_no: str) -> None:
        order = self.db.query(WechatPayOrder).filter(WechatPayOrder.order_no == order_no).first()
        if not order:
            raise BusinessException(-3003, "订单不存在")
        if order.status == PayStatus.PAID:
            raise BusinessException(-3006, "订单已支付，无法关闭")
        try:
            client = self._get_client()
            client.pay.close(order_no, settings.wechat_mch_id)
            order.status = PayStatus.CLOSED
            self.db.commit()
        except Exception as e:
            raise BusinessException(-3006, f"关单失败: {e}")


# ponytail: -3001 统一下单 -3002 验签 -3003 订单不存在 -3004 重单 -3005 退款失败 -3006 关单失败
