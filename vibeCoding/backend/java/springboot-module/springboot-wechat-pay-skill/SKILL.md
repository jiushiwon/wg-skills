---
name: springboot-wechat-pay-skill
description: Spring Boot 微信支付模块技能（独立版）。面向已有 Spring Boot 项目，提供微信支付 V3 完整能力：JSAPI / 小程序 / H5 / Native / App 支付、退款、回调验签、订单查询、关单。**不包含支付宝**，如需支付宝请引入 springboot-alipay-pay-skill。触发词："微信支付"、"JSAPI支付"、"小程序支付"、"H5支付"、"Native支付"、"App支付"、"微信退款"、"微信回调"、"wechat pay v3"、"商户号配置"。
---

# Spring Boot WeChat Pay Module Skill

> 微信支付 V3（推荐）独立模块，**只覆盖微信渠道**。与支付宝完全解耦，按需引入。

## 与合一版的关系

| Skill | 范围 | 推荐度 |
|-------|------|--------|
| `springboot-wechat-pay-skill`（本） | 仅微信 V3 | ⭐⭐⭐⭐⭐ 单一渠道项目 |
| `springboot-alipay-pay-skill` | 仅支付宝 | ⭐⭐⭐⭐⭐ 单一渠道项目 |
| `springboot-payment-module-skill` | 微信+支付宝合一 | 旧版，**已不推荐** |

**新项目请用本 skill + alipay skill 分别引入**，避免代码耦合。

## 能力清单

| 能力 | 适用场景 | 接口 |
|------|----------|------|
| **JSAPI 支付** | 公众号网页 / 微信内浏览器 | `POST /api/wechat-pay/jsapi` |
| **小程序支付** | 微信小程序 | `POST /api/wechat-pay/miniprogram` |
| **H5 支付** | 手机浏览器（非微信） | `POST /api/wechat-pay/h5` |
| **Native 支付** | PC 网站扫码 | `POST /api/wechat-pay/native` |
| **App 支付** | iOS / Android App | `POST /api/wechat-pay/app` |
| **退款** | 全渠道通用 | `POST /api/wechat-pay/refund` |
| **查询订单** | 全渠道通用 | `GET /api/wechat-pay/query/{orderNo}` |
| **关单** | 全渠道通用 | `POST /api/wechat-pay/close/{orderNo}` |
| **回调验签** | 全渠道通用 | `POST /api/wechat-pay/notify` |
| **账单下载** | 对账 | `GET /api/wechat-pay/bill` |

## 前置依赖

| 依赖 | 说明 |
|------|------|
| `springboot-init-skill` | 项目骨架（**必须**） |
| `springboot-auth-module-skill` | 当前用户获取（推荐） |
| `springboot-redis-module-skill` | 幂等防重 + 限流（推荐） |

## 核心实现

### 1. 依赖

```xml
<!-- 微信支付 V3 SDK（推荐） -->
<dependency>
    <groupId>com.github.wechatpay-apiv3</groupId>
    <artifactId>wechatpay-java</artifactId>
    <version>0.2.18</version>
</dependency>
<!-- Apache HttpClient（SDK 默认实现） -->
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
</dependency>
```

> **版本说明**：V2 SDK（`com.github.wxpay:wxpay-sdk 3.0.10`）已停更，**本 skill 强制使用 V3**。

### 2. 配置（application.yml）

