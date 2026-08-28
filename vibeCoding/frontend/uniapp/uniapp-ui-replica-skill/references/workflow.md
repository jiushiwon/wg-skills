# UI 复刻详细流程

本流程是 `ui-replica-skill` 的执行标准。任何看图复刻任务都应按此流程执行。

## 执行模式选择

动手前先判断走快速模式还是完整模式：

| 模式 | 判断条件 |
|---|---|
| **快速模式** | 用户只发了一张图，且没有指定技术栈或要求接入项目 |
| **完整模式** | 用户指定了框架、要求接入项目、或一次性发来多张图 |

**默认走快速模式**：直接输出单文件 HTML，结构说明和 Token 表后置或折叠。

## 阶段 0：读图准备

### 0.1 读取图片

- 本地路径：直接读取，失败时要求用户重新提供路径或上传图片
- URL：尝试读取，失败时告知用户并提供占位方案
- 多张图：进入多图梳理流程

### 0.2 图片质量评估

| 维度 | 合格 | 不合格 | 处理方式 |
|---|---|---|---|
| 清晰度 | 文字可辨认，边界清晰 | 文字模糊，边界锯齿严重 | 告知用户“以下参数为估算”，继续复刻 |
| 完整性 | 包含完整页面或完整功能区块 | 只有局部截图 | 询问“这是页面哪个部分？是否需要复刻整个页面？” |
| 遮挡/水印 | 无遮挡 | 关键元素被遮挡 | 要求用户补充无遮挡截图或文字说明 |
| 长图 | 单屏页面 | 高度明显大于宽度 2 倍以上 | 按视觉断点拆分，先复刻可见区域 |

### 0.3 长页面处理

若图片为长页面（滚动截图）：

1. 按视觉断点拆成若干屏（首屏、列表区、表单区、底部区等）
2. 先复刻当前可见区域
3. 询问用户是否继续复刻下方内容，或合并为同一页面的滚动区块

## 阶段 1：项目与技术栈检测

### 1.1 检测当前工作目录

通过文件判断项目类型，仅作为提示，**不自动决定输出形态**：

| 文件 | 项目类型 |
|---|---|
| `manifest.json` + `pages.json` | uniapp 项目 |
| `vite.config.ts` / `vue.config.js` + `package.json` 含 `vue` | Vue 项目 |
| `next.config.js` / `vite.config.ts` + `package.json` 含 `react` | React/Next 项目 |
| `nuxt.config.ts` | Nuxt 项目 |
| 无以上文件 | 非项目目录 |

### 1.2 输出形态决策

| 用户输入 | 工作目录 | 输出形态 |
|---|---|---|
| 只发图，未指定框架 | 任意 | **单文件 HTML + Tailwind CDN** |
| 指定 "uniapp/Vue/React/HTML" | 任意 | 按指定框架生成 |
| 要求“接入项目” | 目标项目 | 询问确认后按项目技术栈生成 |
| 多图/原型图集 | 任意 | 先梳理页面关系，再逐个生成 |

**默认规则**：用户未指定时，优先输出单文件 HTML；只有用户明确要求框架或接入项目时，才生成框架代码。

### 1.3 多图梳理

如果用户发来多张原型图，先执行梳理：

1. **识别每个页面对应的功能/路由**
2. **识别公共组件**（导航栏、tab bar、卡片、按钮）
3. **识别页面跳转关系**
4. **决定复刻顺序**：先公共布局，再具体页面

详细方法见 [multi-mockups.md](multi-mockups.md)。

## 阶段 2：读图解析

### 2.1 识别页面类型

先判断页面属于哪种场景：

| 页面类型 | 典型特征 |
|---|---|
| 中后台管理系统 | 侧边栏 + 顶部 tab + 表格/表单/卡片 |
| 营销落地页 | 大标题 + CTA + 特性列表 + testimonials |
| 企业官网 | 导航 + hero + 内容区块 + footer |
| 移动端页面 | 底部 tab + 卡片流 + 顶部导航 |
| 文档站点 | 左侧目录 + 右侧内容 |

### 2.2 拆解页面结构

用层级方式描述：

```
页面
├── Sidebar
│   ├── Logo
│   ├── 导航菜单
│   └── 底部操作区
├── Header
│   ├── 顶部导航/面包屑
│   └── 用户工具区
└── Main Content
    ├── 步骤条/页头
    └── 内容网格
        ├── 卡片 A
        ├── 卡片 B
        └── 卡片 C
```

### 2.3 记录关键视觉信息

对每一层记录：

- 背景色
- 文字颜色/字号/字重
- 内边距、外边距
- 圆角
- 阴影
- 边框
- 图标

### 2.4 图标 / 图片 / 二维码 / 特殊元素处理

**核心原则：能代码模拟就模拟，不能模拟再占位。**

| 元素类型 | 优先方案 | 降级方案 |
|---|---|---|
| 通用图标 | Iconify API 或内联 SVG | 语义文字标签 |
| 功能图标（首页、日历、人物） | Heroicons / Phosphor / Tabler via Iconify | 内联 SVG |
| 品牌图标 | 用相近语义图标或纯色块 + 文字 | 占位矩形 |
| 二维码 | QRCode.js 真实生成占位二维码 | 占位 div |
| Banner / 背景图 / 人物头像 | Unsplash 直接图片 URL | CSS gradient 占位 |
| 地图 | CSS 色块 + 标注点模拟 | 占位 div |
| 图表 | ECharts 渲染 mock 数据 | 占位 div |

