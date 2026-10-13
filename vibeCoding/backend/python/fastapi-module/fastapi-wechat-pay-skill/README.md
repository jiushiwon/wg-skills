# FastAPI WeChat Pay Skill

FastAPI 微信支付 V3 模块（独立版），只覆盖微信渠道。

## 功能

- JSAPI / 小程序 / H5 / Native / App 全场景下单
- 退款 + 退款回调
- 回调验签（V3 AES-256-GCM）
- 订单查询 / 关单
- 账单下载 / 对账

## 快速开始

```bash
# 1. 安装依赖
pip install wechatpayv3-py httpx

# 2. 配置商户参数（参考 references/merchant-onboarding.md）
# 3. 拷贝 services/wechat_pay_service.py 到项目
# 4. 执行 alembic 迁移
```

## 商户参数获取

详见 [references/merchant-onboarding.md](references/merchant-onboarding.md)，与 Spring Boot 版**完全相同**（同一个商户号/证书）。

## 使用方式

```
帮我加微信支付（Python）
FastAPI 集成 JSAPI 支付
做微信退款
配置微信商户号
```

## 触发词

微信支付 | JSAPI 支付 | 小程序支付 | H5 支付 | Native 支付
微信退款 | wechat pay v3 | 商户号配置

## 目录

```
fastapi-wechat-pay-skill/
├── SKILL.md
├── README.md
├── api-contract-wechat-pay.md
├── references/
│   └── merchant-onboarding.md
└── templates/
    ├── wechat_pay_service.py
    ├── wechat_pay_router.py
    └── config.example
```

## 配套技能

| 场景 | 引入 |
|------|------|
| 同时需要支付宝 | `fastapi-alipay-pay-skill` |
| 用户体系 | `fastapi-auth-module-skill` |
| 异步通知 + 限流 | `python-redis-module-skill` |
| 退款通知 | `fastapi-notification-module-skill` |
| 操作审计 | `fastapi-log-module-skill` |
