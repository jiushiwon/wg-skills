# notification-skill — Node.js (Express / NestJS) 实现要点

骨架已有的（nodejs-backend-skill 生成，**不要重写**）：信封拦截器、全局异常、JWT 中间件（或 Nest Guard）、Redis。本模块只补通知业务层。错误码用闭集（见 backend-convention-skill response-format.md），不另列。默认 Express；NestJS 把函数挪进对应 Service，逻辑不变。

## 新增依赖

```bash
npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client @alicloud/tea-util   # 阿里云短信 SDK
npm install nodemailer                                                              # 邮件
npm install -D @types/nodemailer
```

环境变量：`ALIYUN_ACCESS_KEY_ID`、`ALIYUN_ACCESS_KEY_SECRET`、`ALIYUN_SMS_SIGN_NAME`、`MAIL_HOST`、`MAIL_PORT`、`MAIL_USERNAME`、`MAIL_PASSWORD`、`APP_ENV`。

## 关键文件（Express 布局）

| 文件 | 职责 |
|------|------|
| `src/models/notify.ts` | `NotifyTemplate` / `NotifyRecord`（Prisma 或 TypeORM），字段见 domain-model.md |
| `src/services/notifyService.ts` | 对外接口 `sendSms(phone, templateCode, params)` / `sendEmail(to, templateCode, params)`：限流 + 落库(status=0) |
| `src/senders/smsSender.ts` | `SmsSender` 接口 + `AliyunSmsSender` / `LogSmsSender` |
| `src/senders/emailSender.ts` | `EmailSender` 接口 + `SmtpEmailSender` / `LogEmailSender` |
| `src/workers/notifyWorker.ts` | `setInterval` 扫 `status=0` 且到 `next_retry_at` 的记录发送 |
| `src/controllers/notifyController.ts` | 管理接口（templates/records/retry），返回裸对象由骨架拦截器包信封 |

## 关键片段

### 阿里云短信最小封装

```ts
import Dysmsapi, * as dysms from '@alicloud/dysmsapi20170525';
import * as OpenApi from '@alicloud/openapi-client';

export class ProviderError extends Error {
  constructor(public code: string, msg: string, public retryable: boolean) { super(msg); }
}

export class AliyunSmsSender {
  private client: Dysmsapi;
  constructor(ak: string, sk: string) {
    this.client = new Dysmsapi(new OpenApi.Config({
      accessKeyId: ak, accessKeySecret: sk, endpoint: 'dysmsapi.aliyuncs.com',
    }));
  }

  async send(phone: string, signName: string, templateCode: string, params: Record<string, unknown>): Promise<string> {
    const req = new dysms.SendSmsRequest({
      phoneNumbers: phone, signName, templateCode, templateParam: JSON.stringify(params),
    });
    let resp;
    try {
      resp = await this.client.sendSms(req);
    } catch (e: any) {
      throw new ProviderError('NETWORK', e.message, true); // 网络类可重试
    }
    const body = resp.body!;
    if (body.code !== 'OK') {
      throw new ProviderError(body.code!, body.message ?? '', retryable(body.code!));
    }
    return body.bizId!; // 落 provider_request_id
  }
}

function retryable(code: string): boolean { // 限流/系统忙可重试；签名/模板未审核等业务错误不可重试
  return ['isv.BUSINESS_LIMIT_CONTROL', 'Throttling', 'ServiceUnavailable'].includes(code);
}
```

### notifyService.sendSms（限流 + 落库 + 异步投递）

```ts
async function sendSms(phone: string, templateCode: string, params: Record<string, unknown>): Promise<number> {
  const tpl = await prisma.notifyTemplate.findFirst({ where: { code: templateCode, status: 1 } });
  if (!tpl) throw new BizError(-1004, '短信模板不存在或已停用');
  if (tpl.channel !== 'sms') throw new BizError(-1001, '模板渠道不匹配');
  // 限流（复用 auth-skill 约定键）
  if (await redis.exists(`sms:limit:${phone}`)) throw new BizError(-1006, '发送过于频繁，请 60 秒后重试');
  const daily = await redis.incr(`sms:daily:${phone}`);
  if (daily === 1) await redis.expire(`sms:daily:${phone}`, 86400);
  if (daily > 10) throw new BizError(-1006, '今日发送次数已达上限');
  await redis.set(`sms:limit:${phone}`, '1', 'EX', 60);
  // 落库（status=0 待发送），立即返回；真正发送交给 worker
  const rec = await prisma.notifyRecord.create({
    data: { channel: 'sms', target: phone, templateCode, params, provider: 'aliyun', status: 0, retryCount: 0 },
  });
  return rec.id;
}
```

