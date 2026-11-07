---
name: frontend-style-harmonizer-skill
description: 前端 UI 一致性审查器。审查跨页面的主题 Token、页面外侧与固定区空间系统、按钮/搜索框/表单等组件契约、图标语义、键盘与安全区状态及重复样式；默认只生成证据化报告。触发词：“前端一致性审查”“页面间距不统一”“底部按钮遮挡”“图标不统一”“组件契约”“frontend-style-harmonizer”。
---

# 前端 UI 一致性审查器

面向多人协作和 AI 连续开发的跨页面审查 Skill。它不只看“颜色是否相同”，还要回答：

- 同一类按钮为什么有三种高度、两种圆角？
- 搜索框是否都有约定的左侧图标、清空能力、筛选入口和状态？
- Checkbox、Input、Dialog 是公共组件、UI 库组件还是页面自定义副本？
- 列表、表单、空状态、加载和错误状态是否有一致的页面骨架？
- 两个页面视觉上都有留白，但一个由外层 `padding` 提供、另一个由子项 `margin` 或居中宽度凑出来；新页面为什么会忘记留白？
- 固定底部按钮是否被内容、键盘或安全区遮挡？顶部导航是否走同一个安全区和胶囊避让方案？
- 同一个“编辑”动作是否复用了同一铅笔图标、尺寸、默认/禁用/危险状态颜色？

## 边界与依赖

本 Skill 是**审查器与协调器**，不新建平行设计系统。

| 技术栈 | Token / 组件事实来源 | 本 Skill 的职责 |
|---|---|---|
| Vue | `vue-theme-skill`、`vue-style-skill`、`vue-base-skill` 及子组件 Skill | 取证、比对、指出未复用与漂移 |
| uni-app | `uniapp-theme-skill`、`uniapp-style-skill`、`uniapp-base-skill` | 按其 rpx、主题与组件规则审查 |
| React / HTML | 项目既有 CSS 变量、组件库、设计规范 | 取证、提出待确认基线，不强套 Vue/uni-app 值 |

**绝不修改** props、事件、状态、接口、路由、权限、业务文案和数据结构。

## 触发词

```text
前端一致性审查
UI 一致性
检查所有页面的按钮、搜索框和 Checkbox 是否统一
我的搜索框有的带图标有的不带
统一各页面样式
样式对齐
去硬编码
组件契约审查
frontend-style-harmonizer
```

## 参数与兼容性

| 参数 | 说明 | 默认 |
|---|---|---|
| `[path]` | 项目路径 | 当前目录 |
| `--report-only` | 只输出报告，不修改源码 | 是 |
| `--apply` | 仅在报告、基线和用户确认后执行高置信度视觉修复 | 否 |
| `--scope` | 指定审查维度 | `all` |
| `--baseline` | 基线来源：`auto`、`theme`、`library`、`confirmed` | `auto` |

兼容旧范围：`reuse`、`align`、`hardcode`、`all`；其中 `align` 等价于 `space + components + patterns`，`all` 包含全部维度。

## 审查维度

| 范围 | 审查内容 | 主要参考 |
|---|---|---|
| `tokens` | 颜色、字号、间距、圆角、阴影、层级、动效 Token 漂移 | `token-conventions.md` |
| `space` | 页面 gutter、padding / margin 责任边界、顶部距离、模块节奏、固定底栏预留 | `space-system.md`、`layout-audit-matrix.md` |
| `components` | 按钮、搜索框、输入、选择、Checkbox、Radio、Switch、Tab、卡片、弹窗、表格、空状态的组件契约 | `component-contracts.md` |
| `icons` | 图标资产、动作语义、尺寸、色彩状态、点击区域 | `icon-contracts.md` |
| `platform` | 键盘顶起、safe-area、顶部导航、固定操作区与内容避让 | `space-system.md` |
| `patterns` | 头部、搜索筛选区、工具栏、表单、列表、固定操作区、空/加载/错误状态 | `page-patterns.md` |
| `states` | hover / focus / disabled / loading / error / empty 等状态是否齐全且统一 | `component-contracts.md` |
| `reuse` | 重复声明块、重复组件副本 | `detection-rules.md` |
| `hardcode` | 裸颜色、裸尺寸、近义值、内联样式 | `hardcode-patterns.md` |
| `request` | 统一请求实例、Token/拦截器、入参出参一致性、loading/错误反馈、登录失效与重复提交 | `frontend-audit-checklist.md` |

