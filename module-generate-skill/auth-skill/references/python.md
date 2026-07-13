# auth-skill — Python (FastAPI) 实现要点

骨架已有的（python-backend-skill 生成，**不要重写**）：JWT 签发/验证依赖、`EnvelopeRoute` 信封、全局异常、`Settings` 配置。本模块只补登录业务层。

## 新增依赖

```bash
pip install bcrypt redis httpx alibabacloud_dysmsapi20170525 alibabacloud_tea_openapi
# alibabacloud_* 仅内置阿里云短信时需要；接 notification-skill 或不发真实短信可省
```

## 关键文件

| 文件 | 职责 |
|------|------|
| `app/models/user.py` | `User` / `RefreshToken`（选 uniapp 加 `open_id` 列）/（接 oauth 加 `OauthAccount`）SQLAlchemy 模型，字段见 domain-model.md |
| `app/schemas/auth.py` | 全部接口的 Pydantic 入参/出参模型 |
| `app/services/auth_service.py` | 注册/登录/短信登录/刷新/登出/找回重置 |
| `app/services/sms_code_service.py` | 验证码生成/限流；发送通道注入 `SmsSender` |
| `app/services/captcha_service.py` | 图形验证码（算术题 SVG + Redis 存答案），开图形码时 |
| `app/services/sms_sender.py` | `SmsSender` 协议 + `AliyunSmsSender` + `LogSmsSender`（dev） |
| `app/services/wx_service.py` | uniapp 微信登录：jscode2session 换 openid、解析手机号，选 uniapp 时 |
| `app/api/v1/auth.py` | 路由，只做依赖注入 + 调 service，返回裸数据（骨架 EnvelopeRoute 包信封） |
| `app/api/v1/user.py` | `/api/user/*` 资料管理路由（开资料管理时），依赖注入 + 调 service |

## 配置（`app/config.py` 追加）

```python
# Settings 内追加（命名遵循 env-config-guide，全大写环境变量）
aliyun_access_key_id: str = ""
aliyun_access_key_secret: str = ""
sms_region_id: str = "cn-hangzhou"
sms_sign_name: str = ""
sms_template_code: str = ""
wechat_miniapp_appid: str = ""      # 选 uniapp 时
wechat_miniapp_secret: str = ""     # 选 uniapp 时
captcha_enabled: bool = False       # 图形验证码开关
```

## 关键片段

### 双令牌签发

```python
import hashlib, secrets, uuid
from datetime import datetime, timedelta, timezone

async def issue_tokens(db: AsyncSession, user: User) -> TokenPair:
    jti = uuid.uuid4().hex
    access = jwt_util.sign(sub=user.id, jti=jti, ttl=timedelta(hours=2))  # 骨架已有，补 jti
    refresh = secrets.token_hex(32)
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hashlib.sha256(refresh.encode()).hexdigest(),  # 只存哈希
        jti=jti,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    await db.commit()
    return TokenPair(access_token=access, refresh_token=refresh, expires_in=7200)
```

### 刷新（轮换 + 重放检测）

```python
async def refresh_tokens(db: AsyncSession, refresh_token: str) -> TokenPair:
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    old = await db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash).with_for_update()
    )
    if old is None:
        raise BizError(-1002, "refresh token 无效")
    if old.revoked or old.expires_at < datetime.now(timezone.utc):
        await db.execute(
            update(RefreshToken).where(RefreshToken.user_id == old.user_id).values(revoked=True)
        )  # 重放：全量吊销
        raise BizError(-1002, "refresh token 已失效，请重新登录")
    user = await db.get(User, old.user_id)
    if user is None or user.status != 1:
        raise BizError(-1002, "账号不可用")
    old.revoked = True
    return await issue_tokens(db, user)  # 同事务插新行
```

### 图形验证码（算术题 SVG）

