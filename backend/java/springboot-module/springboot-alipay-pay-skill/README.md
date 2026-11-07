# Spring Boot Alipay Pay Skill

Spring Boot 支付宝支付模块（独立版），只覆盖支付宝渠道。

## 功能

- 当面付（条码/扫码）/ 手机网站支付 / PC 网站支付 / App 支付
- 退款 + 退款回调
- 回调验签（RSA2）
- 订单查询 / 关单
- 账单下载 / 对账

## 快速开始

```bash
# 1. 引入依赖
<dependency>
    <groupId>com.alipay.sdk</groupId>
    <artifactId>alipay-sdk-java</artifactId>
    <version>4.35.2.ALL</version>
</dependency>

# 2. 配置商户参数（参考 references/merchant-onboarding.md）
# 3. 拷贝 templates/ 下的实体 + Service + Controller 到项目
# 4. 执行 Flyway 迁移
```

## 商户参数获取

详见 [references/merchant-onboarding.md](references/merchant-onboarding.md)，包含：
- 开放平台账号注册
- 应用创建（网页/移动）
- 密钥对生成（推荐 RSA2）
- 支付宝公钥配置
- 沙箱环境使用

## 使用方式

```
帮我加支付宝支付
集成当面付
做支付宝退款
配置支付宝商户号
```

## 触发词

支付宝 | 当面付 | 手机网站支付 | PC 支付 | App 支付
支付宝退款 | 支付宝回调 | alipay | 商户号配置

## 目录

```
springboot-alipay-pay-skill/
├── SKILL.md
├── README.md
├── api-contract-alipay.md
├── references/
│   └── merchant-onboarding.md
└── templates/
    ├── AlipayPayConfig.java
    ├── AlipayPayService.java
    ├── AlipayPayNotifyController.java
    └── application-alipay.yml
```

## 配套技能

| 场景 | 引入 |
|------|------|
| 同时需要微信 | `springboot-wechat-pay-skill` |
| 用户体系 | `springboot-auth-module-skill` |
| 异步通知 + 限流 | `springboot-redis-module-skill` |
| 退款通知 | `springboot-notification-module-skill` |
| 操作审计 | `springboot-log-module-skill` |