**Unsplash 使用规则**：

- 通用场景使用已知稳定的 Unsplash 图片 ID
- 人物头像按身份关键词选择（如 `doctor`、`medical professional`）
- 不依赖 `source.unsplash.com`（已弃用），只使用 `images.unsplash.com` 直接 URL

**Iconify 使用规则**：

- 图标 URL 格式：`https://api.iconify.design/{prefix}/{name}.svg`
- 常用前缀：`ph`（Phosphor）、`heroicons-solid`、`heroicons-outline`、`tabler`
- 示例：`https://api.iconify.design/ph/house.svg`、`https://api.iconify.design/ph/calendar-check.svg`

**原则**：

1. **能模拟就模拟**：二维码、简单图形、图表尽量用代码生成。
2. **占位第二**：复杂图表、真实数据、真实地图用占位 + 说明。
3. **禁止直接使用 Emoji 作为正式图标**。

复杂组件（图表、表单校验、动画、地图等）详见 [complex-components.md](complex-components.md)。

## 阶段 3：收敛设计 Token

### 3.1 颜色 Token

从图中提取所有颜色，归类收敛：

```scss
:root {
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --primary-light: #EFF6FF;

  --text-main: #111827;
  --text-sub: #6B7280;
  --text-inverse: #FFFFFF;

  --bg-page: #F3F4F6;
  --bg-card: #FFFFFF;
  --bg-hover: #F9FAFB;

  --border-light: #E5E7EB;
}
```

### 3.2 间距 Token

按 4px 基准收敛：

```scss
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 20px;
--space-2xl: 24px;
--space-3xl: 32px;
```

### 3.3 圆角与阴影

```scss
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

--shadow-card: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
```

## 阶段 4：组件抽象

### 4.1 判断公共组件

公共组件特征：

- 同一页面出现多次
- 样式/结构可复用
- 有明确 props

典型公共组件：

- `Sidebar`
- `Header`
- `PageHeader`
- `Card`
- `Steps`
- `Button`
- `Input`
- `Switch`
- `Checkbox`

### 4.2 与已有组件对齐（仅完整模式）

若检测到项目已有组件库或 `ui-component-commands-skill/components/` 有类似组件，可作为参考，但不强制复用。

**当前任务优先保证还原度**，组件沉淀放到后续收敛阶段。

## 阶段 5：代码生成

### 5.1 先搭骨架

```html
<div class="flex h-screen">
  <aside class="w-[232px]">...</aside>
  <main class="flex-1 flex flex-col">
    <header>...</header>
    <div class="flex-1 overflow-auto p-6">
      <!-- content -->
    </div>
  </main>
</div>
```

### 5.2 再填血肉

按结构树从外到内填充：

1. Sidebar
2. Header
3. Page-level components（步骤条等）
4. Cards
5. Inner elements

### 5.3 技术栈选择

- 未指定 → 纯 HTML + Tailwind CSS CDN
- Vue3 → Vue SFC + Tailwind
- React → React + Tailwind
- uniapp → Vue3 + uniapp 组件

### 5.4 响应式默认策略

代码生成时默认加入基础断点策略：

| 断点 | 行为 |
|---|---|
| `xl` (≥1280px) | 完整双栏/多栏布局 |
| `lg` (≥1024px) | 双栏为主 |
| `md` (≥768px) | 双栏变单栏 |
| `sm` (<768px) | 单栏，卡片堆叠 |

**注意**：快速模式下，响应式以不破坏桌面还原度为前提，不强求全断点完美适配。

## 阶段 6：验证与交付

### 6.1 状态补全

检查是否遗漏关键状态：

- [ ] hover 态
- [ ] active/pressed 态
- [ ] focus 态
- [ ] disabled 态

loading/empty/error 态在快速模式下可选，完整模式下尽量补全。

### 6.2 还原度自评

按以下维度快速自评，并在输出中告知用户：

| 维度 | 合格标准 | 本次结果 |
|---|---|---|
| 整体布局 | 区块顺序、主次关系与原图一致 | 自填 |
| 颜色 | 主色、背景色、文字色无偏差 | 自填 |
| 间距 | 关键间距无明显偏差 | 自填 |
| 字体 | 字号层级与原图一致 | 自填 |
| 组件形态 | 按钮/输入框/卡片等形态一致 | 自填 |
| 状态 | 至少补全 hover 和 focus | 自填 |

**说明**：AI 看图有先天精度限制，无法保证 100% 像素级还原。达到“整体布局 + 主色 + 关键组件形态一致”即可交付。

## 输出顺序

### 快速模式

1. 一句话结构分析
2. 完整代码
3. 验证提醒

### 完整模式

1. 设计系统/项目检测说明
2. 图质量评估结果
3. 一句话结构分析
4. Token 表
5. 完整代码
6. 验证提醒与还原度自评

## 增量精调

用户拿到第一稿后通常会提出局部修改：

1. 只改被指出的元素，不重写整页
2. 记录已确认的视觉参数
3. 直接输出修改后的文件或局部 diff
4. 不重复输出整份 Token 表

**典型精调话术**：

> “这个按钮颜色从 #2563EB 调到 #1D4ED8，间距从 16px 调到 12px。其他保持不变。”
