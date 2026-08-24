# payment-skill — Java (Spring Boot) 实现要点

骨架已有的（java-backend-skill 生成，**不要重写**）：统一信封 `ResponseAdvice`、全局异常、`BusinessException`、JWT 过滤器。本模块只补支付业务。

> 回调接口（`/api/pay/notify/**`）是信封例外：需让 `ResponseAdvice` 对该路径放行，直接返回渠道要求的应答体，不要包信封（原因见 api-contract.md 文首）。

## 新增依赖

```xml
<!-- 微信支付 v3 -->
<dependency><groupId>com.github.wechatpay-apiv3</groupId><artifactId>wechat-pay-java</artifactId></dependency>
<!-- 支付宝 -->
<dependency><groupId>com.alipay.sdk</groupId><artifactId>alipay-sdk-java</artifactId></dependency>
```

## 关键文件

| 文件 | 职责 |
|------|------|
| `entity/PayOrder.java` + `PayOrderRepository.java` | 对应 `wg_pay_order`，含 `findByOutTradeNoForUpdate`（`@Lock(PESSIMISTIC_WRITE)`）、`findByIdForUpdate` |
| `entity/PayRefund.java` + `PayRefundRepository.java` | 对应 `wg_pay_refund`，含 `findByOutRefundNoForUpdate`、`findByOutRefundNo` |
| `service/PayService.java` | 下单、查单、关单、退款、查退款单的业务编排 |
| `service/PayNotifyService.java` | 回调验签 + 幂等推进（本模块核心） |
| `service/channel/WechatChannel.java` / `AlipayChannel.java` | 渠道封装：下单/查单/关单/退款/查退款/验签，统一 `PayChannel` 接口 |
| `controller/PayController.java` | 5 个业务接口 + 2 个回调接口 |
| `job/PayCloseJob.java` / `RefundQueryJob.java` / `ReconcileJob.java` | 超时关单、查退款单、每日对账定时任务 |
| `config/PayConfig.java` | 环境变量加载（`@Value("${wechat.mch-id}")`） |

## 关键片段

### 下单封装（金额服务端重算）

```java
@Transactional
public PayResult createOrder(CreateOrderReq req) {
  // 红线：金额按业务单据重算，不信任客户端传入的 amount
  long realAmount = bizOrderClient.calcAmount(req.getOutTradeNo());
  if (realAmount != req.getAmount()) {
    throw new BusinessException(-1001, "金额与业务单据不一致");
  }
  if (payOrderRepository.existsByOutTradeNo(req.getOutTradeNo())) {
    throw new BusinessException(-1005, "支付单已存在");
  }
  PayOrder order = new PayOrder();
  order.setOutTradeNo(req.getOutTradeNo());
  order.setUserId(req.getUserId());
  order.setChannel(req.getChannel());
  order.setScene(req.getScene());
  order.setAmount(realAmount);                       // 单位：分，BIGINT
  order.setSubject(req.getSubject());
  order.setStatus(0);
  order.setExpireAt(OffsetDateTime.now().plusMinutes(30));
  payOrderRepository.save(order);
  PayChannel channel = channelFactory.get(req.getChannel());
  return channel.unifiedOrder(order, req.getOpenId()); // 返回 prepay/二维码串/orderString
}
```

### 回调验签 + 幂等推进（本模块核心）

