---
name: fastapi-payment-module-skill
description: Python FastAPI 支付模块技能。面向已有 FastAPI 项目的开发者，提供微信支付、支付宝支付、退款、回调通知、对账等能力的快速集成。触发词："微信支付"、"支付宝支付"、"支付模块"、"退款"、"回调通知"、"对账"、"payment module"、"wechat pay"、"alipay"、"refund"。
---

# FastAPI Payment Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成支付能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **微信支付** | JSAPI/小程序/H5/App 支付 |
| **支付宝支付** | wap/PC/App 支付 |
| **退款** | 退款申请/查询/回调 |
| **回调通知** | 异步通知验签 |
| **对账** | 账单下载/核对 |

## 触发场景

用户说"帮我加支付"或"集成微信/支付宝"时触发。

## 核心实现

### 依赖配置

```bash
# 微信支付
pip install wechatpayv3

# 支付宝
pip install alipay-sdk-python

# 异步HTTP
pip install httpx
```

### 配置

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 微信支付
    wechat_app_id: str = ""
    wechat_mch_id: str = ""
    wechat_api_key: str = ""
    wechat_cert_path: str = ""
    wechat_notify_url: str = ""
    
    # 支付宝
    alipay_app_id: str = ""
    alipay_private_key: str = ""
    alipay_public_key: str = ""
    alipay_notify_url: str = ""
    alipay_return_url: str = ""

settings = Settings()
```

### 数据模型

```python
# models.py
from sqlalchemy import Column, BigInteger, String, Numeric, Integer, DateTime, Enum as SQLEnum, Text
from sqlalchemy.sql import func
from database import Base
import enum

class PayType(str, enum.Enum):
    WECHAT = "wechat"
    ALIPAY = "alipay"

class PayStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    CLOSED = "closed"

class RefundStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

class PayOrder(Base):
    __tablename__ = "wg_pay_order"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_no = Column(String(64), unique=True, nullable=False, index=True)
    pay_order_no = Column(String(64), index=True)
    pay_type = Column(SQLEnum(PayType))
    status = Column(SQLEnum(PayStatus), default=PayStatus.PENDING)
    amount = Column(Numeric(10, 2), nullable=False)
    subject = Column(String(200))
    body = Column(String(500))
    notify_url = Column(String(500))
    return_url = Column(String(500))
    user_id = Column(String(50), index=True)
    openid = Column(String(100))
    paid_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class RefundOrder(Base):
    __tablename__ = "wg_refund_order"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    refund_no = Column(String(64), unique=True, nullable=False)
    pay_order_no = Column(String(64), index=True)
    refund_id = Column(String(64))
    refund_amount = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(SQLEnum(RefundStatus), default=RefundStatus.PENDING)
    reason = Column(String(200))
    refunded_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
```

### 服务层

```python
# services/wechat_pay_service.py
import hashlib
import hmac
import json
import time
import urllib.parse
from WeChatPay import WeChatPay, WeChatPayType
import httpx

class WechatPayService:
    def __init__(self):
        self.app_id = settings.wechat_app_id
        self.mch_id = settings.wechat_mch_id
        self.api_key = settings.wechat_api_key
        self.notify_url = settings.wechat_notify_url
    
    # 统一下单
    async def create_order(self, order: PayOrder) -> dict:
        url = "https://api.mch.weixin.qq.com/pay/unifiedorder"
        
        params = {
            "appid": self.app_id,
            "mch_id": self.mch_id,
            "nonce_str": self._generate_nonce(),
            "body": order.subject,
            "out_trade_no": order.order_no,
            "total_fee": int(order.amount * 100),
            "spbill_create_ip": "127.0.0.1",
            "notify_url": self.notify_url,
            "trade_type": "JSAPI",
            "openid": order.openid
        }
        
        params["sign"] = self._generate_sign(params)
        xml = self._dict_to_xml(params)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, content=xml)
            result = self._xml_to_dict(response.text)
        
        if result.get("return_code") == "SUCCESS":
            return {
                "prepay_id": result.get("prepay_id"),
                "nonce": self._generate_nonce(),
                "timestamp": str(int(time.time()))
            }
        raise Exception(result.get("return_msg"))
    
    # 回调验签
    async def verify_notify(self, data: dict) -> bool:
        sign = data.pop("sign")
        calculated_sign = self._generate_sign(data)
        return sign == calculated_sign
    
    # 生成签名
    def _generate_sign(self, params: dict) -> str:
        sorted_params = sorted(params.items(), key=lambda x: x[0])
        sign_str = "&".join([f"{k}={v}" for k, v in sorted_params if v])
        sign_str += f"&key={self.api_key}"
        return hashlib.md5(sign_str.encode()).hexdigest().upper()
    
    def _generate_nonce(self) -> str:
        return hashlib.md5(str(time.time()).encode()).hexdigest()
    
    def _dict_to_xml(self, params: dict) -> str:
        return "<xml>" + "".join([f"<{k}><![CDATA[{v}]]></{k>" for k, v in params.items()]) + "</xml>"
    
    def _xml_to_dict(self, xml: str) -> dict:
        import xml.etree.ElementTree as ET
        root = ET.fromstring(xml)
        return {child.tag: child.text for child in root}

