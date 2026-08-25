---
name: ui-template-builder
description: "UI页面模板构建器 - 固化常见页面模板，多套风格可选，支持mock数据。从个人中心到商品页，从登录页到大屏，一键生成风格统一、质量稳定的页面代码。"
argument-hint: "[页面类型] [风格] [--mock]"
user-invocable: true
triggers:
  - "生成页面"
  - "做个.*页面"
  - "页面模板"
  - "个人中心"
  - "商品页"
  - "登录页"
  - "底部tab"
  - "顶部tab"
  - "列表页"
  - "详情页"
  - "大屏"
  - "管理后台"
  - "PC端"
  - "表格"
  - "table"
  - "form"
  - "表单"
  - "主题切换"
  - "色阶"
---

# UI Template Builder

页面模板固化技能：把常见页面固化下来，每次生成基于模板，确保效果稳定。

## 核心设计

```
用户：帮我做个个人中心页面
AI：
  1. 确认技术栈（uniapp Vue3）
  2. 确认页面类型（个人中心）
  3. 确认风格（简约现代）
  4. 确认是否mock（是）
  5. 基于模板生成代码
```

**三个必须确认的配置（有默认值）：**
1. **做什么页面** → 从模板库选择
2. **什么风格** → 风格库选择，每种页面3-5套风格
3. **是否mock数据** → 开启则生成配套mock数据

## 交互流程

### 步骤1：确认技术栈

```
AI：请问您使用的技术栈是？
- uniapp (Vue2)
- uniapp (Vue3)
- React + Vite
- Vue3 + Vite
- Taro (React)
- Taro (Vue3)
- 移动端 H5
- PC 端 H5

默认值：uniapp (Vue3)
```

### 步骤2：确认页面类型

```
AI：请选择要生成的页面类型：

【移动端 - uniapp/Taro】
┌─────────────────────────────────────┐
│ 📱 个人中心      │ 商品详情页        │
│ 🛒 商品列表页    │ 分类页面          │
│ 🏠 首页          │ 购物车页面        │
│ 💬 聊天列表页    │ 订单列表页        │
│ 📋 表单页面      │ 设置页面          │
│ 🎁 活动页面      │ 搜索结果页        │
└─────────────────────────────────────┘

【PC 端】
┌─────────────────────────────────────┐
│ 🔐 登录页        │ 注册页            │
│ 📊 数据大屏      │ 管理后台首页      │
│ 📋 表格列表页    │ 表单填写页        │
│ 📰 文章详情页    │ 门户网站首页      │
│ 💼 企业官网      │ 文档页面          │
└─────────────────────────────────────┘

输入页面名称或序号，或直接描述（如"做一个个人中心"）
```

### 步骤3：确认风格（核心！）

每种页面都提供 **3-5 套风格** 供选择：

```
AI：请选择风格（共 X 套可选）：

┌─────────────────────────────────────────────────────────────┐
│ 风格1: 简约现代      │ 白色为主，文字为主，少装饰            │
│ 风格2: 活力炫彩      │ 渐变色，圆形图标，活跃氛围            │
│ 风格3: 高端商务      │ 深色系，金色点缀，精致感              │
│ 风格4: 清新自然      │ 绿色/蓝色系，圆角卡片，亲和力         │
│ 风格5: 暗黑科技      │ 深色背景，霓虹点缀，赛博朋克          │
└─────────────────────────────────────────────────────────────┘

默认值：简约现代
```

### 步骤4：确认Mock数据

```
AI：是否需要生成Mock数据？
- ✅ 是，生成配套的mock数据文件（推荐）
- ❌ 否，只需要页面模板

默认值：是
```

**Mock数据说明**：
- 使用 JSON Server / Mock.js 兼容格式
- 字段命名符合业务语义
- 数据量适中（5-20条典型数据）
- 包含边界状态（空数据、加载中、错误态）

## 页面模板库

### 移动端模板（uniapp/Taro）

#### 1. 个人中心页面

| 风格 | 特点 | 适用场景 |
|------|------|----------|
| 简约现代 | 白色背景，头像+昵称+统计，列表式入口 | 工具类App |
| 活力炫彩 | 渐变头部，卡片式布局，图标丰富 | 电商/社交 |
| 高端商务 | 深色头部，金色/品牌色点缀，会员感 | 金融/高端 |
| 清新自然 | 浅绿/浅蓝背景，卡片圆润，亲和力 | 健康/母婴 |