```java
@Transactional
public String handleWechatNotify(HttpServletRequest request) {
  String body = readBody(request);
  // 1. 验签：微信 v3 用平台证书验证 Wechatpay-Signature 头（SDK 的 NotificationParser）
  NotificationParser parser = new NotificationParser(wechatNotifyConfig);
  Transaction tx;
  try {
    tx = parser.parse(requestToMap(request, body), Transaction.class);
  } catch (Exception e) {
    log.warn("微信回调验签失败, body={}", body);   // 告警日志
    return "{\"code\":\"FAIL\",\"message\":\"验签失败\"}";
  }
  // 2. 幂等推进：行锁 + 状态判断
  PayOrder order = payOrderRepository.findByOutTradeNoForUpdate(tx.getOutTradeNo())
      .orElseThrow(() -> new BusinessException(-1004, "支付单不存在"));
  if (order.getStatus() != 0) {
    return "{\"code\":\"SUCCESS\",\"message\":\"成功\"}"; // 重复回调：直接成功，止重推
  }
  // 3. 金额核对：回调金额必须与本地一致（单位分），不一致拒绝（防篡改）
  // 注意：getTotal() 与 getAmount() 都是装箱 Long，必须 equals 比较，!= 比的是引用会误杀
  if (!tx.getAmount().getTotal().equals(order.getAmount())) {
    log.warn("回调金额不一致, outTradeNo={}", order.getOutTradeNo());
    return "{\"code\":\"FAIL\",\"message\":\"金额不一致\"}";
  }
  // 4. 推进状态 + 留档
  order.setStatus(1);
  order.setProviderTradeNo(tx.getTransactionId());
  order.setPaidAt(OffsetDateTime.parse(tx.getSuccessTime()));
  order.setNotifyPayload(body);
  // 5. 只发事件通知业务方，发券/发货走异步（红线 5）
  applicationEventPublisher.publishEvent(new PaySuccessEvent(order.getOutTradeNo()));
  return "{\"code\":\"SUCCESS\",\"message\":\"成功\"}";
}
```

### 退款封装（事务外调渠道 + 失败补偿）

```java
public String refund(RefundReq req) {
  // 1. 校验 + 落库（在事务内）
  PayOrder order = payOrderRepository.findByOutTradeNoForUpdate(req.getOutTradeNo())
      .orElseThrow(() -> new BusinessException(-1004, "支付单不存在"));
  if (order.getStatus() != 1) { // 只允许已支付状态退款
    throw new BusinessException(-1005, "当前状态不可退款");
  }
  // 红线：退款总额不得超过已支付金额
  if (order.getRefundedAmount() + req.getAmount() > order.getAmount()) {
    throw new BusinessException(-1005, "退款金额超过可退余额");
  }
  if (payRefundRepository.existsByOutRefundNo(req.getOutRefundNo())) {
    throw new BusinessException(-1005, "退款单号重复");
  }
  PayRefund refund = new PayRefund();
  refund.setOutRefundNo(req.getOutRefundNo());
  refund.setPayOrderId(order.getId());
  refund.setAmount(req.getAmount());
  refund.setReason(req.getReason());
  refund.setStatus(0);                              // 退款中
  payRefundRepository.save(refund);
  order.setStatus(3);                               // 退款中
  payOrderRepository.save(order);
  // 事务提交后，再调渠道（红线 11：渠道调用必须在事务外）
  try {
    channelFactory.get(order.getChannel()).refund(order, refund);
  } catch (Exception e) {
    // 渠道调用失败，补偿：本地已提交，需记录告警、人工介入
    log.error("退款调用渠道失败, outRefundNo={}, 需人工处理", req.getOutRefundNo(), e);
    // 不自动回滚本地状态，由对账/人工修复
    throw new BusinessException(-2000, "渠道退款调用失败: " + e.getMessage());
  }
  return req.getOutRefundNo();
}
```

### 退款回调（refunded_amount 唯一回写点）

```java
@Transactional
public String handleWechatRefundNotify(RefundNotification rn) {
  // 1. 验签 + 解密（同支付回调，略；解析为 RefundNotification）
  // 2. 聚合根优先锁序：先锁支付单（聚合根），再锁退款单（防死锁）
  PayOrder order = payOrderRepository.findByIdForUpdate(rn.getOutRefundNo()) // 按 out_refund_no 查不到，需先查退款单拿 pay_order_id
      .orElseThrow(() -> new BusinessException(-1004, "支付单不存在"));
  // 先查退款单拿状态
  PayRefund refund = payRefundRepository.findByOutRefundNo(rn.getOutRefundNo())
      .orElseThrow(() -> new BusinessException(-1004, "退款单不存在"));
  if (refund.getStatus() != 0) {
    return "{\"code\":\"SUCCESS\",\"message\":\"成功\"}"; // 重复回调：止重推
  }
  // 再锁退款单
  refund = payRefundRepository.findByOutRefundNoForUpdate(rn.getOutRefundNo()).get();
  if (rn.getRefundStatus() == RefundStatus.SUCCESS) {
    refund.setStatus(1);
    refund.setProviderRefundNo(rn.getRefundId());
    // 红线 10：refunded_amount 只在这里回写，超额校验才有意义
    order.setRefundedAmount(order.getRefundedAmount() + refund.getAmount());
    order.setStatus(order.getRefundedAmount() >= order.getAmount() ? 4 : 1); // 全额→4，部分→1 可再退
  } else {
    refund.setStatus(2);
    order.setStatus(1); // 退款失败：释放退款中，允许重新发起
  }
  return "{\"code\":\"SUCCESS\",\"message\":\"成功\"}";
}
```

