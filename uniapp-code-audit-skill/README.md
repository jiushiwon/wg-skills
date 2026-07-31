# UniApp Code Audit Skill

本 skill 用于审计 uniapp 项目（Vue3 + TypeScript + Pinia 技术栈优先），按风险等级输出审计报告，**不修改、不修复、不重构项目代码**。

## 功能

审计维度：

- **安全合规**：敏感信息、域名配置、隐私合规、调试代码、依赖漏洞
- **性能**：包体积、图片优化、网络请求、长列表、setData、缓存、生命周期
- **代码质量**：TypeScript 安全、硬编码、重复代码、错误处理、组件规范、Vue3 规范
- **架构与规范**：目录结构、红线规则、配置文件、状态管理、构建/lint
- **UI/主题一致性**：颜色、字号、间距、圆角阴影、组件复用、交互反馈
- **跨平台兼容**：H5 标签、CSS 兼容性、浏览器 API、条件编译、安全区
- **小程序专项**：setData、页面栈、分包体积、隐私合规、合法域名、版本更新
- **API 契约**：请求层封装、响应结构、Token 注入、401/403 处理、防抖去重、Mock

## 使用方式

### 触发词

```
"uniapp 审计"
"小程序代码审计"
"uniapp 安全审计"
"uniapp 性能审计"
"检查 uniapp 规范符合性"
"帮我看看这个 uniapp 项目有什么问题"
```

### 示例

```bash
# 全面审计
> 帮我审计一下这个 uniapp 项目的代码质量

# 重点查安全
> 看看这个项目有没有安全漏洞

# 重点查性能
> 帮我看看有没有性能问题

# 检查规范符合性
> 检查这个项目是否符合 uniapp 开发规范
```

## 工作流

1. **审计范围确认** — 全量/模块、目标平台、重点维度
2. **多维度扫描** — 安全、性能、代码质量、架构、UI/主题、跨平台、小程序、API 契约
3. **问题汇总** — 按 P0/P1/P2/P3 风险等级归类并统计
4. **输出报告** — 生成 `uniapp-audit-report.md`

## 输出文件

- `uniapp-audit-report.md` — 按风险等级分级的审计问题清单

> 本 skill 不输出修复方案、不生成补丁、不修改项目代码。

## 风险等级

| 等级 | 说明 |
|------|------|
| **P0 / Critical** | 违反强制红线或上线合规要求，可能导致审核被拒、安全漏洞或严重性能问题 |
| **P1 / High** | 高风险偏差，影响功能、性能或稳定性 |
| **P2 / Medium** | 中风险偏差，影响可维护性或规范符合性 |
| **P3 / Low** | 优化建议，偏离程度较轻 |

> 风险等级仅用于报告分类，不代表修复指令。

## 参考标准

本 skill 审计依据来自以下 skill 及其 references：

- `uniapp-standard-skill` — 红线规则、目录结构、接口规范、性能规范
- `uniapp-app-generate-skill` — 项目骨架、主题系统、组件标准、跨平台规范
- `uniapp-request-skill` — 请求层封装、API 契约、错误处理
- `uniapp-components-skill` — 登录鉴权、Token 管理、安全规范
- `uniapp-crossplatform-audit-skill` — 跨平台兼容性审计维度

## 可配合技能

本 skill 仅输出报告，不执行修复。如需基于报告落地调整，可调用：

| 配合 Skill | 场景 |
|------------|------|
| `uniapp-standardization-skill` | 按报告进行项目规范化 |
| `uniapp-crossplatform-audit-skill` | 深入跨平台兼容性审计 |
| `uniapp-request-skill` | 深度请求层设计与审计 |
| `uniapp-vue2-upgrade-skill` | Vue2 项目升级评估 |
| `uniapp-theme-skill` | 主题系统一致性治理 |
| `frontend-code-doctor` | 通用前端代码审查补充 |

## 目录说明

```
uniapp-code-audit-skill/
├── SKILL.md                              # 技能定义（报告-only）
├── README.md                             # 本文件
└── references/
    ├── security-checklist.md             # 安全合规检查清单
    ├── performance-checklist.md          # 性能检查清单
    ├── code-quality-checklist.md         # 代码质量检查清单
    ├── ui-consistency-checklist.md       # UI/主题一致性检查清单
    ├── architecture-checklist.md         # 架构与规范检查清单
    ├── api-contract-checklist.md         # API 契约检查清单
    ├── cross-platform-checklist.md       # 跨平台兼容性检查清单
    ├── mini-program-checklist.md         # 小程序专项检查清单
    └── self-audit-checklist.md           # 本技能自我审计清单
```

## 自我审计

本 skill 升级后，使用 `references/self-audit-checklist.md` 对 `SKILL.md`、`README.md` 及所有 references 进行自我审计，确保符合“只输出报告，不修复代码”的原则。

## 常见问题

### Q: 审计结果太多怎么办？

A: 按 P0 → P1 → P2 → P3 顺序查看报告。P0 级问题表示违反红线或上线合规要求，需优先关注。

### Q: 审计后如何落地改进？

A: 本 skill 不执行修复。可基于 `uniapp-audit-report.md` 调用 `uniapp-standardization-skill` 等项目规范化 skill 进行落地。

### Q: 可以审计非 uniapp 项目吗？

A: 本 skill 聚焦 uniapp 项目规范。通用前端代码审查可配合 `frontend-code-doctor`。
