# 主题系统检测与自动对齐

本文件定义 `uniapp-page-components-skill` 接入目标项目时，如何**自动检测项目的主题系统**并把组件样式对齐到项目的颜色 / 尺寸 / 圆角。

## 1. 检测清单（按顺序执行）

### 1.1 定位变量定义文件

扫描这些常见位置（任意命中即记录路径）：

| 位置 | 说明 |
|------|------|
| `App.vue` 的 `<style>` | 全局样式入口（最常见） |
| `src/styles/`、`src/theme/`、`src/assets/styles/` | 主题/样式目录 |
| `static/css/` | 全局静态样式 |
| `src/uni.scss` / `uni.scss` | uniapp 全局 SCSS 变量注入点 |
| `pages.json` | tabBar 的 color/selectedColor（可作品牌色线索） |

### 1.2 识别命名风格

用 grep 在以上文件里搜索，判断项目用的是哪种变量体系：

```bash
rg -n -- "--color-primary|--primary-[0-9]|--brand-" App.vue src/styles static/css
rg -n -- "\$color-primary|\$primary" src/uni.scss src/styles
rg -n -- "@color-primary|@primary" src/styles
```

| 命中 | 命名风格 | 说明 |
|------|----------|------|
| `--color-primary` / `--primary-500` / `--brand-*` | CSS 变量 | 运行时换肤，最理想 |
| `$color-primary` / `$primary` | SCSS 变量 | 编译期注入 |
| `@primary` | LESS 变量 | 编译期注入 |

### 1.3 读取关键值

- **主色**：`primary` / `brand` 相关变量的值（hex）
- **语义色**：是否有 `--color-*` / `$color-*` 语义体系（bg/text/border）
- **尺寸单位**：变量值里是 `rpx` / `px` / `rem`（决定后续替换单位）
- **圆角/间距**：是否有 `radius` / `spacing` / `space` 阶梯
- **换肤机制**：是否有 `data-theme` / `.theme-*` / 媒体查询深色模式（说明主题可动态切换）

### 1.4 记录检测结果（输出给用户确认）

```
目标项目主题系统检测结果：
├─ 变量文件：src/styles/theme.css
├─ 命名风格：CSS 变量（--primary-500 / --color-*）
├─ 主色值：  #2E6BE6（--primary-500）
├─ 语义色：  有（--color-primary/bg-surface/text-primary...）
├─ 尺寸：    rpx
├─ 圆角/间距：有（--radius-* / --spacing-*）
└─ 换肤：    data-theme 深色模式
```

## 2. 三种场景的自动对齐策略

### 场景 A：命名风格一致（直接用）

项目变量名与组件使用的语义变量（`--color-primary` / `--spacing-md` / `--radius-card` 等）**一致** → 组件原样复制，零改动。

### 场景 B：命名风格不同（生成桥接层，不改组件）

项目用的是别的命名（`--primary-500`、`$primary`、`@brand`）→ **不要改组件内部**，在项目全局加一个"桥接"文件，把项目变量映射到组件语义变量：

