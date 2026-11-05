# 前端 UI 一致性审查器

> 目录名与原调用名保留为 `frontend-style-harmonizer-skill`，对外能力升级为“前端 UI 一致性审查器”。旧触发词和 `reuse / align / hardcode` 参数继续可用。

当同事 A、B 分别写了两个页面：一个搜索框有图标、另一个没有；一个 Checkbox 用公共组件、另一个手写；按钮高度、圆角和禁用态也各不相同——这个 Skill 用项目已有主题与组件为依据，给出可核对的统一方案。

## 能力

| 能力 | 会检查什么 | 产出 |
|---|---|---|
| Token 漂移 | 颜色、字号、间距、圆角、阴影、动效、硬编码 | Token 收敛建议 |
| 空间与平台状态 | 页面外侧 gutter、padding/margin 责任、顶部距离、固定底栏、安全区、键盘顶起 | 空间责任与真机验证清单 |
| 组件契约 | Button、Search、Input、Select、Checkbox、Tab、Card、Dialog、Table、Empty | 来源、规格、图标和状态差异 |
| 图标语义 | 编辑/删除/搜索/关闭等动作图标 | 资产、尺寸、颜色、点击区域收敛建议 |
| 页面模式 | 列表、表单、详情、设置、登录、固定操作区 | 页面骨架和反馈状态差异 |
| 复用治理 | 重复样式块、页面手写组件副本 | 公共 class / 组件复用建议 |

## 先审查，后收敛

默认只生成 `<项目>/docs/ui-consistency-report.md`，不会修改源码。报告区分三类结论：

1. **已确认基线**：来自项目 Token、公共组件或组件库。
2. **建议基线**：稳定复用、可访问的现有实现。
3. **待确认基线**：只因出现次数多而推断，绝不会自动落地。

只有你确认后，才可写入 `ui-consistency-baseline.md`；只有再加 `--apply`，才会对高置信度的纯视觉项给出 diff 并执行。

## 使用方式

```text
# 全量只读审查
前端一致性审查 D:/projects/my-admin

# 用户的典型问题：专审组件契约
检查所有页面的按钮、搜索框、Checkbox、页面边距、固定底栏和编辑图标是否统一 D:/projects/my-admin

# 只看页面骨架和状态
frontend-style-harmonizer --scope patterns,states D:/projects/my-admin

# 保持旧调用方式
frontend-style-harmonizer --scope align D:/projects/my-admin

# 在确认报告与基线后才执行视觉修复
frontend-style-harmonizer --apply --baseline confirmed D:/projects/my-admin
```

## 搜索框示例

报告不只会说“搜索框不一致”，而会输出：

| 页面 | 来源 | 左图标 | 高度 | 结论 |
|---|---|---|---|---|
| 用户列表 | `SearchField` | 有 | md Token | 已确认基线 |
| 订单列表 | 页面手写 | 无 | 40px | P1：迁移或确认紧凑变体 |

这样团队能先决定“列表搜索必须有图标吗”，再决定是否替换，避免审查器把合理的页面特例改坏。

## 与 wg-skills 的协同

| 范围 | 事实来源 / 后续处理 |
|---|---|
| Vue Token | `vue-theme-skill` |
| Vue 样式、动效、布局 | `vue-style-skill` |
| Vue 公共组件 | `vue-base-skill` 和各子组件 Skill |
| uni-app 主题与组件规范 | `uniapp-theme-skill`、`uniapp-style-skill`、`uniapp-base-skill` |
| 美学和品牌问题 | `frontend-ui-foundry` |

本 Skill 只审查和协调，**不新造第二套 Token 或组件库**。

## 目录

```text
frontend-style-harmonizer-skill/
├── SKILL.md
├── STANDARD.md
├── README.md
└── references/
    ├── component-contracts.md      # Button / Search / Checkbox 等契约
    ├── space-system.md             # gutter / 顶部 / 键盘 / 固定底栏 / 安全区
    ├── layout-audit-matrix.md      # 页面空间、固定区、键盘的逐项取证矩阵
    ├── icon-contracts.md           # 图标动作语义与状态色
    ├── page-patterns.md            # 列表 / 表单 / 详情等页面模式
    ├── baseline-resolution.md      # 基线决策与例外记录
    ├── report-template.md          # 证据化报告模板
    ├── detection-rules.md          # 样式指纹和文件扫描
    ├── align-checklist.md          # 尺寸对齐兼容规则
    ├── hardcode-patterns.md        # 裸值检测
    └── token-conventions.md        # Token 命名约定
```

## 红线

- 默认只读；不会私自统一业务页面。
- 不改事件、状态、接口、路由、权限或文案。
- 低置信度发现和营销/沉浸式特例只报告，不自动改。
- `--apply` 必须以已确认报告和基线为前提，并验证构建、关键状态和可访问性。
