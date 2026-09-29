# 账户体系表结构

> 字段级定义 + 索引 + 关系。**改表先改本文档。**
> 建表 SQL 完整版见 `universal-login-api/templates/db/V20__init_universal_login.sql`。

> **本技能已对齐 `universal-login-api` 2026-09-28 版设计**：账户与角色/权限都来自宿主，本技能只描述「应用 / 密钥 / 绑定 / 绑定码」四张表。

---

## 一、命名分层（先看这一条）

| 层 | 提供方 | 表 | 本技能是否建表 |
|----|--------|-----|---------------|
| **账户层** | `springboot-auth-module-skill` | `{prefix}_sys_user` | **不建**（只引用） |
| **RBAC 层** | `springboot-auth-module-skill` | 角色 / 菜单 / 用户-角色 / 角色-菜单（四类，统一 `{prefix}_sys_` 前缀） | **不建** |
| **接入层** | 本技能（= `universal-login-api`） | `{prefix}_sys_app` / `{prefix}_sys_app_key` / `{prefix}_sys_app_binding` / `{prefix}_sys_bind_code` | **只建这 4 张** |

前缀规则：**全部统一 `{prefix}_sys_*`**，默认前缀 `wg`（即 `wg_sys_user`、`wg_sys_app` …）。
**禁止**裸 `sys_*` 前缀 —— 历史上一库三前缀。

软删除口径统一：`deleted_at DATETIME`（`NULL` 表示未删除）。

---

## 二、账户层：复用宿主账户（不建表）

### {prefix}_sys_user（宿主账户）—— 本技能的绑定锚点

账户实体、注册、登录、密码、JWT 全部归 `springboot-auth-module-skill`，本技能**只读它的 `id` 与展示字段**。

| 字段（节选） | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT | 宿主账户 ID，**绑定锚点** |
| `username` | VARCHAR | 登录名 |
| `nickname` / `avatar` | VARCHAR | 展示用 |
| `email` / `phone` | VARCHAR | 展示用（只在已绑定时按需返回） |
| `status` | TINYINT | 1 启用 / 0 禁用 |
| `deleted_at` | DATETIME | 软删除 |

> ★ 本技能**不建**账户表。接入方过去若有自建的用户 / 主账户表，一律作废：身份只有一份，在宿主 `{prefix}_sys_user`。

---

## 三、接入层四表（本技能负责）

### 关系

```
{prefix}_sys_user 1 ──── N {prefix}_sys_app_binding N ──── 1 {prefix}_sys_app 1 ──── N {prefix}_sys_app_key

{prefix}_sys_bind_code  （独立：一次性绑定凭证，绑定完成后即失效）
```

### {prefix}_sys_app（应用）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK, 自增 | |
| `app_name` | VARCHAR(100) | not null | 应用名称 |
| `app_key` | VARCHAR(64) | unique, not null | 应用**公开标识**（非密钥，可暴露）；服务端生成，创建后不可改 |
| `description` | VARCHAR(500) | | 描述 |
| `logo` | VARCHAR(500) | | 图标 |
| `callback_url` | VARCHAR(500) | | 回调地址 |
| `status` | TINYINT | 默认 1 | 1 启用 / 0 禁用 |
| `owner_id` | BIGINT | not null | 所有者 → `{prefix}_sys_user.id` |
| `created_at` / `updated_at` | DATETIME | | |
| `deleted_at` | DATETIME | | 软删除 |

**设计要点**：本表**只有公开标识 `app_key`，没有任何密钥字段**。密钥全部收敛到 `{prefix}_sys_app_key`——两处并存会让密钥绕过轮换长期存活。

### {prefix}_sys_app_key（应用密钥，应用级凭证的唯一存放处）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK | |
| `app_id` | BIGINT | not null | 所属应用 |
| `key_name` | VARCHAR(64) | | 密钥名，一应用可多把（便于轮换） |
| `api_key` | VARCHAR(64) | unique, not null | 公开标识，生成规则 `ak_` + 32 位 hex |
| `api_secret` | VARCHAR(128) | not null | 签名密钥，生成规则 `sk_` + 64 位 hex |
| `status` | TINYINT | 默认 1 | 1 启用 / 0 禁用 |
| `last_used_at` | DATETIME | | 最后调用时间 |
| `created_at` | DATETIME | | |
| `deleted_at` | DATETIME | | 软删除 |

