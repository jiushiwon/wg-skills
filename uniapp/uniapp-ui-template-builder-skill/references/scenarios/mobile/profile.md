# 个人中心页面模板

## 页面概述

用户个人信息和功能入口页面，是App用户最常访问的页面之一。

## 适用场景

- 个人账户管理
- 会员中心
- 用户资料页

## 模板结构

```
profile/
├── header.vue          # 头部区域
├── stats.vue           # 统计数据区
├── menu-grid.vue       # 功能菜单（网格）
├── menu-list.vue       # 功能菜单（列表）
└── footer.vue          # 底部操作
```

## 区域详解

### 1. Header 头部

**位置**：页面顶部

**内容**：
- 背景图/渐变（可选）
- 头像（圆形，80-100px）
- 昵称
- 会员等级/标签（可选）
- 编辑资料按钮（可选）

**高度**：200-280px

### 2. Stats 统计区

**位置**：Header下方，卡片内

**内容**（典型）：
- 订单数（待付款/待发货/待收货/已完成）
- 优惠券数
- 积分
- 收藏数
- 足迹

**布局**：等分Flex，3-5个

### 3. Menu 菜单区

**位置**：Stats下方

**布局方式**：
- 网格布局（icon + 文字，2-4列）
- 列表布局（icon + 文字 + 箭头 + 徽标）

**典型菜单**：
- 我的订单
- 我的收藏
- 我的地址
- 我的卡券
- 会员中心
- 设置
- 帮助与反馈

## 风格变体

### 风格1：简约现代

```scss
// 设计Token
--bg-page: #F5F5F5;
--bg-card: #FFFFFF;
--text-primary: #333333;
--text-secondary: #999999;
--primary: #333333;
--radius-card: 12px;
--space-md: 16px;
```

**特点**：
- 白色卡片
- 灰色页面背景
- 线性图标
- 文字为主

### 风格2：活力炫彩

```scss
--bg-header: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
--bg-card: #FFFFFF;
--primary: #667EEA;
--accent: #FF6B6B;
--radius-card: 16px;
```

**特点**：
- 渐变头部背景
- 填充图标
- 圆形统计卡片
- 活跃氛围

### 风格3：高端商务

```scss
--bg-header: #1A1A2E;
--bg-card: #16162A;
--text-primary: #FFFFFF;
--accent: #D4AF37;
--radius-card: 8px;
```

**特点**：
- 深色背景
- 金色点缀
- 会员感强
- 质感突出

### 风格4：清新自然

```scss
--bg-page: #F0F9F6;
--bg-card: #FFFFFF;
--primary: #2ECC71;
--accent: #27AE60;
--radius-card: 20px;
```

**特点**：
- 浅绿/浅蓝背景
- 圆角卡片
- 柔和图标
- 亲和力强

## 交互规范

1. **头部背景**：固定不滚动，或视差滚动
2. **菜单点击**：H5使用navigateTo，uniapp使用uni.navigateTo
3. **头像点击**：预览大图
4. **订单快捷入口**：点击直达对应订单列表

## 响应式适配

- 宽度：100%，最大480px居中
- 安全区域：顶部胶囊按钮，底部Home指示器
- 触摸区域：最小44px

## Mock数据示例

```json
{
  "user": {
    "id": "u001",
    "nickname": "用户昵称",
    "avatar": "https://via.placeholder.com/100",
    "level": "黄金会员",
    "points": 9999
  },
  "stats": {
    "pendingPay": 2,
    "pendingShip": 1,
    "pendingReceive": 3,
    "completed": 28,
    "coupons": 5,
    "points": 9999,
    "favorites": 15,
    "footprints": 42
  },
  "menuItems": [
    { "id": "order", "icon": "order", "title": "我的订单", "badge": 6 },
    { "id": "coupon", "icon": "coupon", "title": "优惠券", "badge": 5 },
    { "id": "address", "icon": "address", "title": "收货地址" },
    { "id": "favorite", "icon": "favorite", "title": "我的收藏" },
    { "id": "setting", "icon": "setting", "title": "设置" }
  ]
}
```
