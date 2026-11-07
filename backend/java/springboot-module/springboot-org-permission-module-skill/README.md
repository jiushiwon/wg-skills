# ⚠️ 已废弃 —— 请改用 springboot-auth-module-skill

> 本技能（`springboot-org-permission-module-skill`）**不再产出任何代码、表结构或契约**。
>
> **组织架构 / 部门管理 / 角色权限 / RBAC / 菜单管理 / 数据权限** → 一律改用
> [`springboot-auth-module-skill`](../springboot-auth-module-skill/README.md)

## 一句话

历史上本技能与 `springboot-auth-module-skill` 双权威并行，表名（`wg_org`/`wg_dept`/`wg_user` vs `{prefix}_sys_*`）、枚举（`CATALOG/MENU/BUTTON` vs `M/C/F`）、字段（`sort` vs `sort_order`）全部冲突，导致同一需求生成结果不可预测。

现已收敛为**单一权威**：`springboot-auth-module-skill`。

## 旧内容现状

| 文件 | 状态 |
|------|------|
| `SKILL.md` | 已改为跳转说明 |
| `README.md` | 本文件即跳转说明 |
| `api-contract-org-permission.md` | **已加废弃横幅**，仅供考古，**不得用于生成代码** |

## 去哪里

| 需求 | 权威位置 |
|------|----------|
| 组织架构 / 部门管理 | `springboot-auth-module-skill` → 单表树 `{prefix}_sys_org` + `parent_ids` |
| 角色权限 / RBAC | 同上 → `{prefix}_sys_role` / `{prefix}_sys_user_role` / `{prefix}_sys_role_menu` |
| 菜单管理 | 同上 → `{prefix}_sys_menu`，`menuType` 取 `M`/`C`/`F` |
| 数据权限 | 同上 → 4 档，多角色取最宽 |
| 方法级鉴权 | 同上 → `@EnableMethodSecurity` + `@PreAuthorize` + JWT 装配真实权限 |
| 可运行代码 | `springboot-auth-module-skill/references/skeleton.md` |
| 接口契约 | `springboot-auth-module-skill/api-contract-auth.md` |

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**