```python
import secrets, uuid
from redis.asyncio import Redis

_OPS = [("+", lambda a, b: a + b), ("-", lambda a, b: a - b), ("*", lambda a, b: a * b)]

async def make_captcha(rdb: Redis) -> dict:
    a, b = secrets.randbelow(9) + 1, secrets.randbelow(9) + 1   # 1~9，两位数内
    op, fn = _OPS[secrets.randbelow(len(_OPS))]
    if op == "-" and b > a:
        a, b = b, a                                            # 减法保证非负
    answer = str(fn(a, b))
    captcha_id = uuid.uuid4().hex
    await rdb.set(f"captcha:{captcha_id}", answer, ex=300)     # 5min、一次性
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">'
           f'<rect width="120" height="40" fill="#f5f5f5"/>'
           f'<text x="12" y="27" font-size="20" fill="#333">{a} {op} {b} = ?</text></svg>')
    return {"captchaId": captcha_id, "svg": svg}

async def check_captcha(rdb: Redis, captcha_id: str, user_answer: str) -> None:
    key = f"captcha:{captcha_id}"
    val = await rdb.getdel(key)                                # 取出即删，一次性
    if val is None or val != (user_answer or "").strip():
        raise BizError(-1001, "图形验证码错误")
```

### 短信验证码限流（Redis）

```python
# 限流+当日配额：对所有手机号一致执行（供 forgot_password 复用，防枚举预言机）
async def consume_sms_quota(rdb: Redis, phone: str) -> None:
    if await rdb.exists(f"sms:limit:{phone}"):
        raise BizError(-1006, "发送过于频繁，请 60 秒后重试")
    daily = await rdb.incr(f"sms:daily:{phone}")
    if daily == 1:
        await rdb.expire(f"sms:daily:{phone}", 86400)
    if daily > 10:
        raise BizError(-1006, "今日发送次数已达上限")

# 登录/注册入口：先过配额再真发
async def send_code(rdb: Redis, sender: SmsSender, phone: str, scene: str) -> None:
    await consume_sms_quota(rdb, phone)
    await generate_and_send(rdb, sender, phone, scene)

async def generate_and_send(rdb: Redis, sender: SmsSender, phone: str, scene: str) -> None:
    code = f"{secrets.randbelow(1_000_000):06d}"                # secrets 是 CSPRNG，别用 random
    try:
        await sender.send(phone, code)                          # 先发送；Aliyun 或 dev LogSender
    except BizError:
        await rdb.decr(f"sms:daily:{phone}")                   # 发送失败回退当日配额，不写限流键
        raise
    # 发送成功才落验证码（按场景分键）与 60s 限流键
    await rdb.set(f"sms:code:{scene}:{phone}", code, ex=300)
    await rdb.set(f"sms:limit:{phone}", "1", ex=60)
```

### 短信 Sender（内置最小阿里云 + dev 日志 + 可委托）

```python
from typing import Protocol
import logging

class SmsSender(Protocol):
    async def send(self, phone: str, code: str) -> None: ...

class LogSmsSender:    # APP_ENV=dev，不真发
    async def send(self, phone: str, code: str) -> None:
        logging.info("[dev-sms] phone=%s code=%s", phone, code)

class AliyunSmsSender:
    def __init__(self, cfg):
        from alibabacloud_tea_openapi.models import Config
        from alibabacloud_dysmsapi20170525.client import Client
        self._client = Client(Config(
            access_key_id=cfg.aliyun_access_key_id,
            access_key_secret=cfg.aliyun_access_key_secret,
            endpoint=f"dysmsapi.{cfg.sms_region_id}.aliyuncs.com"))
        self._sign, self._tpl = cfg.sms_sign_name, cfg.sms_template_code

    async def send(self, phone: str, code: str) -> None:
        import json
        from alibabacloud_dysmsapi20170525 import models as m
        resp = await self._client.send_sms_async(m.SendSmsRequest(
            phone_numbers=phone, sign_name=self._sign,
            template_code=self._tpl, template_param=json.dumps({"code": code})))
        if resp.body.code != "OK":
            raise BizError(-2000, f"短信发送失败: {resp.body.message}")

# 装配：已接 notification-skill → 委托其 sendSms；否则 dev 用 LogSmsSender、生产用 AliyunSmsSender
def build_sms_sender(settings) -> SmsSender:
    return LogSmsSender() if settings.app_env == "dev" else AliyunSmsSender(settings)
```

