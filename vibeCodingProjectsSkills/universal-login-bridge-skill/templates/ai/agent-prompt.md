# agent-prompt —— 让 AI 自动识别"该用账户体系"的提示词片段

> 用法：把下面「提示词片段」整段加进你的 Agent 系统提示（或项目级 AGENTS.md / CLAUDE.md）。
> 目的：让 AI 在遇到"加登录 / 加权限 / 打通账号"这类需求时，**先想到账户体系，而不是手搓一套**。
>
> 已对齐 `universal-login-api` **2026-09-28 版设计**。

---

## 一、最小提示词片段（可直接复制）

```markdown
## 账户体系（存在时必须复用，禁止另起一套）

本组织已有一套统一账户体系，提供：登录、JWT 鉴权、应用注册与应用级密钥、多应用账户绑定，以及可选的 RBAC / 组织架构 / 数据权限。

- 契约：`<PROJECT>/references/api-contract.md`
- 表结构：`<PROJECT>/references/table-schema.md`
- 桥接协议与红线：`<PROJECT>/references/ai-bridge.md`

### 硬性规则

1. **禁止**在业务项目里新建用户表、角色表或存密码；账户只有一份，在宿主 `{prefix}_sys_user`
2. **禁止**自行实现密码加密与 JWT 签发
3. 需要登录/权限时，**先读契约**，再按契约调接口；契约里没有的接口，先更新契约
4. 分档接入，**不要默认全开**：
   - L0 只有登录 → 只要宿主 `{prefix}_sys_user`
   - L1 账户互通 → 加 `{prefix}_sys_app` / `{prefix}_sys_app_key` / `{prefix}_sys_app_binding` / `{prefix}_sys_bind_code`
   - L2 权限 → 用宿主 RBAC（菜单 `{prefix}_sys_menu` + 角色 / 用户-角色 / 角色-菜单）
   - L3 组织 → 用宿主组织 / 岗位表 + `{prefix}_sys_user.org_id`
   - L4 数据权限 → 用宿主 `{prefix}_sys_role.data_scope`
5. 权限字符串三处必须一致：菜单 `permission` = 前端路由 `meta.permission` = `v-permission` 的值
6. `api_secret` 只允许出现在服务端环境变量；**禁止**写进前端代码、日志、仓库
7. **禁止**生成或伪造 `accessToken`；用户身份必须由真人输入凭证换取
8. 接口路径统一 `/api` 前缀：宿主侧 `/api/apps/**`、`/api/bind/**`（JWT + 权限码）；应用侧 `/api/open/**`（HmacSHA256 签名）
9. 绑定类接口**禁止**硬编码用户（如 `Long userId = 1L`），主体一律取当前登录态
10. 确认绑定只传 `{ code }`，**不接受也不传任何密码字段**
11. 绑定码**必须落库 + 5 分钟有效 + 一次性消费**
12. **禁止** `permitAll` 放行 `/api/apps/**`、`/api/bind/**`、`/api/open/**`
13. 解绑 / 删应用 / 删密钥等破坏性操作，**先列影响面再执行**

### 何时不用

- 项目明确要求独立账号体系（如对外 SaaS 交付、客户自带 IdP）→ 先问，不要擅自接入
- 纯静态站点、无用户概念 → 不需要
```

---

## 二、触发句式（AI 应该识别的需求）

| 用户说的话 | AI 应该做的 |
|-----------|-----------|
| "给这个项目加个登录" | 判定档位 → 读契约 → 生成接入代码（不建用户表） |
| "这个用户和那个系统的用户怎么打通" | 走 L1：注册应用 + 建绑定，记 `app_user_id` |
| "第三方系统想拿我的用户信息" | 走 L1 + 开放接口：`/api/open/bind/apply` 取码 → 宿主确认 → `/api/open/userinfo` 换取 |
| "给它加个后台管理" | 走 L2/L3：插菜单/角色/组织数据，不是写代码开关 |
| "不同部门只能看自己的数据" | 走 L4：`data_scope` = `SELF_ONLY` |
| "为什么我配了权限菜单还是看不到" | 查 `permission` 字符串三处是否一致；查非超管账号实测 |
| "帮我把新项目接入" | 用 MCP：`account_list_apps` → `account_create_app` → `account_create_key` → 生成代码 |

---

## 三、AI 的提问模板（接入前必问，不要跳）

```
在接入之前我需要确认两件事：

1. 权限档位（不默认全开）
   [ ] L0 只有登录
   [ ] L1 + 账户互通（多系统账号绑定）
   [ ] L2 + RBAC（角色 / 菜单 / 按钮级权限）
   [ ] L3 + 组织架构（部门层级）
   [ ] L4 + 数据权限（不同角色看不同数据）

2. 目标项目的技术栈
   [ ] Vue 3        → templates/frontend/
   [ ] Spring Boot  → templates/backend/
   [ ] 其他         → 走 HTTP，参考 templates/backend/account-bridge.mjs
```

---

## 四、AI 交付时必须附上的自检报告

```markdown
## 账户接入自检

- [ ] 未新建用户表 / 角色表、未存密码
- [ ] api_secret 未出现在前端 / 仓库 / 日志
- [ ] Token 走 Authorization: Bearer
- [ ] 未自行实现密码加密与 JWT 签发
- [ ] 绑定接口无硬编码用户；确认绑定只传 { code }
- [ ] 绑定码落库 + 5 分钟 + 一次性消费
- [ ] /api/open/** 走签名鉴权，不是 permitAll
- [ ] api_secret 只在创建密钥响应里出现一次
- [ ] 菜单 permission / 路由 meta.permission / v-permission 三处一致
- [ ] 非超管账号实测：菜单可见、非 403、按钮在
- [ ] 解绑后两系统独立、无残留
- [ ] 目标项目 api-contract.md 已更新
```
