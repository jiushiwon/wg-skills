# FastAPI Alipay Skill

FastAPI 支付宝模块（独立版），只覆盖支付宝渠道。

## 功能

- 当面付（扫码） / WAP（手机网站）/ PC / App 全场景下单
- 退款 + 退款回调
- 回调验签（RSA2）
- 订单查询 / 关单
- 对账单下载

## 快速开始

```bash
# 1. 安装依赖
pip install python-alipay-sdk pycryptodome

# 2. 配置商户参数（参考 references/merchant-onboarding.md）
# 3. 拷贝 services/alipay_pay_service.py 到项目
# 4. 执行 alembic 迁移
```

## 商户参数获取

详见 [references/merchant-onboarding.md](references/merchant-onboarding.md)，与 Spring Boot 版**完全相同**（同一个 APPID/密钥对）。

## 触发词

支付宝 | 当面付 | 扫码支付 | 手机网站支付 | WAP 支付
PC 支付 | App 支付 | 支付宝退款 | alipay | RSA2 验签

## 目录

```
fastapi-alipay-pay-skill/
├── SKILL.md
├── README.md
├── api-contract-alipay.md
├── references/
│   └── merchant-onboarding.md
└── templates/
    └── alipay_pay_service.py
```

## 配套技能

| 场景 | 引入 |
|------|------|
| 同时需要微信 | `fastapi-wechat-pay-skill` |
| 用户体系 | `fastapi-auth-module-skill` |
| 异步通知 + 限流 | `python-redis-module-skill` |
| 退款通知 | `fastapi-notification-module-skill` |
| 操作审计 | `fastapi-log-module-skill` |