### 关单 / 查单 / 对账 / 查退款单（实现要点）

- **主动关单 / 超时关单**（`PayCloseJob`）：`FOR UPDATE` 锁单，仅 `status=0` 可关；**先调渠道关单，成功后再改本地 `status=2`**；渠道关单失败不改本地，等下次任务或对账修复（红线 6）。超时任务扫 `idx_pay_order_expire`（`status=0 AND expire_at < now`），分批处理避免长事务。
- **查单同步**（GET orders 内）：本地 `status=0` 时主动调渠道查单；渠道返回已支付则**复用回调的幂等推进逻辑**（同一 `markPaid`），防回调丢失；已关闭则同步关单。
- **查退款单同步**（`RefundQueryJob` / GET refunds 内）：本地 `status=0` 时主动调渠道查退款单；渠道返回成功/失败则**复用退款回调的幂等推进逻辑**，防回调丢失。支付宝退款主要依赖主动查单（回调不保证）。
- **每日对账**（`ReconcileJob`）：用渠道账单下载接口拉前一日账单，逐笔比对 `out_trade_no/transaction_id/amount/status`，差异落清单 + 告警，**不自动改账**（红线 7）。

## 坑位

- **微信 v3 平台证书会自动更新**：用 SDK 的 `AutoUpdateCertificatesVerifier`（基于 apiV3Key），不要手动下载证书写死，否则证书轮换后验签全挂。
- **回调金额单位是分**：微信 `amount.total`、支付宝 `total_amount` 都要与本地 `amount` 严格比对（分），别拿展示层的元去比。
- **支付宝验签 sign_type 必须 RSA2**：`AlipaySignature.rsaCheckV1(params, publicKey, charset, "RSA2")`，漏传 sign_type 或用了 RSA 会验签失败。
- **时区**：`paid_at`/`expire_at` 一律 `OffsetDateTime`/`TIMESTAMPTZ`，渠道时间串带时区，解析后统一存，禁止 `LocalDateTime`。
- **密钥/证书走环境变量**：按 domain-model.md「环境变量」节的变量名读取（`WECHAT_MCH_ID`/`WECHAT_API_V3_KEY`/`WECHAT_PRIVATE_KEY_PATH`/`ALIPAY_APP_ID`/`ALIPAY_PRIVATE_KEY` 等），禁止硬编码或入库。
- **回调本地联调**：用内网穿透（如 natapp）把 `/api/pay/notify/**` 暴露公网，或直接用微信/支付宝沙箱环境，别在生产回调地址上调试。
- **环境变量加载示例**：

```java
@Configuration
@ConfigurationProperties(prefix = "pay")
public class PayConfig {
    private Wechat wechat;
    private Alipay alipay;

    @Data
    public static class Wechat {
        private String mchId;
        private String appId;
        private String apiV3Key;
        private String privateKeyPath;
        private String serialNo;
        private String notifyUrl;
    }

    @Data
    public static class Alipay {
        private String appId;
        private String privateKey;
        private String publicKey;
        private String notifyUrl;
    }
}
```

```yaml
# application.yml
pay:
  wechat:
    mch-id: ${WECHAT_MCH_ID}
    app-id: ${WECHAT_APP_ID}
    api-v3-key: ${WECHAT_API_V3_KEY}
    private-key-path: ${WECHAT_PRIVATE_KEY_PATH}
    serial-no: ${WECHAT_SERIAL_NO}
    notify-url: ${WECHAT_NOTIFY_URL}
  alipay:
    app-id: ${ALIPAY_APP_ID}
    private-key: ${ALIPAY_PRIVATE_KEY}
    public-key: ${ALIPAY_PUBLIC_KEY}
    notify-url: ${ALIPAY_NOTIFY_URL}
```
