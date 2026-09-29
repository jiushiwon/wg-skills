# Drawer 抽屉

从屏幕左侧或右侧滑入的抽屉面板，带遮罩层，点击遮罩或关闭按钮均可关闭。

## 使用方式

```tsx
import { useState } from 'react'
import Drawer from './drawer'

export default function Demo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>打开抽屉</button>
      <Drawer
        open={open}
        placement="right"
        title="设置"
        width={420}
        onClose={() => setOpen(false)}
      >
        <p>这里是抽屉内容区域。</p>
      </Drawer>
    </>
  )
}
```

## 左侧抽屉

```tsx
<Drawer
  open={open}
  placement="left"
  title="菜单"
  width={280}
  onClose={() => setOpen(false)}
>
  <nav>...</nav>
</Drawer>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 是否显示 |
| placement | `'left' \| 'right'` | `'right'` | 滑出方向 |
| title | `string` | - | 标题 |
| width | `number \| string` | `400` | 抽屉宽度（数字为像素，字符串可传 `'50%'`） |
| onClose | `() => void` | - | 关闭回调 |
| children | `React.ReactNode` | - | 内容区 |

## 说明

- `open` 为 `false` 时组件不渲染，不占用 DOM。
- 打开时使用 CSS 动画从屏幕外侧滑入。
- 无第三方依赖。
