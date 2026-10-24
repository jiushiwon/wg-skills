# 根容器组件（container）

> 实现真源：`vibeCoding/frontend/uniapp/uniapp-base-skill/`（本模块即实现层）
> 本文件由 `components/_registry.json` + 各组件 `props.json` 同步生成，**改实现必须重新生成本文件**。
> 重新生成：`node scripts/gen-commands.js`

## 总览

| 组件 | 说明 | 别名 | 类型 |
|------|------|------|------|
| `base-avatar` | 根容器：统一头像渲染（图片 / 文字兜底 / 4 档尺寸 / 圆形或圆角 / 点击事件） | 头像 / avatar / 用户头像 / 圆形头像 | 容器 |
| `base-card` | 根容器：统一卡片外壳（圆角 / 背景 / 描边 / 阴影 / 头尾插槽 / 左侧图片）。所有内容型组件都必须基于它扩展 | 卡片 / card / base-card / 卡片容器 / 面板外壳 / 面板 / 列表项外壳 | 容器 |
| `base-form-item` | 根容器：表单行外壳（标签列 + 必填星号 + 控件插槽 + 错误提示） | 表单项 / form-item / base-form-item / 表单行 / 输入行 | 容器 |
| `base-navbar` | 根容器：状态栏占位 + 单行导航（返回 + 居中标题 + 右侧插槽 / 胶囊） | 导航栏 / navbar / 顶部导航 / 自定义导航 | 容器 |
| `base-popup` | 根容器：5 方向弹窗 / 抽屉（top / bottom / left / right / center）+ 遮罩 + 安全区，内容内置 base-card | 弹窗 / popup / base-popup / 弹层 / 抽屉外壳 | 容器 |
| `base-tabbar` | 根容器：2~5 个菜单项（图标 + 文字 + 角标），激活项主题色高亮 | 底部导航 / tabbar / 底部菜单 / 自定义 tabbar | 容器 |

---

## base-avatar 头像容器

**说明**：根容器：统一头像渲染（图片 / 文字兜底 / 4 档尺寸 / 圆形或圆角 / 点击事件）

**别名**：头像、avatar、用户头像、圆形头像

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/containers/base-avatar/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` |  | 图片地址 |
| `name` | `string` |  | 昵称，优先取末两字 |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `md` | 尺寸档 |
| `round` | `boolean` | `true` | 是否圆形（false 时用圆角矩形） |
| `mode` | `'aspectFill' \| 'aspectFit' \| 'widthFix' \| 'scaleToFill'` | `aspectFill` | 图片裁剪模式 |
| `fallback` | `string` |  | 兜底文字，不传则由 name 推导 |

**事件**：

- `click`

---

## base-card 卡片容器

**说明**：根容器：统一卡片外壳（圆角 / 背景 / 描边 / 阴影 / 头尾插槽 / 左侧图片）。所有内容型组件都必须基于它扩展

**别名**：卡片、card、base-card、卡片容器、面板外壳、面板、列表项外壳

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/containers/base-card/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` |  | 卡片标题（也可用 header 插槽完全自定义） |
| `radius` | `string` | `var(--radius-card, 24rpx)` | 圆角 |
| `padding` | `string` | `var(--space-4, 16rpx)` | 内边距 |
| `background` | `string` | `var(--bg-card, #ffffff)` | 背景色 |
| `margin` | `string` | `0` | 外边距 |
| `width` | `string` | `100%` | 宽度 |
| `height` | `string` | `auto` | 高度 |
| `minHeight` | `string` |  | 最小高度，为空不生效 |
| `border` | `boolean \| string` | `false` | 描边：true 用主题 --border，也可直接传 CSS 边框值 |
| `shadow` | `boolean \| string` | `false` | 阴影：true 用主题 --shadow-sm，也可直接传 CSS 阴影值 |
| `clickable` | `boolean` | `false` | 是否可点击（触发 click 并带按压反馈） |
| `gap` | `string` | `var(--space-3, 12rpx)` | header / body / footer 之间的垂直间距 |
| `image` | `string` |  | 左侧图片地址 |
| `imageSize` | `string` | `var(--height-avatar-md, 80rpx)` | 左侧图片尺寸 |
| `imageRadius` | `string` | `var(--radius-image, 16rpx)` | 左侧图片圆角 |

**事件**：

- `click`

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 卡片主体内容 |
| `header` | 头部内容，优先级高于 title |
| `header-right` | 头部右侧操作区 |
| `footer` | 底部内容 |

---

## base-form-item 表单项容器

