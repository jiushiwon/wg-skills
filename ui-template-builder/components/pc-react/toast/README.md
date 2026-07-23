# Toast 轻提示

顶部/底部轻提示，支持成功、错误、信息、警告四种类型，自动关闭。

## 基础使用

```tsx
import { useState } from 'react'
import Toast from './toast'

export default function Demo() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <button onClick={() => setVisible(true)}>显示提示</button>
      {visible && (
        <Toast
          message="操作成功"
          type="success"
          position="top-right"
          duration={3000}
          onClose={() => setVisible(false)}
        />
      )}
    </>
  )
}
```

## 配合 useToast Hook 管理多个提示

```tsx
import { useState, useCallback } from 'react'
import Toast from './toast'

type ToastItem = {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  position: 'top-right' | 'top-center' | 'bottom-right'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((
    message: string,
    type: ToastItem['type'] = 'info',
    position: ToastItem['position'] = 'top-right'
  ) => {
    const id = Math.random().toString(36).slice(2)
    const item: ToastItem = { id, message, type, position }
    setToasts((prev) => [...prev, item])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const rendered = (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          position={t.position}
          onClose={() => remove(t.id)}
        />
      ))}
    </>
  )

  return { add, remove, rendered }
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| message | `string` | - | 提示内容 |
| type | `'success' \| 'error' \| 'info' \| 'warning'` | `'info'` | 提示类型 |
| position | `'top-right' \| 'top-center' \| 'bottom-right'` | `'top-right'` | 显示位置 |
| duration | `number` | `3000` | 自动关闭时间（毫秒），`0` 为不关闭 |
| onClose | `() => void` | - | 关闭回调 |

## 说明

- 组件挂载后先执行滑入动画，到达 `duration` 前 200ms 开始淡出。
- 位置通过 CSS 自定义属性实现，避免 `top-center` 居中与入场动画冲突。
- 无第三方依赖。