**安全约定**：`api_secret` 必须落库（HMAC 校验要原文），但**出参永不返回**；只在 `POST /api/apps/{id}/keys` 的创建响应（`CreatedAppKeyVO`）里返回一次。列表 / 详情出参 `AppKeyVO` **没有** `apiSecret` 字段。

> ★ 服务端**不得**把实体 `api_secret` 置 null 后再返回——历史缺陷：前端永远拿不到 secret，且托管态实体的脏检查会把库里的 secret 写成 null。

### {prefix}_sys_app_binding（绑定）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK | |
| `sys_user_id` | BIGINT | not null | **宿主账户 ID（绑定锚点）** |
| `app_id` | BIGINT | not null | 应用 ID |
| `app_user_id` | VARCHAR(128) | | **第三方系统内的用户 ID，原样保留** |
| `app_user_name` | VARCHAR(128) | | 第三方系统内的用户名 |
| `bind_type` | VARCHAR(20) | | `app_initiated` / `user_initiated` |
| `is_default` | TINYINT | 默认 0 | 是否默认应用 |
| `bind_at` | DATETIME | not null | 绑定时间 |
| `created_at` | DATETIME | | |
| `deleted_at` | DATETIME | | 软删除 |
| — | — | `UNIQUE uk_user_app (sys_user_id, app_id)` | 同账户同应用只能一条 |
| — | — | `INDEX idx_app_user (app_id, app_user_id)` | 开放接口按应用侧用户反查 |

**唯一约束的意义**：压住"重复绑定"。换绑 = 先解绑（软删）再绑，而不是插第二行。`is_default` 不参与唯一约束，多选一由业务保证。

**核心列是 `app_user_id`**：绑定**不迁移、不复制、不改对方账号**，只记映射。

> ★ 锚点是 `sys_user_id`（宿主账户），**不是**任何独立的"主账户 ID"。这样才真正做到"多个系统公用一套账户"。

### {prefix}_sys_bind_code（绑定码，一次性凭证）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGINT | PK | |
| `code` | VARCHAR(64) | unique, not null | 绑定码（一次性） |
| `direction` | VARCHAR(20) | not null | `app_initiated`=应用发起待宿主确认 / `user_initiated`=宿主发起待应用认领 |
| `app_id` | BIGINT | not null | 应用 ID |
| `sys_user_id` | BIGINT | NULL | `user_initiated` 发起时即写入；`app_initiated` 确认时回填 |
| `app_user_id` | VARCHAR(128) | | 应用侧用户标识 |
| `app_user_name` | VARCHAR(128) | | 应用侧用户名 |
| `status` | TINYINT | 默认 0 | 0 待使用 / 1 已使用 / 2 已失效 |
| `expire_at` | DATETIME | not null | 过期时间（签发 + 300 秒） |
| `used_at` | DATETIME | | 使用时间 |
| `created_at` | DATETIME | | |
| — | — | `UNIQUE uk_code (code)` | |
| — | — | `INDEX idx_expire (status, expire_at)` | 供定时任务清理 |

**一次性保证**：消费走条件更新

```
UPDATE {prefix}_sys_bind_code SET status = 1, used_at = ?, sys_user_id = ?
WHERE code = ? AND status = 0
```

受影响行数为 `0` → 抛 `-1005`。并发下天然互斥，无需分布式锁。

> ★ 绑定码**必须落库**。历史缺陷：只在内存里造个字符串就返回，从不校验有效性 / 过期 / 一次性，导致确认接口可被无限重放。

---

## 四、RBAC / 组织 / 数据权限（宿主提供，L2 及以上）

本技能**不建**任何角色、菜单、权限表；角色与权限一律来自 `springboot-auth-module-skill`，统一 `{prefix}_sys_` 前缀。

### L2 复用宿主的表

| 表（宿主） | 说明 | 关键字段 |
|----|------|---------|
| `{prefix}_sys_role` | 角色定义 | `code` unique、`data_scope`、`status`、`deleted_at` |
| `{prefix}_sys_menu` | 菜单 / 权限 | `parent_id`、`name`、`path`、`component`、`menu_type`(M/C/F，M=目录 C=菜单 F=按钮)、`permission`、`sort_order`、`visible`、`status` |
| `{prefix}_sys_user_role` | 用户-角色 | `user_id`、`role_id` |
| `{prefix}_sys_role_menu` | 角色-菜单 | `role_id`、`menu_id` |

