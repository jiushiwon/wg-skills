# 卡片指令详解

## 指令列表

### card-basic

**触发关键词**：卡片、card、panel

**样式**：
- 背景：var(--bg-primary, #fff)
- 圆角：var(--radius-md, 10px)
- 内边距：16px
- 阴影：0 1px 3px rgba(0, 0, 0, 0.08)

**使用示例**：

```vue
<view class="card-basic">
  <text>卡片内容</text>
</view>
```

---

### card-elevated

**触发关键词**：高卡片、高海拔卡片

**样式**：
- 背景：var(--bg-primary, #fff)
- 圆角：var(--radius-md, 10px)
- 内边距：16px
- 阴影：0 4px 12px rgba(0, 0, 0, 0.1)

**使用示例**：

```vue
<view class="card-elevated">
  <text>突出的卡片内容</text>
</view>
```

---

### card-glass

**触发关键词**：玻璃卡片、玻璃拟态

**样式**：
- 背景：rgba(255, 255, 255, 0.7)
- 圆角：var(--radius-md, 10px)
- 内边距：16px
- 边框：1px solid rgba(255, 255, 255, 0.3)
- 背景模糊：backdrop-filter: blur(10px)

**使用示例**：

```vue
<view class="card-glass">
  <text>玻璃拟态卡片</text>
</view>
```

---

## 使用场景

### 信息分组

```vue
<view class="card-basic">
  <text class="title">订单信息</text>
  <view class="solid-line"></view>
  <text>订单号：20240715001</text>
</view>
```

### 突出强调

```vue
<view class="card-elevated">
  <text>重要通知</text>
</view>
```

### 玻璃拟态背景

```vue
<view class="card-glass">
  <text>浮层卡片</text>
</view>
```
