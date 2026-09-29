# Design Tokens 架构详解

> 本文件是 `SKILL.md` 的补充深入文档，提供色板生成算法、自动生成脚本、CSS 变量桥接、深色模式完整实现等细节。核心规范查阅 `SKILL.md`。

---

## 1. 数据流架构

```
config/_theme-config.scss        ← 唯一人工配置
         │
         ▼
_functions.scss                  ← 色板生成算法 (tint/shade/color-scale)
         │
         ├──────────┬──────────┐
         ▼          ▼          ▼
 _primitive.scss   字号阶梯    间距阶梯    ← 自动生成的基础 Token
         │
         ▼
_semantic.scss                   ← 语义变量，业务代码唯一引用入口
         │
         ├──────────┐
         ▼          ▼
 _mixins.scss    variables.scss  ← 混入 + 统一出口
         │
         ▼
vite.config.ts (additionalData)  ← 自动注入到所有 .vue 文件
```

---

## 2. 色板生成算法详解

### 2.1 tint() — 生成浅色色阶

```scss
@function tint($color, $weight) {
  @return mix(white, $color, $weight);
}
```

`$weight` 为混入白色的百分比。示例：
- `tint(#1CC8C4, 90%)` → 主色 + 90% 白色 ≈ 非常浅的青色
- `tint(#1CC8C4, 50%)` → 中等浅度

### 2.2 shade() — 生成深色色阶

```scss
@function shade($color, $weight) {
  @return mix(black, $color, $weight);
}
```

示例：
- `shade(#1CC8C4, 10%)` → 主色 + 10% 黑色 ≈ 稍深的青色
- `shade(#1CC8C4, 60%)` → 接近深墨绿

### 2.3 color-scale() — 兼容旧写法的通用函数

```scss
@function color-scale($color, $weight, $mode: 'light') {
  @if $mode == 'dark' {
    @return mix(black, $color, $weight);
  }
  @return mix(white, $color, $weight);
}
```

### 2.4 完整 10 档色板

```scss
// src/styles/tokens/_primitive.scss

// 浅色阶梯 (50-400)
$color-primary-50: tint($theme-primary, 95%);
$color-primary-100: tint($theme-primary, 90%);
$color-primary-200: tint($theme-primary, 70%);
$color-primary-300: tint($theme-primary, 50%);
$color-primary-400: tint($theme-primary, 30%);

// 基准色
$color-primary-500: $theme-primary;

// 深色阶梯 (600-900)
$color-primary-600: shade($theme-primary, 10%);
$color-primary-700: shade($theme-primary, 20%);
$color-primary-800: shade($theme-primary, 40%);
$color-primary-900: shade($theme-primary, 60%);
```

**相同方式为每个功能色生成色板**：
```scss
$color-success-50: tint($theme-success, 90%);
// ... up to 500 → 900
$color-warning-50: tint($theme-warning, 90%);
// ...
$color-error-50: tint($theme-error, 90%);
// ...
```

### 2.5 自定义色阶权重表

不同品牌主色的视觉饱和度不同，可根据实际情况调整色阶权重：

| 色档 | 默认权重 | 适用场景 | 说明 |
|------|----------|----------|------|
| 50 | 95% | 页面背景、卡片背景 | 极浅 |
| 100 | 90% | 标签背景、hover 态 | 浅 |
| 200 | 70% | 选中态背景 | 中浅 |
| 300 | 50% | 边框、分割线 | 中等 |
| 400 | 30% | 次要文字、次要按钮 | 中深 |
| 500 | 0% | 主色 | 基准 |
| 600 | 10% dark | hover 态、链接 | 略深 |
| 700 | 20% dark | active 态 | 深 |
| 800 | 40% dark | 深色背景文字 | 很深 |
| 900 | 60% dark | 强调、特殊标记 | 极深 |

---

## 3. 自动生成脚本

### 3.1 色板生成脚本

