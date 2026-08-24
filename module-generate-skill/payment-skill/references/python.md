# payment-skill — Python (FastAPI) 实现要点

骨架已有的（python-backend-skill 生成，**不要重写**）：`EnvelopeRoute` 信封、全局异常、`BusinessException`、JWT 依赖。本模块只补支付业务。

> 回调接口（`/api/pay/notify/**`）是信封例外：这两个路由**不挂** `EnvelopeRoute`，用普通 `APIRouter` 直接返回渠道要求的应答体（原因见 api-contract.md 文首）。

## 新增依赖

```
wechatpayv3            # 微信支付 v3
alipay-sdk-python      # 支付宝（或自封装）
```

## 关键文件

| 文件 | 职责 |
|------|------|
| `models/pay.py` | `PayOrder` / `PayRefund` ORM 模型 |
| `repositories/pay_repo.py` | 含 `lock_by_out_trade_no`（`with_for_update()`） |
| `services/pay_service.py` | 下单、查单、关单、退款编排 |
| `services/pay_notify.py` | 回调验签 + 幂等推进（本模块核心） |
| `services/channels/wechat.py` / `alipay.py` | 渠道封装，统一接口 |
| `routers/pay.py` | 4 个业务接口（挂 EnvelopeRoute）+ 2 个回调接口（普通 router） |
| `jobs/close_job.py` / `reconcile_job.py` | 超时关单、每日对账 |

## 关键片段

### 下单封装（金额服务端重算）

```python
def create_order(db: Session, req: CreateOrderReq) -> dict:
    # 红线：金额按业务单据重算，不信任客户端
    real_amount = biz_client.calc_amount(req.out_trade_no)
    if real_amount != req.amount:
        raise BusinessException(-1001, "金额与业务单据不一致")
    if pay_repo.exists_by_out_trade_no(db, req.out_trade_no):
        raise BusinessException(-1005, "支付单已存在")
    order = PayOrder(
        out_trade_no=req.out_trade_no,
        user_id=req.user_id,
        channel=req.channel,
        scene=req.scene,
        amount=real_amount,  # 单位：分，int
        subject=req.subject,
        status=0,
        expire_at=datetime.now(timezone.utc) + timedelta(minutes=30),
    )
    pay_repo.create(db, order)
    return channel_of(req.channel).unified_order(order, req.open_id)
```

### 回调验签 + 幂等推进（本模块核心）

```python
# 回调路由挂普通 APIRouter（非 EnvelopeRoute），直接返回渠道应答体
@router.post("/pay/notify/wechat")
def wechat_notify(request: Request, db: Session = Depends(get_db)):
    headers = request.headers
    body = request.body().decode("utf-8")
    # 1. 验签 + 解密：wechatpayv3 用平台证书验证 Wechatpay-Signature
    try:
        result = wxpay.decrypt_callback(headers, body)
    except Exception:
        logger.warning("微信回调验签失败, body=%s", body)  # 告警日志
        return JSONResponse(status_code=500, content={"code": "FAIL", "message": "验签失败"})
    # 2. 幂等推进：事务内行锁 + 状态判断
    order = pay_repo.lock_by_out_trade_no(db, result["out_trade_no"])  # with_for_update
    if order is None:
        raise BusinessException(-1004, "支付单不存在")
    if order.status != 0:
        db.commit()
        return {"code": "SUCCESS", "message": "成功"}  # 重复回调：直接成功，止重推
    # 3. 金额核对（分）
    if result["amount"]["total"] != order.amount:
        logger.warning("回调金额不一致, out_trade_no=%s", order.out_trade_no)
        return JSONResponse(status_code=500, content={"code": "FAIL", "message": "金额不一致"})
    # 4. 推进状态 + 留档
    order.status = 1
    order.provider_trade_no = result["transaction_id"]
    order.paid_at = datetime.fromisoformat(result["success_time"])
    order.notify_payload = body
    db.commit()
    # 5. 只发事件通知业务方，重业务走异步（红线 5）
    event_bus.publish(PaySuccessEvent(out_trade_no=order.out_trade_no))
    return {"code": "SUCCESS", "message": "成功"}
```

### 退款封装（超额校验）

```python
def refund(db: Session, req: RefundReq) -> str:
    # 1. 校验 + 落库（在事务内）
    order = pay_repo.lock_by_out_trade_no(db, req.out_trade_no)
    if order is None:
        raise BusinessException(-1004, "支付单不存在")
    if order.status != 1:  # 只允许已支付状态退款
        raise BusinessException(-1005, "当前状态不可退款")
    # 红线：退款总额不得超过已支付金额
    if order.refunded_amount + req.amount > order.amount:
        raise BusinessException(-1005, "退款金额超过可退余额")
    if pay_repo.refund_exists(db, req.out_refund_no):
        raise BusinessException(-1005, "退款单号重复")
    refund = PayRefund(
        out_refund_no=req.out_refund_no,
        pay_order_id=order.id,
        amount=req.amount,
        reason=req.reason,
        status=0,  # 退款中
    )
    pay_repo.create_refund(db, refund)
    order.status = 3  # 退款中
    db.commit()
    # 2. 事务提交后，再调渠道（红线 11：渠道调用必须在事务外）
    try:
        channel_of(order.channel).refund(order, refund)
    except Exception as e:
        # 渠道调用失败，补偿：记录告警、人工介入
        logger.error(f"退款调用渠道失败, outRefundNo={req.out_refund_no}, 需人工处理: {e}")
        raise BusinessException(-2000, f"渠道退款调用失败: {e}")
    return req.out_refund_no
```

