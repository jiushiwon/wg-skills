# payment-skill — Node (Express/NestJS) 实现要点

骨架已有的（nodejs-backend-skill 生成，**不要重写**）：信封包装（NestJS `TransformInterceptor` / Express 拦截 `res.json`）、全局异常过滤器、`BusinessException`、JWT 守卫。本模块只补支付业务。

> 回调接口（`/api/pay/notify/**`）是信封例外：这两个路由**绕过信封拦截器**（NestJS 用 `@SkipEnvelope()` 或在拦截器里按路径放行；Express 直接 `res.send`），返回渠道要求的应答体（原因见 api-contract.md 文首）。

## 新增依赖

```
wechatpay-node-v3     # 微信支付 v3
alipay-sdk            # 支付宝
```

## 关键文件

| 文件 | 职责 |
|------|------|
| `entities/pay-order.entity.ts` / `pay-refund.entity.ts` | 对应两张表 |
| `pay.repository.ts` | 含 `lockByOutTradeNo`（`SELECT ... FOR UPDATE`，事务内） |
| `pay.service.ts` | 下单、查单、关单、退款编排 |
| `pay-notify.service.ts` | 回调验签 + 幂等推进（本模块核心） |
| `channels/wechat.channel.ts` / `alipay.channel.ts` | 渠道封装，统一 `PayChannel` 接口 |
| `pay.controller.ts` | 4 个业务接口 + 2 个回调接口（回调跳过信封） |
| `jobs/close.job.ts` / `reconcile.job.ts` | 超时关单、每日对账 |

## 关键片段

### 下单封装（金额服务端重算）

```ts
async createOrder(req: CreateOrderReq): Promise<PayResult> {
  // 红线：金额按业务单据重算，不信任客户端
  const realAmount = await this.bizClient.calcAmount(req.outTradeNo);
  if (realAmount !== req.amount) {
    throw new BusinessException(-1001, '金额与业务单据不一致');
  }
  if (await this.payRepo.existsByOutTradeNo(req.outTradeNo)) {
    throw new BusinessException(-1005, '支付单已存在');
  }
  const order = await this.payRepo.create({
    outTradeNo: req.outTradeNo,
    userId: req.userId,
    channel: req.channel,
    scene: req.scene,
    amount: realAmount, // 单位：分，number(bigint)
    subject: req.subject,
    status: 0,
    expireAt: new Date(Date.now() + 30 * 60 * 1000),
  });
  return this.channelOf(req.channel).unifiedOrder(order, req.openId);
}
```

### 回调验签 + 幂等推进（本模块核心）

```ts
// 回调 controller 跳过信封拦截器，直接返回渠道应答体
@Post('pay/notify/wechat')
@SkipEnvelope()
async wechatNotify(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
  const body = req.rawBody.toString('utf8');
  // 1. 验签 + 解密：wechatpay-node-v3 用平台证书验证 Wechatpay-Signature
  let result: WechatNotifyResult;
  try {
    result = await this.wechatPay.verifyAndDecrypt(req.headers, body);
  } catch (e) {
    this.logger.warn(`微信回调验签失败, body=${body}`); // 告警日志
    return res.status(500).json({ code: 'FAIL', message: '验签失败' });
  }
  // 2. 幂等推进：事务内行锁 + 状态判断
  try {
    await this.payRepo.tx(async (tx) => {
      const order = await tx.lockByOutTradeNo(result.out_trade_no); // FOR UPDATE
      if (!order) throw new BusinessException(-1004, '支付单不存在');
      if (order.status !== 0) return; // 重复回调：直接成功，止重推
      // 3. 金额核对（分）。注意：BIGINT 经 pg/mysql2 驱动默认返回字符串，必须 Number() 后再比
      if (Number(result.amount.total) !== Number(order.amount)) {
        this.logger.warn(`回调金额不一致, outTradeNo=${order.outTradeNo}`);
        throw new AmountMismatchError();
      }
      // 4. 推进状态 + 留档
      await tx.markPaid(order.id, result.transaction_id, result.success_time, body);
    });
  } catch (e) {
    return res.status(500).json({ code: 'FAIL', message: (e as Error).message });
  }
  // 5. 只发事件通知业务方，重业务走异步（红线 5）
  this.eventBus.emit('pay.success', { outTradeNo: result.out_trade_no });
  return res.json({ code: 'SUCCESS', message: '成功' });
}
```

