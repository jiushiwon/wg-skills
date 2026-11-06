---
name: mobile-safe-area-audit-skill
description: 审计并在确认后最小修复 uni-app、小程序与移动 H5 的顶部胶囊、iPhone 底部安全区、fixed/sticky 操作栏、输入框键盘顶起和内容避让问题。触发词：“安全区审计”“底部按钮遮挡”“键盘顶起”“微信胶囊适配”“safe-area 修复”。
---

# 移动端安全区与键盘审计修复

面向 uni-app、微信小程序和移动 H5 的专项审计 Skill。目标不是给每页补一段 `env()`，而是找出**顶部、底部、固定区、键盘**分别由谁负责，再收口到项目已有的容器、mixin 或 composable。

## 适用与边界

适用：自定义导航、微信胶囊避让、iPhone Home Indicator、底部固定按钮、聊天输入框、长表单、底部 Tab、键盘弹起后的滚动内容。

不适用：普通 PC 页面间距审查使用 `frontend-style-harmonizer-skill`；品牌视觉或页面重设计使用对应 UI Skill。

默认只读。只有用户确认审计报告与基线后，才允许 `--apply` 做视觉层最小修复；不得改接口、路由、业务事件或数据结构。

## 触发示例

```text
审计这个 uni-app 项目的安全区和键盘顶起问题 D:/projects/my-miniapp
为什么 iPhone 底部按钮会挡住最后一项，帮我先只读检查
检查微信胶囊、自定义导航和 fixed 提交按钮是否统一
确认报告后，修复已确认的底部安全区实现漂移
```

## 参数

| 参数 | 说明 | 默认值 |
|---|---|---|
| `[path]` | 项目路径 | 当前目录 |
| `--report-only` | 仅输出证据化报告 | 是 |
| `--scope` | `top`、`bottom`、`keyboard`、`fixed`、`all` | `all` |
| `--apply` | 在用户确认基线后执行最小视觉修复 | 否 |

## 必须执行的审计流程

1. **识别运行端与既有真源**：读取项目规则、导航容器、主题样式、safe-area mixin / Token / composable；区分原生导航、自绘导航、WebView 与沉浸式页面。
2. **建立责任表**：按 `references/audit-checklist.md` 记录顶部胶囊、底部安全区、固定操作区、内容预留、键盘策略分别由哪个层负责。
3. **扫描实现漂移**：查找 `env(safe-area-inset-*)`、`position:fixed/sticky`、`keyboardHeight`、`adjust-position`、`cursor-spacing`、硬编码导航高度；与项目公共封装逐项对照。
4. **判定证据边界**：静态扫描只能判定实现漂移或遮挡风险；键盘、刘海屏、Home Indicator 的最终显示必须标为“待真机验证”。
5. **输出报告**：写入 `<项目>/docs/mobile-safe-area-audit.md`，每项给出文件位置、责任方、静态/视觉证据、风险等级、推荐基线和验证动作。
6. **可选修复**：仅当用户确认后，按 `references/repair-patterns.md` 输出并应用最小 diff；优先复用项目已有 mixin、容器或 composable，不创建第二套安全区方案。
7. **验证**：构建通过后，至少验证 iOS / Android（若项目支持）上的顶部、底部、键盘弹起、键盘收起、滚动到最后一项五种状态；无法验证时明确留下待办。

## 决策红线

1. 顶部胶囊避让、安全区、键盘策略必须先找项目现有真源；不能根据单个页面猜测全局规范。
2. 发现页面手写 `env()`，而项目已有公共 mixin / 容器时，报告为**实现漂移**，不能直接声称页面已坏。
3. 发现 fixed/sticky 操作栏，必须反查内容区是否预留“操作栏高度 + 底部安全区”；无真机只能报告遮挡风险。
4. 页面和输入组件同时处理 `keyboardHeight`、自动顶起或 cursor spacing 时，必须列为双重位移风险并做真机验证。
5. 自绘导航、原生导航、沉浸式 Hero 可以采用不同方案，但必须作为明确 Variant 记录，不能混为一套固定高度。
6. `--apply` 只改已确认的视觉层责任归属；不得碰业务逻辑、请求、状态机、路由和权限。

## 输出格式

```markdown
## P1：底部安全区实现漂移

- 文件：`pages/order/confirm.vue:142-153`
- 静态证据：页面直接写 `env(safe-area-inset-bottom)`；项目已有 `safe-area-bottom` mixin。
- 当前责任：页面私有样式。
- 推荐基线：公共 Footer / mixin。
- 真机验证：iPhone Home Indicator、列表最后一项、键盘弹起与收起。
- 结论：实现漂移；不宣称当前页面已出现遮挡。
```

## 必读参考

- `references/audit-checklist.md`：按端和页面类型取证。
- `references/repair-patterns.md`：确认后的最小修复模式与反例。
- `references/report-template.md`：审计报告模板。

## 协同关系

| 发现 | 下一步 |
|---|---|
| 页面间距、组件、图标等宽泛漂移 | `frontend-style-harmonizer-skill` |
| uni-app Token 或基础容器缺失 | `uniapp-theme-skill`、`uniapp-style-skill`、`uniapp-base-skill` |
| Vue 移动 H5 Token / 容器缺失 | `vue-theme-skill`、`vue-style-skill`、`vue-base-skill` |

