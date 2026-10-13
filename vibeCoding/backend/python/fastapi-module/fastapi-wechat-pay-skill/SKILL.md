---
name: fastapi-wechat-pay-skill
description: FastAPI 微信支付模块技能（独立版）。面向已有 FastAPI 项目，提供微信支付 V3 完整能力：JSAPI / 小程序 / H5 / Native / App 支付、退款、回调验签、订单查询、关单。**不包含支付宝**，如需支付宝请引入 fastapi-alipay-pay-skill。触发词："微信支付"、"JSAPI支付"、"小程序支付"、"H5支付"、"Native支付"、"App支付"、"微信退款"、"微信回调"、"wechat pay v3"、"商户号配置"。
---

# FastAPI WeChat Pay Module Skill

> 微信支付 V3（推荐）独立模块，**只覆盖微信渠道**。Python FastAPI 实现。

## 与合一版的关系

| Skill | 范围 | 推荐度 |
|-------|------|--------|
| `fastapi-wechat-pay-skill`（本） | 仅微信 V3 | ⭐⭐⭐⭐⭐ 单一渠道项目 |
| `fastapi-alipay-pay-skill` | 仅支付宝 | ⭐⭐⭐⭐⭐ 单一渠道项目 |
| `fastapi-payment-module-skill` | 微信+支付宝合一 | 旧版，**已不推荐** |

## 能力清单

| 能力 | 适用场景 | 接口 |
|------|----------|------|
| **JSAPI 支付** | 公众号 / 微信内 H5 | `POST /api/wechat-pay/jsapi` |
| **小程序支付** | 微信小程序 | `POST /api/wechat-pay/miniprogram` |
| **H5 支付** | 手机浏览器 | `POST /api/wechat-pay/h5` |
| **Native 支付** | PC 扫码 | `POST /api/wechat-pay/native` |
| **App 支付** | iOS / Android | `POST /api/wechat-pay/app` |
| **退款** | 全场景通用 | `POST /api/wechat-pay/refund` |
| **查询订单** | 全场景通用 | `GET /api/wechat-pay/query/{orderNo}` |
| **关单** | 全场景通用 | `POST /api/wechat-pay/close/{orderNo}` |
| **回调验签** | 全场景通用 | `POST /api/wechat-pay/notify` |

## 前置依赖

| 依赖 | 说明 |
|------|------|
| `fastapi-init-skill` | 项目骨架（**必须**） |
| `fastapi-auth-module-skill` | 当前用户获取（推荐） |
| `fastapi-redis-module-skill` | 幂等防重 + 限流（推荐） |

## 核心实现

### 1. 依赖

```bash
# 微信支付 V3 Python SDK
pip install wechatpayv3
# 或新版 wechatpayv3-py（推荐）
pip install wechatpayv3-py

# 异步 HTTP
pip install httpx
```

### 2. 配置（config.py）

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ====== 必填项：从商户平台获取 ======
    wechat_app_id: str = ""
    wechat_mch_id: str = ""

    # ====== V3 商户 API 证书 ======
    wechat_private_key_path: str = "/opt/secret/wechat/apiclient_key.pem"
    wechat_merchant_cert_path: str = "/opt/secret/wechat/apiclient_cert.pem"
    wechat_api_cert_serial_no: str = ""

    # ====== APIv3 密钥（32 位字符串） ======
    wechat_api_v3_key: str = ""

    # ====== 回调地址 ======
    wechat_notify_url: str = "https://yourdomain.com/api/wechat-pay/notify"
    wechat_refund_notify_url: str = ""

    class Config:
        env_prefix = ""  # 已在 .env 中加 WECHAT_ 前缀

settings = Settings()
```

### 3. 数据模型（models.py）

```python
import enum
from sqlalchemy import Column, BigInteger, String, Integer, DateTime, Enum as SQLEnum, Text
from sqlalchemy.sql import func
from database import Base


class PayScene(str, enum.Enum):
    JSAPI = "JSAPI"
    MINI_PROGRAM = "MINI_PROGRAM"
    H5 = "H5"
    NATIVE = "NATIVE"
    APP = "APP"


class PayStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    CLOSED = "CLOSED"
    REFUNDED = "REFUNDED"


class RefundStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class WechatPayOrder(Base):
    __tablename__ = "wg_wechat_pay_order"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_no = Column(String(64), unique=True, nullable=False, index=True)
    transaction_id = Column(String(64))
    scene = Column(SQLEnum(PayScene))
    status = Column(SQLEnum(PayStatus), default=PayStatus.PENDING)
    amount = Column(BigInteger, nullable=False, comment="金额（分）")
    description = Column(String(200))
    openid = Column(String(100))
    prepay_id = Column(String(100))
    code_url = Column(Text)
    paid_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class WechatRefundOrder(Base):
    __tablename__ = "wg_wechat_refund_order"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    refund_no = Column(String(64), unique=True, nullable=False)
    order_no = Column(String(64), nullable=False, index=True)
    refund_id = Column(String(64))
    refund_amount = Column(BigInteger, nullable=False, comment="金额（分）")
    total_amount = Column(BigInteger, nullable=False)
    status = Column(SQLEnum(RefundStatus), default=RefundStatus.PENDING)
    reason = Column(String(200))
    refunded_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
```

### 4. 服务层（核心）

```python
# services/wechat_pay_service.py
import time
import uuid
import httpx
from typing import Optional
from datetime import datetime
from wechatpayv3 import WechatPay, WechatPayType
from cryptography.hazmat.primitives import serialization
from wechatpayv3.sign import sign as wechat_sign

from config import settings
from models import WechatPayOrder, WechatRefundOrder, PayStatus, RefundStatus, PayScene
from schemas.wechat_pay import (
    JsapiPayRequest, JsapiPayResponse,
    H5PayResponse, NativePayResponse,
    RefundRequest, RefundResponse
)
from common.exceptions import BusinessException


