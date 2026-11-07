---
name: springboot-payment-module-skill
description: Spring Boot 支付模块技能。面向已有 Spring Boot 项目的开发者，提供微信支付、支付宝支付、退款、回调通知、对账等能力的快速集成。触发词："微信支付"、"支付宝支付"、"支付模块"、"退款"、"回调通知"、"对账"、"payment module"、"wechat pay"、"alipay"、"refund"。
---

# Spring Payment Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成支付能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **微信支付** | JSAPI/小程序/H5/App 支付 |
| **支付宝支付** | wap/PC/App 支付 |
| **退款** | 退款申请/查询/回调 |
| **回调通知** | 异步通知验签 |
| **对账** | 账单下载/核对 |

## 触发场景

用户说"帮我加支付"或"集成微信/支付宝"时触发。

## 核心实现

### 依赖配置

```xml
<!-- 微信支付 -->
<dependency>
    <groupId>com.github.wxpay</groupId>
    <artifactId>wxpay-sdk</artifactId>
    <version>3.0.10</version>
</dependency>

<!-- 支付宝 -->
<dependency>
    <groupId>com.alipay.sdk</groupId>
    <artifactId>alipay-sdk-java</artifactId>
    <version>4.35.2.ALL</version>
</dependency>
```

### 配置

```yaml
# 微信支付
wechat:
  pay:
    app-id: ${WECHAT_APP_ID:}
    mch-id: ${WECHAT_MCH_ID:}
    api-key: ${WECHAT_API_KEY:}
    cert-path: ${WECHAT_CERT_PATH:}
    notify-url: ${WECHAT_NOTIFY_URL:}

# 支付宝
alipay:
  app-id: ${ALIPAY_APP_ID:}
  private-key: ${ALIPAY_PRIVATE_KEY:}
  alipay-public-key: ${ALIPAY_PUBLIC_KEY:}
  notify-url: ${ALIPAY_NOTIFY_URL:}
  return-url: ${ALIPAY_RETURN_URL:}
```

### 实体类

```java
// 支付订单
@Entity
@Table(name = "wg_pay_order")
public class PayOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String orderNo;
    
    private String payOrderNo;
    
    @Enumerated(EnumType.STRING)
    private PayType payType;
    
    @Enumerated(EnumType.STRING)
    private PayStatus status;
    
    private BigDecimal amount;
    
    private String subject;
    
    private String body;
    
    private String notifyUrl;
    
    private String returnUrl;
    
    private String userId;
    
    private String openid;
    
    private LocalDateTime paidAt;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}

public enum PayType { WECHAT, ALIPAY }
public enum PayStatus { PENDING, PAID, REFUNDED, CLOSED }

// 退款订单
@Entity
@Table(name = "wg_refund_order")
public class RefundOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String refundNo;
    
    private String payOrderNo;
    
    private String refundId;
    
    private BigDecimal refundAmount;
    
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    private RefundStatus status;
    
    private String reason;
    
    private LocalDateTime refundedAt;
    
    private LocalDateTime createdAt;
}

public enum RefundStatus { PENDING, SUCCESS, FAILED }
```

### 服务层

```java
@Service
public class WechatPayService {
    
    @Value("${wechat.pay.app-id}")
    private String appId;
    
    @Value("${wechat.pay.mch-id}")
    private String mchId;
    
    @Value("${wechat.pay.api-key}")
    private String apiKey;
    
    // 统一下单
    public String createOrder(PayOrder order) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("appid", appId);
        params.put("mch_id", mchId);
        params.put("nonce_str", WxPayUtil.generateNonceStr());
        params.put("body", order.getSubject());
        params.put("out_trade_no", order.getOrderNo());
        params.put("total_fee", order.getAmount().multiply(new BigDecimal("100")).intValue() + "");
        params.put("spbill_create_ip", "127.0.0.1");
        params.put("notify_url", order.getNotifyUrl());
        params.put("trade_type", "JSAPI");
        params.put("openid", order.getOpenid());
        
        String sign = WxPayUtil.generateSignature(params, apiKey);
        params.put("sign", sign);
        
        String xml = WxPayUtil.mapToXml(params);
        String result = HttpUtil.post("https://api.mch.weixin.qq.com/pay/unifiedorder", xml);
        
        Map<String, String> resultMap = WxPayUtil.xmlToMap(result);
        return resultMap.get("prepay_id");
    }
    
    // 回调验签
    public boolean verifyNotify(Map<String, String> notifyData) {
        String sign = notifyData.get("sign");
        notifyData.remove("sign");
        String calculatedSign = WxPayUtil.generateSignature(notifyData, apiKey);
        return sign.equals(calculatedSign);
    }
}

@Service
public class AlipayService {
    
    @Value("${alipay.app-id}")
    private String appId;
    
    @Value("${alipay.private-key}")
    private String privateKey;
    
    // 统一下单
    public String createOrder(PayOrder order) throws AlipayApiException {
        AlipayTradeWapPayRequest request = new AlipayTradeWapPayRequest();
        request.setReturnUrl(order.getReturnUrl());
        request.setNotifyUrl(order.getNotifyUrl());
        
        AlipayTradeWapPayModel model = new AlipayTradeWapPayModel();
        model.setOutTradeNo(order.getOrderNo());
        model.setSubject(order.getSubject());
        model.setTotalAmount(order.getAmount().toString());
        model.setProductCode("QUICK_WAP_WAY");
        
        request.setBizModel(model);
        
        AlipayClient client = new DefaultAlipayClient(
            "https://openapi.alipay.com/gateway.do",
            appId,
            privateKey,
            "json",
            "UTF-8",
            AlipayConfig.alipayPublicKey,
            "RSA2"
        );
        
        return client.pageExecute(request).getBody();
    }
    
    // 验签
    public boolean verifyNotify(Map<String, String> params) {
        // 使用 AlipaySignature.rsaCheckV1 验签
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/api/pay")
public class PayController {
    
    @Autowired
    private WechatPayService wechatPayService;
    
    @Autowired
    private AlipayService alipayService;
    
    // 微信支付
    @PostMapping("/wechat/create")
    public ApiResponse<String> createWechatOrder(@RequestBody PayOrder order) {
        try {
            String prepayId = wechatPayService.createOrder(order);
            return ApiResponse.ok(prepayId);
        } catch (Exception e) {
            return ApiResponse.fail(-1, e.getMessage());
        }
    }
    
    // 支付宝支付
    @PostMapping("/alipay/create")
    public ApiResponse<String> createAlipayOrder(@RequestBody PayOrder order) {
        try {
            String form = alipayService.createOrder(order);
            return ApiResponse.ok(form);
        } catch (AlipayApiException e) {
            return ApiResponse.fail(-1, e.getMessage());
        }
    }
    
    // 微信回调
    @PostMapping("/wechat/notify")
    public String wechatNotify(@RequestBody String xmlData) {
        try {
            Map<String, String> data = WxPayUtil.xmlToMap(xmlData);
            if (wechatPayService.verifyNotify(data)) {
                // 更新订单状态
                return "<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>";
            }
        } catch (Exception e) {
            log.error("微信回调处理失败", e);
        }
        return "<xml><return_code><![CDATA[FAIL]]></return_code></xml>";
    }
    
    // 支付宝回调
    @PostMapping("/alipay/notify")
    public String alipayNotify(@RequestParam Map<String, String> params) {
        if (alipayService.verifyNotify(params)) {
            // 更新订单状态
            return "success";
        }
        return "fail";
    }
}
```

## 不做

- 不负责商户号配置
- 不处理复杂的退款流程
- 不提供 UI 相关代码
