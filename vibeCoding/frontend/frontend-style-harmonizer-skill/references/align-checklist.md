# 对齐维度检查清单

## 同类组件识别

### 按钮 Button

| 属性 | 必比 | 说明 |
|------|------|------|
| `height` | ✅ | 按钮高度（56/64/72/80rpx） |
| `font-size` | ✅ | 字号（24/26/28/32rpx） |
| `padding` | ✅ | 左右内边距 |
| `border-radius` | ✅ | 圆角（8/12/16/24rpx） |
| `background` | ✅ | 背景色 |
| `color` | ✅ | 文字色 |

**收敛目标示例**：
```scss
// 按钮 size 阶梯
$btn-height-sm: 56rpx;
$btn-height-md: 72rpx;
$btn-height-lg: 88rpx;

$btn-font-sm: 24rpx;
$btn-font-md: 28rpx;
$btn-font-lg: 32rpx;

$btn-radius-sm: 8rpx;
$btn-radius-md: 16rpx;
$btn-radius-lg: 24rpx;
```

### Tab 标签

| 属性 | 必比 | 说明 |
|------|------|------|
| `height` | ✅ | tab 整体高度（固定容器！） |
| `font-size` | ✅ | 标签文字大小 |
| `padding` | ✅ | 左右内边距 |
| `line-height` | ✅ | 行高（垂直居中关键） |
| `border-radius` | ✅ | 选中态圆角 |
| `color` | ✅ | 文字颜色 |
| `border-bottom` | ✅ | 底部边框（选中态） |

**收敛目标示例**（头部 tab 必读）：
```scss
// Tab 阶梯（头部固定高度 tab 必须统一！）
$tab-height-sm: 72rpx;
$tab-height-md: 88rpx;
$tab-height-lg: 104rpx;

$tab-font-sm: 24rpx;
$tab-font-md: 28rpx;
```

### 输入框 Input / Field

| 属性 | 必比 | 说明 |
|------|------|------|
| `height` | ✅ | 输入框高度（64/72/80rpx） |
| `font-size` | ✅ | 字号 |
| `padding` | ✅ | 内边距 |
| `border-radius` | ✅ | 圆角 |
| `border` | ✅ | 边框 |
| `background` | ✅ | 背景色 |

### 标签 Tag / Badge

| 属性 | 必比 | 说明 |
|------|------|------|
| `height` | ✅ | 标签高度（auto 或固定） |
| `font-size` | ✅ | 字号（20/22/24/26rpx） |
| `padding` | ✅ | 左右内边距 |
| `border-radius` | ✅ | 圆角（pill vs square） |
| `color` | ✅ | 文字色 |
| `background` | ✅ | 背景色 |

### 列表项 Cell / List Item

| 属性 | 必比 | 说明 |
|------|------|------|
| `height` | ✅ | 行高（88/96/104rpx） |
| `padding` | ✅ | 左右内边距 |
| `border-radius` | ✅ | 圆角 |
| `font-size` | ✅ | 文字大小 |
| `color` | ✅ | 文字颜色 |

### 卡片 Card / Panel

| 属性 | 必比 | 说明 |
|------|------|------|
| `padding` | ✅ | 内边距（32/40/48rpx） |
| `border-radius` | ✅ | 圆角 |
| `shadow` | ✅ | 阴影 |
| `background` | ✅ | 背景色 |

---

## 散度判定

### 风险等级

| 散度 | 定义 | 风险 |
|------|------|------|
| **无** | 所有页面同一规格 | 低 |
| **低** | 2 种规格，差异 ≤10% | 低 |
| **中** | 3 种规格，或差异 10-20% | 中 |
| **高** | >3 种规格，或差异 >20% | 高 |

### 收敛决策

| 风险 | 动作 |
|------|------|
| 低 | 自动收敛到众数规格 |
| 中 | 报告列出，供人工确认 |
| 高 | 报告详列，强制人工确认 |

---

## 固定高度容器（重点）

**头部 tab / 导航栏**等固定高度容器，**跨页面必须完全一致**，否则切换时会产生明显跳变。

### 检测规则

```javascript
// 检测固定高度容器的跨页面不一致
const FIXED_CONTAINERS = [
  '.header', '.top-bar', '.nav-bar',
  '.tab-bar', '.tabs', '.tab-nav',
  '.toolbar', '.action-bar'
];

// 规则：同选择器在不同页面的 height 必须完全相同
```

### 报告格式

```markdown
### 固定高度容器 - 风险项

| 容器 | 页面 | 检测到的高度 | 风险 |
|------|------|--------------|------|
| .tab-bar | pages/index/index.vue | 88rpx | ⚠️ |
| .tab-bar | pages/category/category.vue | 96rpx | ⚠️ 高 |
| .tab-bar | pages/user/user.vue | 80rpx | ⚠️ 高 |

**建议**：统一为 88rpx，写入 `--tab-height: 88rpx`
```

---

## 常见不对齐模式

### 1. 按钮

```
page-a: 64rpx 高, 24rpx 字号
page-b: 72rpx 高, 28rpx 字号
→ 收敛到 72rpx / 28rpx（md 档）
```

### 2. Tab

```
page-a: 80rpx 高
page-b: 88rpx 高
page-c: 96rpx 高
→ 收敛到 88rpx（最常见）
```

### 3. 输入框

```
page-a: 64rpx 高
page-b: 72rpx 高
→ 收敛到 72rpx（容纳双行文字）
```

### 4. 标签

```
page-a: 32rpx 高, 20rpx 字号
page-b: 40rpx 高, 24rpx 字号
→ 收敛到 36rpx / 22rpx
```

---

## 验证清单

收敛后必验：

- [ ] 对比度 ≥ 4.5:1（文字色 vs 背景色）
- [ ] 触摸目标 ≥ 44pt（88rpx）
- [ ] 字号 ≥ 16px（32rpx）避免 iOS 缩放
- [ ] 固定容器高度跨页面完全一致
