# chat-bubble 使用示例

> 纯展示件，头像统一由根容器 `BaseAvatar` 渲染（图片失败自动回退文字头像）。

## 接收消息（左侧）

```vue
<template>
<chat-bubble
  position="left"
  message="你好，有什么可以帮助你的？"
  avatar="/static/avatar.png"
  name="客服"
  time="10:30"
/>
</template>


```

## 发送消息（右侧）

```vue
<template>
<chat-bubble
  position="right"
  message="我想咨询一下..."
  avatar="/static/my-avatar.png"
  time="10:31"
/>
</template>


```

## 群聊（显示用户名）

```vue
<template>
<chat-bubble
  position="left"
  message="今天天气不错"
  :show-name="true"
  name="用户A"
  time="12:00"
/>
</template>


```

## 图片消息

```vue
<template>
<chat-bubble
  position="right"
  type="image"
  message="/static/photo.jpg"
  time="12:05"
/>
</template>


```

## 说明

- `position="right"` 时气泡靠右、背景为主题主色，文字为反色。
- `type="image"` 时 `message` 传图片地址，加载失败显示「图片加载失败」占位。
- `show-avatar` 为假可隐藏头像。