**权限码就是 `{prefix}_sys_menu.permission` 的值**：三段式 `模块:资源:动作`，例如
`system:app:list` / `system:app:create` / `system:app:key-manage` / `account:bind:list` / `account:bind:create`。

### L3 追加（宿主的组织（`{prefix}_sys_org`）/ 岗位（`{prefix}_sys_post`））

| 表（宿主） | 说明 | 关键字段 |
|----|------|---------|
| `{prefix}_sys_org` | 组织架构（单表自关联树） | `parent_id`、`name`、`leader_user_id`、`status`、`deleted_at` |
| `{prefix}_sys_post` / `{prefix}_sys_user_post` | 岗位 | `code` unique、`user_id`、`post_id` |

并给 `{prefix}_sys_user` 加 `org_id BIGINT`（用户归属部门）。

### L4 数据权限（不加表）

复用宿主 `{prefix}_sys_role.data_scope`：

| 值 | SQL 效果 |
|----|---------|
| `ALL` | 不加过滤 |
| `DEPT_AND_BELOW` | `org_id IN (自身 + 全部子孙组织 id)` |
| `DEPT_ONLY` | `org_id = 当前用户 orgId` |
| `SELF_ONLY` | 追加 `WHERE creator_id = 当前用户` |

判定顺序（宿主 `PermissionEvaluator`）：**多角色取最宽档位**
`ALL > DEPT_AND_BELOW > DEPT_ONLY > SELF_ONLY`；用户无部门归属时 `DEPT_*` **收紧为** `SELF_ONLY`。

```
1. isSuperAdmin(userId)                     → ALL
2. 取该用户全部角色的 data_scope 的最宽档位  → 对应档位
3. 无任何角色                                → SELF_ONLY
```

---

## 五、四档开启阶梯（速查）

| 档位 | 需要的表 | 前端 |
|------|---------|------|
| L0 | 宿主 `{prefix}_sys_user` | 登录页 + token |
| L1 | + `{prefix}_sys_app` `{prefix}_sys_app_key` `{prefix}_sys_app_binding` `{prefix}_sys_bind_code` | 绑定列表页 |
| L2 | + 宿主 RBAC（角色 / 菜单 / 用户-角色 / 角色-菜单） | 菜单树 + 路由守卫 + `v-permission` |
| L3 | + 宿主组织 / 岗位表 + `{prefix}_sys_user.org_id` | 组织树页 |
| L4 | 复用宿主 `{prefix}_sys_role.data_scope` | 无需改 |

**不建的表**：本技能**不自建任何角色表、权限表**（角色与权限归宿主技能，重复建表 = 双权威）。

---

## 六、"开启"是写数据，不是改开关

| 想做的事 | 落到哪张表 |
|---------|-----------|
| 多一个菜单 | `{prefix}_sys_menu` 插一行（`M` 级，填 `path` + `component`） |
| 让某角色看到 | 「角色-菜单」关联表插一行 |
| 按钮级权限 | `{prefix}_sys_menu` 插一行 `menu_type='B'`，`path`/`component` 为 `NULL`，填 `permission` |
| 数据可见范围 | 宿主 `{prefix}_sys_role.data_scope` |
| 用户归属部门 | `{prefix}_sys_user.org_id` |

示例：

```sql
-- 开启「应用管理」菜单
INSERT INTO wg_sys_menu
  (parent_id, name, path, component, menu_type, icon, permission, sort_order, visible, status)
VALUES
  (2, '应用管理', '/system/app', 'system/app/index', 'M', 'link', 'system:app:list', 5, 1, 1);

-- 再往「角色-菜单」关联表插一行，把该菜单授给目标角色
```

> 本技能的四张表**不需要插种子数据**。管理员账号由宿主 auth 模块 bootstrap 生成随机密码并打印一次；首个应用在「应用管理」页面创建。

不需要 L2 的项目，**一张 RBAC 表都别建**。

---

## 七、唯一性约束总表

| 表 | 唯一键 |
|----|--------|
| `{prefix}_sys_user` | `username`（宿主定义） |
| `{prefix}_sys_app` | `app_key` |
| `{prefix}_sys_app_key` | `api_key` |
| `{prefix}_sys_app_binding` | `(sys_user_id, app_id)` |
| `{prefix}_sys_bind_code` | `code` |
| `{prefix}_sys_role` | `code` |
| `{prefix}_sys_user_role` | `(user_id, role_id)` |
