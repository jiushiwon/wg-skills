# 标准项目结构

> 本文档定义 uniapp 标准项目结构，参考自 uniapp-app-generate-skill

## 完整目录结构

```
project-root/
├── src/
│   ├── api/                    # API 层
│   │   ├── modules/            # 按业务模块拆分
│   │   │   ├── user.ts        # 用户相关 API
│   │   │   ├── order.ts       # 订单相关 API
│   │   │   ├── product.ts     # 商品相关 API
│   │   │   └── index.ts       # 统一导出所有 API
│   │   ├── types/             # API 相关类型定义
│   │   │   └── index.ts
│   │   └── index.ts           # API 入口，导出所有模块
│   │
│   ├── components/             # 公共组件（按业务/通用拆分）
│   │   ├── AppButton/         # 按钮组件
│   │   │   ├── index.vue
│   │   │   └── index.ts       # 组件导出
│   │   ├── AppCard/          # 卡片组件
│   │   ├── AppEmpty/         # 空状态组件
│   │   ├── AppLoading/       # 加载组件
│   │   ├── AppNavbar/         # 导航栏
│   │   ├── AppTabBar/        # 标签栏
│   │   ├── AppInput/         # 输入框
│   │   └── index.ts          # 统一导出
│   │
│   ├── constants/             # 常量
│   │   ├── colors.ts         # 颜色常量
│   │   ├── storage.ts        # 存储 key 常量
│   │   └── index.ts          # 统一导出
│   │
│   ├── pages/                 # 页面
│   │   ├── index/            # 首页
│   │   │   └── index.vue
│   │   ├── user/             # 用户页面
│   │   │   └── index.vue
│   │   ├── detail/          # 详情页
│   │   │   └── index.vue
│   │   └── ...
│   │
│   ├── static/                # 静态资源
│   │   ├── icons/            # 小图标
│   │   ├── images/          # 图片资源
│   │   └── tab-bar/         # TabBar 图标
│   │
│   ├── stores/               # 状态管理（Pinia）
│   │   ├── index.ts         # store 入口
│   │   └── modules/         # store 模块
│   │       ├── user.ts      # 用户状态
│   │       ├── app.ts       # 应用状态
│   │       └── cart.ts      # 购物车状态
│   │
│   ├── styles/               # 样式系统
│   │   ├── config/          # 主题配置
│   │   │   └── theme.json   # 主题配置源文件
│   │   ├── tokens/          # Design Tokens
│   │   │   ├── _colors.scss # 颜色 token
│   │   │   ├── _spacing.scss # 间距 token
│   │   │   ├── _typography.scss # 排版 token
│   │   │   ├── _index.scss  # 统一导出
│   │   │   └── _semantic.scss # 语义 token
│   │   ├── _functions.scss  # SCSS 函数
│   │   ├── _mixins.scss     # SCSS 混入
│   │   ├── global.scss      # 全局样式
│   │   └── variables.scss   # 变量入口
│   │
│   ├── types/                # 全局类型定义
│   │   ├── global.d.ts      # 全局类型声明
│   │   └── index.d.ts       # 类型入口
│   │
│   ├── utils/               # 工具函数
│   │   ├── request.ts       # 网络请求封装
│   │   ├── storage.ts       # 存储工具
│   │   ├── platform.ts      # 平台判断
│   │   ├── platform-auth.ts # 平台登录
│   │   ├── platform-share.ts # 平台分享
│   │   ├── date.ts          # 日期工具
│   │   └── index.ts         # 统一导出
│   │
│   ├── App.vue              # 根组件
│   ├── main.ts              # 入口文件
│   ├── pages.json           # 页面配置
│   ├── manifest.json        # 应用配置
│   └── uni.scss             # uni-app 全局变量
│
├── .env                     # 环境变量（不提交）
├── .env.example             # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 目录职责

### api/ — API 层

负责所有网络请求：

- `modules/` 按业务模块拆分
- 统一错误处理
- 统一请求/响应类型
- 统一 loading 状态

### components/ — 公共组件

可复用的 Vue 组件：

- 业务无关的通用组件（按钮、卡片、空状态）
- 按组件名目录组织
- 统一在 index.ts 导出

### constants/ — 常量

不可变的配置：

- 颜色常量
- 存储 key 常量
- 业务常量

### pages/ — 页面

按页面组织：

- 每个页面一个目录
- 目录内可包含组件（局部组件）
- 页面特有的样式可写在同目录

### static/ — 静态资源

无需处理的资源：

- 图片、图标、字体
- 不经过构建处理

### stores/ — 状态管理

Pinia store：

- 按业务模块拆分
- 全局共享的状态

### styles/ — 样式系统

主题和样式：

- tokens/ 设计令牌
- 全局样式
- 混入和函数

### types/ — 类型定义

TypeScript 类型：

- 全局类型声明
- 业务类型定义

### utils/ — 工具函数

纯函数工具：

- 网络请求封装
- 存储工具
- 平台适配
- 日期处理

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 目录 | kebab-case | `api-modules`, `app-button` |
| 组件文件 | PascalCase | `AppButton.vue` |
| 组件目录 | PascalCase | `AppButton/` |
| 工具文件 | camelCase | `request.ts` |
| 样式文件 | kebab-case | `global.scss` |
| 页面文件 | kebab-case | `index.vue` (目录式) |

## 页面目录结构

有两种推荐方式：

### 方式一：目录式（推荐）

```
pages/
├── index/
│   └── index.vue
├── user/
│   ├── index.vue
│   └── components/
│       └── UserAvatar.vue
└── detail/
    └── index.vue
```

### 方式二：文件式

```
pages/
├── index.vue
├── user.vue
├── detail.vue
└── components/
    └── UserAvatar.vue
```

**推荐方式一**，便于组织页面局部组件和样式。