```javascript
// scripts/generate-colors.js
const fs = require('fs')
const path = require('path')
const chroma = require('chroma-js')

const configPath = path.resolve(__dirname, '../src/styles/config/_theme-config.scss')
const outputPath = path.resolve(__dirname, '../src/styles/tokens/_primitive.scss')

function parseScssVar(content, varName) {
  const regex = new RegExp(`\\$${varName}:\\s*([^;]+);`)
  const match = content.match(regex)
  return match ? match[1].trim() : null
}

function generate() {
  const content = fs.readFileSync(configPath, 'utf-8')

  const primary = parseScssVar(content, 'theme-primary') || '#1CC8C4'
  const success = parseScssVar(content, 'theme-success') || '#22c55e'
  const warning = parseScssVar(content, 'theme-warning') || '#f59e0b'
  const error = parseScssVar(content, 'theme-error') || '#ef4444'
  const info = parseScssVar(content, 'theme-info') || '#3b82f6'

  const colors = { primary, success, warning, error, info }

  let output = '// 本文件由 scripts/generate-colors.js 自动生成，请勿手动编辑\n\n'

  for (const [name, hex] of Object.entries(colors)) {
    const scale = chroma.scale([chroma(hex).brighten(3), hex, chroma(hex).darken(3)]).colors(10)

    output += `// ${name} 色板\n`
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
    steps.forEach((step, i) => {
      output += `$color-${name}-${step}: ${scale[i]};\n`
    })
    output += '\n'
  }

  fs.writeFileSync(outputPath, output, 'utf-8')
  console.log('✅ Color palette generated')
}

generate()
```

### 3.2 颜色常量导出脚本

```javascript
// scripts/generate-theme-colors.js
const fs = require('fs')
const path = require('path')

const semanticPath = path.resolve(__dirname, '../src/styles/tokens/_semantic.scss')
const outputPath = path.resolve(__dirname, '../src/constants/colors.ts')

function parseScssVars(content) {
  const regex = /\$([\w-]+):\s*([^;]+);/g
  const vars = {}
  let match
  while ((match = regex.exec(content)) !== null) {
    const value = match[2].trim()
    if (value.startsWith('#') || value.startsWith('rgba') || value.startsWith('rgb')) {
      vars[match[1]] = value
    }
  }
  return vars
}

function generate() {
  const content = fs.readFileSync(semanticPath, 'utf-8')
  const vars = parseScssVars(content)

  let output = '// 本文件由 scripts/generate-theme-colors.js 自动生成，请勿手动编辑\n\n'

  for (const [key, value] of Object.entries(vars)) {
    const constName = key
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      .replace(/^color/, 'COLOR')
      .replace(/^radius/, 'RADIUS')
      .replace(/^spacing/, 'SPACING')
    output += `export const ${constName} = '${value}'\n`
  }

  fs.writeFileSync(outputPath, output, 'utf-8')
  console.log('✅ Color constants generated')
}

generate()
```

### 3.3 package.json 脚本配置

```json
{
  "scripts": {
    "generate:colors": "node scripts/generate-colors.js && node scripts/generate-theme-colors.js",
    "prebuild": "npm run generate:colors"
  }
}
```

---

## 4. _primitive.scss 完整结构

```scss
// src/styles/tokens/_primitive.scss
// 本文件由 scripts/generate-colors.js 自动生成

// ========== 色板 ==========
$color-primary-50: #e0faf9;
$color-primary-100: #b3f0ed;
$color-primary-200: #80e6e0;
$color-primary-300: #4ddbd3;
$color-primary-400: #26d0c9;
$color-primary-500: #1CC8C4;
$color-primary-600: #18b0ae;
$color-primary-700: #129693;
$color-primary-800: #0c7c78;
$color-primary-900: #066260;

// ... 功能色同理

