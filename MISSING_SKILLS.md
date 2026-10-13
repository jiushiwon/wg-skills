# Missing Skills（被引用但未在本仓库实现）

> **目的**：避免外部用户按 `SKILL.md` / `AGENTS.md` 复制走时**找不到引用方**。
> 维护规则：新增/恢复 skill 时，从本表移除并通知所有引用点。

## 列表（4 个 skill 全部在**私有仓库** `wg-project-kits` 维护）

| Skill | 状态 | 替代方案 | 最近引用点 |
|-------|------|----------|------------|
| **`vue-admin-skill`** | 🔒 私有仓库 | Vue3 + Element Plus 后台项目脚手架（前后端一体） | `AGENTS.md` 264/265/403/404/678；`go-auth-module-skill` SKILL.md:10/226、README.md:54；`vue-base-skill/COMPONENT_SPEC.md` 5 处；`frontend-icon-skill/examples/vue-admin-usage.md`、`README.md`；`springboot-init-skill/demo/.../PageResponse.java` 2 处 |
| **`sse-agent-skill`** | 🔒 私有仓库 | SSE 流式 AI 对话编排器 | `AGENTS.md` 265/404/678 |
| **`universal-identity-bridge-skill`** | 🔒 私有仓库 | 统一身份接入编排（Java 先行，Go/Python 预留） | `AGENTS.md` 266 |
| **`universal-login-bridge-skill`** | 🔒 私有仓库 | 通用登录的前端桥接 | `go-auth-module-skill/SKILL.md:227` |

## 引用标记规范

凡引用上述 4 个 skill 的 `*.md` 文件，**必须在引用段开头加一行 HTML 注释**：

```markdown
<!-- missing: see /MISSING_SKILLS.md -->
```

CI 校验（待补）：`scripts/check-broken-skill-refs.sh` 扫所有 `.md` 提到的 skill 名，找不到目录就 fail。

## 公开化计划

- **短期**：本仓库 AGENTS.md / 各 skill SKILL.md 保留"私有仓库"提示，**不假装存在**
- **中期**：把 `vue-admin-skill` 的**模板骨架**（`template/backend/`、`template/frontend/`）开源到本仓库的 `vibeCoding/frontend/vue/vue-base-skill/admin-template/` 子目录
- **长期**：将 `universal-login-bridge-skill` 的桥接规范沉淀为 `vibeCoding/frontend/frontend-request-skill/references/universal-login-spec.md`

## 引用审计

最近一次扫描（2026-10-13）发现 **15 处引用**全部在以上 4 个 skill 名下，未发现其他伪存在引用。