### 退款回调（refunded_amount 唯一回写点）

```python
# 退款回调同样挂普通 APIRouter（非 EnvelopeRoute）
@router.post("/pay/notify/wechat/refund")
def wechat_refund_notify(request: Request, db: Session = Depends(get_db)):
    body = request.body().decode("utf-8")
    try:
        result = wxpay.decrypt_callback(request.headers, body)  # 验签 + 解密
    except Exception:
        logger.warning("微信退款回调验签失败, body=%s", body)
        return JSONResponse(status_code=500, content={"code": "FAIL", "message": "验签失败"})
    # 聚合根优先锁序：先锁支付单（聚合根），再锁退款单（防死锁）
    refund = pay_repo.get_refund_by_out_refund_no(db, result["out_refund_no"])  # 先查退款单拿 pay_order_id
    if refund is None:
        raise BusinessException(-1004, "退款单不存在")
    if refund.status != 0:
        db.commit()
        return {"code": "SUCCESS", "message": "成功"}  # 重复回调：止重推
    order = pay_repo.lock_by_id(db, refund.pay_order_id)  # 先锁支付单
    refund = pay_repo.lock_refund_by_out_refund_no(db, result["out_refund_no"])  # 再锁退款单
    if result["refund_status"] == "SUCCESS":
        refund.status = 1
        refund.provider_refund_no = result["refund_id"]
        order.refunded_amount += refund.amount  # 红线 10：唯一回写点
        order.status = 4 if order.refunded_amount >= order.amount else 1  # 全额→4，部分→1 可再退
    else:
        refund.status = 2
        order.status = 1  # 退款失败：释放退款中，允许重发
    db.commit()
    return {"code": "SUCCESS", "message": "成功"}
```

### 关单 / 查单 / 对账 / 查退款单（实现要点）

- **主动关单 / 超时关单**（`close_job.py`）：事务内 `with_for_update()` 锁单，仅 `status=0` 可关；**先调渠道关单，成功后再改本地 `status=2`**；渠道关单失败不改本地，等下次任务或对账修复（红线 6）。超时任务扫 `idx_pay_order_expire`（`status=0 AND expire_at < now`），分批处理避免长事务。
- **查单同步**（GET orders 内）：本地 `status=0` 时主动调渠道查单；渠道返回已支付则**复用回调的幂等推进逻辑**，防回调丢失。
- **查退款单同步**（`refund_query_job.py` / GET refunds 内）：本地 `status=0` 时主动调渠道查退款单；渠道返回成功/失败则**复用退款回调的幂等推进逻辑**，防回调丢失。支付宝退款主要依赖主动查单（回调不保证）。
- **每日对账**（`reconcile_job.py`）：用渠道账单下载接口拉前一日账单，逐笔比对 `out_trade_no/transaction_id/amount/status`，差异落清单 + 告警，**不自动改账**（红线 7）。

## 坑位

- **微信 v3 平台证书自动更新**：用 `wechatpayv3` 的平台证书自动下载/更新能力（基于 apiV3Key 初始化），别手动下载证书写死，否则证书轮换后验签全挂。
- **金额一律 `int` 分**：`result["amount"]["total"]` 与本地严格比对；禁止用 `float`/`Decimal` 过手金额。
- **支付宝验签 sign_type 必须 RSA2**：`alipay.verify(data, signature)` 时确认应用与商户后台都用 RSA2，混用 RSA 会验签失败。
- **行锁要在事务里**：`with_for_update()` 必须在同一 `Session` 事务内用，`commit`/`rollback` 后锁释放，幂等判断失效。
- **回调本地联调**：内网穿透暴露 `/api/pay/notify/**`，或用沙箱环境；别在生产回调地址上调试。
- **时区**：统一 `datetime.now(timezone.utc)`，渠道时间串带时区，解析后转 UTC，禁止 naive datetime。
- **密钥/证书走环境变量**：按 domain-model.md「环境变量」节的变量名读取（`WECHAT_MCH_ID`/`WECHAT_API_V3_KEY`/`WECHAT_PRIVATE_KEY_PATH`/`ALIPAY_APP_ID`/`ALIPAY_PRIVATE_KEY` 等），禁止硬编码或入库。

### 环境变量配置示例

```python
# config.py
from pydantic_settings import BaseSettings
from pydantic import Field

class PaySettings(BaseSettings):
    # 微信支付
    wechat_mch_id: str = Field(..., env="WECHAT_MCH_ID")
    wechat_app_id: str = Field(..., env="WECHAT_APP_ID")
    wechat_api_v3_key: str = Field(..., env="WECHAT_API_V3_KEY")
    wechat_private_key_path: str = Field(..., env="WECHAT_PRIVATE_KEY_PATH")
    wechat_serial_no: str = Field(..., env="WECHAT_SERIAL_NO")
    wechat_notify_url: str = Field(..., env="WECHAT_NOTIFY_URL")
    # 支付宝
    alipay_app_id: str = Field(..., env="ALIPAY_APP_ID")
    alipay_private_key: str = Field(..., env="ALIPAY_PRIVATE_KEY")
    alipay_public_key: str = Field(..., env="ALIPAY_PUBLIC_KEY")
    alipay_notify_url: str = Field(..., env="ALIPAY_NOTIFY_URL")

    class Config:
        env_file = ".env"
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