# services/alipay_service.py
from alipay import Alipay, AlipayConfig

class AlipayService:
    def __init__(self):
        self.app_id = settings.alipay_app_id
        self.private_key = settings.alipay_private_key
        self.alipay_public_key = settings.alipay_public_key
        self.notify_url = settings.alipay_notify_url
        self.return_url = settings.alipay_return_url
    
    def get_alipay(self):
        config = AlipayConfig(
            app_id=self.app_id,
            app_private_key=self.private_key,
            alipay_public_key=self.alipay_public_key,
        )
        return Alipay(config=config)
    
    # 统一下单
    async def create_order(self, order: PayOrder) -> str:
        alipay = self.get_alipay()
        
        biz_content = {
            "out_trade_no": order.order_no,
            "total_amount": float(order.amount),
            "subject": order.subject,
            "product_code": "FAST_INSTANT_TRADE_PAY"
        }
        
        if order.return_url:
            biz_content["return_url"] = self.return_url
        
        # 生成支付链接
        url = alipay.client.alipay.trade.page.pay(
            biz_content=biz_content,
            return_url=self.return_url,
            notify_url=self.notify_url
        )
        
        return url
    
    # 验签
    def verify_notify(self, data: dict) -> bool:
        from alipay.utils import AliPayChecker
        checker = AliPayChecker(
            alipay_public_key=self.alipay_public_key
        )
        return checker.check(data)
```

### API 路由

```python
# routers/payment.py
from fastapi import APIRouter, Request, BackgroundTasks

router = APIRouter(prefix="/api/pay", tags=["支付"])

@router.post("/wechat/create")
async def create_wechat_order(order: PayOrderCreate):
    order.pay_type = PayType.WECHAT
    order.status = PayStatus.PENDING
    db.add(order)
    db.commit()
    
    result = await wechat_pay_service.create_order(order)
    return ApiResponse.ok(result)

@router.post("/alipay/create")
async def create_alipay_order(order: PayOrderCreate):
    order.pay_type = PayType.ALIPAY
    order.status = PayStatus.PENDING
    db.add(order)
    db.commit()
    
    url = await alipay_service.create_order(order)
    return ApiResponse.ok(url)

@router.post("/wechat/notify")
async def wechat_notify(request: Request, background_tasks: BackgroundTasks):
    data = await request.form()
    data = dict(data)
    
    if await wechat_pay_service.verify_notify(data):
        order_no = data.get("out_trade_no")
        # 更新订单状态
        order = db.query(PayOrder).filter(PayOrder.order_no == order_no).first()
        if order:
            order.status = PayStatus.PAID
            order.paid_at = datetime.now()
            order.pay_order_no = data.get("transaction_id")
            db.commit()
    
    return "<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>"

@router.post("/alipay/notify")
async def alipay_notify(request: Request):
    data = await request.form()
    data = dict(data)
    
    if alipay_service.verify_notify(data):
        order_no = data.get("out_trade_no")
        # 更新订单状态
        order = db.query(PayOrder).filter(PayOrder.order_no == order_no).first()
        if order:
            order.status = PayStatus.PAID
            order.paid_at = datetime.now()
            db.commit()
    
    return "success"
```

## 不做

- 不负责商户号配置
- 不处理复杂的退款流程
- 不提供 UI 相关代码
