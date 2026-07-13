# auth-skill — Node.js (Express / NestJS) 实现要点

骨架已有的（nodejs-backend-skill 生成，**不要重写**）：JWT 签发/验证中间件（或 Nest Guard）、信封拦截器、全局异常、配置加载。本模块只补登录业务层。默认 Express；企业模块化项目走 NestJS，结构对应调整（Service/Controller/Module）。

## 新增依赖

```bash
npm install bcrypt ioredis uuid
npm install -D @types/bcrypt @types/uuid
# 内置阿里云短信时（接 notification-skill 或不发真实短信可省）：
npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client
```

## 配置（`.env` / config 追加）

```bash
# 见 domain-model.md「环境变量」节；命名全大写
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
SMS_REGION_ID=cn-hangzhou
SMS_SIGN_NAME=
SMS_TEMPLATE_CODE=
WECHAT_MINIAPP_APPID=        # 选 uniapp 时
WECHAT_MINIAPP_SECRET=       # 选 uniapp 时
CAPTCHA_ENABLED=false        # 图形验证码开关
```

## 关键文件（Express 布局）

| 文件 | 职责 |
|------|------|
| `src/models/user.ts` | `User` / `RefreshToken`（选 uniapp 加 `openId`）/（接 oauth 加 `OauthAccount`），Prisma 或 TypeORM，字段见 domain-model.md |
| `src/services/authService.ts` | 注册/登录/短信登录/刷新/登出/找回重置 |
| `src/services/smsCodeService.ts` | 验证码生成/限流；发送通道注入 `SmsSender` |
| `src/services/captchaService.ts` | 图形验证码（算术题 SVG + Redis 存答案），开图形码时 |
| `src/services/smsSender.ts` | `SmsSender` 接口 + `AliyunSmsSender` + `LogSmsSender`（dev） |
| `src/services/wxService.ts` | uniapp 微信登录：jscode2session 换 openid、解析手机号，选 uniapp 时 |
| `src/controllers/authController.ts` | 全部接口，参数校验（zod）+ 调 service，返回裸数据（骨架拦截器包信封） |
| `src/controllers/userController.ts` | `/api/user/*` 资料管理接口（开资料管理时），zod 校验 + 调 service |

## 关键片段

### 双令牌签发

```ts
import { createHash, randomUUID, randomBytes } from 'node:crypto';

async function issueTokens(user: User): Promise<TokenPair> {
  const jti = randomUUID();
  const accessToken = jwtUtil.sign({ sub: user.id, jti }, '2h');   // 骨架已有，补 jti
  const refreshToken = randomBytes(32).toString('hex');
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: createHash('sha256').update(refreshToken).digest('hex'), // 只存哈希
      jti,
      expiresAt: new Date(Date.now() + 30 * 86400_000),
    },
  });
  return { accessToken, refreshToken, expiresIn: 7200 };
}
```

### 刷新（轮换 + 重放检测）

```ts
async function refresh(refreshToken: string): Promise<TokenPair> {
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
  return prisma.$transaction(async (tx) => {
    const old = await tx.refreshToken.findUnique({ where: { tokenHash } });
    if (!old) throw new BizError(-1002, 'refresh token 无效');
    if (old.revoked || old.expiresAt < new Date()) {
      await tx.refreshToken.updateMany({ where: { userId: old.userId }, data: { revoked: true } }); // 重放：全量吊销
      throw new BizError(-1002, 'refresh token 已失效，请重新登录');
    }
    const user = await tx.user.findUnique({ where: { id: old.userId } });
    if (!user || user.status !== 1) throw new BizError(-1002, '账号不可用');
    await tx.refreshToken.update({ where: { id: old.id }, data: { revoked: true } });
    return issueTokens(user); // 同事务插新行
  });
}
```

### 图形验证码（算术题 SVG）

```ts
import { randomInt, randomUUID } from 'node:crypto';

async function makeCaptcha(): Promise<{ captchaId: string; svg: string }> {
  let a = randomInt(1, 10), b = randomInt(1, 10);               // 1~9
  const ops = ['+', '-', '*'] as const;
  const op = ops[randomInt(0, 3)];
  if (op === '-' && b > a) [a, b] = [b, a];                     // 减法保证非负
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const captchaId = randomUUID().replace(/-/g, '');
  await redis.set(`captcha:${captchaId}`, String(answer), 'EX', 300);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">`
    + `<rect width="120" height="40" fill="#f5f5f5"/>`
    + `<text x="12" y="27" font-size="20" fill="#333">${a} ${op} ${b} = ?</text></svg>`;
  return { captchaId, svg };
}

