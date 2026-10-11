---
name: universal-identity-bridge-skill
description: 项目级统一身份接入编排技能。将业务项目接入公开的 java-auth-admin 身份中枢，交付 Java 接入实现、应用密钥与小程序扫码绑定流程；Go/Python 当前只提供契约与接入边界。兼容触发词 "universal-login-bridge-skill"。触发词："统一身份接入"、"账户互通"、"扫码绑定账号"、"接入 java-auth-admin"、"多项目统一登录"。
trigger: |
  统一身份接入 | 账户互通 | 统一登录 | 统一鉴权 | 扫码绑定账号
  接入 java-auth-admin | 多项目统一登录 | 应用密钥 | 绑定码
  universal-identity-bridge-skill | universal-login-bridge-skill
---

# universal-identity-bridge-skill

> 项目级编排器：把业务项目接入统一身份中枢，不在接入项目重复创建账户、密码或角色体系。

## 产品分层

| 层 | 定位 | 开放性 |
|---|---|---|
| `java-auth-admin` / Java 基础技能 | 身份中枢的可运行参考：用户、RBAC、应用、密钥、绑定码、扫码绑定 | 公开 |
| 本技能 | 接入编排、Java 模板、多语言契约、AI 受控接入规则 | 项目级交付 |
| 业务项目 | 保有自己的业务资料和业务数据，不保有密码 | 接入方 |

## 已交付与预留范围

| 能力 | Java | Go | Python |
|---|---|---|---|
| Bearer Token 接入与当前用户上下文 | 已提供模板 | 契约预留 | 契约预留 |
| 应用 HMAC 签名调用 | 已提供模板 | 契约预留 | 契约预留 |
| 应用注册、密钥轮换、账户绑定 | 对齐现有账户中枢 | 对齐契约 | 对齐契约 |
| 小程序扫码绑定 | 对齐现有绑定码流程 | 对齐契约 | 对齐契约 |
| 刷新令牌轮换、设备会话、短信登录、UUIDv7 身份号 | 未实现，不得宣称已交付 | 未实现 | 未实现 |

## 必须遵守的边界

1. 身份中枢是唯一的账户事实来源；接入方不得新建密码、用户、角色、权限表。
2. 业务资料归业务项目。例如头像可按授权读取公共 Profile；生活习惯等敏感数据必须归属业务项目，不得塞入身份中枢。
3. `globalUserId` 是后续跨项目身份锚点，不能等同于访问任意用户信息的权限。
4. 应用密钥只能在服务端环境变量或密钥管理服务中使用，严禁进入前端、日志和版本库。
5. AI 只能生成候选接入代码；创建密钥、解绑、删除应用、执行迁移均须真人确认。

## 接入流程

1. 确认账户中枢已具备 `springboot-auth-module-skill` 与 `universal-login-api`。
2. 选择语言实现：当前 Java 使用 `templates/java/`；Go/Python 只能按契约接入，不伪造“已提供 SDK”。
3. 在中枢创建应用与应用密钥；密钥只在创建响应展示一次。
4. 业务项目以 Bearer Token 获取当前主体，以 HMAC 调用 `/api/open/**`。
5. 将实际使用的接口、错误码补充进业务项目的 `api-contract.md`，完成非超管账号实测。

## 已实现的扫码绑定链路

### 应用发起

```text
业务应用以应用密钥申请绑定码
→ 用户到身份中枢完成登录并确认
→ 中枢写入“宿主用户 ↔ 应用用户”绑定关系
```

### 宿主发起

```text
用户在身份中枢生成一次性绑定码或二维码
→ 小程序/业务应用扫描并以应用密钥认领
→ 中枢完成绑定并使绑定码失效
```

绑定码必须落库、5 分钟有效、一次性消费；并发消费以条件更新受影响行数判定。

## 接入自检

- [ ] 接入项目没有密码、用户、角色、权限的重复实现。
- [ ] 用户 Token 仅通过 `Authorization: Bearer` 传递。
- [ ] `/api/open/**` 使用 `X-App-Key`、时间戳、nonce、HMAC 签名，不是公开接口。
- [ ] 绑定确认只提交 `code`，用户身份只取可信登录态。
- [ ] 非超管账号可完成菜单、接口与按钮权限验证。
- [ ] 未把未实现的刷新令牌、短信登录、全局资料扩展写入交付清单。

## 文件导航

| 文件 | 用途 |
|---|---|
| `references/architecture.md` | 身份中枢与业务数据边界 |
| `references/capability-matrix.md` | Java/Go/Python 交付状态 |
| `references/api-contract.md` | 当前已实现接口契约 |
| `references/ai-governance.md` | AI 接入权限与确认规则 |
| `templates/java/` | Java 接入模板 |
| `templates/go/README.md` | Go 后续实现约定 |
| `templates/python/README.md` | Python 后续实现约定 |

## 兼容性

本技能由 `universal-login-bridge-skill` 更名而来。旧触发词继续有效；旧目录路径应迁移至本目录，新增实现只在新目录维护。