```yaml
wechat:
  pay:
    # ====== 必填项：从商户平台获取 ======
    app-id: ${WECHAT_APP_ID:}              # 公众号/小程序/移动应用 appId
    mch-id: ${WECHAT_MCH_ID:}              # 商户号（如 1900000109）
    
    # ====== 商户 API 证书（V3 必须） ======
    private-key-path: ${WECHAT_PRIVATE_KEY_PATH:}    # 商户私钥 apiclient_key.pem 路径
    merchant-cert-path: ${WECHAT_MERCHANT_CERT_PATH:} # 商户证书 apiclient_cert.pem 路径
    api-cert-serial-no: ${WECHAT_API_CERT_SERIAL_NO:} # 商户证书序列号
    
    # ====== 微信支付平台证书（V3 验签用） ======
    api-v3-key: ${WECHAT_API_V3_KEY:}      # APIv3 密钥（在商户平台设置）
    
    # ====== 回调地址 ======
    notify-url: ${WECHAT_NOTIFY_URL:https://yourdomain.com/api/wechat-pay/notify}
    
    # ====== 可选项 ======
    refund-notify-url: ${WECHAT_REFUND_NOTIFY_URL:}  # 退款回调（默认复用 notify-url）
    connect-timeout-ms: 5000
    read-timeout-ms: 10000
```

> **完整配置说明 + 参数获取步骤** 见 [references/merchant-onboarding.md](references/merchant-onboarding.md)

### 3. 实体

```java
// 支付订单
@Entity
@Table(name = "wg_wechat_pay_order")
public class WechatPayOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** 业务订单号（商户系统唯一） */
    @Column(unique = true, length = 64)
    private String orderNo;
    
    /** 微信支付订单号（回调后回填） */
    @Column(length = 64)
    private String transactionId;
    
    /** 支付场景 */
    @Enumerated(EnumType.STRING)
    private PayScene scene;  // JSAPI / MINI_PROGRAM / H5 / NATIVE / APP
    
    /** 订单状态 */
    @Enumerated(EnumType.STRING)
    private PayStatus status;  // PENDING / PAID / CLOSED / REFUNDED
    
    /** 金额（单位：分） */
    private Long amount;
    
    private String description;     // 商品描述
    private String openid;          // JSAPI/小程序 必传
    private String prepayId;        // JSAPI/小程序 返回
    private String codeUrl;         // NATIVE 返回
    
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// 退款订单
@Entity
@Table(name = "wg_wechat_refund_order")
public class WechatRefundOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, length = 64)
    private String refundNo;        // 商户退款单号
    
    @Column(length = 64)
    private String orderNo;         // 原支付订单号
    
    @Column(length = 64)
    private String refundId;        // 微信退款单号
    
    private Long refundAmount;      // 退款金额（分）
    private Long totalAmount;       // 订单总金额（分）
    
    @Enumerated(EnumType.STRING)
    private RefundStatus status;    // PENDING / SUCCESS / FAILED
    
    private String reason;
    private LocalDateTime refundedAt;
    private LocalDateTime createdAt;
}
```

### 4. 服务层（核心）