async function checkCaptcha(captchaId: string, userAnswer: string): Promise<void> {
  const val = await redis.getdel(`captcha:${captchaId}`);       // 取出即删，一次性
  if (val === null || val !== (userAnswer ?? '').trim())
    throw new BizError(-1001, '图形验证码错误');
}
```

### 短信验证码限流（Redis）

```ts
// 限流+当日配额：对所有手机号一致执行（供 forgotPassword 复用，防枚举预言机）
async function consumeSmsQuota(phone: string): Promise<void> {
  if (await redis.exists(`sms:limit:${phone}`)) throw new BizError(-1006, '发送过于频繁，请 60 秒后重试');
  const daily = await redis.incr(`sms:daily:${phone}`);
  if (daily === 1) await redis.expire(`sms:daily:${phone}`, 86400);
  if (daily > 10) throw new BizError(-1006, '今日发送次数已达上限');
}

// 登录/注册入口：先过配额再真发
async function sendCode(phone: string, scene: string): Promise<void> {
  await consumeSmsQuota(phone);
  await generateAndSend(phone, scene);
}

async function generateAndSend(phone: string, scene: string): Promise<void> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0'); // crypto 随机，别用 Math.random
  try {
    await smsSender.send(phone, code); // 先发送；Aliyun 或 dev LogSender，已接 notification-skill 则委托
  } catch (e) {
    await redis.decr(`sms:daily:${phone}`); // 发送失败回退当日配额，不写限流键
    throw e;
  }
  // 发送成功才落验证码（按场景分键）与 60s 限流键
  await redis.set(`sms:code:${scene}:${phone}`, code, 'EX', 300);
  await redis.set(`sms:limit:${phone}`, '1', 'EX', 60);
}
```

### 短信 Sender（内置最小阿里云 + dev 日志）

```ts
export interface SmsSender { send(phone: string, code: string): Promise<void>; }

export class LogSmsSender implements SmsSender {                 // APP_ENV=dev，不真发
  async send(phone: string, code: string) { console.log(`[dev-sms] phone=${phone} code=${code}`); }
}

export class AliyunSmsSender implements SmsSender {
  private client: any;
  constructor(private cfg: { signName: string; templateCode: string }) {
    const Dysmsapi = require('@alicloud/dysmsapi20170525').default;
    const { Config } = require('@alicloud/openapi-client');
    this.client = new Dysmsapi(new Config({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: `dysmsapi.${process.env.SMS_REGION_ID || 'cn-hangzhou'}.aliyuncs.com`,
    }));
  }
  async send(phone: string, code: string) {
    const { SendSmsRequest } = require('@alicloud/dysmsapi20170525');
    const resp = await this.client.sendSms(new SendSmsRequest({
      phoneNumbers: phone, signName: this.cfg.signName,
      templateCode: this.cfg.templateCode, templateParam: JSON.stringify({ code }),
    }));
    if (resp.body.code !== 'OK') throw new BizError(-2000, `短信发送失败: ${resp.body.message}`);
  }
}

// 装配：已接 notification-skill → 委托其 sendSms；否则 dev 用 LogSmsSender、生产用 AliyunSmsSender
export const smsSender: SmsSender =
  process.env.APP_ENV === 'dev'
    ? new LogSmsSender()
    : new AliyunSmsSender({ signName: process.env.SMS_SIGN_NAME!, templateCode: process.env.SMS_TEMPLATE_CODE! });
```

### 密码找回 / 重置

```ts
async function forgotPassword(phone: string): Promise<void> {
  await consumeSmsQuota(phone);                       // 限流对所有手机号一致执行（防枚举预言机）
  const user = await prisma.user.findUnique({ where: { phone } });
  if (user) await generateAndSend(phone, 'reset');    // 仅已注册真发；对外统一返回成功
}

async function resetPassword(phone: string, code: string, newPassword: string): Promise<void> {
  const saved = await redis.getdel(`sms:code:reset:${phone}`);   // 按场景取码，一次性
  if (saved === null || saved !== code) throw new BizError(-1002, '验证码错误或已过期');
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new BizError(-1002, '验证码错误或已过期'); // 不泄露是否注册
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } }), // 吊销全部 refresh
  ]);
}
```

### uniapp 微信小程序登录（jscode2session + 解析手机号）

```ts
async function codeToOpenid(code: string): Promise<string> {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_MINIAPP_APPID}`
    + `&secret=${process.env.WECHAT_MINIAPP_SECRET}&js_code=${code}&grant_type=authorization_code`;
  const data = await (await fetch(url)).json();
  if (!data.openid) throw new BizError(-1002, '微信登录失败');
  return data.openid;                          // session_key 不下发、不落库
}

async function resolvePhone(accessToken: string, phoneCode: string): Promise<string> {
  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
  const data = await (await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: phoneCode }),
  })).json();
  const phone = data?.phone_info?.phoneNumber;
  if (!phone) throw new BizError(-1002, '手机号解析失败');
  return phone;
}

async function wxLogin(code: string, phoneCode?: string): Promise<TokenPair> {
  const openid = await codeToOpenid(code);
  let user: User | null = null;
  if (phoneCode) {                             // 解析手机号模式
    const accessToken = await getWxAccessToken();   // 带缓存，见坑位
    const phone = await resolvePhone(accessToken, phoneCode);
    user = await prisma.user.findUnique({ where: { phone } });
    if (!user) user = await prisma.user.create({ data: { phone, openId: openid } });
    else if (!user.openId) user = await prisma.user.update({ where: { id: user.id }, data: { openId: openid } }); // 命中老用户回写绑定 open_id
  } else {                                     // 仅 openid 模式
    user = await prisma.user.findUnique({ where: { openId: openid } });
    if (!user) user = await prisma.user.create({ data: { openId: openid } });
  }
  return issueTokens(user);
}
```

