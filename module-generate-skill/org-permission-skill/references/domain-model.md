# org-permission-skill — 领域模型与表结构

语言无关。表前缀默认 `wg`（可覆盖），DDL 以 PostgreSQL 为准，MySQL 差异在注释中标注。用户表 `wg_user` 由 auth-skill 提供，本模块只在它上面加 `dept_id`。

## 实体关系

```
wg_dept（部门树，自引用 parent_id）
wg_role（角色） n ──── n wg_user（用户）        经 wg_user_role
wg_role（角色） n ──── n wg_permission（权限）  经 wg_role_permission
wg_role（角色） n ──── n wg_dept（自定义数据范围）经 wg_role_dept（data_scope=2 时用）
wg_user（用户） n ──── 1 wg_dept（所属部门）     wg_user.dept_id
```

## 表结构

### wg_dept — 组织/部门树

```sql
CREATE TABLE wg_dept (
  id         BIGSERIAL PRIMARY KEY,              -- MySQL: BIGINT AUTO_INCREMENT
  parent_id  BIGINT NOT NULL DEFAULT 0,          -- 0 表示根
  name       VARCHAR(64) NOT NULL,
  ancestors  VARCHAR(500) NOT NULL DEFAULT '0',  -- 逗号分隔的祖先 id 路径，如 "0,1,3"
  sort       INT NOT NULL DEFAULT 0,             -- 同级排序，小在前
  status     SMALLINT NOT NULL DEFAULT 1,        -- 1 启用 0 禁用
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- MySQL: DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dept_parent ON wg_dept(parent_id);
```

设计要点：
- **`ancestors` 用祖先路径而不是闭包表（closure table）**：组织树读多写少，路径法查整棵子树只需 `ancestors LIKE '0,1,3,%'`，一条 SQL 无递归；闭包表要多一张关系表、增删节点时维护成本高。代价是移动节点时要级联刷新子孙的 `ancestors`（写少，可接受）。
- 路径统一以 `0` 开头（根），用 `LIKE '{path},%'` 匹配严格子树、用 `= path` 匹配自身。
- 新增节点：`ancestors = 父.ancestors + ',' + 父.id`。

### wg_role — 角色

