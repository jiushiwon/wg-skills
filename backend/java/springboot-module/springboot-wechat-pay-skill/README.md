# Spring Boot WeChat Pay Skill

Spring Boot 微信支付 V3 模块（独立版），只覆盖微信渠道。

## 功能

- JSAPI / 小程序 / H5 / Native / App 全场景下单
- 退款 + 退款回调
- 回调验签（V3 AES-256-GCM）
- 订单查询 / 关单
- 账单下载 / 对账

## 快速开始

```bash
# 1. 引入依赖
<dependency>
    <groupId>com.github.wechatpay-apiv3</groupId>
    <artifactId>wechatpay-java</artifactId>
    <version>0.2.18</version>
</dependency>

# 2. 配置商户参数（参考 references/merchant-onboarding.md）
# 3. 拷贝 templates/ 下的实体 + Service + Controller 到项目
# 4. 执行 Flyway 迁移
```

## 商户参数获取

详见 [references/merchant-onboarding.md](references/merchant-onboarding.md)，包含：
- 商户号申请流程
- API 证书申请
- APIv3 密钥设置
- 回调地址配置
- 沙箱测试账号

## 使用方式

```
帮我加微信支付
集成 JSAPI 支付
做微信退款
配置微信商户号
```

## 触发词

微信支付 | JSAPI 支付 | 小程序支付 | H5 支付 | Native 支付 | App 支付
微信退款 | 微信回调 | wechat pay v3 | 商户号配置

## 目录

```
springboot-wechat-pay-skill/
├── SKILL.md
├── README.md
├── api-contract-wechat-pay.md
├── references/
│   └── merchant-onboarding.md
└── templates/
    ├── WechatPayService.java
    ├── WechatPayOrder.java
    ├── WechatPayController.java
    └── application-wechat-pay.yml
```

## 配套技能

| 场景 | 引入 |
|------|------|
| 同时需要支付宝 | `springboot-alipay-pay-skill` |
| 用户体系 | `springboot-auth-module-skill` |
| 异步通知 + 限流 | `springboot-redis-module-skill` |
| 退款通知 | `springboot-notification-module-skill` |
| 操作审计 | `springboot-log-module-skill` |