### 退款封装（超额校验）

```ts
async refund(req: RefundReq): Promise<string> {
  // 1. 校验 + 落库（在事务内）
  let refundRecord: PayRefund;
  await this.payRepo.tx(async (tx) => {
    const order = await tx.lockByOutTradeNo(req.outTradeNo);
    if (!order) throw new BusinessException(-1004, '支付单不存在');
    if (order.status !== 1) { // 只允许已支付状态退款
      throw new BusinessException(-1005, '当前状态不可退款');
    }
    // 红线：退款总额不得超过已支付金额
    if (Number(order.refundedAmount) + req.amount > Number(order.amount)) {
      throw new BusinessException(-1005, '退款金额超过可退余额');
    }
    if (await tx.refundExists(req.outRefundNo)) {
      throw new BusinessException(-1005, '退款单号重复');
    }
    refundRecord = await tx.createRefund({ outRefundNo: req.outRefundNo, payOrderId: order.id, amount: req.amount, reason: req.reason, status: 0 });
    await tx.updateStatus(order.id, 3); // 退款中
  });
  // 2. 事务提交后，再调渠道（红线 11：渠道调用必须在事务外）
  try {
    const order = await this.payRepo.findByOutTradeNo(req.outTradeNo);
    await this.channelOf(order.channel).refund(order, refundRecord);
  } catch (e) {
    // 渠道调用失败，补偿：记录告警、人工介入
    this.logger.error(`退款调用渠道失败, outRefundNo=${req.outRefundNo}, 需人工处理: ${e}`);
    throw new BusinessException(-2000, `渠道退款调用失败: ${e}`);
  }
  return req.outRefundNo;
}
```

### 退款回调（refunded_amount 唯一回写点）

```ts
@Post('pay/notify/wechat/refund')
@SkipEnvelope()
async wechatRefundNotify(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
  const body = req.rawBody.toString('utf8');
  let rn: WechatRefundNotifyResult;
  try {
    rn = await this.wechatPay.verifyAndDecrypt(req.headers, body); // 验签 + 解密
  } catch (e) {
    this.logger.warn(`微信退款回调验签失败, body=${body}`);
    return res.status(500).json({ code: 'FAIL', message: '验签失败' });
  }
  try {
    await this.payRepo.tx(async (tx) => {
      // 聚合根优先锁序：先锁支付单（聚合根），再锁退款单（防死锁）
      const refund = await tx.getRefundByOutRefundNo(rn.out_refund_no); // 先查退款单拿 pay_order_id
      if (!refund) throw new BusinessException(-1004, '退款单不存在');
      if (refund.status !== 0) return; // 重复回调：止重推
      const order = await tx.lockById(refund.payOrderId); // 先锁支付单
      const refund2 = await tx.lockRefundByOutRefundNo(rn.out_refund_no); // 再锁退款单
      if (rn.refund_status === 'SUCCESS') {
        const newRefunded = Number(order.refundedAmount) + Number(refund.amount); // 红线 10：唯一回写点
        const newStatus = newRefunded >= Number(order.amount) ? 4 : 1; // 全额→4，部分→1 可再退
        await tx.markRefundSuccess(refund.id, rn.refund_id, order.id, newRefunded, newStatus);
      } else {
        await tx.markRefundFailed(refund.id, order.id); // 退款失败：order 回 1，允许重发
      }
    });
  } catch (e) {
    return res.status(500).json({ code: 'FAIL', message: (e as Error).message });
  }
  return res.json({ code: 'SUCCESS', message: '成功' });
}
```

### 关单 / 查单 / 对账 / 查退款单（实现要点）

- **主动关单 / 超时关单**（`close.job.ts`）：事务内 `FOR UPDATE` 锁单，仅 `status=0` 可关；**先调渠道关单，成功后再改本地 `status=2`**；渠道关单失败不改本地，等下次任务或对账修复（红线 6）。超时任务扫 `idx_pay_order_expire`（`status=0 AND expire_at < now`），分批处理避免长事务。
- **查单同步**（GET orders 内）：本地 `status=0` 时主动调渠道查单；渠道返回已支付则**复用回调的幂等推进逻辑**（同一 `markPaid`），防回调丢失。
- **查退款单同步**（`refund-query.job.ts` / GET refunds 内）：本地 `status=0` 时主动调渠道查退款单；渠道返回成功/失败则**复用退款回调的幂等推进逻辑**，防回调丢失。支付宝退款主要依赖主动查单（回调不保证）。
- **每日对账**（`reconcile.job.ts`）：用渠道账单下载接口拉前一日账单，逐笔比对 `out_trade_no/transaction_id/amount/status`，差异落清单 + 告警，**不自动改账**（红线 7）。

