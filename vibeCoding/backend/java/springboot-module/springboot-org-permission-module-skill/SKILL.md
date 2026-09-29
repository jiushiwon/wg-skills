---
name: springboot-org-permission-module-skill
description: 【已废弃·转发页】组织架构 / 部门管理 / 角色权限 / RBAC / 菜单管理 / 数据权限 请改用 springboot-auth-module-skill。本技能不再产出任何代码或表结构，仅保留旧链接的跳转说明与历史差异记录。
---

# ⚠️ 本技能已废弃（DEPRECATED）

> **组织架构 / 部门管理 / 角色权限 / RBAC / 菜单管理 / 数据权限**
> 六类需求，请**一律改用** [`springboot-auth-module-skill`](../springboot-auth-module-skill/SKILL.md)。
>
> 本文件不再产出任何代码、表结构或契约。保留它只为两件事：
> 1. 让旧链接/旧触发词能跳到正确的地方；
> 2. 留下历史差异记录，避免同样的分裂再次发生。

## 为什么废弃

历史上本技能与 `springboot-auth-module-skill` **同时**声称负责组织权限，导致 AI 触发哪个都行、生成结果不可预测。两者的冲突是全面的：

| 维度 | 本技能（废弃） | `springboot-auth-module-skill`（权威） |
|------|----------------|----------------------------------------|
| 组织表 | `wg_org` + `wg_dept`（两表） | `{prefix}_sys_org`（单表树 + `parent_ids`） |
| 用户表 | `wg_user` | `{prefix}_sys_user` |
| 角色表 | `wg_role` | `{prefix}_sys_role` |
| 菜单表 | `wg_menu` | `{prefix}_sys_menu` |
| 排序字段 | `sort` | `sort_order` |
| 菜单类型 | `MenuType { CATALOG, MENU, BUTTON }` 枚举 | `String` 取值 `M` / `C` / `F` |
| 方法级鉴权 | 未提及 | **强制**（`@EnableMethodSecurity` + `@PreAuthorize`） |
| 数据权限 | 未定义档位 | **4 档，多角色取最宽** |
| 回填接口 | 未提及 | **强制 3 个** |
| 代码 | 全篇省略号伪代码（`// 递归构建树`），不可运行 | `references/skeleton.md` 提供可运行代码 |

**典型翻车现场**：同一个项目里出现三种表前缀（`{prefix}_sys_*` / `{prefix}_user` / `sys_*`），"分配菜单"永远回填空树，后端零 `@PreAuthorize`。

## 现在该怎么做

```
「帮我加权限」「集成 RBAC」「组织架构」「部门管理」「菜单管理」「数据权限」
        ↓
改用 springboot-auth-module-skill
```

触发词已从本技能移走，**只保留"springboot-org-permission-module"这一个字面名**，用于把旧调用引导到正确位置。

## 旧内容去哪了

- 旧的伪代码与 `wg_*` 表设计**已作废**，不再提供。
- 旧的 `api-contract-org-permission.md` 保留在仓库里，但**顶部已加废弃横幅**，内容仅供考古，**不得用于生成**。

## 相关

- 权威技能：[`../springboot-auth-module-skill/SKILL.md`](../springboot-auth-module-skill/SKILL.md)
- 可运行代码：[`../springboot-auth-module-skill/references/skeleton.md`](../springboot-auth-module-skill/references/skeleton.md)
- 接口契约：[`../springboot-auth-module-skill/api-contract-auth.md`](../springboot-auth-module-skill/api-contract-auth.md)

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**
