---
name: universal-login-bridge-skill
description: 多账户体系桥接技能（项目级）。把任意项目接入宿主账户体系（宿主账户 + 应用 + 应用密钥 + 账户绑定），并提供 AI 侧桥接能力——契约、表结构、桥接协议、接入模板、MCP 工具，让 AI 能自己完成一次"新项目接入"。**不定义账户、不定义角色**。支持四档按需开启：L0 只登录 / L1 账户互通 / L2 RBAC / L3 组织架构 / L4 数据权限。触发词："接入账户体系"、"多账户"、"账户互通"、"统一登录"、"第三方账号绑定"、"账户体系 MCP"、"AI 桥接账户"、"开启权限组织"。
trigger: |
  接入账户体系 | 多账户体系 | 账户互通 | 统一登录 | 统一鉴权
  第三方账号绑定 | 绑定已有账户 | 账户桥接 | 接入登录中心
  账户体系 MCP | AI 桥接账户 | 让 AI 调账户接口
  开启权限组织 | 开启 RBAC | 开启组织架构 | 开启数据权限
  应用管理 | API 密钥 | 绑定码 | 绑定列表
---

# universal-login-bridge-skill

> **项目级桥接技能。** 它不重新实现账户系统，只做一件事：**把"别的项目"和"账户体系"接起来**，并且让 **AI 也能自己完成这个接入动作**。

> ### 对齐声明
> 本技能已对齐 `universal-login-api` **2026-09-28 版设计**：账户与角色/权限全部来自宿主技能，本技能**不建账户表、不建角色表**；表前缀统一 `{prefix}_sys_*`；接口路径统一 `/api` 前缀。

## 定位

| 项 | 说明 |
|----|------|
| 上游 | `universal-login-api`（账户中枢）——4 张接入表：`{prefix}_sys_app` / `{prefix}_sys_app_key` / `{prefix}_sys_app_binding` / `{prefix}_sys_bind_code` |
| 上游依赖 | `springboot-auth-module-skill`（宿主账户 `{prefix}_sys_user` + RBAC）、`springboot-init-skill`（骨架） |
| 本技能 | 接入侧编排器 + AI 桥接层 |
| 下游 | 任意需要登录 / 权限 / 多端打通的业务项目 |
| 目标用户 | VibeCoder（个人开发者、小团队、多项目并行） |

## 与相邻技能的关系

```
vibeCodingProjectsSkills/
└── universal-login-bridge-skill          # 本技能：接入 + AI 桥接（项目级）
        │
        ├── 依赖 → vibeCoding/backend/java/springboot-module/universal-login-api      # 后端生成
        ├── 依赖 → springboot-auth-module-skill                                        # 宿主账户 + RBAC
        ├── 依赖 → vibeCoding/frontend/vue/vue-base-skill/universal-login-page         # 前端生成
        ├── 复用 → vue-admin-skill                                                     # 若目标项目本身是管理后台
        └── 遵守 → frontend-request-skill/references/api-contract.md                   # 请求层契约
```

**职责边界**：`universal-login-api` 负责"生成账户体系后端"，`universal-login-page` 负责"生成账户页面"，**本技能负责"把目标项目接进去 + 让 AI 会接"**。

## 核心概念（4 张接入表，先记住这个）

| 表 | 中文 | 一句话 |
|----|------|--------|
| `{prefix}_sys_app` | 应用 | 一个接入的业务系统一行。**只有公开标识 `app_key`，不存密钥** |
| `{prefix}_sys_app_key` | 应用密钥 | 应用级凭证的唯一存放处：`api_key` + `api_secret`，可多组、可轮换 |
| `{prefix}_sys_app_binding` | 绑定 | 宿主账户 ↔ 应用账号 的映射。`(sys_user_id, app_id)` unique |
| `{prefix}_sys_bind_code` | 绑定码 | 一次性、5 分钟有效的绑定凭证，**落库** |

账户与角色**不在本技能**：

- 账户 = 宿主 `{prefix}_sys_user`（`springboot-auth-module-skill` 提供）
- 角色 / 菜单 / 权限 = 宿主 RBAC（统一 `{prefix}_sys_` 前缀）

完整字段见 [references/table-schema.md](./references/table-schema.md)。

**一条铁律**：接入方**不存密码、不建用户表、不建角色表**。身份只有一份，在宿主 `{prefix}_sys_user`。

## 四档开启阶梯（按需选，不要默认全开）

