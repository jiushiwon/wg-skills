# Base Card

卡片容器组件，提供通用的卡片布局。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 卡片标题 |
| shadow | boolean | false | 是否显示阴影 |

## Usage

```html
<base-card title="用户信息">
  <div>卡片内容</div>
</base-card>
```

## Slots

| 名称 | 说明 |
|------|------|
| default | 默认内容区域 |
| header | 自定义头部 |
