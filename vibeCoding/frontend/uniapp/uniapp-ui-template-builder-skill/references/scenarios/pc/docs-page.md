# 文档页面模板

## 页面概述

技术文档、产品手册、API文档展示页面。

## 适用场景

- API文档
- 产品手册
- 开发指南
- 帮助中心

## 模板结构

```
docs/
├── sidebar.vue        # 左侧导航
├── header.vue         # 顶部搜索
├── content.vue       # 内容区域
├── toc.vue           # 右侧目录
├── code-block.vue    # 代码块
├── api-table.vue     # API表格
└── mock.json
```

## 布局结构

```
┌────────────────────────────────────────────────────────┐
│  Logo │  文档标题              │ 🔍 搜索 │ GitHub    │
├──────────┬───────────────────────────────┬─────────────┤
│          │                               │             │
│  目录    │      文档内容                  │  页面目录   │
│          │                               │             │
│  · 章节1 │  标题                        │  · 1.1     │
│  · 章节2 │  正文内容...                  │  · 1.2     │
│  · 章节3 │                               │  · 2.1     │
│    · 3.1 │  ```js                       │             │
│    · 3.2 │  代码示例                    │             │
│          │  ```                          │             │
│          │                               │             │
├──────────┴───────────────────────────────┴─────────────┤
│  © 2024 Company · 文档版本: v1.0.0                    │
└────────────────────────────────────────────────────────┘
```

## 区域详解

### 1. 顶部Header

**内容**：
- Logo
- 文档标题
- 搜索框
- 版本选择
- GitHub链接

### 2. 左侧导航

**内容**：
- 章节列表
- 可折叠
- 高亮当前页面
- 搜索过滤

### 3. 内容区域

**内容**：
- 标题
- 段落
- 代码块
- API表格
- 提示框
- 折叠面板

### 4. 右侧目录

**内容**：
- 当前页面标题
- 点击跳转
- 滚动高亮

## API文档

### 请求示例

```http
GET /api/users HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "list": [],
    "total": 0
  }
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| size | int | 否 | 每页条数 |

## 风格变体

### 风格1：浅色文档

```scss
--bg-page: #FFFFFF;
--bg-sidebar: #F7F8FA;
--text-primary: #24292E;
--text-secondary: #6A737D;
--code-bg: #F6F8FA;
--border: #E1E4E8;
```

### 风格2：深色文档

```scss
--bg-page: #0D1117;
--bg-sidebar: #161B22;
--text-primary: #C9D1D9;
--text-secondary: #8B949E;
--code-bg: #161B22;
--border: #30363D;
```

### 风格3：Mintlify风格

```scss
--primary: #1A73E8;
--bg-page: #FFFFFF;
--bg-sidebar: #FFFFFF;
--shadow: 0 0 2px rgba(0,0,0,0.1);
```

## Mock数据

```json
{
  "sidebar": [
    {
      "title": "开始",
      "children": [
        { "title": "介绍", "path": "/docs/intro" },
        { "title": "快速开始", "path": "/docs/quickstart" }
      ]
    },
    {
      "title": "API",
      "children": [
        { "title": "用户接口", "path": "/docs/api/user" }
      ]
    }
  ],
  "content": {
    "title": "介绍",
    "content": "文档正文内容...",
    "code": "console.log('hello')"
  }
}
```
