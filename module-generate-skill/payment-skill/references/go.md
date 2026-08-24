# payment-skill — Go (Gin) 实现要点

骨架已有的（go-backend-skill 生成，**不要重写**）：`OK()/Fail()` 信封包装、全局错误处理、JWT 中间件、`BusinessError`。本模块只补支付业务。

> 回调接口（`/api/pay/notify/**`）是信封例外：这两个 handler **不经过** `OK()/Fail()`，直接用 `c.JSON`/`c.String` 返回渠道要求的应答体（原因见 api-contract.md 文首）。

## 新增依赖

```
github.com/wechatpay-apiv3/wechatpay-go   # 微信支付 v3
github.com/smartwalle/alipay/v3           # 支付宝（或自封装）
```

## 关键文件

| 文件 | 职责 |
|------|------|
| `model/pay_order.go` / `pay_refund.go` | 对应两张表，GORM tag |
| `repository/pay_repo.go` | 含 `LockByOutTradeNo`（`clause.Locking{Strength:"UPDATE"}`） |
| `service/pay_service.go` | 下单、查单、关单、退款编排 |
| `service/pay_notify.go` | 回调验签 + 幂等推进（本模块核心） |
| `service/channel/wechat.go` / `alipay.go` | 渠道封装，统一 `PayChannel` 接口 |
| `handler/pay_handler.go` | 4 个业务接口 + 2 个回调接口 |
| `job/close_job.go` / `reconcile_job.go` | 超时关单、每日对账 |

## 关键片段

### 下单封装（金额服务端重算）

```go
func (s *PayService) CreateOrder(ctx context.Context, req *CreateOrderReq) (*PayResult, error) {
  // 红线：金额按业务单据重算，不信任客户端
  realAmount, err := s.bizClient.CalcAmount(ctx, req.OutTradeNo)
  if err != nil {
    return nil, err
  }
  if realAmount != req.Amount {
    return nil, NewBusinessError(-1001, "金额与业务单据不一致")
  }
  if s.repo.ExistsByOutTradeNo(req.OutTradeNo) {
    return nil, NewBusinessError(-1005, "支付单已存在")
  }
  order := &PayOrder{
    OutTradeNo: req.OutTradeNo,
    UserID:     req.UserID,
    Channel:    req.Channel,
    Scene:      req.Scene,
    Amount:     realAmount, // 单位：分，int64
    Subject:    req.Subject,
    Status:     0,
    ExpireAt:   time.Now().Add(30 * time.Minute),
  }
  if err := s.repo.Create(order); err != nil {
    return nil, err
  }
  return s.channelOf(req.Channel).UnifiedOrder(ctx, order, req.OpenID)
}
```

### 回调验签 + 幂等推进（本模块核心）

```go
// 微信回调 handler（信封例外，直接 c.JSON）
func (h *PayHandler) WechatNotify(c *gin.Context) {
  ctx := c.Request.Context()
  // 1. 验签 + 解密：wechatpay-go 的 notify.Handler 用平台证书验证 Wechatpay-Signature
  tx := new(payments.Transaction)
  _, err := h.wechatNotifyHandler.ParseNotifyRequest(ctx, c.Request, tx)
  if err != nil {
    log.Warnf("微信回调验签失败: %v", err) // 告警日志
    c.JSON(http.StatusInternalServerError, gin.H{"code": "FAIL", "message": "验签失败"})
    return
  }
  // 2. 幂等推进：事务内行锁 + 状态判断
  err = h.repo.Tx(func(txRepo *PayRepo) error {
    order, err := txRepo.LockByOutTradeNo(*tx.OutTradeNo)
    if err != nil {
      return NewBusinessError(-1004, "支付单不存在")
    }
    if order.Status != 0 {
      return nil // 重复回调：直接成功，止重推
    }
    // 3. 金额核对（分）
    if int64(*tx.Amount.Total) != order.Amount {
      log.Warnf("回调金额不一致: %s", order.OutTradeNo)
      return errAmountMismatch
    }
    // 4. 推进状态 + 留档
    return txRepo.MarkPaid(order.ID, *tx.TransactionId, tx.SuccessTime, rawBody)
  })
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"code": "FAIL", "message": err.Error()})
    return
  }
  // 5. 只发事件通知业务方，重业务走异步（红线 5）
  h.eventBus.Publish(PaySuccessEvent{OutTradeNo: *tx.OutTradeNo})
  c.JSON(http.StatusOK, gin.H{"code": "SUCCESS", "message": "成功"})
}
```

