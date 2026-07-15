# 线条指令详解

## 指令列表

### solid-line

**触发关键词**：线、分割线、横线、实线、普通线

**样式**：
- 宽度：100%
- 高度：1px
- 背景色：var(--line-color)

**使用示例**：

```vue
<view class="solid-line"></view>
```

---

### dashed-line

**触发关键词**：虚线、点线、dashed

**样式**：
- 宽度：100%
- 高度：0
- 边框：1px dashed var(--line-color)

---

### gradient-line

**触发关键词**：渐变线、彩线

**样式**：
- 宽度：100%
- 高度：2px
- 背景：linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 50%, var(--primary) 100%)

---

### space-line

**触发关键词**：间隔线、带间距的线

**样式**：
- 同 solid-line
- 上边距：16px
- 下边距：16px

**变体**：
- `space-line--small`：上下间距 8px
- `space-line--large`：上下间距 24px

---

### v-solid-line

**触发关键词**：竖线、垂直线

**样式**：
- 宽度：1px
- 高度：100%
- 背景色：var(--line-color)

---

## 使用场景

### 列表分割

```vue
<view class="list-item">项目1</view>
<view class="solid-line"></view>
<view class="list-item">项目2</view>
<view class="solid-line"></view>
<view class="list-item">项目3</view>
```

### 区块间隔

```vue
<view class="section">
  <text>第一部分</text>
</view>
<view class="space-line"></view>
<view class="section">
  <text>第二部分</text>
</view>
```

### 装饰线

```vue
<view class="gradient-line"></view>
```
