# 管理后台模板

## 页面概述

企业后台管理系统框架，包含侧边导航、顶部Header、内容区域。

## 适用场景

- 企业管理后台
- SAAS系统
- CMS内容管理
- 数据管理后台

## 模板结构

```
admin/
├── layout.vue           # 整体布局
├── sidebar.vue         # 侧边导航
├── header.vue          # 顶部Header
├── breadcrumb.vue      # 面包屑
├── content.vue         # 内容区域
├── menu-config.js      # 菜单配置
└── mock.json
```

## 布局结构

```
┌──────────────────────────────────────────┐
│ Logo │  系统名称        │ 用户 │ 设置    │
├────────┬─────────────────────────────────┤
│        │  面包屑：首页 / 用户管理 / 列表  │
│ 侧边   ├─────────────────────────────────┤
│ 导航   │                                 │
│        │         内容区域                  │
│        │                                 │
│        │                                 │
│        │                                 │
│        │                                 │
├────────┴─────────────────────────────────┤
│  © 2024 Company                          │
└──────────────────────────────────────────┘
```

## 布局变体

### 变体1：固定侧边

**特点**：
- 侧边宽度固定（200-250px）
- 侧边可折叠
- 内容独立滚动
- 适合功能较多的后台

### 变体2：可折叠侧边

**特点**：
- 点击折叠/展开
- 折叠后仅显示图标
- 适合功能较少的场景

### 变体3：顶部导航

```
┌──────────────────────────────────────────┐
│ Logo │  菜单1 │ 菜单2 │ 菜单3  │ 用户  │
├──────────────────────────────────────────┤
│ 面包屑                                      │
├──────────────────────────────────────────┤
│                                          │
│              内容区域                      │
│                                          │
└──────────────────────────────────────────┘
```

**特点**：
- 顶部水平导航
- 无侧边栏
- 适合功能较少的轻量后台

## 侧边导航

### 结构

```js
const menuList = [
  {
    path: '/dashboard',
    title: '首页',
    icon: 'HomeOutlined'
  },
  {
    path: '/user',
    title: '用户管理',
    icon: 'UserOutlined',
    children: [
      { path: '/user/list', title: '用户列表' },
      { path: '/user/role', title: '角色管理' }
    ]
  },
  {
    path: '/order',
    title: '订单管理',
    icon: 'OrderOutlined'
  }
]
```

### 交互

- 展开/收起子菜单
- 刷新保持展开状态
- 高亮当前路由
- 刷新页面保持选中

## 顶部Header

### 内容

- 系统Logo/名称
- 面包屑
- 用户信息（头像/名字/下拉）
- 通知图标
- 设置图标
- 全屏按钮

### 高度

- 固定：48-64px

## 面包屑

### 内容

- 首页入口
- 父级路由
- 当前页面

### 样式

```
首页 / 用户管理 / 用户列表
```

## 内容区域

### 布局

- 标题区域
- 筛选/操作栏
- 表格/表单/图表
- 分页

### 滚动

- 内容区独立滚动
- 侧边不滚动

## 风格变体

### 风格1：浅色商务

```scss
--bg-page: #F5F7FA;
--bg-sidebar: #FFFFFF;
--bg-header: #FFFFFF;
--text-primary: #303133;
--text-secondary: #909399;
--primary: #409EFF;
--border: #E4E7ED;
--shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
```

### 风格2：深色商务

```scss
--bg-page: #1A1A2E;
--bg-sidebar: #16162A;
--bg-header: #1A1A2E;
--text-primary: #E5EAF3;
--text-secondary: #8F9BB3;
--primary: #3B82F6;
--border: #2D3A4F;
```

### 风格3：绿色清新

```scss
--bg-page: #F0F9F6;
--bg-sidebar: #FFFFFF;
--bg-header: #FFFFFF;
--primary: #2ECC71;
--border: #D1FAE5;
```

## 组件库

### 常用组件

- 表格 Table
- 表单 Form
- 搜索 Search
- 弹窗 Modal
- 抽屉 Drawer
- 标签 Tabs
- 步骤 Steps
- 时间线 Timeline
- 统计卡片 StatCard

## Mock数据

```json
{
  "menu": [
    {
      "path": "/",
      "title": "首页",
      "icon": "Home"
    },
    {
      "path": "/user",
      "title": "用户管理",
      "icon": "User",
      "children": [
        { "path": "/user/list", "title": "用户列表" },
        { "path": "/user/role", "title": "角色管理" }
      ]
    }
  ],
  "user": {
    "name": "管理员",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    "role": "超级管理员"
  }
}
```