### 退款封装（事务外调渠道 + 失败补偿）

```go
func (s *PayService) Refund(ctx context.Context, req *RefundReq) (string, error) {
  // 1. 校验 + 落库（在事务内）
  var refundID int64
  err := s.repo.Tx(func(txRepo *PayRepo) error {
    order, err := txRepo.LockByOutTradeNo(req.OutTradeNo)
    if err != nil {
      return NewBusinessError(-1004, "支付单不存在")
    }
    if order.Status != 1 { // 只允许已支付状态退款
      return NewBusinessError(-1005, "当前状态不可退款")
    }
    if order.RefundedAmount+req.Amount > order.Amount {
      return NewBusinessError(-1005, "退款金额超过可退余额")
    }
    if txRepo.RefundExists(req.OutRefundNo) {
      return NewBusinessError(-1005, "退款单号重复")
    }
    refund := &PayRefund{OutRefundNo: req.OutRefundNo, PayOrderID: order.ID, Amount: req.Amount, Reason: req.Reason, Status: 0}
    if err := txRepo.CreateRefund(refund); err != nil {
      return err
    }
    refundID = refund.ID
    return txRepo.UpdateStatus(order.ID, 3) // 退款中
  })
  if err != nil {
    return "", err
  }
  // 2. 事务提交后，再调渠道（红线 11：渠道调用必须在事务外）
  order, _ := s.repo.GetByOutTradeNo(req.OutTradeNo)
  refund, _ := s.repo.GetRefundByOutRefundNo(req.OutRefundNo)
  err = s.channelOf(order.Channel).Refund(ctx, order, refund)
  if err != nil {
    // 渠道调用失败，补偿：记录告警、人工介入
    log.Errorf("退款调用渠道失败, outRefundNo=%s, 需人工处理: %v", req.OutRefundNo, err)
    return "", NewBusinessError(-2000, "渠道退款调用失败: "+err.Error())
  }
  return req.OutRefundNo, nil
}
```

### 退款回调（refunded_amount 唯一回写点）

```go
// 微信退款回调（信封例外，直接 c.JSON）
func (h *PayHandler) WechatRefundNotify(c *gin.Context) {
  ctx := c.Request.Context()
  rn := new(refund.Transaction) // 验签 + 解密（同支付回调，略）
  if _, err := h.wechatNotifyHandler.ParseNotifyRequest(ctx, c.Request, rn); err != nil {
    log.Warnf("微信退款回调验签失败: %v", err)
    c.JSON(http.StatusInternalServerError, gin.H{"code": "FAIL", "message": "验签失败"})
    return
  }
  err := h.repo.Tx(func(txRepo *PayRepo) error {
    // 聚合根优先锁序：先锁支付单（聚合根），再锁退款单（防死锁）
    refund, err := txRepo.GetRefundByOutRefundNo(*rn.OutRefundNo) // 先查退款单拿 pay_order_id
    if err != nil {
      return NewBusinessError(-1004, "退款单不存在")
    }
    if refund.Status != 0 {
      return nil // 重复回调：止重推
    }
    order, err := txRepo.LockByID(refund.PayOrderID) // 先锁支付单
    if err != nil {
      return NewBusinessError(-1004, "支付单不存在")
    }
    refund, _ = txRepo.LockRefundByOutRefundNo(*rn.OutRefundNo) // 再锁退款单
    if *rn.RefundStatus == "SUCCESS" {
      // 红线 10：refunded_amount 只在这里回写
      newRefunded := order.RefundedAmount + refund.Amount
      newStatus := 1 // 部分退→1 可再退
      if newRefunded >= order.Amount {
        newStatus = 4 // 全额→4
      }
      return txRepo.MarkRefundSuccess(refund.ID, *rn.RefundId, order.ID, newRefunded, newStatus)
    }
    return txRepo.MarkRefundFailed(refund.ID, order.ID) // 退款失败：order 回 1，允许重发
  })
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"code": "FAIL", "message": err.Error()})
    return
  }
  c.JSON(http.StatusOK, gin.H{"code": "SUCCESS", "message": "成功"})
}
```