| 档位 | 需要的表 | 前端要做 | 适用 |
|------|---------|---------|------|
| **L0 只有登录** | 宿主 `{prefix}_sys_user` | 登录页 + 存 token | 工具类、内部小系统 |
| **L1 账户互通** | + `{prefix}_sys_app` `{prefix}_sys_app_key` `{prefix}_sys_app_binding` `{prefix}_sys_bind_code` | 加绑定列表页 | 多产品线打通、第三方接入 |
| **L2 权限 RBAC** | + 宿主 RBAC（角色 / 菜单 / 用户-角色 / 角色-菜单） | 菜单 + 路由守卫 + `v-permission` | 管理后台 |
| **L3 组织架构** | + 宿主组织 / 岗位表 + `{prefix}_sys_user.org_id` | 组织树页面 | 有部门层级 |
| **L4 数据权限** | 复用宿主 `{prefix}_sys_role.data_scope` | 无需改前端 | 多角色看不同数据 |

**关键认知**："开启权限/组织"不是改配置开关，而是**往宿主的权限数据表写数据**：

- 多一个菜单 → 往 `{prefix}_sys_menu` 插一行
- 让某角色看到 → 往「角色-菜单」关联表插一行
- 按钮级控制 → 插一行 `menu_type='B'`，填 `permission` 字符串，前端用 `v-permission`

不需要 L2 的项目，**一张 RBAC 表都别建**。

## 桥接决策树（AI 按这个走）

```
用户说"接入账户体系 / 加登录 / 打通账号"
        │
        ├─ 1. 先问：要不要权限体系？
        │      ├─ 不要 → L0 或 L1
        │      └─ 要   → 再问：有没有部门层级？有没有数据可见性差异？
        │                 ├─ 只有角色菜单 → L2
        │                 ├─ 有部门       → L2 + L3
        │                 └─ 有数据边界   → L2 + L3 + L4
        │
        ├─ 2. 再问：目标项目什么栈？
        │      ├─ Vue  → templates/frontend/
        │      ├─ Spring Boot → templates/backend/
        │      └─ 其他（Node/Python/Go）→ 走 HTTP，用 templates/backend/account-bridge.mjs 做参考
        │
        ├─ 3. 读契约 → references/api-contract.md（唯一真理源，禁止凭记忆写接口）
        │
        ├─ 4. 生成接入代码（只生成"接入"，不生成"账户系统本身"）
        │
        ├─ 5. 落契约 → 把本次用到的接口 / 错误码补进目标项目的 api-contract.md
        │
        └─ 6. 自检 → 见下方"接入自检清单"
```

## 接入自检清单（每次必须跑）

- [ ] 接入方**没有**新建用户表 / 角色表，**没有**存密码
- [ ] Token 走 `Authorization: Bearer <accessToken>`，没有塞进 query / body
- [ ] 接入方**没有**自己实现密码加密与 JWT 签发
- [ ] 绑定接口**没有**硬编码用户（无 `Long userId = 1L`），主体一律取当前登录态
- [ ] 确认绑定只传 `{ code }`，**不收也不传**任何密码字段
- [ ] 绑定码**落库 + 5 分钟有效 + 一次性消费**（`UPDATE ... WHERE status = 0` 判受影响行数）
- [ ] `api_secret` **只出现在创建密钥的响应里**，列表 / 详情类型里没有该字段
- [ ] `/api/open/**` 走 `X-App-Key` / `X-Timestamp` / `X-Nonce` / `X-Signature` 签名鉴权，**不是** `permitAll`
- [ ] 菜单 `permission` 字符串、前端路由 `meta.permission`、`v-permission` 三处**完全一致**
- [ ] 用**非超管**账号实测：菜单能看见、点进去不是 403、按钮在
- [ ] 解绑后两个系统各自独立，无残留
- [ ] 目标项目 `api-contract.md` 已更新

## AI 桥接（本技能与相邻技能最大的不同）

技能文档只能让 AI "知道"，要让它 "能做"，需要三件东西：**契约 + 桥接协议 + 工具**。

### 三种身份

| 身份 | 凭证 | 能做什么 | AI 是否可用 |
|------|------|---------|-----------|
| 只读探查 | 无 | 读契约、读表结构 | 可以 |
| **应用身份** | `api_key` + `api_secret` | 以应用名义调 `/api/open/**`（签名） | **可以（默认）** |
| 用户身份 | `accessToken`（真人登录换取） | 代表具体用户调 `/api/apps/**`、`/api/bind/**` | **不可以自行获取** |

