# uniapp-base-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 1 层：容器层。**

本模块提供 uniapp 技能群的**根容器**与**基础零件**，是所有内容型组件的唯一实现来源。

```
uniapp-theme-skill（变量真源）
          
uniapp-base-skill（容器层）   本模块
          
专项层（style / page-components / app-generate / ui-template-builder …）
```

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-theme-skill` | 依赖（变量真源） | 全部颜色/间距/圆角/字号来自 `base.css` |
| `uniapp-ui-component-commands-skill` | 索引依赖 | 组件别名检索、注册表维护；**不复制**其组件源码 |
| `uniapp-page-components-skill` | 索引依赖 | 历史页面组件清单，用于搬迁时的对照 |

反向依赖（**禁止**）：`uniapp-theme-skill` 不得引用本模块。

## 三、目录约定

```
uniapp-base-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
├── base-card.md                      # 根容器契约文档
├── base-popup.md                     # 根容器契约文档
├── input-field.md                    # 表单类文档（input-field / search-bar）
├── containers/                       # ★ 根容器层
│   ├── base-card/{index.vue,…}
│   ├── base-popup/{index.vue,…}
│   ├── base-form-item/{index.vue,…}
│   ├── base-avatar/{index.vue,…}
│   ├── base-navbar/{index.vue,…}
│   └── base-tabbar/{index.vue,…}
├── components/                       # ★ 内置组件层
│   ├── form/      button/search-bar/input-field/picker/date-picker/
│   │              switch/checkbox-group/radio-group
│   ├── feedback/  toast/modal/action-sheet/loading/empty-state
│   ├── list/      list-item/product-card/article-card/chat-bubble/timeline
│   ├── navigation/ top-tab/side-menu/breadcrumb
│   └── business/  price-tag/count-down/progress-bar/stepper/coupon
├── styles/                           # 样式类组件 + 全局关键帧真源
│   ├── animation.scss                # ★ @keyframes 唯一定义处
│   ├── index.scss
│   └── button/ line/ shape/ combo/ card/
├── references/
│   ├── skill-matrix.md
│   └── component-checklist.md
└── demo-components/                  # ★ 场景 demo（Markdown 规范 + HTML 参考图）
    ├── base-card-layout/  base-form/  base-page/
    └── base-popup/  base-picker/  base-date-picker/  shared/
```

### 3.1 容器 vs 零件

| | 容器 `containers/` | 零件 `components/` |
|---|---|---|
| 职责 | 提供外壳（背景/圆角/边框/阴影/遮罩/安全区/动画） | 提供内容（选项、标签、数据、交互逻辑） |
| 数量 | 少而稳定 | 可持续扩充 |
| 依赖 | 只依赖主题变量 | 依赖容器 + 主题变量 |
| 例子 | `base-card` `base-popup` `base-input` | `picker` `radio-group` `toast` `product-card` |

## 四、内容清单

### 4.1 根容器

| 容器 | 职责 | 状态 |
|------|------|------|
| `base-card` | 卡片外壳：圆角/背景/边框/阴影/header/footer/按压反馈 | 已实现（唯一实现） |
| `base-popup` | 弹窗外壳：遮罩/方向/圆角/安全区/进出场动画；内部内置 `base-card` | 已实现（唯一实现） |
| `base-input` | 输入外壳：标签/前后缀/错误文案/聚焦态 | 已实现 |
| `base-form-item` | 表单项行外壳：标题/说明/控件位/箭头 | 待补全 |

### 4.2 零件分类

| 分类 | 含义 | 组件 |
|------|------|------|
| `form` | 表单控件 | `picker` `date-picker` `radio-group` `checkbox-group` `input-field` `stepper` |
| `feedback` | 反馈提示 | `toast` `modal` `action-sheet` `loading` `empty-state` |
| `business` | 业务展示 | `product-card` `article-card` `user-avatar` `price-tag` `count-down` `coupon` `progress-bar` |
| `list` | 列表件 | `list-item` `notice-bar` `grid` `comment-item` |
| `navigation` | 导航件 | `nav-bar` `tab-bar` `back-button` |
| `style` | 纯样式 | `divider` `badge` `tag` `card.scss` |

## 五、内置约束

**B01** 容器是唯一实现。`uniapp-page-components-skill/components/base-*` 的历史实现必须迁入本模块后删除原件，不允许两处并存。

**B02** 容器**不感知业务**。容器内不出现接口调用、store 访问、业务文案、业务字段。

**B03** 内容型组件必须基于根容器。判定与示例见上位规范 §三。

**B04** 容器可嵌容器。`base-popup` 内部就是 `base-card`，这是设计而非违规。

**B05** 组件一律 Vue 3 `<script setup lang="ts">`，`props` 用 TS 接口 + `withDefaults`，每个 prop 带注释。

**B06** 每个组件目录必须有 `index.vue` + `props.json` + `usage.md` 三件套。`props.json` 必须**严格合法 JSON**（禁止 `//` 注释、禁止尾逗号）。

**B07** `props.json` 字段固定 7 类：`name` / `title` / `category` / `aliases` / `props` / `events` / `slots`；`props` 每项四元组 `{name, type, default, desc}`；`aliases` 必填。

**B08** `props.json` 的 `props` 与实现**逐条对应**（名称、类型、默认值三者一致），`events` / `slots` 与实现的 `defineEmits` / `<slot>` 一致。

**B09** 样式全部 `scoped`，颜色与尺寸走 `var(--xxx, 兜底)`，禁止裸值。

**B10** 容器对外不暴露内部实现类名（`.bc-header` / `.bc-body` 属私有），扩展走 props 与 slot。

**B11** 弹窗类组件（`modal` / `action-sheet` / `picker` / `date-picker`）必须用 `base-popup` 承载，**禁止**自写 `position: fixed` + 遮罩。

**B12** 卡片类组件（`product-card` / `article-card` / `user-card` / `list-item` / `comment-item`）必须用 `base-card` 承载，**禁止**自写圆角/边框/内边距。

**B13** 演示优先：每个组件至少一个自包含 HTML demo，落在 `demo-components/<组件名>/html/`，可直接 `file://` 打开。

**B14** Demo 交互状态默认触发到底（弹窗类默认打开），避免"打开页面什么都没发生"。

**B15** 场景 demo 一律放 `demo-components/<场景>/`，只放**场景化组合与参考图**，不放组件实现；实现一律在本模块 `containers/` 或 `components/`。

## 六、变更纪律

- 移动/新增组件 → 同步 `components/_registry.json`、索引层 `commands/*.md`、`references/matching-rules.md`、本文件 §四清单。
- 改容器 props → 同步 `base-card.md` / `base-popup.md` / `input-field.md` 契约文档。
- 破坏性变更在 `README.md` 标注迁移方式。

## 七、自检

- [ ] `props.json` 全部是合法 JSON
- [ ] `props.json` 与实现逐条对应
- [ ] 无第二份容器实现
- [ ] 弹窗/卡片类组件已基于根容器
- [ ] 全部颜色/尺寸走 `var()` 且带兜底
- [ ] 每个组件有可运行 demo
- [ ] `bash scripts/check-skills.sh` 错误为 0