// ========== 字号阶梯 ==========
$font-size-xs: $theme-font-size-base * 10;
$font-size-sm: $theme-font-size-base * 12;
$font-size-md: $theme-font-size-base * 14;
$font-size-lg: $theme-font-size-base * 16;
$font-size-xl: $theme-font-size-base * 18;
$font-size-xxl: $theme-font-size-base * 20;
$font-size-xxxl: $theme-font-size-base * 24;

// ========== 间距阶梯 ==========
$spacing-0: 0;
$spacing-1: $theme-spacing-base * 1;
$spacing-2: $theme-spacing-base * 2;
$spacing-3: $theme-spacing-base * 3;
$spacing-4: $theme-spacing-base * 4;
$spacing-5: $theme-spacing-base * 5;
$spacing-6: $theme-spacing-base * 6;
$spacing-8: $theme-spacing-base * 8;
$spacing-10: $theme-spacing-base * 10;
$spacing-12: $theme-spacing-base * 12;
$spacing-16: $theme-spacing-base * 16;
```

---

## 5. variables.scss 统一出口

```scss
// src/styles/variables.scss

// 基础原语
@forward 'config/_theme-config';
@forward 'tokens/_primitive';
@forward 'tokens/_semantic';

// 工具
@forward '_functions';
@forward '_mixins';

// ========== CSS 变量桥接 ==========
// 将 SCSS 变量映射为 CSS 自定义属性，供深色模式和 JS 读取使用
page {
  --color-primary: #{$color-primary};
  --color-primary-50: #{$color-primary-50};
  --color-primary-100: #{$color-primary-100};
  --color-primary-500: #{$color-primary-500};
  --color-primary-600: #{$color-primary-600};
  --color-primary-700: #{$color-primary-700};

  --color-success: #{$color-success};
  --color-warning: #{$color-warning};
  --color-error: #{$color-error};
  --color-info: #{$color-info};

  --color-bg-primary: #{$color-bg-primary};
  --color-bg-secondary: #{$color-bg-secondary};
  --color-bg-tertiary: #{$color-bg-tertiary};
  --color-bg-mask: #{$color-bg-mask};

  --color-text-primary: #{$color-text-primary};
  --color-text-secondary: #{$color-text-secondary};
  --color-text-tertiary: #{$color-text-tertiary};
  --color-text-disabled: #{$color-text-disabled};
  --color-text-placeholder: #{$color-text-placeholder};
  --color-text-inverse: #{$color-text-inverse};
  --color-text-link: #{$color-text-link};

  --color-border: #{$color-border};
  --color-border-light: #{$color-border-light};

  --radius-small: #{$radius-small};
  --radius-medium: #{$radius-medium};
  --radius-large: #{$radius-large};

  --shadow-sm: #{$shadow-sm};
  --shadow-md: #{$shadow-md};
  --shadow-lg: #{$shadow-lg};

  --spacing-1: #{$spacing-1};
  --spacing-2: #{$spacing-2};
  --spacing-4: #{$spacing-4};
  --spacing-6: #{$spacing-6};
  --spacing-8: #{$spacing-8};

  --font-size-xs: #{$font-size-xs};
  --font-size-sm: #{$font-size-sm};
  --font-size-md: #{$font-size-md};
  --font-size-lg: #{$font-size-lg};
  --font-size-xl: #{$font-size-xl};
}
```

---

## 6. SCSS 变量 → CSS 变量桥接：与 uniapp-theme-skill 共存

### 6.1 两层体系对比

| 维度 | SCSS 变量 (本 skill) | CSS 变量 (uniapp-theme-skill) |
|------|---------------------|-------------------------------|
| 注入时机 | 编译时（vite additionalData） | 运行时（`<page>` 属性） |
| 修改方式 | 改 SCSS → 重新编译 | 改 `data-theme` / CSS 属性 → 即时生效 |
| 适用场景 | 静态设计规范、组件默认值 | 用户自定义换肤、实时切换 |
| 性能 | 零运行时开销 | 微小运行时开销（CSS 变量解析） |

### 6.2 共存推荐方案

```scss
// SCSS 变量作为编译时默认值
// CSS 变量作为运行时覆盖层