### 密码找回 / 重置

```python
async def forgot_password(db, rdb, sender, phone: str) -> None:
    await consume_sms_quota(rdb, phone)          # 限流对所有手机号一致执行（防枚举预言机）
    user = await db.scalar(select(User).where(User.phone == phone))
    if user is not None:                          # 仅已注册真发；对外统一返回成功
        await generate_and_send(rdb, sender, phone, "reset")

async def reset_password(db, rdb, phone: str, code: str, new_password: str) -> None:
    saved = await rdb.getdel(f"sms:code:reset:{phone}")   # 按场景取码，一次性
    if saved is None or saved != code:
        raise BizError(-1002, "验证码错误或已过期")
    user = await db.scalar(select(User).where(User.phone == phone))
    if user is None:
        raise BizError(-1002, "验证码错误或已过期")        # 不泄露是否注册
    user.password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt(rounds=10)).decode()
    await db.execute(update(RefreshToken).where(RefreshToken.user_id == user.id).values(revoked=True))
    await db.commit()                                       # 重置后吊销全部 refresh，强制重登
```

### uniapp 微信小程序登录（jscode2session + 解析手机号）

```python
import httpx

class WxService:
    def __init__(self, cfg):
        self._appid, self._secret = cfg.wechat_miniapp_appid, cfg.wechat_miniapp_secret

    async def code_to_openid(self, code: str) -> str:
        r = await httpx.AsyncClient().get(
            "https://api.weixin.qq.com/sns/jscode2session",
            params={"appid": self._appid, "secret": self._secret,
                    "js_code": code, "grant_type": "authorization_code"})
        data = r.json()
        if "openid" not in data:
            raise BizError(-1002, "微信登录失败")
        return data["openid"]            # session_key 不下发、不落库

    async def resolve_phone(self, access_token: str, phone_code: str) -> str:
        r = await httpx.AsyncClient().post(
            f"https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token={access_token}",
            json={"code": phone_code})
        info = r.json().get("phone_info") or {}
        if not info.get("phoneNumber"):
            raise BizError(-1002, "手机号解析失败")
        return info["phoneNumber"]
# access_token 用 GET /cgi-bin/token 换取并缓存至过期（约 7200s），不要每次现取

async def wx_login(db, wx: WxService, code: str, phone_code: str | None) -> TokenPair:
    openid = await wx.code_to_openid(code)
    if phone_code:                                        # 解析手机号模式
        token = await get_wx_access_token()               # 带缓存
        phone = await wx.resolve_phone(token, phone_code)
        user = await db.scalar(select(User).where(User.phone == phone))
        if user is None:
            user = User(phone=phone, open_id=openid)
        elif user.open_id is None:                        # 命中老用户回写绑定 open_id
            user.open_id = openid
    else:                                                 # 仅 openid 模式
        user = await db.scalar(select(User).where(User.open_id == openid)) or User(open_id=openid)
    db.add(user)
    await db.flush()
    return await issue_tokens(db, user)
```

### 密码

```python
import bcrypt
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=10)).decode()
ok = bcrypt.checkpw(password.encode(), user.password_hash.encode())
```

### 资料管理（profile / 改密 / 换绑手机 / 注销）

