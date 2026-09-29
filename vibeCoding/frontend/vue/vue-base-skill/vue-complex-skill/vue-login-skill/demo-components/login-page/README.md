# Login Page Demo

纯 HTML/CSS/JS 实现的登录页组件 Demo，可直接在浏览器中打开查看效果。

## Demo 列表

| 文件 | 说明 |
|------|------|
| `00-showcase.html` | 全部形态展示（综合） |
| `01-frosted.html` | 毛玻璃登录 |
| `02-particles.html` | 粒子背景登录 |
| `03-flip.html` | 3D 翻转登录 |
| `04-split.html` | 分屏登录 |
| `05-dark.html` | 暗黑科技风格 |
| `06-gradient.html` | 渐变动画背景 |

## 使用方式

直接在浏览器中打开 HTML 文件即可：

```bash
# Windows
start demo-components/login-page/html/00-showcase.html

# macOS
open demo-components/login-page/html/00-showcase.html

# Linux
xdg-open demo-components/login-page/html/00-showcase.html
```

## 核心特性演示

### 1. 毛玻璃登录
- 背景模糊效果（backdrop-filter）
- 半透明登录卡片
- 渐变背景 + 旋转装饰

### 2. 粒子背景
- Canvas 粒子连线动画
- 鼠标交互效果
- 响应式适配

### 3. 3D 翻转
- CSS 3D 变换
- 登录/注册卡片翻转切换
- 平滑过渡动画

### 4. 分屏登录
- 左图右表单布局
- 品牌展示区
- 浮动装饰动画

### 5. 暗黑风格
- 深色背景 + 网格
- 霓虹光效（glow）
- 科技感 Logo

### 6. 渐变动画
- 流动渐变背景
- 多色彩圆圈动画
- 毛玻璃卡片

## 文件结构

```
login-page/
└── html/
    ├── 00-showcase.html    # 综合展示
    ├── 01-frosted.html     # 毛玻璃
    ├── 02-particles.html   # 粒子背景
    ├── 03-flip.html        # 3D 翻转
    ├── 04-split.html       # 分屏
    ├── 05-dark.html        # 暗黑风格
    └── 06-gradient.html    # 渐变动画
```

## 样式依赖

- `../../shared/tokens.css` — 设计 Token
- `../../shared/demo.css` — Demo 基础样式
- `../../shared/particles.js` — 粒子动画

## 技术特性

- ✅ 纯 CSS3 动画，无第三方依赖
- ✅ Canvas 粒子动画
- ✅ backdrop-filter 毛玻璃
- ✅ CSS 3D 变换
- ✅ 响应式设计

## Vue3 组件实现

完整的 Vue3 组件实现见 [SKILL.md](../../SKILL.md)。