.btn-primary {
  background: var(--color-primary, $color-primary);
  color: var(--color-text-inverse, $color-text-inverse);
}

// 当 CSS 变量 --color-primary 存在时（theme-skill 注入），使用运行时值
// 当 CSS 变量不存在时，fallback 到 SCSS 编译值
```

### 6.3 小程序中读取 CSS 变量

**⚠ 小程序不支持 `getComputedStyle()`，请使用以下替代方案：**

```typescript
// ❌ 错误：小程序不可用
// const val = getComputedStyle(el).getPropertyValue('--color-primary')

// ✅ 正确：通过 style 属性读取
function getCssVarOnPage(varName: string): Promise<string> {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery()
    query.select('page').fields({ computedStyle: [varName] }, (res) => {
      resolve(res?.[varName] || '')
    }).exec()
  })
}

// 使用
getCssVarOnPage('--color-primary').then((val) => {
  console.log('当前主色:', val)
})
```

也可以使用 uni-app 官方 API：

```typescript
// 在组件 mounted 中
onMounted(() => {
  const instance = getCurrentInstance()
  const query = uni.createSelectorQuery().in(instance)
  query.select('.target').fields({ computedStyle: ['backgroundColor'] }, (res) => {
    console.log(res.backgroundColor)
  }).exec()
})
```

---

## 7. 深色模式完整实现

### 7.1 方案选择

| 方案 | 适配方式 | 优点 | 缺点 |
|------|----------|------|------|
| **A: 媒体查询** | `@media (prefers-color-scheme: dark)` | 跟随系统，零 JS | 不支持手动切换 |
| **B: data-theme** | `[data-theme="dark"]` 属性选择器 | 支持手动/自动切换 | 需要 JS 设置属性 |
| **C: CSS 变量覆盖** | 兼容 A+B | 最灵活 | 配置较多 |

**推荐方案 C**：以 CSS 变量为基础，同时支持跟随系统和手动切换。

### 7.2 实现代码

```scss
// src/styles/theme-dark.scss

// 策略：CSS 变量在 page 上定义，亮色为默认值
page {
  // 亮色默认值已在 variables.scss 中定义
}

// 方式 A：跟随系统
@media (prefers-color-scheme: dark) {
  page {
    --color-bg-primary: #1a1a2e;
    --color-bg-secondary: #16213e;
    --color-bg-tertiary: #0f3460;
    --color-bg-mask: rgba(0, 0, 0, 0.75);

    --color-text-primary: #e4e6eb;
    --color-text-secondary: #b0b3b8;
    --color-text-tertiary: #8a8d93;
    --color-text-disabled: #5a5d63;
    --color-text-placeholder: #5a5d63;
    --color-text-inverse: #1a1a2e;

    --color-border: #2a2a3e;
    --color-border-light: #1f1f32;

    --shadow-sm: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4rpx 12rpx rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.5);
  }
}

// 方式 B：手动切换（与 A 并列）
[data-theme="dark"] page {
  --color-bg-primary: #1a1a2e;
  --color-bg-secondary: #16213e;
  // ... 与上面相同的变量
}
```

```typescript
// src/utils/theme.ts

type Theme = 'light' | 'dark' | 'auto'

