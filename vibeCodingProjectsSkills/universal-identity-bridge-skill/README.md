# universal-identity-bridge-skill

把一个业务项目接入统一身份中枢的项目级编排技能。它服务于公开的 `java-auth-admin`：公开项目负责把账户与扫码绑定跑通，本技能负责把更多项目以一致、安全的方式接进来。

## 当前能做什么

- Java 项目可复用 Bearer Token 当前用户上下文与应用 HMAC 签名模板。
- 业务应用可创建应用密钥，并走“应用发起确认”或“小程序扫码认领”完成账户绑定。
- 一个宿主用户与一个应用用户建立唯一映射；接入方无需存密码，也不需要复制用户表。
- 提供 AI 接入治理规则，限制密钥、用户令牌和破坏性操作。

## 不能声称已经实现什么

刷新令牌轮换、设备会话、全局登出、改密强制下线、手机号短信登录、UUIDv7 全局身份号、动态资料模型目前都还没有实现。本技能只将它们记录为后续路线，不把设计当成交付。

## 三层责任

| 层 | 负责内容 |
|---|---|
| 身份中枢 | 账户、密码、RBAC、应用、密钥、绑定码、绑定关系 |
| 本技能 | 契约、Java 接入模板、跨语言演进边界、AI 治理 |
| 业务项目 | 项目私有资料与业务数据，如订单、笔记、生活习惯 |

## 快速使用

```text
/universal-identity-bridge-skill 将当前 Spring Boot 项目接入 java-auth-admin，
只使用现有的应用密钥与小程序扫码绑定能力
```

使用前先阅读：

- [架构边界](./references/architecture.md)
- [能力矩阵](./references/capability-matrix.md)
- [接口契约](./references/api-contract.md)
- [AI 治理规则](./references/ai-governance.md)

## 多语言路线

| 语言 | 状态 |
|---|---|
| Java | 已提供接入模板，作为当前唯一可复制实现 |
| Go | 仅预留目录与契约，尚未提供 SDK |
| Python | 仅预留目录与契约，尚未提供 SDK |

旧名称 `universal-login-bridge-skill` 仍可作为触发词使用；目录已迁移为 `universal-identity-bridge-skill`。
