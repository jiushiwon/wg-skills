---
name: fastapi-alipay-pay-skill
description: FastAPI 支付宝模块技能（独立版）。面向已有 FastAPI 项目，提供支付宝完整能力：当面付/扫码、手机网站支付（WAP）、PC 网站支付、App 支付、退款、回调验签、订单查询、关单。**不包含微信支付**，如需微信请引入 fastapi-wechat-pay-skill。触发词："支付宝"、"当面付"、"扫码支付"、"手机网站支付"、"WAP支付"、"PC支付"、"APP支付"、"支付宝退款"、"支付宝回调"、"alipay"、"RSA2验签"。
---

# FastAPI Alipay Module Skill

> 支付宝独立模块，**只覆盖支付宝渠道**。Python FastAPI 实现。

## 与合一版的关系

| Skill | 范围 | 推荐度 |
|-------|------|--------|
| `fastapi-alipay-pay-skill`（本） | 仅支付宝 | ⭐⭐⭐⭐⭐ 单一渠道 |
| `fastapi-wechat-pay-skill` | 仅微信 V3 | ⭐⭐⭐⭐⭐ 单一渠道 |
| `fastapi-payment-module-skill` | 微信+支付宝合一 | 旧版，**已不推荐** |

## 能力清单

| 能力 | 适用场景 | 接口 |
|------|----------|------|
| **当面付** | 线下扫码 / 收银台 | `POST /api/alipay/precreate` |
| **手机网站支付** | 移动端浏览器 H5 | `POST /api/alipay/wap` |
| **PC 网站支付** | PC 浏览器 | `POST /api/alipay/page` |
| **App 支付** | iOS / Android App | `POST /api/alipay/app` |
| **退款** | 全场景通用 | `POST /api/alipay/refund` |
| **查询订单** | 全场景通用 | `GET /api/alipay/query/{order_no}` |
| **关单** | 全场景通用 | `POST /api/alipay/close/{order_no}` |
| **对账单下载** | 财务对账 | `GET /api/alipay/bill` |
| **回调验签** | 全场景通用 | `POST /api/alipay/notify` |

## 前置依赖

| 依赖 | 说明 |
|------|------|
| `fastapi-init-skill` | 项目骨架（**必须**） |
| `fastapi-auth-module-skill` | 当前用户获取（推荐） |
| `python-redis-module-skill` | 幂等防重 + 限流（推荐） |

## 核心实现

### 1. 依赖

```bash
# 支付宝官方 Python SDK
pip install python-alipay-sdk

# 或新版 pycryptodome（签名需要）
pip install pycryptodome
```

### 2. 配置（config.py）

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ====== 必填项：从开放平台获取 ======
    alipay_app_id: str = "2021000000000000"           # 16 位 APPID
    alipay_private_key: str = ""                       # 应用私钥（PEM PKCS8，含 BEGIN/END 头）
    alipay_public_key: str = ""                        # 支付宝公钥（**不是应用公钥**）

    # ====== 业务地址 ======
    alipay_gateway: str = "https://openapi.alipay.com/gateway.do"
    alipay_sandbox_gateway: str = "https://openapi.alipaydev.com/gateway.do"
    alipay_notify_url: str = "https://yourdomain.com/api/alipay/notify"
    alipay_return_url: str = "https://yourdomain.com/pay/return"

    # ====== 可选 ======
    alipay_sign_type: str = "RSA2"                     # 固定 RSA2
    alipay_charset: str = "UTF-8"
    alipay_format: str = "json"
    alipay_debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

### 3. 数据模型（models.py）