class WechatPayService:
    def __init__(self, db):
        self.db = db
        # 加载商户私钥（PEM 格式）
        with open(settings.wechat_private_key_path, "rb") as f:
            self.private_key = serialization.load_pem_private_key(f.read(), password=None)
        # 加载商户证书序列号
        self.merchant_cert_serial = settings.wechat_api_cert_serial_no

    def _get_client(self, type_: WechatPayType = WechatPayType.JSAPI) -> WechatPay:
        return WechatPay(
            wechatpay_public_key_id=settings.wechat_api_cert_serial_no,
            wechatpay_public_key=settings.wechat_api_v3_key,  # 实际用 platform cert
            private_key=self.private_key,
            mchid=settings.wechat_mch_id,
            appid=settings.wechat_app_id,
            apiv3_key=settings.wechat_api_v3_key,
        )

    # ============== 统一下单 ==============

    async def create_jsapi_order(self, req: JsapiPayRequest) -> JsapiPayResponse:
        # 1. 幂等检查
        existing = self.db.query(WechatPayOrder).filter(
            WechatPayOrder.order_no == req.order_no
        ).first()
        if existing:
            raise BusinessException(-3004, "订单号已存在")

        # 2. 构造下单参数
        body = {
            "appid": settings.wechat_app_id,
            "mchid": settings.wechat_mch_id,
            "description": req.description,
            "out_trade_no": req.order_no,
            "notify_url": settings.wechat_notify_url,
            "amount": {"total": req.amount, "currency": "CNY"},
            "payer": {"openid": req.openid},
        }

        # 3. 调用微信
        try:
            client = self._get_client(WechatPayType.JSAPI)
            prepay_id = client.pay.create(body, type_=WechatPayType.JSAPI)
        except Exception as e:
            raise BusinessException(-3001, f"JSAPI 统一下单失败: {e}")

        # 4. 持久化
        order = WechatPayOrder(
            order_no=req.order_no,
            scene=PayScene.JSAPI,
            amount=req.amount,
            description=req.description,
            openid=req.openid,
            prepay_id=prepay_id,
            status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()

        # 5. 构造前端调起参数
        timestamp = int(time.time())
        nonce_str = uuid.uuid4().hex
        package = f"prepay_id={prepay_id}"
        sign_str = f"{settings.wechat_app_id}\n{timestamp}\n{nonce_str}\n{package}\n"
        signature = wechat_sign(sign_str.encode("utf-8"), self.private_key)

        return JsapiPayResponse(
            prepay_id=prepay_id,
            timestamp=timestamp,
            nonce_str=nonce_str,
            package=package,
            sign=signature,
            sign_type="RSA",
        )

    async def create_h5_order(self, req) -> H5PayResponse:
        body = {
            "appid": settings.wechat_app_id,
            "mchid": settings.wechat_mch_id,
            "description": req.description,
            "out_trade_no": req.order_no,
            "notify_url": settings.wechat_notify_url,
            "amount": {"total": req.amount, "currency": "CNY"},
            "scene_info": {
                "payer_client_ip": req.client_ip,
                "h5_info": {"type": "Wap"},
            },
        }
        try:
            client = self._get_client()
            h5_url = client.pay.create(body, type_=WechatPayType.H5)
        except Exception as e:
            raise BusinessException(-3001, f"H5 下单失败: {e}")

        order = WechatPayOrder(
            order_no=req.order_no, scene=PayScene.H5,
            amount=req.amount, description=req.description,
            status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()
        return H5PayResponse(h5_url=h5_url)

    async def create_native_order(self, req) -> NativePayResponse:
        body = {
            "appid": settings.wechat_app_id,
            "mchid": settings.wechat_mch_id,
            "description": req.description,
            "out_trade_no": req.order_no,
            "notify_url": settings.wechat_notify_url,
            "amount": {"total": req.amount, "currency": "CNY"},
        }
        try:
            client = self._get_client()
            code_url = client.pay.create(body, type_=WechatPayType.NATIVE)
        except Exception as e:
            raise BusinessException(-3001, f"Native 下单失败: {e}")

        order = WechatPayOrder(
            order_no=req.order_no, scene=PayScene.NATIVE,
            amount=req.amount, description=req.description,
            code_url=code_url, status=PayStatus.PENDING,
        )
        self.db.add(order)
        self.db.commit()
        return NativePayResponse(code_url=code_url)

    # ============== 退款 ==============

    async def refund(self, req: RefundRequest) -> RefundResponse:
        order = self.db.query(WechatPayOrder).filter(
            WechatPayOrder.order_no == req.order_no
        ).first()
        if not order:
            raise BusinessException(-3003, "原订单不存在")
        if order.status != PayStatus.PAID:
            raise BusinessException(-3005, "订单未支付，无法退款")
        if req.refund_amount > order.amount:
            raise BusinessException(-3005, "退款金额超限")

        refund_order = WechatRefundOrder(
            refund_no=req.refund_no,
            order_no=req.order_no,
            refund_amount=req.refund_amount,
            total_amount=order.amount,
            reason=req.reason,
            status=RefundStatus.PENDING,
        )
        self.db.add(refund_order)
        self.db.commit()

        try:
            client = self._get_client()
            body = {
                "out_trade_no": req.order_no,
                "out_refund_no": req.refund_no,
                "reason": req.reason,
                "notify_url": settings.wechat_refund_notify_url or settings.wechat_notify_url,
                "amount": {
                    "refund": req.refund_amount,
                    "total": order.amount,
                    "currency": "CNY",
                },
            }
            client.refund.create(body)
            return RefundResponse(refund_no=req.refund_no, status="PROCESSING")
        except Exception as e:
            refund_order.status = RefundStatus.FAILED
            self.db.commit()
            raise BusinessException(-3005, f"退款失败: {e}")

    # ============== 查询 / 关单 ==============

    async def query_order(self, order_no: str) -> WechatPayOrder:
        order = self.db.query(WechatPayOrder).filter(
            WechatPayOrder.order_no == order_no
        ).first()
        if not order:
            raise BusinessException(-3003, "订单不存在")
        return order

    async def close_order(self, order_no: str):
        order = self.db.query(WechatPayOrder).filter(
            WechatPayOrder.order_no == order_no
        ).first()
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
```

### 5. 路由（routers/wechat_pay.py）

```python
from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from services.wechat_pay_service import WechatPayService
from schemas.wechat_pay import *
from common.response import ApiResponse

router = APIRouter(prefix="/api/wechat-pay", tags=["微信支付"])


@router.post("/jsapi", response_model=ApiResponse[JsapiPayResponse])
async def create_jsapi(req: JsapiPayRequest, db: Session = Depends(get_db)):
    svc = WechatPayService(db)
    return ApiResponse.ok(await svc.create_jsapi_order(req))


@router.post("/miniprogram")
async def create_miniprogram(req: JsapiPayRequest, db: Session = Depends(get_db)):
    svc = WechatPayService(db)
    return ApiResponse.ok(await svc.create_jsapi_order(req))


@router.post("/h5")
async def create_h5(req: H5PayRequest, db: Session = Depends(get_db)):
    svc = WechatPayService(db)
    return ApiResponse.ok(await svc.create_h5_order(req))


@router.post("/native")
async def create_native(req: NativePayRequest, db: Session = Depends(get_db)):
    svc = WechatPayService(db)
    return ApiResponse.ok(await svc.create_native_order(req))


@router.post("/refund")
async def refund(req: RefundRequest, db: Session = Depends(get_db)):
    svc = WechatPayService(db)
    return ApiResponse.ok(await svc.refund(req))


@router.get("/query/{order_no}")
async def query(order_no: str, db: Session = Depends(get_db)):
    svc = WechatPayService(db)
    return ApiResponse.ok(await svc.query_order(order_no))


@router.post("/close/{order_no}")
async def close(order_no: str, db: Session = Depends(get_db)):
    svc = WechatPayService(db)
    await svc.close_order(order_no)
    return ApiResponse.ok()


@router.post("/notify")
async def notify(
    request: Request,
    wechatpay_timestamp: str = Header(...),
    wechatpay_nonce: str = Header(...),
    wechatpay_serial: str = Header(...),
    wechatpay_signature: str = Header(...),
    db: Session = Depends(get_db),
):
    """支付回调"""
    from wechatpayv3.notify import WechatPayNotify
    body = (await request.body()).decode("utf-8")

    try:
        # SDK 验签 + 解密
        notify = WechatPayNotify(settings.wechat_api_v3_key)
        decrypted = notify.parse(
            wechatpay_timestamp, wechatpay_nonce, body, wechatpay_signature, wechatpay_serial
        )
    except Exception as e:
        return {"code": "FAIL", "message": str(e)}

    order_no = decrypted.get("out_trade_no")
    transaction_id = decrypted.get("transaction_id")
    trade_state = decrypted.get("trade_state")

    order = db.query(WechatPayOrder).filter(WechatPayOrder.order_no == order_no).first()
    if order:
        if trade_state == "SUCCESS":
            order.status = PayStatus.PAID
            order.transaction_id = transaction_id
            order.paid_at = datetime.now()
        elif trade_state == "REFUND":
            order.status = PayStatus.REFUNDED
        db.commit()

    return {"code": "SUCCESS", "message": "成功"}
```

## 数据库迁移（Alembic 示例）

```python
# alembic/versions/001_create_wechat_pay.py
def upgrade():
    op.create_table(
        "wg_wechat_pay_order",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("order_no", sa.String(64), unique=True, nullable=False),
        sa.Column("transaction_id", sa.String(64)),
        sa.Column("scene", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="PENDING"),
        sa.Column("amount", sa.BigInteger, nullable=False, comment="金额（分）"),
        sa.Column("description", sa.String(200)),
        sa.Column("openid", sa.String(100)),
        sa.Column("prepay_id", sa.String(100)),
        sa.Column("code_url", sa.Text),
        sa.Column("paid_at", sa.DateTime),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("idx_status", "wg_wechat_pay_order", ["status"])
    # ... 退款表类似
```

## 关键踩坑

| 坑 | 现象 | 解决 |
|---|------|------|
| 私钥加载失败 | `ValueError: Could not deserialize key data` | 私钥必须是 PEM PKCS8 格式 |
| 平台证书验证失败 | `wechatpayv3` 初始化报错 | 用 `AutoUpdateCertificatesVerifier` 自动下载 |
| 回调验签失败 | 验签 API 抛异常 | 检查 apiv3_key 是否正确 |
| Native 返回的 code_url 是 weixin://... | 前端用 qrcode.js 转换 | 正常现象 |
| 沙箱环境 | 用正式 mch_id 报错 | 测试用沙箱 API 地址 |

## 不做

- ❌ 商户号开通（参考 [merchant-onboarding.md](references/merchant-onboarding.md)）
- ❌ 证书申请（参考同上）
- ❌ UI 组件
- ❌ 支付宝（独立 skill）

## 触发场景

用户说以下任一句即触发本 skill：
- 「帮我加微信支付（Python 版）」
- 「FastAPI 集成 JSAPI / 小程序 / H5 支付」
- 「做微信退款」
- 「配置微信商户号」
