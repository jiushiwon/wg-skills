# UI Template Builder

> 页面模板固化技能：把常见页面固化下来，每次生成基于模板，确保效果稳定。

## 核心能力

| 能力 | 说明 |
|------|------|
| **37 套页面模板** | 覆盖移动端和 PC 端常见页面 |
| **5 套风格** | 简约/活力/高端/自然/暗黑，一键切换 |
| **Mock 数据** | 每个模板配套 mock.json，所见即所得 |
| **一键换肤** | CSS 变量 + 主题生成器，任意颜色色阶 |
| **三档尺寸** | 小/中/大字号，全局切换 |
| **Props 数据流** | 对接后端只需替换 mock.json |

## 快速开始

```
# 生成个人中心页面（简约现代风格，带Mock数据）
生成一个个人中心页面

# 生成商品详情页（活力炫彩风格）
生成商品详情页，活力炫彩风格

# 生成PC表格列表页（暗黑科技风格，带分页和批量操作）
做个表格列表页，暗黑科技风格

# 换个品牌色一键生成
换个主题色 #FF6B6B
```

## 三个必须确认的配置

| 配置 | 默认值 | 说明 |
|------|--------|------|
| 技术栈 | uniapp Vue3 | 支持多种前端框架 |
| 页面类型 | 用户输入 | 从模板库选择 |
| 风格 | 简约现代 | 5 套风格可选 |
| Mock数据 | 是 | 可选开启/关闭 |

---

## 一、页面模板库

### 移动端（uniapp Vue3）

| 页面 | 风格数 | 说明 |
|------|--------|------|
| 个人中心 | 4 | 头像、昵称、统计、功能菜单 |
| 商品详情 | 4 | 轮播图、价格、规格、详情、评价 |
| 商品列表 | 1 | 瀑布流、网格、列表 |
| 购物车 | 1 | 店铺分组、数量编辑、结算栏 |
| 订单列表 | 1 | 状态标签、商品卡片 |
| 朋友圈 Moments | 3 | 微信风格、小红书瀑布流 |
| 聊天列表 Chat | 3 | 微信列表、卡片风格 |
| 底部 TabBar | 4 | 简约/活力/暗金/自然 |

### PC 端（React）

| 页面 | 风格数 | 说明 |
|------|--------|------|
| 登录/注册 | 3 | 简约/渐变/深色科技 |
| 数据大屏 | 1 | 科技深蓝、统计卡片、图表 |
| 管理后台 | 1 | 侧边栏、Header、统计 |
| 表格列表 | 3 | 默认/优雅/深色科技 |
| 表单页 | 3 | 默认/填充/深色科技 |
| 文章详情 | 1 | 博客风格 |

---

## 二、风格系统

### 5 套预设风格

| 风格 | 主色 | 特点 | 适用场景 |
|------|------|------|----------|
| 简约现代 | #333333 | 白色为主，文字为主 | 工具类 App、B 端后台 |
| 活力炫彩 | #FF6B6B | 渐变橙红，圆形图标 | 电商、社交、活动页 |
| 高端暗金 | #D4AF37 | 深色+金色点缀 | 金融、奢侈品、会员页 |
| 清新自然 | #2ECC71 | 绿色系，圆角卡片 | 健康、母婴、旅游 |
| 暗黑科技 | #00D9FF | 深色背景，霓虹点缀 | 数据大屏、科技产品 |

---

## 三、主题生成器（一键换肤）

### 色阶生成脚本

提供 `references/theme-generator.js`，输入任意颜色自动生成完整色阶：

```bash
# 使用预设主题
node references/theme-generator.js modern
node references/theme-generator.js vibrant
node references/theme-generator.js premium

# 自定义颜色
node references/theme-generator.js custom #FF6B6B
```

### 输出示例

自动生成 50-900 色阶的 CSS 变量：

```css
:root {
  --color-primary-50: #fff5f5;
  --color-primary-100: #ffe4e4;
  --color-primary-500: #FF6B6B;
  --color-primary-900: #450a0a;
  /* ... */
}
```

### 交互式预览

打开 `templates/theme-preview.html` 可实时预览：

- **5 套主题**：点击按钮实时切换
- **3 档尺寸**：小/中/大字号全局生效

---

## 四、Mock 数据规范

### 每个模板目录都有 mock.json

```
templates/uniapp-vue3/profile/
├── style-1-simple.vue
├── style-2-vibrant.vue
├── ...
└── mock.json          # 配套数据
```

### 数据格式