### 红线（写死在 [references/ai-bridge.md](./references/ai-bridge.md)）

1. AI **不得**生成或伪造 `accessToken`，用户身份必须由真人输入凭证换取
2. AI **不得**把 `api_secret` 写入前端代码、日志、或提交进仓库
3. AI **不得**为实现"快速打通"而在接入方新建用户表 / 角色表
4. AI **不得**绕过 `api-contract.md` 直接猜接口路径
5. 涉及删除（解绑 / 删应用 / 删密钥）**必须二次确认**

### MCP 工具（让 AI 真的能调）

`templates/ai/mcp-server.mjs` 把账户体系暴露成 8 个工具：

| 工具名 | 对应接口 | 身份 |
|--------|---------|------|
| `account_open_apply_bind` | `POST /api/open/bind/apply` | 应用（签名） |
| `account_open_claim_bind` | `POST /api/open/bind/claim` | 应用（签名） |
| `account_open_userinfo` | `GET /api/open/userinfo?appUserId=` | 应用（签名） |
| `account_list_apps` | `GET /api/apps` | 宿主登录态 |
| `account_list_bindings` | `GET /api/bind/list` | 宿主登录态 |
| `account_create_app` | `POST /api/apps` | 宿主登录态 |
| `account_create_key` | `POST /api/apps/{id}/keys` | 宿主登录态 |
| `account_confirm_bind` | `POST /api/bind/confirm` | 宿主登录态 |

配置与工具定义见 [templates/ai/](./templates/ai/)。

## 一键生成指令

```
/universal-login-bridge-skill 把当前项目接入账户体系，只用 L0 + L1（登录 + 绑定）

/universal-login-bridge-skill 给当前项目开启 RBAC + 组织架构，
                              注意菜单 permission 和路由 meta.permission 必须一致

/universal-login-bridge-skill 生成账户体系的 MCP server（应用管理 + 绑定列表 + 创建密钥）

/universal-login-bridge-skill 检查当前项目的账户接入：菜单/路由权限字符串是否一致、
                              有没有重复建用户表、api_secret 有没有泄露到前端
```

## 文件结构

```
universal-login-bridge-skill/
├── SKILL.md                          # 本文件（AI 入口）
├── README.md                         # 人读文档
├── references/
│   ├── api-contract.md               # 接口契约（唯一真理源，与 universal-login-api 逐字一致）
│   ├── table-schema.md               # 4 张接入表 + 宿主账户/RBAC，字段级
│   └── ai-bridge.md                  # AI 桥接协议 + 红线 + 工具映射
└── templates/
    ├── frontend/
    │   ├── api/account.ts            # 账户 API 模块（不含密码逻辑）
    │   └── views/BindAccountPage.vue # 绑定页（列表 + 生成绑定码 + 确认绑定 + 解绑 + 设默认）
    ├── backend/
    │   ├── AccountTokenInterceptor.java  # Spring 侧：宿主 JWT + @CurrentUser / 应用级 HMAC 签名
    │   └── account-bridge.mjs        # Node/Python/Go 参考：按新契约调账户体系
    └── ai/
        ├── mcp-server.mjs            # MCP server（8 个工具）
        ├── tools.json                # 工具定义清单
        └── agent-prompt.md           # 让 AI 自动识别"该用账户体系"的提示词片段
```

## 契约权威源

- 接口契约：[references/api-contract.md](./references/api-contract.md)
- 表结构：[references/table-schema.md](./references/table-schema.md)
- 请求层规范：[frontend-request-skill/references/api-contract.md](../../vibeCoding/frontend/vue/frontend-request-skill/references/api-contract.md)
- 表单字段映射：[vue-form-skill/references/form-contract.md](../../vibeCoding/frontend/vue/vue-form-skill/references/form-contract.md)

## 不做（边界声明）

- **不重新实现**账户后端（那是 `universal-login-api` 的事）
- **不重新实现**账户页面（那是 `universal-login-page` 的事）
- **不定义账户、不定义角色**（那是宿主技能的事）
- **不写测试代码**（验收姿势：契约文档 + 接入代码 + 编译产物）
- **不替用户决定**域名、部署、跨域网关
- **不擅自**修改接入方已有用户表的数据（只建映射，不迁移）
