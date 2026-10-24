# uniapp-page-components-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（页面级组件）。**

本模块提供**整页级**的组合组件（首页、列表页、详情页、登录页…）与页面内业务件（评论项、通知栏、设置项、用户卡）。

定位边界：整页组件 vs 局部组件。整页组件自带页面级背景与骨架，**不再**外层套容器；局部内容型组件必须套 `base-card`。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-theme-skill` | 依赖（变量真源） | 主题变量引用 |
| `uniapp-base-skill` | 依赖（容器与零件） | 根容器 `base-card` / `base-popup` / `base-input`，业务零件 `user-avatar` / `price-tag` / `product-card` |
| `uniapp-standard-skill` | 依赖（前置规范） | 目录结构、命名、接口与状态管理红线 |
| `uniapp-style-skill` | 依赖（样式规范） | D01–D34 视觉红线 |

反向依赖（**禁止**）：本模块不得反向依赖 `uniapp-request-skill` / `uniapp-auth-skill` 的实现代码；数据由调用方通过 props 传入。

## 三、目录约定

```
uniapp-page-components-skill/
├── SKILL.md
├── README.md
├── STANDARD.md                       # 本文件
├── components/
│   ├── <kebab-name>/<kebab-name>.vue
│   └── …
└── references/
    ├── page-specs.md
    ├── theme-integration.md
    └── theme-detect.md
```

- 组件目录 kebab-case，入口文件与目录同名（`chat-page/chat-page.vue`），走 easycom 自动注册。
- 依赖的 `base-*` 容器/组件在 base-skill 内，**不满足** easycom 默认规则，须用 base-skill 生成的 `easycom.json` 里的 custom 规则注册。
- 组件只消费 props 与 slot，**禁止**在组件内发起 `uni.request`。

## 四、内容清单

### 4.1 页面级组件（自带页面骨架，不套容器）

`home-page` / `list-page` / `detail-page` / `form-page` / `login-page` / `profile-page` / `tab-list-page` / `search-page` / `result-page` / `moments-page` / `product-detail-page`

### 4.2 页面内业务件（**必须**套 `base-card`）

`user-card` / `comment-item` / `image-card` / `notice-bar` / `setting-item` / `empty` / `custom-tabbar`

### 4.3 根容器（**必须迁出本模块**）

`base-card` / `base-button` / `base-navbar` / `base-tabbar` / `base-form-item` / `base-avatar`

> 这 6 个与 `uniapp-base-skill/containers/` 重复。迁移后本模块只保留 `components/` 中的**页面级与业务级**组件，`base-*` 一律改为从 `uniapp-base-skill` 依赖。

## 五、内置约束

**P01** 整页组件自带页面级背景与骨架，**不**再外层套 `base-card`；局部内容型组件**必须**套 `base-card`。

**P02** 卡片类布局一律基于 `<base-card>` 或透传 `cardProps`，不重复造圆角/内边距。

**P03** 禁写死颜色/间距/圆角/字号，一律 `var(--xxx)` + 兜底值。

**P04** 例外白名单（必须加注释说明）：阴影模糊半径、图片固定高度、`1rpx` 细边框、小徽标/指示条尺寸。

**P05** 样式 `scoped`；props 用 TS 接口 + `withDefaults`；事件用 `defineEmits` 泛型。

**P06** 图片必须 `mode` + 占位 + `@error` 兜底。

**P07** 可点击区 ≥ `88rpx`（44pt）。

**P08** 动画只改 `transform` / `opacity`，不动布局属性。

**P09** 禁第三方 UI 库（uView / Vant Weapp / ColorUI / iView）。

**P10** 长度用 `rpx`。

**P11** 组件必须留扩展口：props / slot / emit，外部不改源码即可定制。

**P12** 组件内只做展示，**禁止** `uni.request`、store 写入。

**P13** 结构性嵌套 `v-for` 属必要例外（允许），数据型嵌套 `v-for` 禁止。

**P14** 迁移后 `components/base-*/` 必须删除，改为依赖 `uniapp-base-skill`；两处并存即违规。

**P15** `references/theme-integration.md` 的主题变量清单必须与 `uniapp-theme-skill` 的 `base.css` 保持一致（该文件历史上出现过编码损坏，修改时必须重写而非增量编辑）。

## 六、变更纪律

- 新增页面组件 → 同步 `SKILL.md` 组件索引、`references/page-specs.md`。
- 引用变量名变更 → 同步 `references/theme-integration.md`。
- 迁移 `base-*` → 同步本文件 §4.3 与 `SKILL.md` 目录树。

## 七、自检

- [ ] `components/base-*/` 已全部迁出
- [ ] 局部内容型组件均已套 `base-card`
- [ ] 无写死颜色/间距
- [ ] 组件内无网络请求
- [ ] `references/theme-integration.md` 可读且与 `base.css` 一致
- [ ] `bash scripts/check-skills.sh` 错误为 0