**说明**：根容器：表单行外壳（标签列 + 必填星号 + 控件插槽 + 错误提示）

**别名**：表单项、form-item、base-form-item、表单行、输入行

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/containers/base-form-item/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` |  | 标签文案 |
| `required` | `boolean` | `false` | 必填（左侧红色星号） |
| `error` | `string` |  | 错误提示，非空即显示并把行标红 |
| `labelWidth` | `string` | `160rpx` | 标签列宽 |
| `adjustPosition` | `boolean` | `true` | 键盘弹起时是否自动上推页面（小程序端） |
| `cursorSpacing` | `number` | `0` | 输入框与键盘的间距（px，仅 adjustPosition 为 true 时生效） |

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 控件内容，插槽参数 inputProps 含 adjustPosition / cursorSpacing |
| `label` | 标签内容，优先级高于 label |
| `error` | 错误提示内容，优先级高于 error |

---

## base-navbar 顶部导航容器

**说明**：根容器：状态栏占位 + 单行导航（返回 + 居中标题 + 右侧插槽 / 胶囊）

**别名**：导航栏、navbar、顶部导航、自定义导航

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/containers/base-navbar/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` |  | 标题 |
| `showBack` | `boolean` | `true` | 是否显示返回按钮 |
| `transparent` | `boolean` | `false` | 透明背景（沉浸式） |
| `fixed` | `boolean` | `false` | 是否吸顶 |
| `placeholder` | `boolean` | `true` | 吸顶时是否占位（避免遮挡内容） |
| `statusBarHeight` | `string` | `'0'` | 状态栏高度，小程序端建议传 var(--status-bar-height) |
| `showStatusBar` | `boolean` | `true` | 是否渲染状态栏占位行 |
| `rightText` | `string` |  | 右侧文字按钮 |
| `capsuleRight` | `CapsuleItem[]` | `[]` | 右侧胶囊按钮组 |
| `avoidCapsule` | `boolean` | `true` | 是否避让微信系统胶囊（微信端生效） |
| `capsuleGap` | `number` | `8` | 胶囊与右侧内容的间距（px） |

**事件**：

- `back`
- `rightClick`
- `capsuleClick`

**插槽**：

| 名称 | 说明 |
|------|------|
| `status-bar` | 状态栏占位内容 |
| `left` | 左侧区域，优先级高于返回按钮 |
| `title` | 标题内容，优先级高于 title |
| `right` | 右侧区域 |

---

## base-popup 弹窗容器

**说明**：根容器：5 方向弹窗 / 抽屉（top / bottom / left / right / center）+ 遮罩 + 安全区，内容内置 base-card

**别名**：弹窗、popup、base-popup、弹层、抽屉外壳

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/containers/base-popup/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | `false` | 是否显示（配合 update:show 做 v-model） |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'center'` | `bottom` | 弹出方向 |
| `radius` | `string` | `var(--radius-lg, 24rpx)` | 圆角，方向决定圆角位置 |
| `height` | `string` | `auto` | 高度，仅上下方向生效 |
| `width` | `string` | `560rpx` | 宽度，左右 / 居中方向生效 |
| `padding` | `'default' \| 'sm' \| 'none'` | `default` | 内边距档位，转发给内部 base-card |
| `title` | `string` |  | 标题，转发给内部 base-card |
| `mask` | `boolean` | `true` | 是否显示遮罩 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `duration` | `number` | `300` | 动画时长（毫秒） |
| `safeArea` | `boolean` | `true` | 底部弹窗是否适配安全区 |

**事件**：

- `update:show`
- `close`

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 弹窗内容 |
| `header-right` | 头部右侧操作区 |
| `footer` | 底部操作区 |

---

## base-tabbar 底部菜单容器

**说明**：根容器：2~5 个菜单项（图标 + 文字 + 角标），激活项主题色高亮

**别名**：底部导航、tabbar、底部菜单、自定义 tabbar

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/containers/base-tabbar/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `TabbarItem[]` | `[]` | 菜单项（2~5 个） |
| `modelValue` | `string \| number` |  | 当前激活 key（v-model） |
| `fixed` | `boolean` | `true` | 是否底部固定 |
| `safeArea` | `boolean` | `true` | 是否适配安全区 |
| `placeholder` | `boolean` | `true` | 固定时是否渲染等高占位（避免内容被底栏遮挡） |

**事件**：

- `update:modelValue`
- `change`

**插槽**：

| 名称 | 说明 |
|------|------|
| `item` | 自定义菜单项内容 |
