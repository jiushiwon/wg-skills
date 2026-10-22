# uniapp-style-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（视觉与样式规范）。**

本模块定义"页面长什么样"的**规则**与**参考实现**：Token 层级、排版阶梯、间距体系、语义变量、动效预设、核心组件实现范式、无障碍与深色模式。

> **边界**：本模块产出**规范与范式**，不产出**技能库组件实现**。§10 的 Card / Modal / Popup / Input 等实现是"参考范式"，组件真源在 `uniapp-base-skill`；两处不一致时以 `uniapp-base-skill` 为准，本模块同步更新。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-theme-skill` | 依赖（变量真源） | 运行时 CSS 变量以 `base.css` 为准 |
| `uniapp-standard-skill` | 依赖（前置规范） | 目录结构、命名、红线 R01–R20 |
| `uniapp-base-skill` | 依赖（容器与零件） | 卡片/弹窗/输入的容器外壳 |

反向依赖（**禁止**）：不得反向依赖 `uniapp-app-generate-skill` / `uniapp-diagnostic-skill` 的实现。

## 三、目录约定

```
uniapp-style-skill/
├── SKILL.md                        # 十八章规范主体
├── README.md
├── STANDARD.md                     # 本文件
├── demo.html                       # Token 速查盘（自包含 HTML）
└── references/
    ├── design-tokens.md            # Token 生成算法与桥接
    └── design-audit-checklist.md   # D01–D34 逐条 grep 检测命令
```

- `SKILL.md` 主体较长，**细节下沉**到 `references/`；`SKILL.md` 只保留判定规则与索引。
- `demo.html` 是 Token 速查盘，自包含、可直接打开。

## 四、变量与 SCSS Token 的关系

本模块的 SCSS Token（`$color-*` / `$spacing-*` / `$font-size-*` / `$radius-*` / `$z-*`）与 `uniapp-theme-skill` 的 CSS 变量（`--color-*` / `--space-*` / `--font-*` / `--radius-*` / `--z-index-*`）是**两层**，不是两套：

| 层 | 载体 | 用途 |
|----|------|------|
| 编译期 | SCSS 变量 | 静态计算（色阶派生、mixin、函数） |
| 运行时 | CSS 变量 | 主题切换（`[data-theme]`） |

- SCSS 变量**不允许**直接产出运行时主题色；主题色必须落到 CSS 变量。
- 组件样式中引用运行时主题，走 `var(--xxx, 兜底)`。

## 五、内置约束

**S01** D01–D34 是本模块的红线集合，与 `uniapp-standard-skill` 的 R01–R20 并列。引用时**必须带前缀**（"D01"、"R10"），禁止裸写编号——历史上出现过 `R01` 在两套体系里含义不同的撞车。

**S02** D01：SCSS 必须用 Token，禁止硬编码颜色。D06/D09/D18 同理禁止写死字号 / z-index / 圆角。

**S03** D33：组件尺寸必须取组件级 Token；新增组件级 Token 统一写入 `styles/tokens/_components.scss`。

**S04** D02：样式必须 `scoped`。

**S05** D07：SCSS 嵌套不超过 3 层。

**S06** D13：Popup 必须有进出场动画。

**S07** D14/D17：页面外边距与模块间距统一，走 `$page-gutter` / `$section-padding`。

**S08** D19：底部悬浮按钮走 `.btn-fixed-bottom`；D20：分割线走 `.divider`；D23：文本层级走 `.text-*` 类；D30：工具类集中定义。

**S09** D24：可点击区 ≥ 44pt（88rpx）。

**S10** D28：图片必须 `mode` + 占位 + 兜底。

**S11** D29：禁第三方 UI 库。

**S12** D32：空列表必须用 `<Empty>`。

**S13** D34：正文对比度 ≥ 4.5:1。

**S14** §8.4.1：项目内禁止新定义 `@keyframes`（组件级动画除外）。本模块正文的示例代码必须自洽——**示例里出现裸尺寸或自带 `@keyframes` 视为违规**。

**S15** §12.2：props 用 TS 接口 + `withDefaults`；emit 用 `defineEmits` 泛型、事件名 kebab-case；slots 明确声明并给默认 fallback；样式 scoped 且只经 Token 引用，跨组件穿透用 `:deep()`。

**S16** §12.3：`components/common/index.ts` 集中导出。

**S17** §12.4：禁第三方 UI 库，检查 3 条（依赖声明、源码目录、`@import`）。

**S18** 深色模式方案（A/B/C，见 `references/design-tokens.md` §7）落地时必须以新增 `[data-theme]` 覆盖实现，不新增第二套变量名。

**S19** `references/design-tokens.md` 的色阶生成（chroma-js）只产出 SCSS 中间层，最终运行时值仍以 `uniapp-theme-skill/base.css` 为准。

**S20** 本模块 §10 的组件实现若与 `uniapp-base-skill` 冲突，**以 `uniapp-base-skill` 为准**并回头修本模块。

## 六、变更纪律

- 改 D 系列红线 → 同步 `references/design-audit-checklist.md` 的对应 grep 命令。
- 改 Token 阶梯 → 同步 `demo.html` 速查盘、`references/design-tokens.md`。
- 改组件范式 → 同步 `SKILL.md` §10 与 `uniapp-base-skill` 的实现（双向）。

## 七、自检

- [ ] 引用红线时带 D/R 前缀
- [ ] 正文中无写死颜色/尺寸
- [ ] 正文中无自带 `@keyframes`（组件级除外）
- [ ] `demo.html` 可直接打开
- [ ] 与 `uniapp-base-skill` 无冲突
- [ ] `bash scripts/check-skills.sh` 错误为 0