```java
@Service
public class WechatPayService {
    
    @Value("${wechat.pay.app-id}")
    private String appId;
    
    @Value("${wechat.pay.mch-id}")
    private String mchId;
    
    private final WechatpayClient client;
    
    // Spring 启动时初始化（推荐 @Configuration 注入）
    public WechatPayService(
        @Value("${wechat.pay.private-key-path}") String privateKeyPath,
        @Value("${wechat.pay.merchant-cert-path}") String merchantCertPath,
        @Value("${wechat.pay.api-v3-key}") String apiV3Key,
        @Value("${wechat.pay.api-cert-serial-no}") String serialNo
    ) {
        PrivateKey merchantPrivateKey = PemUtil.loadPrivateKeyFromFile(privateKeyPath);
        X509Certificate merchantCert = PemUtil.loadCertificateFromFile(merchantCertPath);
        // 自动下载平台证书 + 定时刷新
        AutoUpdateCertificatesVerifier verifier = new AutoUpdateCertificatesVerifier(
            new WechatPay2Credentials(mchId, new PrivateKeySigner(serialNo, merchantPrivateKey)),
            apiV3Key.getBytes(StandardCharsets.UTF_8),
            "https://api.mch.weixin.qq.com/v3/certificates"
        );
        this.client = new WechatpayClient.Builder()
            .merchantId(mchId)
            .merchantSerialNumber(serialNo)
            .privateKey(merchantPrivateKey)
            .wechatpayCertificates(verifier)
            .build();
    }
    
    /** JSAPI 支付（公众号 / 微信内 H5） */
    public JsapiPayResponse createJsapiOrder(PayOrder order) {
        // 1. 构造请求
        JSONObject amount = new JSONObject()
            .put("total", order.getAmount())           // 单位：分
            .put("currency", "CNY");
        JSONObject payer = new JSONObject()
            .put("openid", order.getOpenid());
        
        JSONObject body = new JSONObject()
            .put("appid", appId)
            .put("mchid", mchId)
            .put("description", order.getDescription())
            .put("out_trade_no", order.getOrderNo())
            .put("notify_url", notifyUrl)
            .put("amount", amount)
            .put("payer", payer);
        
        // 2. 发起请求
        try {
            ResponseEntity<JSONObject> response = client.create(
                "/v3/pay/transactions/jsapi", body, JSONObject.class
            );
            String prepayId = response.getBody().getString("prepay_id");
            
            // 3. 构造前端调起支付参数（关键步骤）
            long timestamp = Instant.now().getEpochSecond();
            String nonceStr = UUID.randomUUID().toString().replace("-", "");
            String packageStr = "prepay_id=" + prepayId;
            
            // 签名串：appId\ntimestamp\nnonceStr\npackageStr\n
            String signStr = appId + "\n" + timestamp + "\n" + nonceStr + "\n" + packageStr + "\n";
            Signature signature = new Signature();
            String paySign = signature.sign(signStr, merchantPrivateKey);
            
            return new JsapiPayResponse(prepayId, timestamp, nonceStr, paySign);
        } catch (Exception e) {
            throw new BusinessException(-3001, "JSAPI 统一下单失败: " + e.getMessage());
        }
    }
    
    /** 小程序支付（同 JSAPI，但 appid 是小程序 appid） */
    public JsapiPayResponse createMiniProgramOrder(PayOrder order) {
        // 与 JSAPI 完全相同，仅 appid 不同
        return createJsapiOrder(order);
    }
    
    /** H5 支付（返回 h5_url 给前端跳转） */
    public H5PayResponse createH5Order(PayOrder order) {
        JSONObject amount = new JSONObject().put("total", order.getAmount()).put("currency", "CNY");
        JSONObject sceneInfo = new JSONObject()
            .put("payer_client_ip", order.getClientIp())
            .put("h5_info", new JSONObject().put("type", "Wap"));
        JSONObject body = new JSONObject()
            .put("appid", appId).put("mchid", mchId)
            .put("description", order.getDescription())
            .put("out_trade_no", order.getOrderNo())
            .put("notify_url", notifyUrl)
            .put("amount", amount).put("scene_info", sceneInfo);
        
        try {
            ResponseEntity<JSONObject> response = client.create(
                "/v3/pay/transactions/h5", body, JSONObject.class
            );
            return new H5PayResponse(response.getBody().getString("h5_url"));
        } catch (Exception e) {
            throw new BusinessException(-3001, "H5 统一下单失败: " + e.getMessage());
        }
    }
    
    /** Native 支付（PC 扫码，返回 code_url） */
    public NativePayResponse createNativeOrder(PayOrder order) {
        JSONObject amount = new JSONObject().put("total", order.getAmount()).put("currency", "CNY");
        JSONObject body = new JSONObject()
            .put("appid", appId).put("mchid", mchId)
            .put("description", order.getDescription())
            .put("out_trade_no", order.getOrderNo())
            .put("notify_url", notifyUrl)
            .put("amount", amount);
        
        try {
            ResponseEntity<JSONObject> response = client.create(
                "/v3/pay/transactions/native", body, JSONObject.class
            );
            return new NativePayResponse(response.getBody().getString("code_url"));
        } catch (Exception e) {
            throw new BusinessException(-3001, "Native 统一下单失败: " + e.getMessage());
        }
    }
    
    /** 退款 */
    public RefundResponse refund(RefundRequest req) {
        JSONObject amount = new JSONObject()
            .put("refund", req.getRefundAmount())
            .put("total", req.getTotalAmount())
            .put("currency", "CNY");
        JSONObject body = new JSONObject()
            .put("out_trade_no", req.getOrderNo())
            .put("out_refund_no", req.getRefundNo())
            .put("reason", req.getReason())
            .put("amount", amount)
            .put("notify_url", refundNotifyUrl);
        
        try {
            client.post("/v3/refund/domestic/refunds", body, JSONObject.class);
            return new RefundResponse(req.getRefundNo(), "PROCESSING");
        } catch (Exception e) {
            throw new BusinessException(-3005, "退款失败: " + e.getMessage());
        }
    }
    
    /** 查询订单 */
    public PayOrder queryOrder(String orderNo) {
        try {
            ResponseEntity<JSONObject> response = client.get(
                "/v3/pay/transactions/out-trade-no/" + orderNo + "?mchid=" + mchId,
                JSONObject.class
            );
            // 解析返回的 JSON，转换为 PayOrder
            return parsePayOrder(response.getBody());
        } catch (Exception e) {
            throw new BusinessException(-3003, "订单查询失败: " + e.getMessage());
        }
    }
    
    /** 关单 */
    public void closeOrder(String orderNo) {
        try {
            client.post("/v3/pay/transactions/out-trade-no/" + orderNo + "/close",
                new JSONObject().put("mchid", mchId), JSONObject.class);
        } catch (Exception e) {
            throw new BusinessException(-3001, "关单失败: " + e.getMessage());
        }
    }
}
```

