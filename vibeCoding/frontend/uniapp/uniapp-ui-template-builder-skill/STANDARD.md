# uniapp-ui-template-builder-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（页面模板构建器）。**

本模块把"页面类型 × 视觉风格"固化成**可直接生成的页面模板**，并配套 mock 数据与主题生成器。

覆盖两类目标端：

| 目标端 | 目录 | 说明 |
|--------|------|------|
| uniapp Vue3 | `components/uniapp-vue3/` | 小程序 / H5 页面模板 |
| PC React | `components/pc-react/` | 管理后台 / 大屏模板 |

> **边界**：本模块产**页面模板**（整页骨架 + mock），不产通用组件。模板内部使用的通用件来自 `uniapp-base-skill`。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-theme-skill` | 依赖（变量真源） | 主题变量与主题生成器 |
| `uniapp-base-skill` | 依赖（容器与零件） | 卡片 / 弹窗 / 输入的容器实现 |
| `uniapp-style-skill` | 依赖（样式规范） | 排版与间距规范 |
| `uniapp-page-components-skill` | 依赖（页面骨架） | 可复用的整页组件 |

## 三、目录约定

```
uniapp-ui-template-builder-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
├── components/
│   ├── uniapp-vue3/<template>/       # 小程序页面模板
│   └── pc-react/<template>/         # PC 端模板
├── references/
│   ├── mock-templates/
│   ├── scenarios/
│   └── theme-generator.ts
├── scripts/
├── styles/
└── templates/
```

- 模板目录名统一 `kebab-case`，代表**页面类型**（`home` / `product` / `login` / `profile` / `list` / `detail` / `table-list` / `dashboard`）。
- 每套风格以**样式文件**区分（`style-1-default` / `style-2-…`），不复制模板结构。
- mock 数据独立成 `mock.json` / `mock.ts`，与视图分离。

## 四、内容清单

| 分类 | 内容 |
|------|------|
| 页面类型 | 首页、商品页、登录页、个人中心、列表页、详情页、底部 tab、顶部 tab、大屏、管理后台表格 |
| 风格 | 每类型多套（`style-1-*` ~ `style-n-*`） |
| `references/theme-generator.ts` | `generateTokens` / `generateCSSVariables` |
| `references/mock-templates/` | mock 数据骨架 |
| `references/scenarios/mobile/` | 移动端场景 |

## 五、内置约束

**F01** 模板的**结构**只有一份，风格差异只体现在样式层。禁止为每种风格复制一份模板结构。

**F02** 模板内的颜色/间距/圆角/字号全部走 CSS 变量；风格切换 = 换变量集，不是换 class。

**F03** 变量名与 `uniapp-theme-skill` 的命名空间一致；模板内自带的变量集必须由 `theme-generator.ts` 生成，**不得**手写变量清单。

**F04** 模板生成的主题变量集要写进 `base.css` 的 `[data-theme]` 机制（可作为新主题变体），保证与全局换肤一致。

**F05** 页面级内容块必须基于 `base-card` / `base-popup`；模板不得自带一套卡片实现。

**F06** mock 数据集中在 `mock.json` / `mock.ts`，模板内不得散落硬编码业务数据。

**F07** mock 数据字段名与真实接口契约对齐（可用假值，但结构必须是最终结构），避免接入时全量返工。

**F08** 模板必须可直接运行，且交互状态默认触发到底（弹层默认打开、tab 默认选中第一项）。

**F09** PC React 模板与 uniapp 模板**分目录隔离**，不共享代码文件；跨端一致性通过**设计语言**保证，不通过代码复用保证。

**F10** 新增模板 → 同步 `SKILL.md` 页面类型清单、`README.md` 示例、`references/scenarios/`。

## 六、变更纪律

- 改模板结构 → 同步所有风格变体（结构只有一份）。
- 改风格 → 只动样式文件与变量集。
- 改主题生成器 → 同步 `references/theme-generator.ts` 与 `uniapp-theme-skill` 的变量命名空间。

## 七、自检

- [ ] 同一页面类型只有一份结构
- [ ] 无硬编码颜色/尺寸
- [ ] mock 与视图分离
- [ ] mock 字段结构与接口契约一致
- [ ] 模板可直接运行
- [ ] `bash scripts/check-skills.sh` 错误为 0