**模板结构**：
```
个人中心/
├── header.vue          # 头部区域（头像/昵称/背景）
├── stats.vue           # 统计数据（订单/积分/优惠券）
├── menu-grid.vue       # 功能菜单（网格布局）
├── menu-list.vue       # 功能菜单（列表布局）
├── footer.vue          # 底部（退出/设置）
└── mock.json           # Mock数据
```

#### 2. 商品详情页

| 风格 | 特点 |
|------|------|
| 简约现代 | 轮播图+基本信息，纯色按钮 |
| 活力炫彩 | 大幅轮播，标签化属性，促销氛围 |
| 高端商务 | 沉浸式深色，细节图多，规格严谨 |
| 清新自然 | 柔和色调，场景图，卡片式评价 |

**模板结构**：
```
商品详情/
├── gallery.vue         # 图片轮播
├── info.vue           # 基本信息（标题/价格/评分）
├── specs.vue          # 规格选择
├── detail.vue         # 详情区（富文本/Tabs）
├── bottom-bar.vue     # 底部操作栏
└── mock.json
```

#### 3. 底部TabBar

| 风格 | 特点 | 关键约束 |
|------|------|----------|
| 简约线条 | 线性图标，文字在图标下方 | **禁止scroll-view，使用view+overflow** |
| 活力填充 | 填充图标，图标+文字，渐变选中 | 胶囊按钮适配 |
| 高级暗金 | 深色底，金色图标，质感 | 安全区域适配 |
| 清新圆角 | 浅色，圆角容器，柔和动画 | uniapp xstyle 兼容 |

**⚠️ 重要约束（AI必须遵守）**：
- **禁止使用 scroll-view** 实现整页滚动
- 胶囊按钮区域必须 safe-area 适配
- tab切换使用 view 切换，禁止滑动动画延迟
- 底部安全距离必须使用 `safe-area-inset-bottom`

#### 4. 商品列表页

| 风格 | 特点 |
|------|------|
| 瀑布流 | 双列瀑布，图片为主 |
| 网格 | 九宫格，图标+文字 |
| 列表 | 单列，图片左+信息右 |
| 横向滑动 | 横向类目+纵向商品 |

#### 5. 分类页面

| 风格 | 特点 |
|------|------|
| 左右结构 | 左侧类目+右侧商品 |
| 顶部tab | 顶部类目切换+商品列表 |
| 搜索+分类 | 顶部搜索+分类列表 |

#### 6. 购物车页面

| 风格 | 特点 |
|------|------|
| 简约编辑 | 单选+编辑数量+删除 |
| 活动氛围 | 多选+优惠券+推荐 |

#### 7. 订单列表页

| 风格 | 特点 |
|------|------|
| 标签筛选 | 顶部tabs+订单卡片 |
| 时间线 | 纵向时间轴展示 |

#### 8. 表单页面

| 风格 | 特点 |
|------|------|
| 简洁输入 | 行内表单，标签在上 |
| 卡片分组 | 卡片包裹，分组标题 |
| 步骤表单 | 分步骤填写，进度指示 |

### PC端模板

#### 1. 登录页

| 风格 | 特点 |
|------|------|
| 极简登录 | 纯表单，居中，背景纯净 |
| 左侧表单 | 左侧表单+右侧大图 |
| 卡片式 | 浮层卡片，背景虚化 |
| 深色科技 | 深色背景，霓虹边框 |

#### 2. 数据大屏

| 风格 | 特点 |
|------|------|
| 科技深蓝 | 深蓝背景，发光图表 |
| 商务蓝 | 浅蓝背景，卡片式布局 |
| 赛博朋克 | 黑色背景，霓虹色块 |
| 山水国风 | 深色背景，云雾水墨元素 |

**大屏组件库**：
- 数字滚动卡片
- 折线/面积/柱状图
- 环形/饼图
- 地图可视化
- 实时数据流

#### 3. 管理后台

| 侧边菜单 | 头部 | 内容区 |
|----------|------|--------|
| 固定宽 | 固定高 | 独立滚动 |
| 可折叠 | 面包屑 | 表格/表单 |

**组件**：
- 侧边导航
- 顶部Header
- 面包屑
- 表格（分页/筛选/排序）
- 表单（栅格布局）
- 标签页

#### 4. 表格列表页

| 风格 | 特点 |
|------|------|
| 紧凑高效 | 行高32-36，密集信息 |
| 宽敞舒适 | 行高48+，操作明显 |
| 卡片表格 | 卡片式行，展开详情 |

#### 5. 文章详情页

| 风格 | 特点 |
|------|------|
| 博客风格 | 居中，封面图，目录 |
| 文档风格 | 左侧目录，右侧内容 |
| 门户风格 | 大封面，相关信息 |

## 组件模板库