```python
import enum
from sqlalchemy import Column, BigInteger, String, DateTime, Enum as SQLEnum, Numeric, Text
from sqlalchemy.sql import func
from database import Base


class PayScene(str, enum.Enum):
    PRECREATE = "PRECREATE"   # 当面付
    WAP = "WAP"               # 手机网站
    PAGE = "PAGE"             # PC 网站
    APP = "APP"               # App 支付


class PayStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    CLOSED = "CLOSED"
    REFUNDED = "REFUNDED"


class RefundStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class AlipayPayOrder(Base):
    __tablename__ = "wg_alipay_pay_order"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_no = Column(String(64), unique=True, nullable=False, index=True)
    trade_no = Column(String(64), comment="支付宝交易号")
    scene = Column(SQLEnum(PayScene))
    status = Column(SQLEnum(PayStatus), default=PayStatus.PENDING)
    # 金额单位：元（BigDecimal 对应 Python Decimal / Numeric）
    amount = Column(Numeric(10, 2), nullable=False)
    subject = Column(String(200))
    qr_code = Column(Text, comment="当面付二维码内容")
    paid_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class AlipayRefundOrder(Base):
    __tablename__ = "wg_alipay_refund_order"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    refund_no = Column(String(64), unique=True, nullable=False)
    order_no = Column(String(64), nullable=False, index=True)
    refund_id = Column(String(64), comment="支付宝退款单号")
    refund_amount = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(SQLEnum(RefundStatus), default=RefundStatus.PENDING)
    reason = Column(String(200))
    refunded_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
```

### 4. 服务层（核心）

```python
# services/alipay_pay_service.py
from decimal import Decimal
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from alipay import AliPay

from config import settings
from models import AlipayPayOrder, AlipayRefundOrder, PayStatus, RefundStatus, PayScene
from common.exceptions import BusinessException


class AlipayPayService:
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
        """当面付（生成二维码）"""
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
            amount=amount, subject=subject,
            qr_code=qr_code, status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()
        return qr_code

    def wap_pay(self, order_no: str, amount: Decimal, subject: str) -> str:
        """手机网站支付（返回 form HTML）"""
        try:
            form_html = self._get_client().api_alipay_trade_wap_pay(
                out_trade_no=order_no,
                total_amount=str(amount),
                subject=subject,
                return_url=settings.alipay_return_url,
                notify_url=settings.alipay_notify_url,
                product_code="QUICK_WAP_WAY",
            )
        except Exception as e:
            raise BusinessException(-3001, f"WAP 支付失败: {e}")

        self._persist(order_no, PayScene.WAP, amount, subject)
        return form_html

    def page_pay(self, order_no: str, amount: Decimal, subject: str) -> str:
        """PC 网站支付（返回 form HTML，浏览器自动跳转）"""
        try:
            form_html = self._get_client().api_alipay_trade_page_pay(
                out_trade_no=order_no,
                total_amount=str(amount),
                subject=subject,
                return_url=settings.alipay_return_url,
                notify_url=settings.alipay_notify_url,
            )
        except Exception as e:
            raise BusinessException(-3001, f"PC 支付失败: {e}")

        self._persist(order_no, PayScene.PAGE, amount, subject)
        return form_html

    def app_pay(self, order_no: str, amount: Decimal, subject: str) -> str:
        """App 支付（返回 orderStr，App 端用 SDK 调起）"""
        try:
            order_str = self._get_client().api_alipay_trade_app_pay(
                out_trade_no=order_no,
                total_amount=str(amount),
                subject=subject,
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
            result = self._get_client().api_alipay_trade_close(
                out_trade_no=order_no,
            )
            if result.get("code") == "10000":
                order.status = PayStatus.CLOSED
                self.db.commit()
            else:
                raise BusinessException(-3006, f"关单失败: {result.get('sub_msg')}")
        except BusinessException:
            raise
        except Exception as e:
            raise BusinessException(-3006, f"关单异常: {e}")
```

### 5. 路由