## 坑位

- **微信 v3 平台证书自动更新**：用 `wechatpay-node-v3` 基于 apiV3Key 的平台证书自动更新能力，别手动下载证书写死，否则证书轮换后验签全挂。
- **回调原始报文**：验签需要未解析的原始 body，Express/NestJS 默认会 `body-parser` 解析掉——回调路由要用 `rawBody`（Express 配 `verify` 保留，NestJS 用 `rawBody: true`），否则验签必失败。
- **金额一律整数分**：金额列在 DB 是 BIGINT，但 `pg`/`mysql2` 驱动默认把 BIGINT 返回成**字符串**——取出后必须 `Number()` 转换再参与比较/计算（`'19900' !== 19900` 会恒为 true 误拒）。金额在分单位下远小于 `Number.MAX_SAFE_INTEGER`，用 number 安全；禁止浮点运算。
- **支付宝验签 sign_type 必须 RSA2**：`alipaySdk.checkNotifySign` 时确认应用与商户后台都用 RSA2，混用 RSA 会验签失败。
- **行锁要在事务里**：`FOR UPDATE` 必须在同一事务连接内执行，事务结束锁释放，幂等判断失效。
- **回调本地联调**：内网穿透暴露 `/api/pay/notify/**`，或用沙箱环境；别在生产回调地址上调试。
- **时区**：统一用 UTC `Date` 存储，渠道时间串（ISO8601 带时区）解析后转 UTC，展示层再换时区。
- **密钥/证书走环境变量**：按 domain-model.md「环境变量」节的变量名读取（`WECHAT_MCH_ID`/`WECHAT_API_V3_KEY`/`WECHAT_PRIVATE_KEY_PATH`/`ALIPAY_APP_ID`/`ALIPAY_PRIVATE_KEY` 等），禁止硬编码或入库。

### 环境变量配置示例

```typescript
// config/pay.config.ts
export interface WechatPayConfig {
  mchId: string;
  appId: string;
  apiV3Key: string;
  privateKeyPath: string;
  serialNo: string;
  notifyUrl: string;
}

export interface AlipayConfig {
  appId: string;
  privateKey: string;
  publicKey: string;
  notifyUrl: string;
}

export interface PayConfig {
  wechat: WechatPayConfig;
  alipay: AlipayConfig;
}

export const payConfig = () => ({
  wechat: {
    mchId: process.env.WECHAT_MCH_ID!,
    appId: process.env.WECHAT_APP_ID!,
    apiV3Key: process.env.WECHAT_API_V3_KEY!,
    privateKeyPath: process.env.WECHAT_PRIVATE_KEY_PATH!,
    serialNo: process.env.WECHAT_SERIAL_NO!,
    notifyUrl: process.env.WECHAT_NOTIFY_URL!,
  },
  alipay: {
    appId: process.env.ALIPAY_APP_ID!,
    privateKey: process.env.ALIPAY_PRIVATE_KEY!,
    publicKey: process.env.ALIPAY_PUBLIC_KEY!,
    notifyUrl: process.env.ALIPAY_NOTIFY_URL!,
  },
});
```

```bash
# .env.example
WECHAT_MCH_ID=1234567890
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_API_V3_KEY=your-api-v3-key
WECHAT_PRIVATE_KEY_PATH=./cert/apiclient_key.pem
WECHAT_SERIAL_NO=serial-number
WECHAT_NOTIFY_URL=https://your-domain.com/api/pay/notify/wechat

ALIPAY_APP_ID=2021001234567890
ALIPAY_PRIVATE_KEY=your-private-key
ALIPAY_PUBLIC_KEY=alipay-public-key
ALIPAY_NOTIFY_URL=https://your-domain.com/api/pay/notify/alipay
```
