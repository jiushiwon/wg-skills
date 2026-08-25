# 图形指令详解

## 指令列表

### semi-circle

**触发关键词**：半圆、半弧、圆弧

**样式**：
- 默认：朝上的半圆
- 宽度：100px
- 高度：50px
- 圆角：50px 50px 0 0
- 背景：var(--primary)

**方向变体**：
- `semi-circle--down`：朝下
- `semi-circle--left`：朝左
- `semi-circle--right`：朝右

**使用示例**：

```vue
<!-- 默认朝上 -->
<view class="semi-circle"></view>

<!-- 朝下 -->
<view class="semi-circle semi-circle--down"></view>

<!-- 朝左 -->
<view class="semi-circle semi-circle--left"></view>

<!-- 朝右 -->
<view class="semi-circle semi-circle--right"></view>
```

---

### circle

**触发关键词**：圆形、圆

**样式**：
- 圆形，尺寸可控

**尺寸变体**：
- `circle--small`：24x24px
- `circle--medium`：40x40px（默认）
- `circle--large`：64x64px

**使用示例**：

```vue
<view class="circle circle--small"></view>
<view class="circle circle--medium"></view>
<view class="circle circle--large"></view>
```

---

### dot

**触发关键词**：点、圆点、小圆点

**样式**：
- 小圆点

**尺寸变体**：
- `dot--small`：4px
- `dot--medium`：8px（默认）
- `dot--large`：12px

**使用场景**：列表前缀、加载指示

```vue
<view class="dot dot--small"></view>
<view class="dot dot--medium"></view>
<view class="dot dot--large"></view>
```
