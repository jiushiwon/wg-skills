---
name: springboot-alipay-pay-skill
description: Spring Boot 支付宝支付模块技能（独立版）。面向已有 Spring Boot 项目，提供支付宝当面付（条码/扫码）、手机网站支付、PC 网站支付、App 支付、退款、回调验签、订单查询、关单。**不包含微信支付**，如需微信请引入 springboot-wechat-pay-skill。触发词："支付宝"、"当面付"、"手机网站支付"、"PC支付"、"App支付"、"支付宝退款"、"支付宝回调"、"alipay"、"商户号配置"。
---

# Spring Boot Alipay Pay Module Skill

> 支付宝支付独立模块，**只覆盖支付宝渠道**。与微信支付完全解耦，按需引入。

## 与合一版的关系

| Skill | 范围 | 推荐度 |
|-------|------|--------|
| `springboot-alipay-pay-skill`（本） | 仅支付宝 | ⭐⭐⭐⭐⭐ 单一渠道项目 |
| `springboot-wechat-pay-skill` | 仅微信 | ⭐⭐⭐⭐⭐ 单一渠道项目 |
| `springboot-payment-module-skill` | 微信+支付宝合一 | 旧版，**已不推荐** |

## 能力清单

| 能力 | 适用场景 | 接口 |
|------|----------|------|
| **当面付（条码）** | 线下收银台，用户被扫 | `POST /api/alipay/trade/precreate` |
| **当面付（扫码）** | PC 网站生成二维码 | `POST /api/alipay/trade/precreate` |
| **手机网站支付** | 手机浏览器（H5） | `POST /api/alipay/trade/wap` |
| **PC 网站支付** | PC 浏览器（页面跳转） | `POST /api/alipay/trade/page` |
| **App 支付** | iOS / Android App | `POST /api/alipay/trade/app` |
| **退款** | 全渠道通用 | `POST /api/alipay/trade/refund` |
| **查询订单** | 全渠道通用 | `GET /api/alipay/trade/query/{orderNo}` |
| **关单** | 全渠道通用 | `POST /api/alipay/trade/close/{orderNo}` |
| **回调验签** | 全渠道通用 | `POST /api/alipay/notify` |
| **账单下载** | 对账 | `GET /api/alipay/bill` |

## 前置依赖

| 依赖 | 说明 |
|------|------|
| `springboot-init-skill` | 项目骨架（**必须**） |
| `springboot-auth-module-skill` | 当前用户获取（推荐） |
| `springboot-redis-module-skill` | 幂等防重 + 限流（推荐） |

## 核心实现

### 1. 依赖

```xml
<!-- 支付宝新版 SDK（推荐） -->
<dependency>
    <groupId>com.alipay.sdk</groupId>
    <artifactId>alipay-sdk-java</artifactId>
    <version>4.35.2.ALL</version>
</dependency>
```

### 2. 配置（application.yml）

```yaml
alipay:
  # ====== 必填项：从开放平台获取 ======
  app-id: ${ALIPAY_APP_ID:}                  # 16 位数字（沙箱：2021000000000000）
  
  # ====== 密钥对（V2 私钥 + 支付宝公钥） ======
  # 商户应用私钥（pkcs8 格式）
  private-key: ${ALIPAY_PRIVATE_KEY:}
  # 支付宝公钥（从开放平台获取，不是应用公钥！）
  alipay-public-key: ${ALIPAY_PUBLIC_KEY:}
  
  # ====== 回调地址 ======
  notify-url: ${ALIPAY_NOTIFY_URL:https://yourdomain.com/api/alipay/notify}
  return-url: ${ALIPAY_RETURN_URL:https://yourdomain.com/pay/success}
  
  # ====== 网关地址 ======
  # 生产：https://openapi.alipay.com/gateway.do
  # 沙箱：https://openapi.alipaydev.com/gateway.do
  gateway-url: ${ALIPAY_GATEWAY_URL:https://openapi.alipay.com/gateway.do}
  
  # ====== 签名方式 ======
  sign-type: RSA2
  charset: UTF-8
  format: json
```

> **完整配置说明 + 参数获取步骤** 见 [references/merchant-onboarding.md](references/merchant-onboarding.md)

### 3. 实体

```java
@Entity
@Table(name = "wg_alipay_pay_order")
public class AlipayPayOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, length = 64)
    private String orderNo;            // 商户订单号
    
    @Column(length = 64)
    private String tradeNo;            // 支付宝交易号（回调后回填）
    
    @Enumerated(EnumType.STRING)
    private PayScene scene;            // PRECREATE / WAP / PAGE / APP
    
    @Enumerated(EnumType.STRING)
    private PayStatus status;          // PENDING / PAID / CLOSED / REFUNDED
    
    /** 金额（单位：元，BigDecimal） */
    private BigDecimal amount;
    
    private String subject;            // 商品标题
    private String qrCode;              // 当面付返回的二维码
    private String payUrl;              // 手机/PC 网站支付返回的 URL
    private String paidAt;
    private LocalDateTime createdAt;
}

@Entity
@Table(name = "wg_alipay_refund_order")
public class AlipayRefundOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, length = 64)
    private String refundNo;
    @Column(length = 64)
    private String orderNo;
    @Column(length = 64)
    private String refundId;            // 支付宝退款单号
    private BigDecimal refundAmount;
    private BigDecimal totalAmount;
    @Enumerated(EnumType.STRING)
    private RefundStatus status;
    private String reason;
    private LocalDateTime refundedAt;
}
```