统一为接口标准格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "title": "用户管理",
    "columns": [...],
    "rows": [...],
    "pagination": { "current": 1, "pageSize": 10, "total": 56 }
  }
}
```

### 对接后端

组件通过 **props 接收数据**，不是硬编码：

```vue
<!-- uniapp -->
<profile-page :user="userData" :stats="statsData" :menus="menuData" />

<script setup>
import Profile from './profile/style-1-simple.vue'
import mock from './profile/mock.json'

// 方式1：直接用 mock
const userData = ref(mock.data.user)

// 方式2：替换成后端 API
const { data } = await fetch('/api/user/profile')
userData.value = data.user
</script>
```

```tsx
// PC React
import TableList from './table-list/style-1-default'
import mock from './table-list/mock.json'

<TableList
  title={mock.data.title}
  columns={mock.data.columns}
  rows={mock.data.rows}
  pagination={mock.data.pagination}
/>
```

---

## 五、组件风格（每个组件 2-3 套）

### Table 表格

| 风格 | 特点 |
|------|------|
| default | 简约线条，表头浅灰 |
| elegant | 优雅边框，虚线分隔 |
| gradient | 渐变表头，深色主题 |

### Form 表单

| 风格 | 特点 |
|------|------|
| default | 默认线条，圆角输入框 |
| filled | 填充背景，悬浮高亮 |
| outline | 粗边框，方正风格 |

### Pagination 分页

| 风格 | 特点 |
|------|------|
| default | 简约分页，方角按钮 |
| rounded | 圆角胶囊，渐变激活 |
| modern | 紧凑布局，小号按钮 |

### Button 按钮

| 风格 | 特点 |
|------|------|
| default | 简约现代 |
| elegant | 优雅渐变 |
| gradient | 深色科技 |

---

## 六、尺寸阶梯

### 三档尺寸

通过 CSS 变量控制全局尺寸：

| 档位 | 字号 | 间距 | 圆角 |
|------|------|------|------|
| sm | 12px | 12px | 6px |
| md | 14px | 16px | 8px |
| lg | 16px | 20px | 10px |

### 使用方式

```css
/* 切换尺寸 */
:root { --font-size-base: 12px; }  /* 小号 */
:root { --font-size-base: 16px; }  /* 大号 */
```

---

## 七、技术栈

- uniapp (Vue2)
- uniapp (Vue3)
- React + Vite
- Vue3 + Vite
- Taro (React)
- Taro (Vue3)
- 移动端 H5
- PC 端 H5

---

## 八、目录结构

```
ui-template-builder/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
├── references/
│   ├── theme-generator.js       # 主题生成器
│   ├── styles/                # 风格定义
│   │   ├── modern.json
│   │   ├── vibrant.json
│   │   ├── premium.json
│   │   ├── nature.json
│   │   └── dark-tech.json
│   └── mock-templates/        # Mock 模板
├── components/                 # 组件模板
│   ├── uniapp-vue3/        # uniapp 组件
│   └── pc-react/           # React 组件
└── templates/                 # 页面模板
    ├── uniapp-vue3/         # uniapp 页面
    │   ├── profile/
    │   ├── product-detail/
    │   ├── moments/
    │   ├── chat-list/
    │   └── ...
    └── pc-react/            # PC 页面
        ├── login/
        ├── table-list/
        ├── form-page/
        └── ...
```

---

## 九、与其他技能协作

| 技能 | 协作方式 |
|------|----------|
| frontend-ui-foundry | 场景/品牌风格由此提供，本技能使用其风格系统 |
| ui-component-commands-skill | 组件级沉淀，页面由组件组合而成 |
| icon-image-catch-skill | 素材抓取，页面缺图标/图片时自动补 |
| impeccable | 生成后可通过 impeccable 优化代码 |

---

## 十、示例

### 示例 1：生成个人中心

```
用户：做个个人中心页面

AI：
1. 技术栈确认（默认 uniapp Vue3）
2. 页面类型：个人中心
3. 风格选择：
   - 简约现代（默认）
   - 活力炫彩
   - 高端商务
   - 清新自然
4. Mock 数据：默认开启
5. 生成代码
```

### 示例 2：一键换肤

```
用户：换个品牌色，#FF4444

AI：
1. 调用 theme-generator.js 生成色阶
2. 输出新的 CSS 变量
3. 全局替换 --color-primary 相关变量
```

### 示例 3：生成表格列表页

```
用户：帮我做一个 PC 表格列表页，带搜索、分页、批量操作

AI：
1. 技术栈：React + Vite
2. 页面：table-list
3. 风格：elegant 优雅风格
4. Mock：开启
5. 生成包含：
   - 搜索栏
   - 复选框批量选择
   - 分页组件
   - mock.json 配套数据
```

---

**一句话**：选页面 → 选风格 → 确认 Mock → 一键生成 ✓