组件模板与页面模板**相互独立**，但页面模板可以直接引用组件模板。

**重要**：这里的组件不是 Element Plus / Ant Design / uView 等第三方 UI 库，而是**纯模板代码**：
- 无 npm 依赖
- 无额外编译配置
- 即拷即用
- 可直接修改源码

### uniapp 组件

| 组件 | 用途 |
|------|------|
| button | 按钮：主/次/幽灵/危险，多尺寸，加载态 |
| modal | 弹框 / Dialog：确认/提示，支持遮罩关闭 |
| drawer | 抽屉 / Sidebar：从右/下/左滑出 |
| toast | 轻提示：成功/错误/加载，多位置 |
| picker | 底部选择器：单列选项 |
| calendar | 日历：月份视图、选日期 |
| moments | 朋友圈 / 动态列表：封面、头像、图片网格、点赞评论 |
| **table** | **表格：列配置、排序、筛选、分页、斑马纹** |
| **form** | **表单容器、表单项、输入框、选择器、校验规则** |

### PC React 组件

| 组件 | 用途 |
|------|------|
| button | 按钮：多风格、多尺寸、加载态 |
| modal | 弹框：确认/提示 |
| drawer | 抽屉：从右/左滑出 |
| toast | 轻提示：通知消息 |
| **table** | **表格：列配置、排序、筛选、分页、自定义渲染** |
| **form** | **表单：受控模式、验证规则、动态表单** |

### 引用方式

```vue
<!-- uniapp 页面模板内引用 -->
<script setup>
import MyButton from '@/components/uniapp-vue3/button/button.vue'
import MyModal from '@/components/uniapp-vue3/modal/modal.vue'
</script>
```

## Mock数据规范

### 文件位置

```
项目根目录/
├── mock/
│   ├── index.js          # Mock Server 入口
│   ├── user.json         # 用户相关
│   ├── product.json       # 商品相关
│   ├── order.json         # 订单相关
│   └── common.json        # 通用（字典/配置）
└── pages/（业务代码）
```

### 数据规范

```json
{
  "products": [
    {
      "id": "p001",
      "name": "商品名称",
      "price": 99.00,
      "originalPrice": 199.00,
      "sales": 1000,
      "image": "https://via.placeholder.com/200",
      "tags": ["热销", "新品"],
      "stock": 99,
      "rating": 4.5
    }
  ]
}
```

### 状态覆盖

每份Mock数据必须包含：
- **正常态**：5-20条典型数据
- **空状态**：空数组
- **加载态**：延迟响应
- **错误态**：模拟网络错误

### 模板级 Mock 数据

每个页面模板目录下都提供 `mock.json`，与模板代码配套：

```
templates/uniapp-vue3/profile/
├── style-1-simple.vue
├── style-2-vibrant.vue
├── ...
└── mock.json          # 配套 mock 数据
```

**数据格式统一为**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "title": "页面标题",
    "user": { ... },
    "list": [ ... ]
  }
}
```

**组件通过 props 接收数据**，不是硬编码：
```tsx
import TableList from './templates/pc-react/table-list/style-1-default'
import mock from './templates/pc-react/table-list/mock.json'

function Page() {
  return (
    <TableList
      title={mock.data.title}
      columns={mock.data.columns}
      rows={mock.data.rows}
      pagination={mock.data.pagination}
    />
  )
}
```

这样 **mock.json 可直接替换为后端 API 返回**，实现快速对接。

## 风格系统

### 颜色定义

每个风格对应一组设计Token：

```json
{
  "styles": {
    "简约现代": {
      "primary": "#333333",
      "background": "#FFFFFF",
      "surface": "#F5F5F5",
      "border": "#E5E5E5",
      "radius": "8px"
    },
    "活力炫彩": {
      "primary": "#FF6B6B",
      "background": "#FFFFFF",
      "surface": "#FFF5F5",
      "gradient": "linear-gradient(135deg, #FF6B6B, #FFB347)",
      "radius": "12px"
    },
    "高端商务": {
      "primary": "#1A1A2E",
      "background": "#0F0F1A",
      "surface": "#16162A",
      "accent": "#D4AF37",
      "radius": "4px"
    }
  }
}
```

### 组件映射

```
风格选择 → 加载对应 tokens.json → 渲染时替换变量
```

### 动态主题生成器

提供 `references/theme-generator.js` 脚本，支持**自定义主题色**一键生成完整色阶：

```bash
# 生成主题色阶（默认 modern 风格）
node references/theme-generator.js modern

# 指定自定义颜色
node references/theme-generator.js custom #FF6B6B

