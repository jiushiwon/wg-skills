# FastAPI Module Skills

Python FastAPI 业务模块技能集合

## 包含的技能（13 个）

| 技能 | 功能 |
|------|------|
| `fastapi-auth-module-skill` | RBAC 权限底座 |
| `fastapi-agent-module-skill` | AI Agent |
| `fastapi-ai-chat-module-skill` | AI 聊天 |
| `fastapi-dict-module-skill` | 数据字典 |
| `fastapi-log-module-skill` | 操作日志 |
| `fastapi-notification-module-skill` | 消息通知 |
| `fastapi-org-permission-module-skill` | 组织权限 |
| `fastapi-payment-module-skill` | 支付 |
| `fastapi-storage-module-skill` | 文件存储 |
| `fastapi-upload-module-skill` | 文件上传 |
| `fastapi-ws-module-skill` | WebSocket |
| `python-kafka-module-skill` | Kafka |
| `python-redis-module-skill` | Redis |

## 设计原则

每个 module 独立可叠加，叠加到 `fastapi-init-skill` 生成的项目上。

## 使用方式

```bash
cp -r fastapi-auth-module-skill/* my-project/
cp -r fastapi-storage-module-skill/* my-project/
```

## 依赖

- `fastapi-init-skill` - 基础骨架
- `database-design-skill` - 数据库设计规范
