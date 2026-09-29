# 组合指令详解

## 指令列表

### icon-tag

**触发关键词**：图标标签、icon+文字、图标+文字、带图标的标签

**样式**：
- 显示：inline-flex
- 对齐：center
- 间距：4px
- 内边距：4px 8px
- 背景：var(--bg-secondary)
- 字号：14px

**变体**：
- `icon-tag--primary`：主色背景
- `icon-tag--success`：成功色
- `icon-tag--warning`：警告色
- `icon-tag--error`：错误色

**使用示例**：

```vue
<!-- 基础 -->
<view class="icon-tag">
  <text class="iconfont icon-fire"></text>
  <text>热门</text>
</view>

<!-- 主色 -->
<view class="icon-tag icon-tag--primary">
  <text class="iconfont icon-star"></text>
  <text>精选</text>
</view>

<!-- 成功色 -->
<view class="icon-tag icon-tag--success">
  <text class="iconfont icon-check"></text>
  <text>已完成</text>
</view>

<!-- 警告色 -->
<view class="icon-tag icon-tag--warning">
  <text class="iconfont icon-warning"></text>
  <text>注意</text>
</view>

<!-- 错误色 -->
<view class="icon-tag icon-tag--error">
  <text class="iconfont icon-error"></text>
  <text>失败</text>
</view>
```

---

### badge

**触发关键词**：徽章、角标、小红点、badge

**样式**：
- 最小宽度：18px
- 高度：18px
- 内边距：0 5px
- 背景：var(--error)
- 文字色：var(--text-inverse)
- 字号：10px
- 圆角：9999px（圆形）

**尺寸变体**：
- `badge--small`：14x14px，字号8px
- `badge--large`：22x22px，字号12px

**使用示例**：

```vue
<!-- 带数字的徽章 -->
<view class="badge">3</view>

<!-- 小号徽章 -->
<view class="badge badge--small">1</view>

<!-- 大号徽章 -->
<view class="badge badge--large">99+</view>

<!-- 配合其他组件使用 -->
<view class="relative">
  <text>消息</text>
  <view class="badge">5</view>
</view>
```

---

### icon-btn

**触发关键词**：图标按钮、带图标的按钮

**样式**：同 btn-icon，但支持内部放图标组件

**使用示例**：

```vue
<!-- uniapp -->
<button class="icon-btn">
  <text class="iconfont icon-search"></text>
</button>

<!-- 或者带文字 -->
<view class="icon-btn">
  <text class="iconfont icon-search"></text>
  <text>搜索</text>
</view>
```

---

## 常用组合示例

### 列表项标签

```vue
<view class="list-item">
  <text class="title">项目名称</text>
  <view class="icon-tag icon-tag--success">
    <text class="iconfont icon-check"></text>
    <text>已完成</text>
  </view>
</view>
```

### 消息提示

```vue
<view class="message">
  <view class="icon-tag icon-tag--primary">
    <text class="iconfont icon-info"></text>
    <text>提示信息</text>
  </view>
</view>
```
