# SpringBoot Module Skills

Java SpringBoot 业务模块技能集合

## 包含的技能（12 个）

| 技能 | 功能 |
|------|------|
| `springboot-auth-module-skill` | RBAC 权限底座 |
| `springboot-agent-module-skill` | AI Agent 模块 |
| `springboot-dict-module-skill` | 数据字典 |
| `springboot-kafka-module-skill` | Kafka 消息 |
| `springboot-log-module-skill` | 操作日志 |
| `springboot-notification-module-skill` | 消息通知 |
| `springboot-org-permission-module-skill` | 组织权限 |
| `springboot-payment-module-skill` | 支付 |
| `springboot-redis-module-skill` | Redis 缓存 |
| `springboot-storage-module-skill` | 文件存储 |
| `springboot-upload-module-skill` | 文件上传 |
| `universal-login-api` | 通用登录 |

## 设计原则

每个 module 独立可叠加，叠加到 `springboot-init-skill` 生成的项目上。

## 使用方式

```bash
cp -r springboot-auth-module-skill/* my-project/
cp -r springboot-storage-module-skill/* my-project/
```

## 依赖

- `springboot-init-skill` - 基础骨架
- `database-design-skill` - 数据库设计规范