### 4. 服务层（核心）

```java
@Service
public class AlipayPayService {
    
    @Value("${alipay.app-id}") private String appId;
    @Value("${alipay.private-key}") private String privateKey;
    @Value("${alipay.alipay-public-key}") private String alipayPublicKey;
    @Value("${alipay.gateway-url}") private String gatewayUrl;
    @Value("${alipay.notify-url}") private String notifyUrl;
    @Value("${alipay.return-url}") private String returnUrl;
    
    private AlipayClient client;
    
    public AlipayPayService(...) {
        // 构造支付宝客户端（单例）
        this.client = new DefaultAlipayClient(
            gatewayUrl, appId, privateKey, "json", "UTF-8",
            alipayPublicKey, "RSA2"
        );
    }
    
    /** 当面付（预创建订单，返回二维码） */
    public PrecreateResponse precreate(PrecreateRequest req) {
        AlipayTradePrecreateRequest request = new AlipayTradePrecreateRequest();
        request.setNotifyUrl(notifyUrl);
        
        AlipayTradePrecreateModel model = new AlipayTradePrecreateModel();
        model.setOutTradeNo(req.getOrderNo());
        model.setTotalAmount(req.getAmount().toString());
        model.setSubject(req.getSubject());
        request.setBizModel(model);
        
        try {
            AlipayTradePrecreateResponse response = client.execute(request);
            if (response.isSuccess()) {
                return new PrecreateResponse(response.getQrCode());
            }
            throw new BusinessException(-3001, "预创建失败: " + response.getSubMsg());
        } catch (AlipayApiException e) {
            throw new BusinessException(-3001, "支付宝调用失败: " + e.getMessage());
        }
    }
    
    /** 手机网站支付（返回 form 表单，前端自动提交） */
    public String wapPay(WapPayRequest req) {
        AlipayTradeWapPayRequest request = new AlipayTradeWapPayRequest();
        request.setReturnUrl(returnUrl);
        request.setNotifyUrl(notifyUrl);
        
        AlipayTradeWapPayModel model = new AlipayTradeWapPayModel();
        model.setOutTradeNo(req.getOrderNo());
        model.setTotalAmount(req.getAmount().toString());
        model.setSubject(req.getSubject());
        model.setProductCode("QUICK_WAP_WAY");
        request.setBizModel(model);
        
        try {
            return client.pageExecute(request).getBody();  // 返回 HTML form
        } catch (AlipayApiException e) {
            throw new BusinessException(-3001, "WAP 支付失败: " + e.getMessage());
        }
    }
    
    /** PC 网站支付（页面跳转） */
    public String pagePay(PagePayRequest req) {
        AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
        request.setReturnUrl(returnUrl);
        request.setNotifyUrl(notifyUrl);
        
        AlipayTradePagePayModel model = new AlipayTradePagePayModel();
        model.setOutTradeNo(req.getOrderNo());
        model.setTotalAmount(req.getAmount().toString());
        model.setSubject(req.getSubject());
        model.setProductCode("FAST_INSTANT_TRADE_PAY");
        request.setBizModel(model);
        
        try {
            return client.pageExecute(request).getBody();
        } catch (AlipayApiException e) {
            throw new BusinessException(-3001, "PC 支付失败: " + e.getMessage());
        }
    }
    
    /** App 支付（返回 orderStr 给 App 端调起支付宝） */
    public String appPay(AppPayRequest req) {
        AlipayTradeAppPayRequest request = new AlipayTradeAppPayRequest();
        request.setNotifyUrl(notifyUrl);
        
        AlipayTradeAppPayModel model = new AlipayTradeAppPayModel();
        model.setOutTradeNo(req.getOrderNo());
        model.setTotalAmount(req.getAmount().toString());
        model.setSubject(req.getSubject());
        model.setProductCode("QUICK_MSECURITY_PAY");
        request.setBizModel(model);
        
        try {
            return client.sdkExecute(request).getBody();  // 返回 orderStr
        } catch (AlipayApiException e) {
            throw new BusinessException(-3001, "App 支付失败: " + e.getMessage());
        }
    }
    
    /** 退款 */
    public RefundResponse refund(RefundRequest req) {
        AlipayTradeRefundRequest request = new AlipayTradeRefundRequest();
        
        AlipayTradeRefundModel model = new AlipayTradeRefundModel();
        model.setOutTradeNo(req.getOrderNo());
        model.setOutRequestNo(req.getRefundNo());
        model.setRefundAmount(req.getRefundAmount().toString());
        model.setTotalAmount(req.getTotalAmount().toString());
        model.setRefundReason(req.getReason());
        request.setBizModel(model);
        
        try {
            AlipayTradeRefundResponse response = client.execute(request);
            if (response.isSuccess()) {
                return new RefundResponse(req.getRefundNo(), "PROCESSING");
            }
            throw new BusinessException(-3005, "退款失败: " + response.getSubMsg());
        } catch (AlipayApiException e) {
            throw new BusinessException(-3005, "退款异常: " + e.getMessage());
        }
    }
    
    /** 查询订单 */
    public AlipayPayOrder queryOrder(String orderNo) {
        AlipayTradeQueryRequest request = new AlipayTradeQueryRequest();
        AlipayTradeQueryModel model = new AlipayTradeQueryModel();
        model.setOutTradeNo(orderNo);
        request.setBizModel(model);
        
        try {
            AlipayTradeQueryResponse response = client.execute(request);
            // 解析返回，更新本地订单
            return parsePayOrder(response);
        } catch (AlipayApiException e) {
            throw new BusinessException(-3003, "查询失败: " + e.getMessage());
        }
    }
    
    /** 关单 */
    public void closeOrder(String orderNo) {
        AlipayTradeCloseRequest request = new AlipayTradeCloseRequest();
        AlipayTradeCloseModel model = new AlipayTradeCloseModel();
        model.setOutTradeNo(orderNo);
        request.setBizModel(model);
        
        try {
            AlipayTradeCloseResponse response = client.execute(request);
            if (!response.isSuccess()) {
                throw new BusinessException(-3006, "关单失败: " + response.getSubMsg());
            }
        } catch (AlipayApiException e) {
            throw new BusinessException(-3006, "关单异常: " + e.getMessage());
        }
    }
}
```

