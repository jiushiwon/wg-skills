# Button 按钮

PC React 按钮模板，支持主/次/幽灵/危险/链接五种变体，三种尺寸，加载与禁用状态。

## 使用方式

```tsx
import Button from './button'

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="danger">危险按钮</Button>
      <Button variant="link">链接按钮</Button>

      <Button size="sm">小按钮</Button>
      <Button size="md">中按钮</Button>
      <Button size="lg">大按钮</Button>

      <Button disabled>禁用</Button>
      <Button loading>加载中</Button>
      <Button block>块状按钮</Button>
    </div>
  )
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'link'` | `'primary'` | 按钮风格 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| disabled | `boolean` | `false` | 是否禁用 |
| loading | `boolean` | `false` | 是否加载中（自动禁用点击） |
| block | `boolean` | `false` | 是否撑满父容器宽度 |
| children | `React.ReactNode` | - | 按钮文字或内容 |
| onClick | `(event: React.MouseEvent) => void` | - | 点击回调 |
| type | `'button' \| 'submit' \| 'reset'` | `'button'` | 按钮类型 |
| className | `string` | `''` | 额外类名 |
| style | `React.CSSProperties` | - | 额外样式 |

## 说明

- 按钮内文字使用 `white-space: nowrap` + `overflow: hidden` + `text-overflow: ellipsis`，中文长文本会自动截断并显示省略号。
- 加载状态会在按钮内显示一个小型旋转图标，且按钮自动变为不可点击。
- 文件依赖：`button.tsx`、`button.css`，无第三方包。
