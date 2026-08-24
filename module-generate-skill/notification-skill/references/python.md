# notification-skill — Python (FastAPI) 实现要点

骨架已有的（python-backend-skill 生成，**不要重写**）：`EnvelopeRoute` 信封、全局异常、JWT 依赖、Redis。本模块只补通知业务层。错误码用闭集（见 backend-convention-skill response-format.md），不另列。

## 新增依赖

```bash
pip install alibabacloud_dysmsapi20170525 alibabacloud_tea_openapi   # 阿里云短信 SDK
pip install aiosmtplib                                                # 异步邮件（同步用标准库 smtplib）
```

环境变量：`ALIYUN_ACCESS_KEY_ID`、`ALIYUN_ACCESS_KEY_SECRET`、`ALIYUN_SMS_SIGN_NAME`、`MAIL_HOST`、`MAIL_PORT`、`MAIL_USERNAME`、`MAIL_PASSWORD`、`APP_ENV`。

## 关键文件

| 文件 | 职责 |
|------|------|
| `app/models/notify.py` | `NotifyTemplate` / `NotifyRecord`（SQLAlchemy），字段见 domain-model.md |
| `app/services/notify_service.py` | 对外接口 `send_sms(phone, template_code, params)` / `send_email(to, template_code, params)`：限流 + 落库(status=0) |
| `app/senders/sms.py` | `SmsSender` 抽象 + `AliyunSmsSender` / `LogSmsSender` |
| `app/senders/email.py` | `EmailSender` 抽象 + `SmtpEmailSender` / `LogEmailSender` |
| `app/workers/notify_worker.py` | 后台任务扫 `status=0` 且到 `next_retry_at` 的记录发送（APScheduler / asyncio task） |
| `app/routers/notify.py` | 管理接口（templates/records/retry），返回裸数据由骨架包信封 |

## 关键片段

### 阿里云短信最小封装

```python
import json
from alibabacloud_dysmsapi20170525.client import Client as DysmsClient
from alibabacloud_dysmsapi20170525 import models as dysms_models
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_util.client import ClientError

class ProviderError(Exception):
    def __init__(self, code: str, msg: str, retryable: bool):
        super().__init__(msg); self.code, self.retryable = code, retryable

class AliyunSmsSender:
    def __init__(self, ak: str, sk: str):
        config = open_api_models.Config(access_key_id=ak, access_key_secret=sk, endpoint="dysmsapi.aliyuncs.com")
        self._client = DysmsClient(config)

    def send(self, phone: str, sign_name: str, template_code: str, params: dict) -> str:
        req = dysms_models.SendSmsRequest(
            phone_numbers=phone, sign_name=sign_name,
            template_code=template_code, template_param=json.dumps(params, ensure_ascii=False))
        try:
            resp = self._client.send_sms(req)
        except ClientError as e:
            raise ProviderError("NETWORK", str(e), True)  # 网络类可重试
        body = resp.body
        if body.code != "OK":
            raise ProviderError(body.code, body.message, self._retryable(body.code))
        return body.biz_id  # 落 provider_request_id

    @staticmethod
    def _retryable(code: str) -> bool:  # 限流/系统忙可重试；签名/模板未审核等业务错误不可重试
        return code in ("isv.BUSINESS_LIMIT_CONTROL", "Throttling", "ServiceUnavailable")
```

### NotifyService.send_sms（限流 + 落库 + 异步投递）

```python
from datetime import datetime, timedelta, timezone

def send_sms(db, redis, phone: str, template_code: str, params: dict) -> int:
    tpl = db.query(NotifyTemplate).filter_by(code=template_code, status=1).first()
    if not tpl:
        raise BizError(-1004, "短信模板不存在或已停用")
    if tpl.channel != "sms":
        raise BizError(-1001, "模板渠道不匹配")
    # 限流（复用 auth-skill 约定键）
    if redis.exists(f"sms:limit:{phone}"):
        raise BizError(-1006, "发送过于频繁，请 60 秒后重试")
    daily = redis.incr(f"sms:daily:{phone}")
    if daily == 1:
        redis.expire(f"sms:daily:{phone}", 86400)
    if daily > 10:
        raise BizError(-1006, "今日发送次数已达上限")
    redis.set(f"sms:limit:{phone}", "1", ex=60)
    # 落库（status=0 待发送），立即返回；真正发送交给 worker
    rec = NotifyRecord(channel="sms", target=phone, template_code=template_code,
                       params=params, provider="aliyun", status=0, retry_count=0)
    db.add(rec); db.commit(); db.refresh(rec)
    return rec.id
```