### 5. 回调验签

```java
@PostMapping("/api/alipay/notify")
public String notify(HttpServletRequest request) throws AlipayApiException {
    // 1. 获取所有参数（alipay 回调所有参数都在 form 里）
    Map<String, String> params = new HashMap<>();
    Enumeration<String> paramNames = request.getParameterNames();
    while (paramNames.hasMoreElements()) {
        String name = paramNames.nextElement();
        params.put(name, request.getParameter(name));
    }
    
    // 2. 验签（关键步骤）
    boolean signVerified = AlipaySignature.rsaCheckV1(
        params, alipayPublicKey, "UTF-8", "RSA2"
    );
    
    if (!signVerified) {
        log.warn("支付宝回调验签失败: {}", params);
        return "fail";
    }
    
    // 3. 处理订单
    String orderNo = params.get("out_trade_no");
    String tradeNo = params.get("trade_no");
    String tradeStatus = params.get("trade_status");
    
    if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
        payOrderService.markAsPaid(orderNo, tradeNo);
    }
    
    // 4. 必须返回 "success"（注意是小写，且不带任何空格）
    return "success";
}
```

## 数据库表（Flyway 迁移示例）

```sql
CREATE TABLE wg_alipay_pay_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '商户订单号',
    trade_no VARCHAR(64) COMMENT '支付宝交易号',
    scene VARCHAR(20) NOT NULL COMMENT 'PRECREATE/WAP/PAGE/APP',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10,2) NOT NULL COMMENT '金额（元）',
    subject VARCHAR(200) COMMENT '商品标题',
    qr_code TEXT COMMENT '当面付二维码',
    pay_url TEXT COMMENT 'WAP/PC 支付URL',
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付宝支付订单';

CREATE TABLE wg_alipay_refund_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    refund_no VARCHAR(64) NOT NULL UNIQUE,
    order_no VARCHAR(64) NOT NULL,
    refund_id VARCHAR(64),
    refund_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(200),
    refunded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付宝退款订单';
```

## 关键踩坑

| 坑 | 现象 | 解决 |
|---|------|------|
| 回调验签失败 | 应用公钥填错 | 用**支付宝公钥**（从开放平台复制），不是应用公钥 |
| WAP 支付跳到登录页 | 沙箱环境 | 切到生产环境 |
| 异步通知收不到 | 回调地址不通 | 必须是公网 HTTPS，内网穿透用 frp |
| App 支付 iOS 端没反应 | orderStr 错误 | 必须用 `client.sdkExecute(request).getBody()` 不用 pageExecute |
| 金额对不上 | 用了分（元） | 支付宝用**元**（BigDecimal），微信用**分**（long） |

## 不做

- ❌ 商户号开通（参考 [merchant-onboarding.md](references/merchant-onboarding.md)）
- ❌ 证书申请（参考同上）
- ❌ UI 组件
- ❌ 微信（独立 skill）

## 触发场景

用户说以下任一句即触发本 skill：
- 「帮我加支付宝支付」
- 「集成当面付 / 手机网站 / PC / App 支付」
- 「做支付宝退款」
- 「配置支付宝商户号」
- 「支付宝回调怎么验签」
