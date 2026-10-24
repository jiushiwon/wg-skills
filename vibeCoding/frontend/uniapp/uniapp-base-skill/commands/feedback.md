# 反馈类组件（feedback）

> 实现真源：`vibeCoding/frontend/uniapp/uniapp-base-skill/`（本模块即实现层）
> 本文件由 `components/_registry.json` + 各组件 `props.json` 同步生成，**改实现必须重新生成本文件**。
> 重新生成：`node scripts/gen-commands.js`

## 总览

| 组件 | 说明 | 别名 | 类型 |
|------|------|------|------|
| `action-sheet` | 基于 BasePopup 的底部操作菜单 | 操作面板 / action-sheet / 底部菜单弹层 / 动作列表 | 组件 |
| `empty-state` | 无数据时的占位展示 | 空页面 / empty-state / 暂无数据 / 空列表占位 | 组件 |
| `loading` | 加载中指示器 | 加载 / loading / 加载动画 / 转圈 | 组件 |
| `modal` | 基于 BasePopup 的居中模态对话框 | 模态框 / modal / 对话框 / 确认框 / 确认弹窗 | 组件 |
| `toast` | 短暂显示后自动消失的轻提示 | 提示 / toast / 轻提示 / 操作反馈 | 组件 |

---

## action-sheet 动作面板

**说明**：基于 BasePopup 的底部操作菜单

**别名**：操作面板、action-sheet、底部菜单弹层、动作列表

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/feedback/action-sheet/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | `false` | 显示状态（v-model:show） |
| `title` | `string` |  | 标题 |
| `actions` | `array` | `[]` | 操作项列表，每项 { text, value, danger, disabled } |
| `showCancel` | `boolean` | `true` | 是否显示取消按钮 |
| `cancelText` | `string` | `取消` | 取消按钮文字 |

**事件**：

- `update:show`
- `close`
- `select`

**用法**：见 [usage.md](../components/feedback/action-sheet/usage.md)

---

## empty-state 空状态

**说明**：无数据时的占位展示

**别名**：空页面、empty-state、暂无数据、空列表占位

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/feedback/empty-state/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `image` | `string` |  | 插图 / 图标图片地址，为空时用 CSS 形状占位 |
| `title` | `string` |  | 标题 |
| `desc` | `string` |  | 描述文字 |
| `buttonText` | `string` |  | 操作按钮文字 |
| `showButton` | `boolean` | `false` | 是否显示操作按钮（需配合 buttonText） |

**事件**：

- `click`

**插槽**：

| 名称 | 说明 |
|------|------|
| `icon` | 自定义图标 / 插图区域 |
| `action` | 自定义操作区，优先于内置按钮 |

**用法**：见 [usage.md](../components/feedback/empty-state/usage.md)

---

## loading 加载中

**说明**：加载中指示器

**别名**：加载、loading、加载动画、转圈

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/feedback/loading/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `loading` | `boolean` | `true` | 是否显示加载态 |
| `text` | `string` |  | 加载文字 |
| `size` | `'small' \| 'medium' \| 'large'` | `medium` | 尺寸 |

**用法**：见 [usage.md](../components/feedback/loading/usage.md)

---

## modal 模态弹窗

**说明**：基于 BasePopup 的居中模态对话框

**别名**：模态框、modal、对话框、确认框、确认弹窗

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/feedback/modal/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | `false` | 显示状态（v-model:show） |
| `title` | `string` |  | 标题 |
| `message` | `string` |  | 内容文本，默认插槽优先级更高 |
| `showCancel` | `boolean` | `true` | 是否显示取消按钮 |
| `showConfirm` | `boolean` | `true` | 是否显示确认按钮 |
| `cancelText` | `string` | `取消` | 取消按钮文字 |
| `confirmText` | `string` | `确定` | 确认按钮文字 |
| `closeOnMask` | `boolean` | `true` | 点击遮罩是否关闭 |
| `danger` | `boolean` | `false` | 危险态：确认按钮使用错误色 |

**事件**：

- `update:show`
- `close`
- `cancel`
- `confirm`

**插槽**：

| 名称 | 说明 |
|------|------|
| `default` | 内容区域，未传时显示 message |

**用法**：见 [usage.md](../components/feedback/modal/usage.md)

---

## toast 轻提示

**说明**：短暂显示后自动消失的轻提示

**别名**：提示、toast、轻提示、操作反馈

**路径**：`vibeCoding/frontend/uniapp/uniapp-base-skill/components/feedback/toast/`

**属性**：

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | `false` | 是否显示 |
| `text` | `string` |  | 提示文案 |
| `type` | `'text' \| 'success' \| 'error' \| 'warning' \| 'loading'` | `text` | 提示类型 |
| `duration` | `number` | `2000` | 自动关闭时长(ms)，0 表示不自动关闭 |

**事件**：

- `close`

**用法**：见 [usage.md](../components/feedback/toast/usage.md)