```python
async def update_profile(db, user_id: int, nickname: str | None, avatar: str | None) -> User:
    if not nickname and not avatar:
        raise BizError(-1001, "至少修改一项")
    user = await db.get(User, user_id)
    if user is None:
        raise BizError(-1004, "用户不存在")
    if nickname: user.nickname = nickname
    if avatar: user.avatar = avatar
    await db.commit()
    return user

# 改密：校验旧密码 → 设新密码 → 吊销其他设备 refresh（保留当前 jti 会话）
async def change_password(db, user_id: int, current_jti: str, old_password: str, new_password: str) -> None:
    user = await db.get(User, user_id)
    if user is None or not user.password_hash or \
       not bcrypt.checkpw(old_password.encode(), user.password_hash.encode()):
        raise BizError(-1002, "旧密码错误")
    user.password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt(rounds=10)).decode()
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.jti != current_jti)
        .values(revoked=True)
    )  # 保留当前会话
    await db.commit()

# 换绑手机：校验新号短信验证码(scene=bind) → 唯一冲突 -1005 → 绑定
async def bind_phone(db, rdb, user_id: int, phone: str, code: str) -> User:
    saved = await rdb.getdel(f"sms:code:bind:{phone}")
    if saved is None or saved != code:
        raise BizError(-1002, "验证码错误或已过期")
    if await db.scalar(select(User).where(User.phone == phone)) is not None:
        raise BizError(-1005, "该手机号已被绑定")
    user = await db.get(User, user_id)
    if user is None:
        raise BizError(-1004, "用户不存在")
    user.phone = phone
    await db.commit()
    return user

# 注销：二次确认（密码或短信验证码 scene=login）→ status=0 → 吊销全部 token + 拉黑当前 access
async def deactivate(db, rdb, user_id: int, current_jti: str, password: str | None, code: str | None) -> None:
    user = await db.get(User, user_id)
    if user is None:
        raise BizError(-1004, "用户不存在")
    ok = bool(password and user.password_hash and bcrypt.checkpw(password.encode(), user.password_hash.encode()))
    if not ok and code and user.phone:
        saved = await rdb.getdel(f"sms:code:login:{user.phone}")
        ok = saved == code
    if not ok:
        raise BizError(-1002, "确认信息错误")
    user.status = 0
    await db.execute(update(RefreshToken).where(RefreshToken.user_id == user_id).values(revoked=True))
    await db.commit()
    await rdb.set(f"token:blacklist:{current_jti}", "1", ex=7200)  # 拉黑当前 access
```

## 坑位

- 验证码必须用 `secrets`，禁止 `random`（可预测）。
- 登录失败计数 `login:fail:{id}`：失败时 `incr`（首次设 15min TTL，≥5 锁定），**登录成功后必须 `delete` 重置**，避免成功后仍被旧计数锁定。
- 短信码按场景分键 `sms:code:{scene}:{phone}`；限流 `sms:limit`/`sms:daily` 按手机号共享。发送顺序：先 `consume_sms_quota`、`send` 成功才写验证码与限流键，失败 `decr` 回退当日计数。`forgot_password` 对所有手机号都先 `consume_sms_quota` 再按注册与否决定是否真发（防枚举）。
- 刷新用 `with_for_update()` 行锁防并发双换；SQLite 不支持行锁，生产用 PG/MySQL。
- 时区统一 `datetime.now(timezone.utc)` + `TIMESTAMPTZ`，禁止 naive datetime 存过期时间。
- 唯一冲突捕获 `IntegrityError` 转 `-1005`，别先查后插。
- 路由函数返回 Pydantic 模型或 dict，由骨架 `EnvelopeRoute` 统一包信封；禁止手写 `JSONResponse` 表达业务结果。
- 图形验证码/短信码都要「取出即删」（`getdel`），保证一次性；并发下不要 get 后再 del。
- 微信 `access_token` 全小程序共享且有调用频率限制，必须缓存；`session_key` 仅服务端用，禁止下发前端。
- 已接 notification-skill 时**委托**它的 `sendSms`，不要在本模块重复实现阿里云调用。