export function setTheme(theme: Theme) {
  if (theme === 'auto') {
    uni.removeStorageSync('theme-preference')
    document.documentElement.removeAttribute('data-theme')
  } else {
    uni.setStorageSync('theme-preference', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export function getTheme(): Theme {
  return uni.getStorageSync('theme-preference') || 'auto'
}
```

### 7.3 图片资源深色适配

```vue
<template>
  <image
    :src="isDark ? '/static/images/logo-dark.png' : '/static/images/logo-light.png'"
    mode="aspectFit"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

onMounted(() => {
  uni.getSystemInfo({
    success(res) {
      isDark.value = res.theme === 'dark'
    }
  })
})
</script>
```

### 7.4 深色模式注意事项

- **TabBar 图标**：微信小程序 `app.json` 中可配置 `dark` 和 `light` 两套图标路径
- **navigationBar**：`pages.json` 中 `backgroundColor` 需区分亮/暗
- **canvas 绘制**：需要检测当前主题后手动设置填充色
- **webview 嵌入页**：通过 `?theme=dark` query 参数传递

---

## 8. 小程序平台注意事项

| 注意项 | 说明 |
|--------|------|
| **@use 现代语法** | 新版 Dart Sass 才支持 `@use`，确保 `sass >= 1.32.0` |
| **CSS 变量作用域** | 微信小程序中 CSS 变量必须定义在 `page` 选择器下才能全局生效 |
| **hover-class 限制** | uni-app 小程序不支持 `:hover`、`:active`、`:focus` 伪类，使用 `hover-class` 替代 |
| **safe-area-inset** | 微信小程序 2.7.0+ 才支持 `env()` 格式，低版本需用 `constant()` 双写法 |
| **getComputedStyle** | 小程序不支持，使用 `uni.createSelectorQuery` 的 `computedStyle` 字段 |
| **rpx 精度** | 小程序渲染时 rpx 会转换为整数 px，极端边界值（如 1rpx）可能丢失 |
| **自定义字体** | 小程序不支持 `@font-face` 引入本地字体，需用网络字体或系统字体栈 |
| **动画性能** | `@keyframes` 中避免使用 `width`、`height`、`left`、`top` 等触发重排的属性 |

---

## 9. 从硬编码迁移到 Token 系统

### 9.1 迁移检查清单

1. **颜色硬编码**：搜索 `#` 开头的十六进制颜色值，替换为 `$color-*` 变量
2. **字号硬编码**：搜索 `font-size:` 后的 rpx 值，替换为 `$font-size-*` 变量
3. **间距硬编码**：搜索 `padding:` / `margin:` 后的 rpx 值，替换为 `$spacing-*` 变量
4. **圆角硬编码**：搜索 `border-radius:` 后的 rpx 值，替换为 `$radius-*` 变量
5. **z-index 硬编码**：搜索 `z-index:` 后的数字，替换为 `$z-*` 变量
6. **shadow 硬编码**：搜索 `box-shadow:` 后的值，替换为 `$shadow-*` 变量
7. **transition 硬编码**：搜索 `transition:` 后的时间，替换为 `$transition-duration-*`

### 9.2 全局查找正则

```bash
# 颜色硬编码
rg ":\s*#[0-9a-fA-F]{3,8}" --glob "*.scss" --glob "*.vue"

# 字号硬编码
rg "font-size:\s*\d+rpx" --glob "*.scss" --glob "*.vue"

# z-index 硬编码
rg "z-index:\s*\d+" --glob "*.scss" --glob "*.vue"
```

---

## 10. 性能优化建议

1. **减少 `@include` 嵌套**：混入内部避免嵌套其他混入，防止编译产物体积膨胀
2. **慎用 `@extend`**：`@extend` 会改变选择器顺序，影响 gzip 压缩率，优先用 `@mixin`
3. **按需引用色板**：不需要全 10 档色板时只引用使用的档位，减少 CSS 体积
4. **CSS 变量层级**：只在 `page` 定义全局 CSS 变量，组件级 CSS 变量就近定义
5. **避免 SCSS 循环**：`@for` 循环生成的样式规则不应超过 50 条

---

## 11. 兼容性别名

```scss
// src/styles/variables.scss

// 简写别名（用于快速开发，正式环境推荐使用完整变量名）
$primary: $color-primary;
$text-primary: $color-text-primary;
$text-secondary: $color-text-secondary;
$bg-primary: $color-bg-primary;
$bg-secondary: $color-bg-secondary;
$border: $color-border;
$radius: $radius-medium;
$shadow: $shadow-md;
```