```css
/* src/styles/bridge.css（追加到全局引入，或 App.vue 里） */
:root {
  /* 主色：从项目变量映射 */
  --color-primary: var(--primary-500);      /* 或 $primary 编译进来的值 */
  /* 背景 / 文字语义色 */
  --color-bg-page: var(--bg-page, #F5F6F8);
  --color-bg-surface: #FFFFFF;
  /* color-mix() 需较新内核（微信 XWeb/Chrome 111+/现代 Safari），低版本不可用时改成预计算浅色（如 #EAF0FD） */
  --color-bg-tinted: color-mix(in srgb, var(--primary-500, var(--color-primary, #2563EB)) 8%, #fff);
  --color-text-primary: var(--text-primary, #171717);
  --color-text-secondary: var(--text-secondary, #737373);
  --color-text-tertiary: var(--text-tertiary, #A3A3A3);
  --color-border: #E5E7EB;
  --color-border-light: #F0F0F0;
  --color-error: #EF4444;
  --white: #FFFFFF;
  /* 尺寸：项目有间距/圆角体系则映射，无则用标准阶梯 */
  --spacing-xs: 8rpx;  --spacing-sm: 16rpx;  --spacing-md: 24rpx;
  --spacing-lg: 32rpx; --spacing-xl: 48rpx;  --spacing-2xl: 64rpx; --spacing-3xl: 96rpx;
  --font-xs: 22rpx;  --font-sm: 24rpx;  --font-md: 28rpx;
  --font-lg: 32rpx;  --font-xl: 36rpx;  --font-2xl: 44rpx;
  --height-btn-sm: 56rpx; --height-btn-md: 72rpx; --height-btn-lg: 88rpx; --height-btn-xl: 96rpx;
  --height-avatar-sm: 64rpx; --height-avatar-md: 96rpx; --height-avatar-lg: 128rpx;
  --icon-xs: 24rpx; --icon-sm: 32rpx; --icon-md: 40rpx; --icon-lg: 48rpx;
  --radius-btn: 16rpx; --radius-tag: 8rpx; --radius-card: 16rpx;
  --radius-sm: 8rpx; --radius-lg: 24rpx; --radius-full: 9999rpx;
  --radius-avatar: 9999rpx; --radius-image: 8rpx;
  /* 状态栏（小程序端定义，来自 uni.getSystemInfoSync().statusBarHeight） */
  --status-bar-height: 0;
}
```

> 若项目是 SCSS/LESS 变量：桥接文件仍写成 CSS 变量（放 `App.vue` 的 `<style>` 或全局样式，`:root` 下），但值直接写项目变量的**具体值**（如 `--color-primary: #2E6BE6;` 取自 `$primary`）。单一来源仍是项目变量，桥接文件只映射一次；项目变量后续改值，手动同步桥接取值即可。

### 场景 C：无主题系统（自动提取品牌色生成变量组）

1. **提取品牌色**：扫描项目源码中**出现频率最高**的 hex 颜色作为 `--color-primary` 候选：

```bash
rg -o "#[0-9a-fA-F]{6}" src --no-filename | sort | uniq -c | sort -rn | head -10
```

取第一名（通常是品牌主色）与用户确认；取失败时默认 `#2563EB`。
2. **生成变量组**：按 `theme-integration.md` §2 的 fallback 表，把 `--color-primary` 换成提取的品牌色，其余用标准值。变量组定义在 `App.vue` 的 `<style>`（`:root { ... }`）或项目全局样式文件里——**组件原样复制不替换**（组件引用 `var(--color-primary)` 等，运行时自动取到品牌色）。
3. **推荐**：优先建议用户先跑 `uniapp-theme-skill` 初始化正式主题系统（含换肤/深色模式），组件复制进去即自动对齐；用户嫌重则用提取色硬编码。

## 3. 尺寸自动调整规则

| 检测结果 | 处理 |
|----------|------|
| 项目整体用 `px`（非 rpx） | 把组件样式里的 `rpx` 值按 `1rpx ≈ 0.5px @375px` 换算，或保持 rpx（uni 编译端自动换算，推荐保持 rpx） |
| 项目有自定义间距阶梯（如 `--spacing-base: 20rpx`） | 在桥接文件里映射，不改组件 |
| 项目 `font-size` 基准不同 | 仅映射 `--font-*` 语义层，组件内部不动 |

> 组件默认全用 `rpx` + 语义变量，绝大多数情况无需改组件，只需桥接或保持。

## 4. 自动调整执行清单（完成度核对）

- [ ] 定位到变量定义文件，确认命名风格（CSS/SCSS/LESS）
- [ ] 读取主色值与语义色体系
- [ ] 确认尺寸单位与间距/圆角体系
- [ ] 场景 A：组件原样复制
- [ ] 场景 B：生成桥接文件（不改组件）
- [ ] 场景 C：提取品牌色 → 生成变量组 / 或初始化 theme-skill
- [ ] 深色模式：若项目有 `data-theme`，验证组件颜色随变量切换
- [ ] 编译验证：页面颜色、间距、圆角与项目其他页面一致