```sql
CREATE TABLE wg_role (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(64) NOT NULL,
  code       VARCHAR(64) NOT NULL UNIQUE,        -- 角色标识，如 admin；超管约定为 admin
  data_scope SMALLINT NOT NULL DEFAULT 1,        -- 1 全部 2 自定义部门 3 本部门 4 本部门及子部门 5 仅本人
  status     SMALLINT NOT NULL DEFAULT 1,        -- 1 启用 0 禁用
  remark     VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

设计要点：
- `code` 唯一且上线后禁止改名（前后端都引用它做特判，如超管 `admin`）。
- `data_scope` 是数据权限范围枚举，含义固定；`2 自定义部门` 时具体部门在 `wg_role_dept`。

### wg_permission — 权限（菜单 + 按钮一体）

```sql
CREATE TABLE wg_permission (
  id         BIGSERIAL PRIMARY KEY,
  parent_id  BIGINT NOT NULL DEFAULT 0,          -- 0 表示根目录
  name       VARCHAR(64) NOT NULL,
  type       SMALLINT NOT NULL,                  -- 1 目录 2 菜单 3 按钮
  perms      VARCHAR(100) UNIQUE,                -- 权限标识如 user:add；按钮必填且唯一，目录/菜单可空
  path       VARCHAR(200) NOT NULL DEFAULT '',   -- 前端路由路径
  component  VARCHAR(200) NOT NULL DEFAULT '',   -- 前端组件路径
  icon       VARCHAR(100) NOT NULL DEFAULT '',
  sort       INT NOT NULL DEFAULT 0,
  visible    SMALLINT NOT NULL DEFAULT 1,        -- 1 显示 0 隐藏（菜单显隐，不影响鉴权）
  status     SMALLINT NOT NULL DEFAULT 1,        -- 1 启用 0 禁用
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_perm_parent ON wg_permission(parent_id);
```

设计要点：
- 目录/菜单/按钮同表，用 `type` 区分，前端按 `parent_id` 递归建树；按钮（`type=3`）无路由，只有 `perms`。
- **`perms` 是后端鉴权的唯一依据**，`visible` 只控制前端显示，二者解耦：隐藏的菜单仍可被授权访问。

### wg_user_role — 用户-角色关联

```sql
CREATE TABLE wg_user_role (
  user_id BIGINT NOT NULL REFERENCES wg_user(id),
  role_id BIGINT NOT NULL REFERENCES wg_role(id),
  PRIMARY KEY (user_id, role_id)                 -- 联合主键即唯一约束
);
CREATE INDEX idx_ur_role ON wg_user_role(role_id);
```

### wg_role_permission — 角色-权限关联

```sql
CREATE TABLE wg_role_permission (
  role_id       BIGINT NOT NULL REFERENCES wg_role(id),
  permission_id BIGINT NOT NULL REFERENCES wg_permission(id),
  PRIMARY KEY (role_id, permission_id)
);
CREATE INDEX idx_rp_perm ON wg_role_permission(permission_id);
```

### wg_role_dept — 角色-自定义数据范围关联（data_scope=2 时用）

```sql
CREATE TABLE wg_role_dept (
  role_id BIGINT NOT NULL REFERENCES wg_role(id),
  dept_id BIGINT NOT NULL REFERENCES wg_dept(id),
  PRIMARY KEY (role_id, dept_id)
);
```

### wg_user 加部门字段（ALTER，不建用户表）

```sql
ALTER TABLE wg_user ADD COLUMN dept_id BIGINT REFERENCES wg_dept(id);
CREATE INDEX idx_user_dept ON wg_user(dept_id);
```

## 状态机

角色 / 权限 / 部门三者的启用禁用一致：

```
[启用 1] ──禁用──▶ [禁用 0]   禁用后：不参与权限计算、不出现在授权选项；已持有该角色的用户即时失去对应权限（缓存失效）
[禁用 0] ──启用──▶ [启用 1]
```

**删除约束**（存在关联则拒绝，返回 `-1005`）：
- 删部门：有子部门 或 有 `wg_user.dept_id` 指向它 → 拒绝。
- 删角色：有 `wg_user_role` 指向它 → 拒绝（先解除用户关联）。
- 删权限：有子权限（`parent_id` 指向它）→ 拒绝；`wg_role_permission` 关联可级联清理。

## Redis 键约定

| 键 | 值 | TTL | 用途 |
|----|----|----|------|
| `perm:user:{userId}` | JSON：`{ perms: [...], dataScope: n, deptIds: [...] }` | 30min | 缓存用户权限标识集合 + 数据范围 |

- 权限计算：用户所有启用角色 → 关联的启用权限的 `perms` 取并集；数据范围取所有角色中**最大**的 `data_scope`（范围越大越宽），`data_scope=2` 时合并各角色 `wg_role_dept` 的部门。
- **失效时机**：改角色权限、改角色数据范围、改用户角色、禁用/删除角色或权限后，删除相关用户的 `perm:user:{userId}`（或整批 `perm:user:*`，按变更影响面定）。下次请求重建。
- 无 Redis 降级：每次请求实时查库计算（权限数据量小，可接受），不加缓存。

## 数据权限过滤范式（查询层统一拼接）

按当前用户缓存的 `dataScope` / `deptIds` 拼一个 dept 过滤条件，所有受数据权限约束的查询都套同一个函数，禁止散落手写：

```
dataScope = 1（全部）        → 不加条件
dataScope = 2（自定义部门）   → WHERE dept_id IN (deptIds)
dataScope = 3（本部门）       → WHERE dept_id = 当前用户.dept_id
dataScope = 4（本部门及子部门）→ WHERE dept 的 ancestors LIKE '当前部门.ancestors,当前部门.id,%' OR dept_id = 当前用户.dept_id
dataScope = 5（仅本人）       → WHERE created_by = 当前用户.id
```

超管（`admin`）在唯一判断点直接视为 `dataScope = 1`，绕过拼接。各语言实现见 `references/<lang>.md`。

## 核心时序：权限校验

```
客户端                 服务端
  │ 业务请求 + access   │
  │ ──────────────────▶ │ JWT 过滤器注入当前用户（auth-skill 已有）
  │                     │ 查 perm:user:{userId} 缓存，miss 则查库计算并回写
  │                     │ 超管？是 → 放行；否 → 校验接口要求的 perms 是否在集合内
  │                     │ 无权限 → -1003；有 → 拼数据权限条件 → 执行业务
  │ ◀────────────────── │
```