### 5. 回调验签

```java
@PostMapping("/api/wechat-pay/notify")
public String notify(HttpServletRequest request, @RequestBody String body) {
    // 1. 获取验签所需头
    String timestamp = request.getHeader("Wechatpay-Timestamp");
    String nonce = request.getHeader("Wechatpay-Nonce");
    String signature = request.getHeader("Wechatpay-Signature");
    String serial = request.getHeader("Wechatpay-Serial");
    
    // 2. 构造验签串
    String signStr = timestamp + "\n" + nonce + "\n" + body + "\n";
    
    // 3. 验签（用 SDK 内置 verifier）
    try {
        if (!verifier.verify(serial, signStr, signature)) {
            log.warn("微信回调验签失败: {}", body);
            return responseFail();
        }
    } catch (Exception e) {
        log.error("验签异常", e);
        return responseFail();
    }
    
    // 4. 解密 resource 字段（AES-256-GCM）
    JSONObject resource = JSON.parseObject(body).getJSONObject("resource");
    String decrypted = AesUtil.decryptToString(
        resource.getString("associated_data"),
        resource.getString("nonce"),
        resource.getString("ciphertext"),
        apiV3Key
    );
    
    // 5. 处理订单
    JSONObject decryptedData = JSON.parseObject(decrypted);
    String orderNo = decryptedData.getString("out_trade_no");
    String transactionId = decryptedData.getString("transaction_id");
    
    // TODO: 更新订单状态（orderNo → PAID，写 transactionId）
    payOrderService.markAsPaid(orderNo, transactionId);
    
    return responseSuccess();
}

private String responseSuccess() {
    return "{\"code\":\"SUCCESS\",\"message\":\"成功\"}";
}

private String responseFail() {
    return "{\"code\":\"FAIL\",\"message\":\"失败\"}";
}
```

### 6. Controller

