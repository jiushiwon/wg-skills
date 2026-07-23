# 商品列表页模板

## 页面概述

展示商品列表的页面，支持多种布局方式（瀑布流、网格、列表、横向滑动）。

## 适用场景

- 电商商品列表
- 搜索结果页
- 分类商品列表
- 活动商品列表

## 模板结构

```
product-list/
├── filter-bar.vue       # 筛选栏
├── layout-selector.vue  # 布局切换
├── waterfall.vue       # 瀑布流布局
├── grid.vue           # 网格布局
├── list.vue           # 列表布局
├── horizontal.vue     # 横向滑动
├── product-item.vue   # 商品项组件
└── mock.json
```

## 布局变体

### 变体1：瀑布流

```
┌────┐ ┌────┐
│    │ │    │
│ 商 │ │ 商 │
│ 品  │ │ 品  │
│    │ │    │
└────┘ └────┘
┌────┐ ┌────┐
│    │ │    │
│ 商 │ │ 商 │
│ 品  │ │ 品  │
│    │ │    │
└────┘ └────┘
```

**特点**：
- 双列交错排列
- 图片高度自适应
- 适合图片为主的商品
- 视觉丰富

### 变体2：网格布局

```
┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │
│ 商 │ │ 商 │ │ 商 │
│ 品  │ │ 品  │ │ 品  │
│    │ │    │ │    │
└────┘ └────┘ └────┘
```

**特点**：
- 等分多列
- 商品信息简洁
- 信息密度高
- 适合标准化商品

### 变体3：列表布局

```
┌─────────────────────┐
│ ┌────┐ 商品名称      │
│ │图片│ ¥99.00      │
│ └────┘ 已售1000件   │
└─────────────────────┘
┌─────────────────────┐
│ ┌────┐ 商品名称      │
│ │图片│ ¥99.00      │
│ └────┘ 已售1000件   │
└─────────────────────┘
```

**特点**：
- 图片左对齐
- 信息展示全面
- 适合详情较多的商品

### 变体4：横向滑动

```
┌──────────┐
│  分类1    │ → → →
├──────────┤
│ ┌──┐ ┌──┐ ┌──┐ │
│ │商│ │商│ │商│ │
│ │品│ │品│ │品│ │
│ └──┘ └──┘ └──┘ │
└──────────────────┘
```

**特点**：
- 顶部横向类目
- 下方商品横向滚动
- 适合多分类场景

## 筛选栏

### 内容

- 综合排序（默认/销量/价格/新品）
- 筛选（品牌/价格区间/属性）
- 筛选（仅看有货/促销）

### 交互

- 点击切换排序
- 点击展开筛选面板
- 选中高亮

## 商品项组件

### 内容

- 商品图片
- 商品名称
- 价格（现价 + 原价）
- 销量
- 标签（可选）
- 收藏按钮（可选）

### 布局

```vue
<view class="product-item">
  <image class="product-image" :src="item.image" mode="aspectFill" />
  <view class="product-info">
    <text class="product-name">{{ item.name }}</text>
    <view class="product-price">
      <text class="price">¥{{ item.price }}</text>
      <text class="original-price">¥{{ item.originalPrice }}</text>
    </view>
    <text class="sales">已售{{ item.sales }}件</text>
  </view>
</view>
```

## 风格变体

### 风格1：简约现代

```scss
--bg-page: #F5F5F5;
--bg-card: #FFFFFF;
--text-primary: #333333;
--text-secondary: #999999;
--price-color: #FF4400;
--radius: 8px;
```

### 风格2：活力炫彩

```scss
--bg-page: #FFFFFF;
--card-shadow: 0 4px 12px rgba(255, 107, 107, 0.1);
--price-color: #FF6B6B;
--radius: 12px;
--tag-bg: linear-gradient(135deg, #FF6B6B, #FF8E53);
```

### 风格3：高端商务

```scss
--bg-page: #F5F5F5;
--bg-card: #FFFFFF;
--text-primary: #1A1A1A;
--price-color: #D4AF37;
--border: 1px solid #E5E5E5;
```

### 风格4：清新自然

```scss
--bg-page: #F0F9F6;
--bg-card: #FFFFFF;
--price-color: #2ECC71;
--radius: 16px;
--shadow: 0 2px 12px rgba(46, 204, 113, 0.1);
```

## 交互规范

1. **下拉刷新**：刷新商品列表
2. **上拉加载**：分页加载更多
3. **滚动吸顶**：筛选栏滚动时吸顶
4. **图片懒加载**：优化性能
5. **点击跳转**：点击商品跳转详情

## Mock数据

```json
{
  "products": [
    {
      "id": "p001",
      "name": "商品名称商品名称商品名称",
      "image": "https://picsum.photos/200/200?random=1",
      "price": 99.00,
      "originalPrice": 199.00,
      "sales": 1000,
      "tags": ["热销"]
    }
  ],
  "categories": [
    { "id": "c1", "name": "推荐" },
    { "id": "c2", "name": "手机" },
    { "id": "c3", "name": "数码" },
    { "id": "c4", "name": "配件" }
  ]
}
```
