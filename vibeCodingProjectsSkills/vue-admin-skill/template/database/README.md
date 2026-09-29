# vue-admin-skill 数据库脚本

本目录提供 vue-admin-skill 模板项目的完整数据库脚本。

## 文件清单

| 文件 | 用途 |
| --- | --- |
| `init.sql` | **完整版**（结构 + 种子数据），最常用入口 |
| `schema.sql` | 仅表结构，无种子数据（适合生产部署） |
| `seed.sql` | 仅种子数据（依赖已建表） |
| `docker-compose.yml` | 一键启动 MySQL 8 容器，自动执行 `init.sql` |

> **Flyway 用户**：本模板默认 `FLYWAY_ENABLED=false`。若要启用 Flyway 自动迁移，需把 `init.sql` 重命名为 `V1__init.sql` 并复制到 `backend/src/main/resources/db/migration/`，同时设置环境变量 `FLYWAY_ENABLED=true`。

## 表结构概览

所有表统一使用 `wg_` 前缀（业务表）或 `wg_sys_` 前缀（系统表）。

| 表名 | 说明 |
| --- | --- |
| `wg_sys_tenant` | 租户 |
| `wg_sys_org` | 组织架构（树形） |
| `wg_sys_post` | 岗位 |
| `wg_sys_user` | 用户 |
| `wg_sys_role` | 角色（含 `data_scope`，四档） |
| `wg_sys_menu` | 菜单权限（`menu_type` 三类：`M` 目录 / `C` 菜单 / `F` 按钮） |
| `wg_sys_user_role` | 用户-角色关联 |
| `wg_sys_user_post` | 用户-岗位关联 |
| `wg_sys_role_menu` | 角色-菜单关联 |
| `wg_product` | 示例业务表（商品） |

### `menu_type` 语义（别记反）

| 值 | 含义 | 约束 |
| --- | --- | --- |
| `M` | **目录** | 只做分组，`path` 通常是 `/system` 这类前缀，`component` 一般为 `Layout`，**不带** `permission` |
| `C` | **菜单** | 对应一个页面组件，必须有 `path` + `component`，带 `permission`（与 `GET` 列表接口同码） |
| `F` | **按钮** | 只承载 `permission`，**没有** `path` / `component` |

> `M` 是目录、`C` 是菜单。历史上两者曾被写反，已纠正。
> 读取时兼容 `B` 等价于 `F`；写入只允许 `M` / `C` / `F`。

### `icon` 字段

存**图标名**（kebab-case，如 `layout-dashboard` / `users` / `settings` / `shield-check` / `building-2` / `briefcase` / `blocks` / `link-2`），
由前端 `BaseIcon` 映射到具体图形。**不要在 DB 里存字符画图标**。

### 菜单树完整性（父节点必须存在）

种子数据满足以下三条规则，导入后应全部返回 0 行：

```sql
-- 规则 1：父节点必须存在 —— parent_id 非空时必须能查到该 id（禁止孤儿节点）
SELECT m.id, m.name, m.parent_id
FROM wg_sys_menu m
WHERE m.parent_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM wg_sys_menu p WHERE p.id = m.parent_id);
-- 期望：0 行

-- 规则 2：menu_type 只允许 M / C / F
SELECT id, name, menu_type FROM wg_sys_menu WHERE menu_type NOT IN ('M','C','F');
-- 期望：0 行

-- 规则 3：只有 C 才有 path / component；F 的 path 必须为 NULL
SELECT id, name FROM wg_sys_menu WHERE menu_type = 'F' AND path IS NOT NULL;
-- 期望：0 行
SELECT id, name FROM wg_sys_menu WHERE menu_type = 'C' AND component IS NULL;
-- 期望：0 行
```

> 后端侧同一规则由 `auth/service/MenuService#assertMenuTreeIntegrity()` 兜底：
> 每次创建 / 更新菜单都会重新校验全表，出现孤儿节点或非法 `menu_type` 直接抛
> `BusinessException(-1005)` 并回滚事务，防止再产生孤儿节点。
> 另外「存在子菜单时不可删除」也由 `MenuService#delete` 拦截（返回 `-1005`）。


## 默认账号

| 用户名 | 密码 | 角色 | 说明 |
| --- | --- | --- | --- |
| `admin` | `admin123` | 超级管理员 | 全权限 |
| `user_admin` | `admin123` | 用户管理员 | 仪表盘 + 系统管理（不含菜单管理）+ 示例 |
| `demo` | `admin123` | 普通用户 | 仅仪表盘 |

> 密码使用 BCrypt（cost=10）加密，所有账号的哈希值相同。

## 三种导入方式

### 方式一：Docker（推荐，最省事）

确保当前目录就是 `database/` 且存在 `init.sql`：

```bash
cd template/database
docker compose up -d
```

首次启动会自动：
- 创建 `vue_admin` 数据库
- 字符集设为 `utf8mb4` / `utf8mb4_unicode_ci`
- 执行 `init.sql`（建表 + 种子数据）

连接信息：
- 主机：`localhost`
- 端口：`3306`
- 用户：`root`
- 密码：`root`
- 数据库：`vue_admin`

停止容器并保留数据：
```bash
docker compose down
```

清空数据卷彻底重置：
```bash
docker compose down -v
```

### 方式二：MySQL 命令行

```bash
mysql -u root -p < init.sql
```

或者登录后手动执行：
```sql
source /absolute/path/to/init.sql;
```

### 方式三：MySQL Workbench / Navicat / DBeaver

1. 打开 GUI 工具，连接到目标 MySQL 实例
2. 新建（或选择）`vue_admin` 数据库
3. 文件 → 运行 SQL 脚本 → 选择 `init.sql`
4. 等待执行完成

## 验证查询

导入完成后执行以下 SQL 验证：

```sql
-- 期望：user=3, role=3, org=4, post=4, menu=35, product=5
SELECT
  (SELECT COUNT(*) FROM wg_sys_user)      AS user_count,
  (SELECT COUNT(*) FROM wg_sys_role)      AS role_count,
  (SELECT COUNT(*) FROM wg_sys_org)       AS org_count,
  (SELECT COUNT(*) FROM wg_sys_post)      AS post_count,
  (SELECT COUNT(*) FROM wg_sys_menu)      AS menu_count,
  (SELECT COUNT(*) FROM wg_product)       AS product_count;

-- 验证 admin 用户的角色绑定
SELECT u.username, r.name AS role_name
FROM wg_sys_user u
JOIN wg_sys_user_role ur ON u.id = ur.user_id
JOIN wg_sys_role r        ON ur.role_id = r.id
WHERE u.username = 'admin';
-- 期望：admin / 超级管理员

-- 验证 super_admin 拥有全部菜单权限
SELECT COUNT(*) AS menu_count
FROM wg_sys_role_menu
WHERE role_id = 1;
-- 期望：35
```

## 生产部署提示

- 生产环境建议只执行 `schema.sql`，由后端应用通过 Flyway / Liquibase 管理种子数据
- 正式密码应在后端首次启动时由管理员重置，不要直接使用种子数据中的默认密码
- 如启用多租户隔离，记得给每张业务表加 `tenant_id` 字段并调整查询条件