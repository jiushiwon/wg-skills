# Modal 弹窗

居中对话框，带遮罩层，默认底部有确认/取消按钮，也可自定义 footer。

## 使用方式

```tsx
import { useState } from 'react'
import Modal from './modal'

export default function Demo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>打开弹窗</button>
      <Modal
        open={open}
        title="提示"
        onOk={() => { console.log('确认'); setOpen(false) }}
        onCancel={() => setOpen(false)}
      >
        <p>确定要执行该操作吗？</p>
      </Modal>
    </>
  )
}
```

## 自定义 Footer

```tsx
<Modal
  open={open}
  title="确认删除"
  onCancel={() => setOpen(false)}
  footer={
    <button className="danger-btn" onClick={() => handleDelete()}>
      确认删除
    </button>
  }
>
  <p>删除后无法恢复，请确认。</p>
</Modal>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 是否显示 |
| title | `string` | - | 标题 |
| children | `React.ReactNode` | - | 内容区 |
| footer | `React.ReactNode` | - | 自定义底部，传入后替换默认按钮 |
| onOk | `() => void` | - | 点击确认回调 |
| onCancel | `() => void` | - | 点击取消/关闭/遮罩回调 |
| okText | `string` | `'确认'` | 确认按钮文字 |
| cancelText | `string` | `'取消'` | 取消按钮文字 |

## 说明

- 点击遮罩层会触发 `onCancel`。
- 右上角关闭按钮触发 `onCancel`。
- 默认 footer 的两个按钮文本支持中文溢出保护。
- 无第三方依赖。