### 关单 / 查单 / 对账（实现要点）

- **主动关单 / 超时关单**（`close_job.go`）：事务内 `LockByOutTradeNo`，仅 `status=0` 可关；**先调渠道关单，成功后再改本地 `status=2`**；渠道关单失败不改本地，等下次任务或对账修复（红线 6）。超时任务扫 `idx_pay_order_expire`（`status=0 AND expire_at < now`），分批处理避免长事务。
- **查单同步**（GET orders 内）：本地 `status=0` 时主动调渠道查单；渠道返回已支付则**复用回调的幂等推进逻辑**（同一 `MarkPaid`），防回调丢失。
- **每日对账**（`reconcile_job.go`）：用渠道账单下载接口拉前一日账单，逐笔比对 `out_trade_no/transaction_id/amount/status`，差异落清单 + 告警，**不自动改账**（红线 7）。
- **查退款单同步**（`refund_query_job.go` / GET refunds 内）：本地 `status=0` 时主动调渠道查退款单；渠道返回成功/失败则**复用退款回调的幂等推进逻辑**，防回调丢失。支付宝退款主要依赖主动查单（回调不保证）。

## 坑位

- **微信 v3 平台证书自动更新**：用 `wechatpay-go` 的 `auth/credentials` + 自动更新 verifier（基于 apiV3Key），别手动下载证书写死，否则证书轮换后验签全挂。
- **金额一律 `int64` 分**：微信 `tx.Amount.Total` 是 `*int64`，与本地严格比对；禁止用 `float64` 过手金额。
- **支付宝验签 sign_type 必须 RSA2**：`client.VerifySign`/`VerifySignWithCert` 时确认商户后台与应用都用 RSA2，混用 RSA 会验签失败。
- **行锁要在事务里**：`LockByOutTradeNo` 必须在 `Tx` 回调内执行，出了事务锁就释放，幂等判断失效。
- **回调本地联调**：内网穿透暴露 `/api/pay/notify/**`，或用沙箱环境；别在生产回调地址上调试。
- **时区**：`time.Time` 统一 UTC 存储，渠道时间串（RFC3339）解析后转 UTC，展示层再换时区。
- **密钥/证书走环境变量**：按 domain-model.md「环境变量」节的变量名读取（`WECHAT_MCH_ID`/`WECHAT_API_V3_KEY`/`WECHAT_PRIVATE_KEY_PATH`/`ALIPAY_APP_ID`/`ALIPAY_PRIVATE_KEY` 等），禁止硬编码或入库。

### 环境变量配置示例

```go
// config/pay.go
type PayConfig struct {
    Wechat WechatConfig `mapstructure:"wechat"`
    Alipay AlipayConfig `mapstructure:"alipay"`
}

type WechatConfig struct {
    MchID          string `mapstructure:"mch-id"`
    AppID          string `mapstructure:"app-id"`
    APIV3Key       string `mapstructure:"api-v3-key"`
    PrivateKeyPath string `mapstructure:"private-key-path"`
    SerialNo       string `mapstructure:"serial-no"`
    NotifyURL      string `mapstructure:"notify-url"`
}

type AlipayConfig struct {
    AppID       string `mapstructure:"app-id"`
    PrivateKey  string `mapstructure:"private-key"`
    PublicKey   string `mapstructure:"public-key"`
    NotifyURL   string `mapstructure:"notify-url"`
}
```

```yaml
# config.yaml
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
