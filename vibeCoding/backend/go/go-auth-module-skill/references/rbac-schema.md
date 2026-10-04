# RBAC + 组织架构 表结构

表前缀 `wg_sys_*`，与 Java 侧完全同名，便于同一套 SQL / 迁移脚本复用。

## 主表

| 表 | 说明 | 关键列 |
|----|------|--------|
| `wg_sys_user` | 用户 | `username`(唯一) `password`(json:"-") `org_id` `status` `last_login_at` |
| `wg_sys_role` | 角色 | `code`(唯一) `data_scope` `sort_order` |
| `wg_sys_menu` | 菜单 | `parent_id` `menu_type`(M/C/F) `permission`(`*string`) `visible` |
| `wg_sys_org` | 组织 | `parent_id` `leader_user_id` `sort_order` |
| `wg_sys_post` | 岗位 | `code`(唯一) `sort_order` |
| `wg_sys_tenant` | 租户 | `code`(唯一) |

## 关联表（物理删除，无软删列）

| 表 | 说明 |
|----|------|
| `wg_sys_user_role` | 用户 ↔ 角色 |
| `wg_sys_user_post` | 用户 ↔ 岗位 |
| `wg_sys_role_menu` | 角色 ↔ 菜单（**权限就来自这张表 join 出来的 `permission`**） |

## 列约定（全部主表通用）

- 主键：`id`
- 租户：`tenant_id`（默认 1）
- 状态：`status`（0 禁用 / 1 启用）
- 排序：`sort_order`
- 时间：`created_at` / `updated_at`
- 软删：`deleted_at`（GORM `gorm.DeletedAt`，json:"-"）

## 菜单类型 `menu_type`

| 值 | 含义 | `permission` |
|----|------|-------------|
| `M` | 目录 | **NULL**（严禁空串） |
| `C` | 页面 | 如 `system:user:list` |
| `F` | 按钮 | 如 `system:user:create` |

> 历史数据里可能出现旧值 `B`（语义同 `F` 按钮），读取时兼容，写入一律用 `F`。

## 权限常量（38 个，唯一常量源）

```
用户(7)   system:user:{list,create,edit,delete,reset-pwd,assign-role,assign-post}
角色(5)   system:role:{list,create,edit,delete,assign-menu}
菜单(4)   system:menu:{list,create,edit,delete}
组织(4)   system:org:{list,create,edit,delete}
岗位(4)   system:post:{list,create,edit,delete}
租户(4)   system:tenant:{list,create,edit,delete}          ← 无对应菜单，仅常量
应用(5)   system:app:{list,create,edit,delete,key-manage}
绑定(4)   account:bind:{list,create,delete,set-default}
仪表盘(1) dashboard:home:view
```

合计 **38**。其中 34 个有对应菜单（会被 DB 派生出来），4 个 `system:tenant:*` 无菜单
（只有 super_admin 短路时才出现在鉴权上下文）。

★ 种子菜单的权限字符串必须与 Java `DataInitializer` **逐字一致**（实测 34 个，建议用
`grep -oE '"(system|account|dashboard):[a-zA-Z:-]+"'` 两边提取后 `diff` 校验）。

## 菜单校验

- 权限码三段式校验：`模块:资源:动作`
- 删除菜单前做**孤儿节点断言**：若存在子节点则拒绝删除（避免整棵子树失联）