### 定时扫表发送 worker（无队列降级）

```ts
const BACKOFF_MIN = [1, 5, 15];

export function startNotifyWorker() {
  setInterval(dispatch, 15_000);
}

async function dispatch() {
  const now = new Date();
  const pending = await prisma.notifyRecord.findMany({
    where: { status: 0, OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }] }, take: 50,
  });
  for (const rec of pending) {
    try {
      const tpl = await prisma.notifyTemplate.findFirst({ where: { code: rec.templateCode } });
      const reqId = rec.channel === 'sms'
        ? await smsSender.send(rec.target, process.env.ALIYUN_SMS_SIGN_NAME!, tpl!.providerTemplateId, rec.params as any)
        : await emailSender.send(rec.target, tpl!.providerTemplateId, tpl!.content ?? '', rec.params as any);
      await prisma.notifyRecord.update({
        where: { id: rec.id },
        data: { status: 1, providerRequestId: reqId, sentAt: now, errorMsg: null },
      });
    } catch (e: any) {
      const retryable = e instanceof ProviderError && e.retryable && rec.retryCount < 3;
      await prisma.notifyRecord.update({
        where: { id: rec.id },
        data: retryable
          ? { retryCount: rec.retryCount + 1, nextRetryAt: new Date(now.getTime() + BACKOFF_MIN[rec.retryCount] * 60_000), errorMsg: e.message }
          : { status: 2, errorMsg: e.message }, // 终态失败：业务错误或已达上限，不再重试
      });
    }
  }
}
```

### SMTP 发送封装（nodemailer，连接复用）

```ts
import nodemailer from 'nodemailer';

// 模块级单例：复用连接，别每次 new
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, port: Number(process.env.MAIL_PORT), secure: Number(process.env.MAIL_PORT) === 465,
  auth: { user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD },
  pool: true, maxConnections: 5, connectionTimeout: 10_000,
});

export async function sendEmail(to: string, subjectTpl: string, contentTpl: string, params: Record<string, unknown>): Promise<string> {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USERNAME, to,
      subject: render(subjectTpl, params), html: render(contentTpl, params), // {{var}} 替换
    });
    return info.messageId ?? '';
  } catch (e: any) {
    throw new ProviderError('SMTP', e.message, true); // SMTP 瞬时错误可重试
  }
}
```

## 坑位

- **SDK 异常分类**：`body.code !== 'OK'` 按 code 判可重试——`isv.BUSINESS_LIMIT_CONTROL`/`Throttling`/`ServiceUnavailable` 可重试；`isv.SMS_SIGNATURE_ILLEGAL`、`isv.SMS_TEMPLATE_ILLEGAL`、`isv.MOBILE_NUMBER_ILLEGAL`、`isv.OUT_OF_SERVICE` 属业务错误，**置失败不重试**。SDK `sendSms` 直接抛错多为网络/限流，按可重试处理。
- **签名/模板需先在阿里云控制台审核通过**，否则报 `SMS_SIGNATURE_ILLEGAL`/`SMS_TEMPLATE_ILLEGAL`；这是环境配置问题，别在代码里绕。
- **nodemailer 连接复用**：`transporter` 做成模块级单例 + `pool: true`，禁止每发一封 `createTransport` 新建连接（会被 SMTP 服务器限流/拒连）。
- **LogSender 由 `APP_ENV` 切换**：sender 工厂按 `APP_ENV` 返回 Log 或真实实现，避免开发期真发。
- **worker 防并发重复发送**：多实例部署时扫表加行锁（Prisma 用 `$queryRaw` 的 `SELECT ... FOR UPDATE SKIP LOCKED`）或只让单实例跑 worker，避免同一记录重复发、重复计费。