```python
# routers/alipay_pay.py
from decimal import Decimal
from fastapi import APIRouter, Depends, Request, Form
from sqlalchemy.orm import Session

from database import get_db
from services.alipay_pay_service import AlipayPayService
from common.response import ApiResponse

router = APIRouter(prefix="/api/alipay", tags=["支付宝"])


@router.post("/precreate")
def precreate(order_no: str, amount: Decimal, subject: str, db: Session = Depends(get_db)):
    qr_code = AlipayPayService(db).precreate(order_no, amount, subject)
    return ApiResponse.ok({"qrCode": qr_code})


@router.post("/wap")
def wap(order_no: str, amount: Decimal, subject: str, db: Session = Depends(get_db)):
    html = AlipayPayService(db).wap_pay(order_no, amount, subject)
    return ApiResponse.ok({"formHtml": html})


@router.post("/page")
def page(order_no: str, amount: Decimal, subject: str, db: Session = Depends(get_db)):
    html = AlipayPayService(db).page_pay(order_no, amount, subject)
    return ApiResponse.ok({"formHtml": html})


@router.post("/app")
def app(order_no: str, amount: Decimal, subject: str, db: Session = Depends(get_db)):
    order_str = AlipayPayService(db).app_pay(order_no, amount, subject)
    return ApiResponse.ok({"orderStr": order_str})


@router.post("/refund")
def refund(order_no: str, refund_no: str, refund_amount: Decimal, reason: str = "", db: Session = Depends(get_db)):
    return ApiResponse.ok(AlipayPayService(db).refund(order_no, refund_no, refund_amount, reason))


@router.get("/query/{order_no}")
def query(order_no: str, db: Session = Depends(get_db)):
    return ApiResponse.ok(AlipayPayService(db).query_order(order_no))


@router.post("/close/{order_no}")
def close(order_no: str, db: Session = Depends(get_db)):
    AlipayPayService(db).close_order(order_no)
    return ApiResponse.ok()


@router.post("/notify")
async def notify(request: Request, db: Session = Depends(get_db)):
    """支付宝回调（form 表单 POST）"""
    from config import settings
    form = await request.form()
    data = dict(form)

    # 验签（SDK 内部完成）
    from alipay import AliPay
    alipay = AliPay(
        appid=settings.alipay_app_id,
        app_notify_url=None,
        app_private_key_string=settings.alipay_private_key,
        alipay_public_key_string=settings.alipay_public_key,
        sign_type=settings.alipay_sign_type,
    )

    if not alipay.verify(data, data.pop("sign")):
        # 验签失败返回 fail
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse("fail", status_code=400)

    order_no = data.get("out_trade_no")
    trade_no = data.get("trade_no")
    trade_status = data.get("trade_status")

    order = db.query(AlipayPayOrder).filter(AlipayPayOrder.order_no == order_no).first()
    if order:
        if trade_status in ("TRADE_SUCCESS", "TRADE_FINISHED"):
            order.status = PayStatus.PAID
            order.trade_no = trade_no
            order.paid_at = datetime.now()
        elif trade_status == "TRADE_CLOSED":
            order.status = PayStatus.CLOSED
        db.commit()

    # 必须返回纯文本 "success"（小写无空格）
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse("success")
```

## 关键踩坑

| 坑 | 现象 | 解决 |
|---|------|------|
| 验签失败 | 回调报 INVALID_SIGN | 用的是**应用公钥**，换成**支付宝公钥** |
| App 支付无反应 | 报 INVALID_PARAMETER | `product_code` 必须填 `QUICK_MSECURITY_PAY` |
| 私钥格式错 | `ValueError: Could not deserialize` | 必须 PKCS8（PEM 头是 `-----BEGIN PRIVATE KEY-----`） |
| 当面付返回的 code_url 不到账 | 没有扫码 | 买家账号必须**用沙箱 App**登录 |
| 沙箱 404 | 网关用错 | 沙箱用 `openapi.alipaydev.com` |
| Decimal 精度 | 0.1 + 0.2 = 0.30000000000004 | 用 `Decimal(str(amount))` 不用 `float` |

## 不做

- ❌ 商户号开通（参考 [merchant-onboarding.md](references/merchant-onboarding.md)）
- ❌ 密钥生成（参考同上）
- ❌ UI 组件
- ❌ 微信支付（独立 skill）

## 触发场景

- 「帮我加支付宝（Python 版）」
- 「FastAPI 集成当面付 / WAP / App 支付」
- 「做支付宝退款」
- 「配置支付宝 RSA2 签名」
