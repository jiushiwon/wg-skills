# 扫描检测规则

## 1. rpx 归一化

### 触发条件

检测项目是否为 uniapp：
- 存在 `pages.json`
- 存在 `manifest.json`
- 任意 `.vue` / `.scss` / `.css` 文件包含 `rpx` 单位

### 归一化规则

```
750rpx = 设计稿宽度（375pt）

换算表：
rpx    px(近似)    建议token档位
 4rpx   2px        --space-1
 8rpx   4px        --space-2
16rpx   8px        --space-3
24rpx  12px        --space-4
32rpx  16px        --space-5
48rpx  24px        --space-6
64rpx  32px        --space-7
```

### 4pt 网格检查（仅限 px 项目）

```javascript
// px 项目：检查 %4
const onGrid = px => px % 4 === 0;

// rpx 项目：不适用 4pt，检查是否在 rpx 档位上
const rpxOnGrid = v => [4, 8, 16, 24, 32, 48, 64, 96].includes(parseInt(v));
```

## 2. 组件语义归类

### 识别线索（优先级从高到低）

1. **easycom 组件名**：`ui-button`, `ui-input`, `ui-tab`, `ui-tag`
2. **选择器名**：
   - 按钮：`.btn`, `.button`, `.ui-btn`, `.btn-primary`
   - Tab：`.tab`, `.tab-item`, `.tabs`, `.nav-tab`
   - 输入框：`.input`, `.field`, `.ui-input`, `.text-input`
   - 标签：`.tag`, `.badge`, `.label`, `.ui-tag`
   - 列表项：`.cell`, `.list-item`, `.item`, `.row`
   - 卡片：`.card`, `.panel`, `.card-item`
3. **模板标签**：`<button>`, `<input>`, `<view class="tab">`

### 关键视觉属性（必比）

| 组件 | 比较属性 |
|------|----------|
| 按钮 | height, font-size, padding, border-radius, background, color |
| Tab | height, font-size, padding, border-radius |
| 输入框 | height, font-size, padding, border-radius |
| 标签 | height, font-size, padding, border-radius |
| 列表项 | height, padding, border-radius |
| 卡片 | padding, border-radius, shadow |

### 置信度标注

| 置信度 | 条件 |
|--------|------|
| **高** | 选择器完全匹配（如 `.btn`） + 关键属性全 |
| **中** | 选择器部分匹配（如 `.primary-btn`） + 部分属性 |
| **低** | 仅模板标签匹配（如 `<view>` 内的按钮） |

**低置信度项不自动修改**，仅在报告中标注"疑似"，交人工确认。

## 3. 样式声明指纹

### 指纹生成

```javascript
function fingerprint(block) {
  // 1. 提取所有 property:value
  // 2. 按 property 字母排序
  // 3. 拼接为字符串
  // 4. 归一化（去掉空格、大小写统一）
  return normalizedString;
}
```

### 示例

```css
/* Block A */
.card {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
}
/* 指纹: background:#fff border-radius:16rpx padding:32rpx */

.block {
  border-radius: 16rpx;
  padding: 32rpx;
  background: #fff;
}
/* 指纹: background:#fff border-radius:16rpx padding:32rpx */

/* 指纹相同 → 复用候选 */
```

### 相似度阈值

- **相同**：指纹完全一致
- **高相似**（≥90%）：属性集合相同，值在近义范围内（如 `#c45c48` vs `#bd5640`）
- **中相似**（≥70%）：核心属性相同，部分属性差异
- **低相似**（<70%）：不判定为复用

### 归一化规则

```javascript
// 值归一化
function normalizeValue(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/0px/g, '0')
    .replace(/rpx/g, 'rpx')
    .trim();
}
```

## 4. 文件遍历策略

### 忽略目录

```
node_modules, dist, build, .git, .next, unpackage, .nuxt, .svelte-kit, .output, coverage
```

### 扫描文件类型

```
.vue, .tsx, .jsx, .svelte, .html, .css, .scss, .sass, .less
```

### 扫描位置

1. **页面级**：`pages/**/*.vue`（uniapp）、`src/pages/**/*.{vue,tsx}`（Vue/React）
2. **组件级**：`components/**/*.vue`、`src/components/**/*.{vue,tsx}`
3. **全局样式**：`App.vue`、`main.{vue,ts,js}`、全局 `.scss/.css`
4. **静态样式**：`static/css/**/*`、`assets/styles/**/*`

## 5. 硬编码检测模式

### 颜色

```javascript
const COLOR_PATTERNS = [
  /#[0-9a-f]{3,8}\b/gi,    // #hex
  /rgba?\s*\([^)]+\)/gi,    // rgb/rgba
  /hsla?\s*\([^)]+\)/gi,    // hsl/hsla
  /\b(red|blue|green|yellow|black|white|pink|purple|orange|gray|grey)\b/gi  // 命名色
];
```

### 尺寸

```javascript
const SIZE_PATTERNS = [
  /\b(\d+)rpx\b/gi,         // rpx
  /\b(\d+)px\b/gi,          // px
  /\b(\d+)rem\b/gi,         // rem
  /\b(\d+)em\b/gi           // em
];
```

### 变量化建议

| 类型 | 检测到 | 建议变量 |
|------|--------|----------|
| 主色 | `#c45c48` | `--color-primary` |
| 副色 | `#d4a574` | `--color-secondary` |
| 背景 | `#ffffff` | `--color-surface` |
| 文字 | `#1a1a1a` | `--color-on-surface` |
| 间距 | `32rpx` | `--space-5` |
| 圆角 | `16rpx` | `--radius-md` |
| 字号 | `28rpx` | `--text-base` |