```java
@RestController
@RequestMapping("/api/wechat-pay")
public class WechatPayController {
    
    @Autowired private WechatPayService wechatPayService;
    @Autowired private WechatPayOrderService orderService;
    
    @PostMapping("/jsapi")
    public ApiResponse<JsapiPayResponse> jsapi(@RequestBody PayOrderRequest req) {
        return ApiResponse.ok(wechatPayService.createJsapiOrder(toOrder(req)));
    }
    
    @PostMapping("/miniprogram")
    public ApiResponse<JsapiPayResponse> miniprogram(@RequestBody PayOrderRequest req) {
        return ApiResponse.ok(wechatPayService.createMiniProgramOrder(toOrder(req)));
    }
    
    @PostMapping("/h5")
    public ApiResponse<H5PayResponse> h5(@RequestBody PayOrderRequest req) {
        return ApiResponse.ok(wechatPayService.createH5Order(toOrder(req)));
    }
    
    @PostMapping("/native")
    public ApiResponse<NativePayResponse> native(@RequestBody PayOrderRequest req) {
        return ApiResponse.ok(wechatPayService.createNativeOrder(toOrder(req)));
    }
    
    @PostMapping("/refund")
    public ApiResponse<RefundResponse> refund(@RequestBody RefundRequest req) {
        return ApiResponse.ok(wechatPayService.refund(req));
    }
    
    @GetMapping("/query/{orderNo}")
    public ApiResponse<WechatPayOrder> query(@PathVariable String orderNo) {
        return ApiResponse.ok(wechatPayService.queryOrder(orderNo));
    }
    
    @PostMapping("/close/{orderNo}")
    public ApiResponse<Void> close(@PathVariable String orderNo) {
        wechatPayService.closeOrder(orderNo);
        return ApiResponse.ok();
    }
}
```

## 数据库表（Flyway 迁移示例）

```sql
-- V1__create_wechat_pay_order.sql
CREATE TABLE wg_wechat_pay_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '业务订单号',
    transaction_id VARCHAR(64) COMMENT '微信支付订单号',
    scene VARCHAR(20) NOT NULL COMMENT 'JSAPI/MINI_PROGRAM/H5/NATIVE/APP',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/PAID/CLOSED/REFUNDED',
    amount BIGINT NOT NULL COMMENT '金额（分）',
    description VARCHAR(200) COMMENT '商品描述',
    openid VARCHAR(100) COMMENT 'JSAPI/小程序 openid',
    prepay_id VARCHAR(100) COMMENT 'JSAPI prepay_id',
    code_url VARCHAR(500) COMMENT 'NATIVE code_url',
    paid_at DATETIME COMMENT '支付时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信支付订单';

CREATE TABLE wg_wechat_refund_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    refund_no VARCHAR(64) NOT NULL UNIQUE COMMENT '商户退款单号',
    order_no VARCHAR(64) NOT NULL COMMENT '原订单号',
    refund_id VARCHAR(64) COMMENT '微信退款单号',
    refund_amount BIGINT NOT NULL COMMENT '退款金额（分）',
    total_amount BIGINT NOT NULL COMMENT '订单总金额（分）',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/SUCCESS/FAILED',
    reason VARCHAR(200) COMMENT '退款原因',
    refunded_at DATETIME COMMENT '退款成功时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信退款订单';
```

## 关键踩坑

| 坑 | 现象 | 解决 |
|---|------|------|
| 平台证书不刷新 | 一个月后回调验签失败 | 用 `AutoUpdateCertificatesVerifier` 自动下载 |
| 回调通知 5xx | 微信认为失败重发 | 业务逻辑放异步，主流程立即返回 SUCCESS |
| 同 orderNo 重复下单 | 报"订单号重复" | 业务方保证 orderNo 唯一 + Redis 幂等 |
| 退款金额 > 原单 | 报错 | 校验 `refundAmount <= totalAmount` |
| 沙箱环境配置 | 用正式 mchId 报错 | 测试用沙箱：`https://api.mch.weixin.qq.com/sandboxnew` |

## 不做

- ❌ 商户号开通（参考 [merchant-onboarding.md](references/merchant-onboarding.md)）
- ❌ 证书申请（参考同上）
- ❌ UI 组件（前端接入参考 `uniapp-wechat-pay-skill` 未来版本）
- ❌ 支付宝（独立 skill）

## 触发场景

用户说以下任一句即触发本 skill：
- 「帮我加微信支付」
- 「集成 JSAPI / 小程序 / H5 / Native / App 支付」
- 「做微信退款」
- 「配置微信商户号」
- 「微信支付回调怎么验签」