# 预设主题
node references/theme-generator.js vibrant
node references/theme-generator.js premium
node references/theme-generator.js nature
node references/theme-generator.js dark-tech
```

**输出**：自动生成 50-900 色阶的 CSS 变量，替换 `--color-primary-500` 等变量即可全局换肤。

### 一键换肤 & 换尺寸

**交互演示**：[templates/theme-preview.html](templates/theme-preview.html)

直接在浏览器打开预览，支持：
- **5 套主题**：现代灰 / 活力橙 / 暗金 / 清新绿 / 科技蓝
- **3 档尺寸**：小号 / 中号 / 大号
- **实时预览**：点击即切换，所见即所得

**在代码中使用**：
```js
import { generateTokens, generateCSSVariables } from './references/theme-generator'

// 用户说"换成红色主题"
const tokens = generateTokens({ primaryColor: '#FF4444' })
const css = generateCSSVariables(tokens)

// 将 css 注入到页面即可全局换肤
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`)
```

**换尺寸同理**：
```css
/* 小号 */
:root { --font-size-base: 12px; --space-base: 12px; }

/* 大号 */
:root { --font-size-base: 16px; --space-base: 20px; }
```

## 技术栈适配

### uniapp Vue3

```vue
<template>
  <view class="page-container">
    <!-- 页面内容 -->
  </view>
</template>

<script setup>
import { ref } from 'vue'
// 使用 Composition API
</script>

<style lang="scss">
// 使用 SCSS 变量
</style>
```

### uniapp Vue2

```vue
<template>
  <view class="page-container">
    <!-- 页面内容 -->
  </view>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style lang="scss">
</style>
```

### React + Vite

```tsx
import { useState } from 'react'

export default function Page() {
  return (
    <div className="page-container">
      {/* 页面内容 */}
    </div>
  )
}
```

## 输出结构

生成的文件结构：

```
项目/
├── pages/
│   ├── profile/           # 个人中心
│   │   ├── index.vue
│   │   └── index.scss
│   ├── product-detail/    # 商品详情
│   │   ├── index.vue
│   │   └── index.scss
│   └── ...
├── components/            # 页面级组件
├── mock/                   # Mock数据
│   ├── index.js
│   ├── user.json
│   └── product.json
└── styles/
    └── tokens.scss        # 风格变量
```

## 与其他技能协作

| 技能 | 协作方式 |
|------|----------|
| frontend-ui-foundry | 场景/品牌风格由此提供，本技能使用其风格系统 |
| ui-component-commands-skill | 组件级沉淀，页面由组件组合而成 |
| impeccable | 生成后可通过impeccable优化 |

## 目录结构

```
ui-template-builder/
├── SKILL.md                    # 本文件
├── README.md                   # 使用文档
├── references/
│   ├── scenarios/              # 场景定义
│   │   ├── mobile/             # 移动端场景
│   │   │   ├── profile.md
│   │   │   ├── product-detail.md
│   │   │   ├── product-list.md
│   │   │   ├── category.md
│   │   │   ├── cart.md
│   │   │   ├── order.md
│   │   │   └── ...
│   │   └── pc/                 # PC端场景
│   │       ├── login.md
│   │       ├── dashboard.md
│   │       ├── table.md
│   │       └── ...
│   ├── styles/                 # 风格定义
│   │   ├── modern.json
│   │   ├── vibrant.json
│   │   ├── premium.json
│   │   ├── nature.json
│   │   └── dark-tech.json
│   └── mock-templates/         # Mock模板
│       ├── user.json
│       ├── product.json
│       └── order.json
└── templates/                  # 页面代码模板
    ├── uniapp-vue3/
    ├── uniapp-vue2/
    ├── react/
    └── vue3/

```

实际仓库结构还包含：

```
ui-template-builder/
├── components/                 # 组件模板（与页面模板独立，可被引用）
│   ├── uniapp-vue3/           # uniapp 组件：button/modal/drawer/toast/picker/calendar/moments
│   └── pc-react/              # PC React 组件：button/modal/drawer/toast
└── templates/                  # 页面代码模板
    ├── uniapp-vue3/
    ├── pc-react/
    └── ...
```

## 默认值总结

| 配置项 | 默认值 | 可选值 |
|--------|--------|--------|
| 技术栈 | uniapp Vue3 | 见上方技术栈列表 |
| 页面类型 | 用户输入 | 页面名称 |
| 风格 | 简约现代 | 简约现代/活力炫彩/高端商务/清新自然/暗黑科技 |
| Mock数据 | 是 | 是/否 |

---

**一句话**：选页面 → 选风格 → 确认Mock → 一键生成 ✓