### 后台扫表发送 worker（无队列降级）

```python
BACKOFF = [timedelta(minutes=1), timedelta(minutes=5), timedelta(minutes=15)]

async def dispatch(db, sms_sender, email_sender, sign_name: str):
    now = datetime.now(timezone.utc)
    pending = (db.query(NotifyRecord)
               .filter(NotifyRecord.status == 0)
               .filter((NotifyRecord.next_retry_at.is_(None)) | (NotifyRecord.next_retry_at <= now))
               .limit(50).all())
    for rec in pending:
        try:
            tpl = db.query(NotifyTemplate).filter_by(code=rec.template_code).first()
            if rec.channel == "sms":
                req_id = sms_sender.send(rec.target, sign_name, tpl.provider_template_id, rec.params)
            else:
                req_id = await email_sender.send(rec.target, tpl.provider_template_id, tpl.content, rec.params)
            rec.status, rec.provider_request_id = 1, req_id
            rec.sent_at, rec.error_msg = now, None
        except ProviderError as e:
            rec.error_msg = str(e)
            if e.retryable and rec.retry_count < 3:
                rec.retry_count += 1
                rec.next_retry_at = now + BACKOFF[rec.retry_count - 1]
            else:
                rec.status = 2  # 终态失败：业务错误或已达上限，不再重试
        db.commit()
```

用 `asyncio.create_task` 起周期循环，或接 APScheduler `@scheduler.scheduled_job("interval", seconds=15)`。

### SMTP 发送封装（aiosmtplib）

```python
import aiosmtplib
from email.message import EmailMessage

class SmtpEmailSender:
    def __init__(self, host, port, username, password, sender):
        self.host, self.port, self.username, self.password, self.sender = host, port, username, password, sender

    async def send(self, to: str, subject_tpl: str, content_tpl: str, params: dict) -> str:
        msg = EmailMessage()
        msg["From"], msg["To"] = self.sender, to
        msg["Subject"] = render(subject_tpl, params)  # {{var}} 替换
        msg.set_content(render(content_tpl, params), subtype="html")
        try:
            await aiosmtplib.send(msg, hostname=self.host, port=self.port,
                                  username=self.username, password=self.password, start_tls=True, timeout=10)
        except aiosmtplib.SMTPException as e:
            raise ProviderError("SMTP", str(e), True)  # SMTP 瞬时错误可重试
        return msg["Message-ID"] or ""
```

## 坑位

- **SDK 异常分类**：`body.code != "OK"` 按 code 判可重试——`isv.BUSINESS_LIMIT_CONTROL`/`Throttling`/`ServiceUnavailable` 可重试；`isv.SMS_SIGNATURE_ILLEGAL`、`isv.SMS_TEMPLATE_ILLEGAL`、`isv.MOBILE_NUMBER_ILLEGAL`、`isv.OUT_OF_SERVICE` 属业务错误，**置失败不重试**。SDK 抛出的 `ClientError` 多为网络/限流，按可重试处理。
- **签名/模板需先在阿里云控制台审核通过**，否则报 `SMS_SIGNATURE_ILLEGAL`/`SMS_TEMPLATE_ILLEGAL`；这是环境配置问题，别在代码里绕。
- **同步/异步混用**：阿里云 SDK 是同步调用，在 FastAPI 里放 worker（后台任务）里跑，别放请求链路；邮件用 `aiosmtplib` 异步、或用 `anyio.to_thread` 包同步 `smtplib`，二选一别混。
- **LogSender 由 `APP_ENV` 切换**：sender 工厂按 `APP_ENV` 返回 Log 或真实实现，避免开发期真发。
- **worker 防并发重复发送**：多实例部署时扫表加 `SELECT ... FOR UPDATE SKIP LOCKED`（SQLAlchemy `with_for_update(skip_locked=True)`），避免同一记录重复发、重复计费。
