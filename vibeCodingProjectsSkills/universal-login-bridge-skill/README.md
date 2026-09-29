# universal-login-bridge-skill

> **多账户体系桥接技能（项目级）。** 把任意项目接入宿主账户体系，并让 AI 自己完成这个接入动作。

> 本技能已对齐 `universal-login-api` **2026-09-28 版设计**：账户与角色/权限来自宿主，本技能只桥接「应用 / 应用密钥 / 账户绑定 / 绑定码」。

## 它解决什么

你手上有 5 个项目，每个都要注册一遍；某个第三方系统里已经有账号了，你想让它和你这套系统认成同一个人。

这套技能不重写账户系统，只做**接入 + AI 桥接**：告诉 AI"账户体系长什么样、怎么调、什么不许做"，并给出可复制的接入模板。

## 30 秒看懂

| 层 | 内容 |
|----|------|
| 接入 4 表 | `{prefix}_sys_app`（应用）/ `{prefix}_sys_app_key`（应用密钥）/ `{prefix}_sys_app_binding`（绑定）/ `{prefix}_sys_bind_code`（绑定码） |
| 身份来源 | 宿主 `{prefix}_sys_user`（默认前缀 `wg` → `wg_sys_user`）；角色/权限同属宿主 |
| 四档开启 | L0 只登录 → L1 账户互通 → L2 RBAC → L3 组织架构 → L4 数据权限 |
| AI 桥接 | 契约 + 表结构 + 桥接协议（三身份 + 5 条红线）+ MCP 工具（8 个） |

一条铁律：**身份只有一份，在宿主 `{prefix}_sys_user`。接入方不存密码、不建用户表、不建角色表。**

## 快速使用

### 1. 接入一个业务项目（L0 + L1）

```
/universal-login-bridge-skill 把当前项目接入账户体系，只用 L0 + L1
```

生成物：

- 前端 `src/api/account.ts` + `views/BindAccountPage.vue`
- 后端 token 校验拦截器 / 签名客户端
- 目标项目 `api-contract.md` 增量

### 2. 开启权限与组织（L2 / L3 / L4）

```
/universal-login-bridge-skill 开启 RBAC + 组织架构
```

注意：**开启权限不是改开关，是往宿主的 `{prefix}_sys_menu` 与「角色-菜单」关联表写数据**。

### 3. 让 AI 直接操作账户体系（MCP）

```bash
# 1) 装依赖
cd templates/ai && npm i @modelcontextprotocol/sdk

# 2) 配 MCP（示例，写入你的 MCP 配置）
{
  "mcpServers": {
    "account-hub": {
      "command": "node",
      "args": ["<abs>/templates/ai/mcp-server.mjs"],
      "env": {
        "ACCOUNT_BASE_URL": "http://localhost:8080",
        "ACCOUNT_API_KEY": "<应用密钥的 api_key>",
        "ACCOUNT_API_SECRET": "<应用密钥的 api_secret，仅创建时返回一次>",
        "ACCOUNT_ACCESS_TOKEN": "<可选：真人登录换来的宿主 accessToken>"
      }
    }
  }
}
```

配好后 AI 有 8 个工具：`account_open_apply_bind` / `account_open_claim_bind` / `account_open_userinfo` /
`account_list_apps` / `account_list_bindings` / `account_create_app` / `account_create_key` / `account_confirm_bind`。

> `ACCOUNT_API_KEY` + `ACCOUNT_API_SECRET` 用于 `/api/open/**` 的 HmacSHA256 签名；
> `ACCOUNT_ACCESS_TOKEN` 用于宿主侧 `/api/apps/**`、`/api/bind/**`，必须由真人登录换取。

## 文件结构

```
universal-login-bridge-skill/
├── SKILL.md                        # AI 入口（AI 读这个）
├── README.md                       # 本文件（人读）
├── references/
│   ├── api-contract.md             # 接口契约（唯一真理源）
│   ├── table-schema.md             # 表结构 + 字段 + 索引 + 开启阶梯
│   └── ai-bridge.md                # AI 桥接协议 + 红线 + 工具映射
└── templates/
    ├── frontend/
    │   ├── api/account.ts
    │   └── views/BindAccountPage.vue
    ├── backend/
    │   ├── AccountTokenInterceptor.java
    │   └── account-bridge.mjs
    └── ai/
        ├── mcp-server.mjs
        ├── tools.json
        └── agent-prompt.md
```

## 与相邻技能的关系

| 技能 | 关系 |
|------|------|
| `universal-login-api` | 上游：生成账户体系**后端**（应用 / 密钥 / 绑定 / 绑定码） |
| `springboot-auth-module-skill` | 上游：提供宿主账户 `{prefix}_sys_user` 与 RBAC |
| `universal-login-page` | 上游：生成账户**页面** |
| `vue-admin-skill` | 平级：目标项目本身是管理后台时复用 |
| `frontend-request-skill` | 依赖：请求层契约（信封 / 错误码 / JWT） |

**职责边界**：本技能只做"接进去 + 让 AI 会接"，不重新实现账户系统本身。

## 不做的事

- 不重新实现账户后端 / 账户页面
- 不定义账户、不定义角色（宿主技能的事）
- 不写测试代码（验收：契约文档 + 接入代码 + 编译产物）
- 不替用户决定域名 / 部署 / 跨域网关
- 不擅自修改接入方已有用户表的数据（只建映射，不迁移）
