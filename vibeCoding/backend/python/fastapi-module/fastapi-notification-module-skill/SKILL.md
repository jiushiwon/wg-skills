---
name: fastapi-notification-module-skill
description: Python FastAPI 通知模块技能。面向已有 FastAPI 项目的开发者，提供短信发送、邮件推送、站内消息、推送通知等能力的快速集成。触发词："短信验证码"、"发送短信"、"发送邮件"、"站内消息"、"通知模块"、"sms"、"email"、"mail"、"notification"。
---

# FastAPI Notification Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成通知能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **短信发送** | 验证码/通知短信 |
| **邮件推送** | HTML/文本邮件/模板邮件 |
| **站内消息** | 系统通知/未读消息 |
| **推送通知** | 极光/FCM |
| **消息模板** | 模板管理和渲染 |

## 触发场景

用户说"帮我加短信"或"集成通知"时触发。

## 核心实现

### 依赖配置

```bash
# 短信
pip install aliyun-python-sdk-core

# 邮件
pip install aiosmtpd jinja2

# 站内消息
pip install redis
```

### 配置

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 短信配置
    sms_access_key: str = ""
    sms_secret_key: str = ""
    sms_sign_name: str = ""
    sms_template_code: str = ""
    
    # 邮件配置
    mail_host: str = "smtp.qq.com"
    mail_port: int = 587
    mail_username: str = ""
    mail_password: str = ""
    
    # Redis 配置
    redis_host: str = "localhost"
    redis_port: int = 6379
```

### 数据模型

```python
# models.py
from sqlalchemy import Column, BigInteger, String, Text, Integer, DateTime, Enum as SQLEnum
from database import Base
import enum

class NotificationType(str, enum.Enum):
    SYSTEM = "system"
    SMS = "sms"
    EMAIL = "email"
    PUSH = "push"

class Notification(Base):
    __tablename__ = "wg_notification"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(SQLEnum(NotificationType), default=NotificationType.SYSTEM)
    link = Column(String(500))
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

class SmsCode(Base):
    __tablename__ = "wg_sms_code"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    phone = Column(String(20), nullable=False, index=True)
    code = Column(String(10), nullable=False)
    template_code = Column(String(50))
    expire_time = Column(DateTime)
    used = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
```

### 服务层

```python
# services/notification_service.py
from aliyunsdkcore.client import AcsClient
from aliyunsdkcore.request import CommonRequest
import random
import string
import redis

class NotificationService:
    def __init__(self):
        self.sms_client = AcsClient(
            settings.sms_access_key,
            settings.sms_secret_key,
            'cn-hangzhou'
        )
        self.redis = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            decode_responses=True
        )
    
    # 短信验证码
    async def send_sms_code(self, phone: str, template_code: str = None):
        code = ''.join(random.choices(string.digits, k=6))
        
        # 调用短信API
        request = CommonRequest()
        request.set_accept_format('json')
        request.set_domain('dysmsapi.aliyuncs.com')
        request.set_method('POST')
        request.set_protocol_type('https')
        request.set_version('2017-05-25')
        request.set_action_name('SendSms')
        
        request.add_query_param('PhoneNumbers', phone)
        request.add_query_param('SignName', settings.sms_sign_name)
        request.add_query_param('TemplateCode', template_code or settings.sms_template_code)
        request.add_query_param('TemplateParam', f'{{"code":"{code}"}}')
        
        response = self.sms_client.do_action_with_exception(request)
        
        # 保存验证码到 Redis
        key = f"sms:code:{phone}"
        self.redis.setex(key, 300, code)  # 5分钟过期
        
        return code
    
    async def verify_sms_code(self, phone: str, code: str) -> bool:
        key = f"sms:code:{phone}"
        saved_code = self.redis.get(key)
        if saved_code == code:
            self.redis.delete(key)
            return True
        return False
    
    # 发送邮件
    async def send_email(self, to: str, subject: str, content: str):
        import aiosmtplib
        from email.mime.text import MIMEText
        
        msg = MIMEText(content, 'html', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = settings.mail_username
        msg['To'] = to
        
        await aiosmtplib.send(
            msg,
            hostname=settings.mail_host,
            port=settings.mail_port,
            username=settings.mail_username,
            password=settings.mail_password,
            use_tls=True
        )
    
    # 站内消息
    async def send_notification(
        self,
        user_id: str,
        title: str,
        content: str,
        notification_type: NotificationType = NotificationType.SYSTEM,
        link: str = None
    ):
        notification = Notification(
            user_id=user_id,
            title=title,
            content=content,
            type=notification_type,
            link=link
        )
        db.add(notification)
        db.commit()
        
        # Redis 推送
        self.redis.publish(f"notification:{user_id}", json.dumps({
            "title": title,
            "content": content,
            "type": notification_type.value
        }))
        
        return notification
    
    # 获取未读消息
    async def get_unread_notifications(self, user_id: str) -> List[Notification]:
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == 0
        ).order_by(Notification.created_at.desc()).all()
```

### API 路由

```python
# routers/notification.py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/notification", tags=["通知"])

@router.post("/sms/send")
async def send_sms(phone: str):
    await notification_service.send_sms_code(phone)
    return ApiResponse.ok(None)

@router.post("/sms/verify")
async def verify_sms(phone: str, code: str):
    valid = await notification_service.verify_sms_code(phone, code)
    return ApiResponse.ok(valid)

@router.post("/email/send")
async def send_email(to: str, subject: str, content: str):
    await notification_service.send_email(to, subject, content)
    return ApiResponse.ok(None)

@router.post("/send")
async def send_notification(
    user_id: str,
    title: str,
    content: str,
    notification_type: NotificationType = NotificationType.SYSTEM
):
    await notification_service.send_notification(user_id, title, content, notification_type)
    return ApiResponse.ok(None)

@router.get("/unread")
async def get_unread(user_id: str):
    notifications = await notification_service.get_unread_notifications(user_id)
    return ApiResponse.ok(notifications)
```

## 不做

- 不负责短信/邮件服务商账号配置
- 不处理复杂的推送策略
- 不提供 UI 相关代码
