# chat-bubble 使用示例

## 接收消息（左侧）

```vue
<chat-bubble
  position="left"
  message="你好，有什么可以帮助你的？"
  avatar="/static/avatar.png"
  name="客服"
  time="10:30"
/>
```

## 发送消息（右侧）

```vue
<chat-bubble
  position="right"
  message="我想咨询一下..."
  avatar="/static/my-avatar.png"
  time="10:31"
/>
```

## 群聊（显示用户名）

```vue
<chat-bubble
  position="left"
  message="今天天气不错"
  :show-name="true"
  name="用户A"
  time="12:00"
/>
```
