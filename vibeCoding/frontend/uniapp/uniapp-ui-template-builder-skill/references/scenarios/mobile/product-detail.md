# 商品详情页模板

## 页面概述

展示商品详细信息，包含图片、价格、规格选择、详情描述、用户评价等。

## 适用场景

- 电商商品详情
- 服务详情
- 课程详情

## 模板结构

```
product-detail/
├── gallery.vue         # 图片轮播
├── info.vue            # 基本信息
├── specs.vue           # 规格选择
├── promotion.vue      # 促销信息
├── detail.vue          # 商品详情
├── rating.vue          # 评价区
├── bottom-bar.vue      # 底部操作栏
└── mock.json
```

## 区域详解

### 0. 淘宝/京东风格核心要点

参考主流电商平台的商品详情页，必须包含以下元素：

- **顶部轮播图**：多图横向滑动，底部指示器显示 `当前/总数`，支持视频标识
- **价格区**：现价（大字号、高饱和暖色）、原价（删除线）、券后价/促销标签
- **标题区**：商品主标题 + 副标题/卖点 + 官方/物流/服务标签
- **口碑区**：评分星级、评价数量、好评率
- **规格选择**：已选规格入口，点击弹出 SKU 选择器
- **服务保障**：正品保证、7天无理由、运费险、分期免息等图标列表
- **店铺信息**：店铺 Logo、名称、粉丝数、好评率、进店/关注按钮
- **横向推荐**："看了又看" 商品横向滚动
- **中部 Tab**：商品详情 / 评价晒单 / 相关推荐，吸顶切换
- **底部操作栏**：客服、店铺、购物车图标 + 加入购物车/立即购买按钮

**底部按钮防溢出规范**：
- 按钮文字使用 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`
- 按钮最小宽度不小于 80px，避免 "加入购物车" 等 5 字文案被截断或凸出
- 图标区与按钮区比例建议 4:6 或 3:7，确保按钮有足够空间

### 1. Gallery 图片轮播

**位置**：页面顶部

**规格**：
- 高度：375px（1:1）或 500px（4:3）
- 指示点：底部居中
- 数量：支持视频+图片

**交互**：
- 左右滑动
- 点击查看大图（预览）
- 手指捏合缩放

### 2. Info 基本信息

**位置**：轮播图下方

**内容**：
- 价格（现价 + 原价）
- 标题
- 副标题/描述
- 销量/评分/收藏
- 标签（新品/热卖/促销）

**布局**：
```vue
<view class="price-row">
  <text class="price">¥99</text>
  <text class="original-price">¥199</text>
</view>
<view class="title">商品标题</view>
<view class="tags">
  <text class="tag">新品</text>
</view>
```

### 3. Specs 规格选择

**位置**：Info下方，卡片内

**内容**：
- 颜色/尺寸/版本选择
- 已选提示："已选：黑色，256G"
- 数量选择器

**交互**：
- 点击选中，状态切换
- 弹出规格选择弹窗（复杂场景）

### 4. Promotion 促销信息

**位置**：Specs下方（可折叠）

**内容**：
- 优惠券领取
- 满减活动
- 积分抵扣
- 拼团/秒杀标识

### 5. Detail 商品详情

**位置**：Promotion下方

**内容**：
- 属性列表（规格参数）
- 富文本详情（图文）
- 售后服务

**实现**：
- 使用 `rich-text` 或 `u-parse`
- 图片懒加载

### 6. Rating 评价区

**位置**：Detail下方

**内容**：
- 评分概览（星级+数量）
- 评价列表（头像+内容+图片）
- 查看全部评价入口

### 7. BottomBar 底部操作栏

**位置**：页面底部，固定

**内容**：
- 收藏/分享（图标按钮）
- 客服（图标按钮）
- 加入购物车（次按钮）
- 立即购买（主按钮）

**高度**：50px + safe-area

## 风格变体

### 风格1：简约现代

```scss
--primary: #333333;
--price-color: #FF4400;
--bg-card: #FFFFFF;
--bg-page: #F5F5F5;
--radius: 8px;
```

**特点**：白色卡片，纯色按钮，简洁信息

### 风格2：活力炫彩

```scss
--primary: #FF6B6B;
--price-color: #FF4400;
--gradient: linear-gradient(90deg, #FF6B6B, #FF8E53);
--bg-card: #FFFFFF;
--radius: 16px;
```

**特点**：渐变按钮，标签化属性，促销氛围浓

### 风格3：高端商务

```scss
--primary: #1A1A2E;
--price-color: #D4AF37;
--bg-card: #FFFFFF;
--border: #E5E5E5;
--radius: 4px;
```

**特点**：深色文字，金色价格，规格严谨

### 风格4：清新自然

```scss
--primary: #2ECC71;
--price-color: #27AE60;
--bg-page: #F0F9F6;
--radius: 20px;
```

**特点**：柔和色调，场景图，卡片圆润

## 交互规范

1. **底部按钮**：固定定位，使用 `safe-area-inset-bottom`
2. **页面滚动**：
   - 禁止使用 `scroll-view` 实现整页滚动
   - 使用 `page` 滚动 + `position: sticky` 吸顶
3. **规格弹窗**：使用自定义弹窗，禁止使用 `uni.showActionSheet`
4. **图片预览**：使用 `uni.previewImage`

## 常见问题

### Q1：商品详情太长怎么办？
- 懒加载图片
- 折叠部分内容，"展开全部"

### Q2：多规格如何处理？
- 弹窗选择规格
- 记住用户已选
- 库存实时计算

## Mock数据示例

```json
{
  "product": {
    "id": "p001",
    "name": "商品标题商品标题商品标题",
    "subtitle": "副标题描述",
    "price": 99.00,
    "originalPrice": 199.00,
    "sales": 1000,
    "rating": 4.5,
    "ratingCount": 200,
    "stock": 99,
    "images": [
      "https://via.placeholder.com/750",
      "https://via.placeholder.com/750"
    ],
    "tags": ["热销", "新品", "促销"]
  },
  "specs": {
    "colors": [
      { "id": "c1", "name": "黑色", "image": "" },
      { "id": "c2", "name": "白色", "image": "" }
    ],
    "sizes": [
      { "id": "s1", "name": "128G" },
      { "id": "s2", "name": "256G" }
    ]
  },
  "ratings": {
    "score": 4.5,
    "count": 200,
    "list": [
      {
        "id": "r1",
        "user": "用户***1",
        "avatar": "",
        "content": "评价内容",
        "images": [],
        "date": "2024-01-01"
      }
    ]
  }
}
```
