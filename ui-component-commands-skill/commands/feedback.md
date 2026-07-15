# 反馈类组件

## toast 轻提示

**说明**：轻量级提示

**别名**：提示、轻反馈

**用法**（全局方法）：
```js
// 基本提示
this.$toast('操作成功')

// 成功
this.$toast.success('保存成功')

// 失败
this.$toast.error('操作失败')

// 加载中
this.$toast.loading('加载中...')
this.$toast.hide()
```

---

## modal 模态框

**说明**：对话框/弹窗

**别名**：弹窗、对话框

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show | boolean | false | 显示状态 |
| title | string | '' | 标题 |
| content | string | '' | 内容 |
| showCancel | boolean | true | 显示取消按钮 |
| confirmText | string | '确定' | 确认文字 |
| cancelText | string | '取消' | 取消文字 |

**事件**：
- confirm：点击确认
- cancel：点击取消

**用法**：
```vue
<modal :show.sync="showModal" title="提示" content="确定要删除吗？" @confirm="onConfirm" />
```

**JS调用**：
```js
this.$modal.confirm({
  title: '提示',
  content: '确定要删除吗？'
}).then(() => {
  // 确定
}).catch(() => {
  // 取消
})
```

---

## action-sheet 操作菜单

**说明**：底部操作菜单

**别名**：操作表、底部菜单

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show | boolean | false | 显示状态 |
| actions | array | [] | 操作项配置 |

**actions配置**：
```js
[
  { name: '拍照', icon: 'camera' },
  { name: '相册', icon: 'photo' },
  { name: '取消', type: 'cancel' }
]
```

**用法**：
```vue
<action-sheet :show.sync="show" :actions="actions" @select="onSelect" />
```

---

## loading 加载态

**说明**：加载指示器

**别名**：loading、加载

**用法**：
```vue
<!-- 页面加载 -->
<loading />

<!-- 带文字 -->
<loading text="加载中..." />

<!-- 骨架屏 -->
<loading type="skeleton" :rows="3" />
```

---

## empty-state 空状态

**说明**：空数据提示

**别名**：空列表、无数据

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| image | string | '' | 图片 |
| description | string | '暂无数据' | 描述文字 |
| button | string | '' | 按钮文字 |

**事件**：
- buttonClick：点击按钮

**用法**：
```vue
<empty-state description="暂无订单" button="去逛逛" @buttonClick="goShopping" />
```