## 强制工作流

1. **识别项目与事实来源**：扫描技术栈、主题文件、公共组件目录、UI 库和既有设计文档；先确定“谁是唯一真源”。
2. **收集页面与组件证据**：扫描页面、组件、全局样式；忽略 `node_modules`、构建产物和生成目录。
3. **按范围归类比对**：同一语义组件跨页面比较组件来源、Token、尺寸、图标、状态；同一页面模式按 `layout-audit-matrix.md` 逐项比较 gutter、顶部/底部空间责任、固定区、键盘和反馈状态。
4. **解析基线**：按 `references/baseline-resolution.md` 的优先级给出“已确认 / 建议 / 待确认”三类基线。不得把众数直接伪装成规范。
5. **生成报告**：写入 `<项目>/docs/ui-consistency-report.md`，使用 `references/report-template.md`。每一项必须带文件位置、证据类型、置信度、风险和建议。
6. **可选固化基线**：只有用户明确确认或指定 `--baseline confirmed`，才写入 `<项目>/docs/ui-consistency-baseline.md`，记录统一规格和合理例外。
7. **可选修复**：只有 `--apply` 且用户确认报告后，先输出 diff；仅执行高置信度视觉层替换。完成后构建并校验关键页面。

## 基线决策规则

优先级从高到低：

1. 项目明确的 Token、设计规范和组件 API。
2. 已接入的公共组件或 UI 库。
3. 已经稳定复用且可访问的共同实现。
4. 出现频率最高的实现，仅作为**待确认建议**。

营销 Hero、沉浸式活动、数据可视化、第三方嵌入等可成为例外，但必须在报告中说明范围与理由。

## 输出约束

- 报告写在**被审查项目**的 `docs/`，不写入本 Skill。
- 静态扫描得到的结论标注“静态证据”；只有实际截图或浏览器比对才标注“视觉证据”。
- 低置信度、跨组件库或涉及交互状态的项不得自动修复。
- 文本对比度遵循 WCAG AA：普通文本至少 `4.5:1`，大文本与非文本交互元素至少 `3:1`。

## 必读参考资料

- `references/detection-rules.md`
- `references/align-checklist.md`
- `references/hardcode-patterns.md`
- `references/token-conventions.md`
- `references/space-system.md`
- `references/layout-audit-matrix.md`
- `references/component-contracts.md`
- `references/icon-contracts.md`
- `references/page-patterns.md`
- `references/baseline-resolution.md`
- `references/frontend-audit-checklist.md`
- `references/report-template.md`

## 协同关系

| 发现的问题 | 下一步 Skill |
|---|---|
| Vue Token 缺失或命名漂移 | `vue-theme-skill` |
| Vue 布局、动效或工具类缺失 | `vue-style-skill` |
| Vue 公共组件未复用 | `vue-base-skill` 及对应子组件 Skill |
| uni-app 主题 / 组件规则漂移 | `uniapp-theme-skill`、`uniapp-style-skill`、`uniapp-base-skill` |
| 品牌美学而非一致性问题 | `frontend-ui-foundry` |
| 代码质量或性能问题 | `frontend-code-doctor` |
| 接口请求/配置漂移 | `frontend-request-skill` |

## 红线

1. 默认只读；`--apply` 前必须有报告、基线与用户确认。
2. 不建立第二套主题 Token 或组件库。
3. 不把低置信度识别、视觉特例或众数直接自动落地。
4. uni-app 必须按 rpx 规则归一化，不能套用 Web 的 px 网格。
5. 视觉相同但空间责任不同（如用子项 margin 模拟页面 gutter）必须报告为实现漂移，不能只因截图相似而忽略。
6. safe-area、键盘与固定操作区只做取证；未经过真机验证不得声称已解决遮挡问题。
7. 自动修复后必须检查构建、关键状态和可访问性。
8. 回滚前审查本轮差异，仅撤销本轮确认的改动，保留用户原有的未提交工作。
