# UniApp Code Audit Skill

本 skill 用于审计 uniapp 项目（Vue3 + TypeScript + Pinia 技术栈优先），按风险等级输出审计报告，**不修改、不修复、不重构项目代码**。

> **Vue2 项目适配**：Vue2 + Options API 项目也可直接审计，其中 `script setup`、Pinia、`defineProps` 类型等 Vue3 专属检查项将标注为"不适用"；如需先升级可配合 `uniapp-vue2-upgrade-skill`。

## 功能

审计维度：

- **安全合规**：敏感信息、域名配置、隐私合规、调试代码、依赖漏洞
- **性能**：包体积、图片优化、网络请求、长列表、setData、缓存、生命周期
- **代码质量**：TypeScript 安全、硬编码、重复代码、错误处理、组件规范、Vue3 规范、**测试质量、埋点与数据采集**
- **架构与规范**：目录结构、红线规则、配置文件、状态管理、构建/lint
- **UI/主题一致性**：颜色、字号、间距、圆角阴影、组件复用、交互反馈
- **跨平台兼容**：H5 标签、CSS 兼容性、浏览器 API、条件编译、安全区、**三端表现差异对比**
- **小程序专项**：setData、页面栈、分包体积、隐私合规、合法域名、版本更新
- **App 端专项**：Android/iOS 平台差异、原生能力（plus/nvue）、App 打包体积、更新推送、App 端安全
- **冗余与死代码**：未引用页面/组件/静态资源、死代码、冗余依赖
- **API 契约**：请求层封装、响应结构、Token 注入、401/403 处理、防抖去重、Mock

扩展能力：

- **增量审计**：仅扫描 git 未提交改动，输出差异问题，适合快速排查
- **抽样审计**：大项目可指定模块/文件范围，避免全量噪音
- **平台过滤**：小程序专属检查项（包体积、合法域名、审核合规）仅在目标平台包含小程序时执行；App 端专项检查项（Android/iOS 差异、原生能力、热更新）仅在目标平台包含 App 时执行
- **按文件分组视图**：报告可按文件维度二次组织，便于定位修复
- **问题闭环**：支持与上次审计报告对比，量化问题解决进度（仅统计，不输出修复方案）

## 使用方式

### 触发词

```
"uniapp 审计"
"小程序代码审计"
"uniapp 安全审计"
"uniapp 性能审计"
"检查 uniapp 规范符合性"
"uniapp UI/主题审计"
"uniapp 代码质量审计"
"uniapp 架构审计"
"uniapp API 契约审计"
"uniapp 小程序合规审计"
"uniapp App 端审计"
"安卓/苹果端兼容性审计"
"帮我看看这个 uniapp 项目有什么问题"
"审计这个项目有没有冗余代码或没用的页面组件"
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

# 单维度审计
> 检查一下这个项目的 UI/主题是否一致
> 帮我看看接口封装有没有问题
> 小程序能过审吗（小程序合规审计）

# 增量审计（只查未提交改动）
> 只审计我还没提交的改动有没有问题
```

## 工作流

1. **审计范围确认** — 全量/模块、目标平台、重点维度，可选增量审计（git diff）与抽样审计
   - 会按需询问：审计范围、目标平台（小程序专属检查仅在小程序平台执行）、重点维度、是否增量/抽样
2. **多维度扫描** — 安全、性能、代码质量、架构、UI/主题、跨平台、小程序专项、App 端专项、冗余与死代码、API 契约
3. **问题汇总** — 按 P0/P1/P2/P3 风险等级归类并统计
4. **输出报告** — 生成 `uniapp-audit-report.md`

## 输出文件

- `uniapp-audit-report.md` — 按风险等级分级的审计问题清单
- 报告可选包含：按文件分组问题清单、问题闭环对比（与上次报告）、维度健康度

> 本 skill 不输出修复方案、不生成补丁、不修改项目代码。

## 审计运行前提

- 包体积 / 主包大小检查依赖构建产物，请先执行 `npm run build:mp-weixin`（产物在 `dist/build/`）。
- 依赖漏洞检查（`npm audit`）需已安装依赖且可访问 npm registry。
- 前提未满足的检查项，报告中标注"未执行（缺少前提）"，不会忽略或臆测。

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
    ├── code-quality-checklist.md         # 代码质量检查清单（含测试/埋点）
    ├── ui-consistency-checklist.md       # UI/主题一致性检查清单
    ├── architecture-checklist.md         # 架构与规范检查清单
    ├── api-contract-checklist.md         # API 契约检查清单
    ├── cross-platform-checklist.md       # 跨平台兼容性检查清单
    ├── mini-program-checklist.md         # 小程序专项检查清单
    ├── app-platform-checklist.md         # App 端专项检查清单（Android/iOS）
    ├── dead-code-checklist.md            # 冗余与死代码检查清单
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

### Q: 项目是 Vue2 的，能审计吗？

A: 可以。Vue3 专属检查项（`script setup`、Pinia、`defineProps` 类型等）会标注为"不适用"，其余检查项照常执行。如需先升级到 Vue3，可配合 `uniapp-vue2-upgrade-skill`。

### Q: 为什么报告里有些检查标了"未执行（缺少前提）"？

A: 这类检查依赖构建产物或网络（如包体积检查需先构建、`npm audit` 需网络）。按提示补齐前提后重新审计即可。

### Q: 只改了几行代码，怎么快速排查？

A: 使用增量审计：告诉 skill"只审计未提交的改动"，它会只扫描 git diff 范围内的代码，输出差异问题。