### 密码

```ts
import bcrypt from 'bcrypt';
const passwordHash = await bcrypt.hash(password, 10);
const ok = await bcrypt.compare(password, user.passwordHash);
```

### 资料管理（profile / 改密 / 换绑手机 / 注销）

```ts
async function updateProfile(userId: bigint, nickname?: string, avatar?: string): Promise<User> {
  if (!nickname && !avatar) throw new BizError(-1001, '至少修改一项');
  return prisma.user.update({
    where: { id: userId },
    data: { ...(nickname && { nickname }), ...(avatar && { avatar }) },
  });
}

// 改密：校验旧密码 → 设新密码 → 吊销其他设备 refresh（保留当前 jti 会话）
async function changePassword(userId: bigint, currentJti: string, oldPassword: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash || !(await bcrypt.compare(oldPassword, user.passwordHash)))
    throw new BizError(-1002, '旧密码错误');
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, jti: { not: currentJti } }, data: { revoked: true }, // 保留当前会话
    }),
  ]);
}

// 换绑手机：校验新号短信验证码(scene=bind) → 唯一冲突 -1005 → 绑定
async function bindPhone(userId: bigint, phone: string, code: string): Promise<User> {
  const saved = await redis.getdel(`sms:code:bind:${phone}`);
  if (saved === null || saved !== code) throw new BizError(-1002, '验证码错误或已过期');
  if (await prisma.user.findUnique({ where: { phone } })) throw new BizError(-1005, '该手机号已被绑定');
  return prisma.user.update({ where: { id: userId }, data: { phone } });
}

// 注销：二次确认（密码或短信验证码 scene=login）→ status=0 → 吊销全部 token + 拉黑当前 access
async function deactivate(userId: bigint, currentJti: string, password?: string, code?: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new BizError(-1004, '用户不存在');
  let ok = !!(password && user.passwordHash && await bcrypt.compare(password, user.passwordHash));
  if (!ok && code && user.phone) {
    const saved = await redis.getdel(`sms:code:login:${user.phone}`);
    ok = saved === code;
  }
  if (!ok) throw new BizError(-1002, '确认信息错误');
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: 0 } }),
    prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } }),
  ]);
  await redis.set(`token:blacklist:${currentJti}`, '1', 'EX', 7200); // 拉黑当前 access
}
```

## 坑位

- 验证码用 `crypto.randomInt`，禁止 `Math.random`（可预测）。
- 登录失败计数 `login:fail:{id}`：失败时 `incr`（首次设 15min TTL，≥5 锁定），**登录成功后必须 `del` 重置**，避免成功后仍被旧计数锁定。
- 短信码按场景分键 `sms:code:{scene}:{phone}`；限流 `sms:limit`/`sms:daily` 按手机号共享。发送顺序：先 `consumeSmsQuota`、`send` 成功才写验证码与限流键，失败 `decr` 回退当日计数。`forgotPassword` 对所有手机号都先 `consumeSmsQuota` 再按注册与否决定是否真发（防枚举）。
- 刷新必须 `$transaction`；高并发下 PG 加 `SELECT ... FOR UPDATE`（Prisma 用 `$queryRaw`），防并发双换。
- JWT 中间件补两条校验：`status === 1`、黑名单 `token:blacklist:{jti}`（如启用，ioredis `get`）。
- 唯一冲突捕获 Prisma `P2002` 转 `-1005`，别先查后插。
- controller 返回裸对象，由骨架拦截器统一包信封；禁止 `res.json({ code, message, data })` 手写信封。
- 图形验证码/短信码用 `getdel`（ioredis 支持）保证一次性；旧版 ioredis 用 `multi().get().del().exec()`。
- 微信 `access_token` 全小程序共享且有频率限制：`GET /cgi-bin/token` 换取后缓存至过期（约 7200s），不要每次现取；`session_key` 仅服务端用。
- NestJS 版：把 service 函数挪进 `AuthService`，controller 用 `@Body()` + zod pipe，逻辑不变。
- 已接 notification-skill 时**委托**它的 `sendSms`，不要在本模块重复实现阿里云调用。
