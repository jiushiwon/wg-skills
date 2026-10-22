# 列表类组件（list）

> 实现真源：`vibeCoding/frontend/uniapp/uniapp-base-skill/`（本模块即实现层）
> 本文件由 `components/_registry.json` + 各组件 `props.json` 同步生成，**改实现必须重新生成本文件**。
> 重新生成：`node scripts/gen-commands.js`

## 总览

| 组件 | 说明 | 别名 | 类型 |
|------|------|------|------|
| `article-card` | 文章卡片，卡片外壳由 BaseCard 提供，支持封面图、标题、描述、作者、日期、阅读量 | 文章卡 / article-card / 资讯卡片 / 图文卡片 | 组件 |
| `chat-bubble` | 聊天气泡，支持左/右位置、文本/图片/语音类型，头像由 BaseAvatar 渲染 | 气泡 / chat-bubble / 消息气泡 / 对话气泡 | 组件 |
| `list-item` | 列表项，卡片外壳由 BaseCard 提供，支持图标、标题、描述、值、箭头 | 列表行 / list-item / 条目 / 列表单元 | 组件 |
| `product-card` | 商品卡片，卡片外壳由 BaseCard 提供，支持图片、标题、描述、价格、原价、销量、标签 | 商品卡 / product-card / 商品项 / 商品列表项 | 组件 |
| `timeline` | 时间线，整条由 BaseCard 承载，展示时间节点和事件 | 时间轴 / timeline / 时间线列表 / 进度时间线 | 组件 |

---

## article-card 文章卡片

**说明**：文章卡片，卡片外壳由 BaseCard 提供，支持封面图、标题、描述、作者、日期、阅读量

**别名**：文章卡、article-card、资讯卡片、图文卡片

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/list/article-card/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'thumb' | 'cover'` | `thumb` | 模式：thumb 左侧缩略图 / cover 顶部封面 |
| `image` | `string` |  | 封面图地址 |
| `title` | `string` |  | 标题 |
| `desc` | `string` |  | 描述 |
| `author` | `string` |  | 作者 |
| `date` | `string` |  | 日期 |
| `views` | `string|number` |  | 阅读量 |

**事件**：

- `click`

**用法**：见 [usage.md](../components/list/article-card/usage.md)

---

## chat-bubble 聊天气泡

**说明**：聊天气泡，支持左/右位置、文本/图片/语音类型，头像由 BaseAvatar 渲染

**别名**：气泡、chat-bubble、消息气泡、对话气泡

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/list/chat-bubble/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `'left' | 'right'` | `left` | 位置：left 接收方 / right 发送方 |
| `type` | `'text' | 'image' | 'voice'` | `text` | 类型：text 文本 / image 图片 / voice 语音 |
| `message` | `string` |  | 消息内容，image 类型时为图片地址 |
| `avatar` | `string` |  | 头像地址 |
| `name` | `string` |  | 用户名，同时用于头像文字兜底 |
| `time` | `string` |  | 时间 |
| `showAvatar` | `boolean` | `true` | 显示头像 |
| `showName` | `boolean` | `false` | 显示用户名 |

**用法**：见 [usage.md](../components/list/chat-bubble/usage.md)

---

## list-item 列表项

**说明**：列表项，卡片外壳由 BaseCard 提供，支持图标、标题、描述、值、箭头

**别名**：列表行、list-item、条目、列表单元

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/list/list-item/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` |  | 左侧图标地址 |
| `title` | `string` |  | 标题 |
| `label` | `string` |  | 描述文字 |
| `value` | `string` |  | 右侧值 |
| `arrow` | `boolean` | `false` | 显示右侧箭头 |
| `disabled` | `boolean` | `false` | 禁用，置灰且不触发 click |

**事件**：

- `click`

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 内容区自定义内容 |
| `icon` | 左侧自定义图标 |
| `right` | 右侧自定义内容 |

**用法**：见 [usage.md](../components/list/list-item/usage.md)

---

## product-card 商品卡片

**说明**：商品卡片，卡片外壳由 BaseCard 提供，支持图片、标题、描述、价格、原价、销量、标签

**别名**：商品卡、product-card、商品项、商品列表项

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/list/product-card/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `image` | `string` |  | 商品图片地址 |
| `title` | `string` |  | 商品标题 |
| `desc` | `string` |  | 商品描述 |
| `price` | `string|number` | `0.00` | 售价 |
| `originalPrice` | `string|number` |  | 原价，带删除线展示 |
| `sales` | `string|number` |  | 销量 |
| `tags` | `string[]` | `[]` | 标签数组 |

**事件**：

- `click`

**用法**：见 [usage.md](../components/list/product-card/usage.md)

---

## timeline 时间线

**说明**：时间线，整条由 BaseCard 承载，展示时间节点和事件

**别名**：时间轴、timeline、时间线列表、进度时间线

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/list/timeline/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `array` | `[]` | 时间线节点列表 [{ time, title, desc, active }] |

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 节点内容扩展，作用域参数为 { item, index } |

**用法**：见 [usage.md](../components/list/timeline/usage.md)
