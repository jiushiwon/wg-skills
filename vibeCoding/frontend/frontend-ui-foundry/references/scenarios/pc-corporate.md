# 场景：PC 企业官网（PC Corporate）

桌面优先的 PC 企业品牌站、官网、机构页。**移动端降级为可读但不强求完美**。

---

## 适用

- 企业品牌站
- 机构官网（学校、医院、政府）
- 产品官网（消费类）
- 文创/文化品牌官网
- 服务型公司官网

## 不适用

- 移动端优先的工具（用 `mobile-responsive`）
- SaaS 后台（用 `admin-dashboard`）
- 营销活动页（用 `landing-marketing`）

---

## 核心组件

| 组件 | 说明 |
|------|------|
| **Top Nav** | 横向导航，logo + 5-7 项 + CTA，64-80px |
| **Hero** | 大标题 + 副标题 + 主 CTA，640-720px 高 |
| **Feature Grid** | 3-4 列特性卡片，48px gap |
| **Testimonial** | 客户引用 + 头像 + 公司 |
| **Stats Section** | 关键数字（不用 hero-metric 模板！） |
| **Footer** | 多列链接 + 订阅 + 版权 |
| **Breadcrumb** | 多级面包屑（除首页外） |
| **Modal** | 居中模态（如视频、表单） |

---

## 布局基线

### 默认（桌面 ≥ 1024px）

```css
.page {
  max-width: var(--container-xl);  /* 1280px */
  margin: 0 auto;
  padding: 0 var(--space-8);
}

.section {
  padding: var(--space-24) 0;  /* 96px 上下 */
}

.section-tight {
  padding: var(--space-16) 0;  /* 64px 上下 */
}
```

### 12 列栅格

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

.hero-grid {
  display: grid;
  grid-template-columns: 6fr 4fr;  /* 6+4 不对称 */
  gap: var(--space-12);
  align-items: center;
}
```

### 移动端降级（< 1024px）

```css
@media (max-width: 1023px) {
  .hero-grid { grid-template-columns: 1fr; }
  .feature-grid { grid-template-columns: 1fr; }
  .grid-12 { grid-template-columns: 1fr; }
  .section { padding: var(--space-12) 0; }
  .top-nav { display: none; }  /* 改为移动菜单 */
}
```

---

## 关键 Token 偏向

```css
/* 大间距，企业感 */
--space-section: var(--space-24);    /* 96px 区块间距 */
--space-section-loose: var(--space-32); /* 128px 强调 */

/* 圆角中等 */
--radius-button: var(--radius-md);   /* 8px */
--radius-card: var(--radius-lg);     /* 12px */

/* 字体偏大 */
--font-size-h1: 3.5rem;              /* 56px */
--font-size-h2: 2.5rem;              /* 40px */

/* 阴影克制 */
--shadow-card: var(--shadow-sm);
```

---

## Hero 设计

### 经典结构（可接受）
```html
<section class="hero">
  <h1 class="hero-title">主标题 4-8 字</h1>
  <p class="hero-subtitle">副标题 16-24 字，解释价值</p>
  <div class="hero-ctas">
    <a class="btn-primary">主 CTA</a>
    <a class="btn-secondary">次 CTA</a>
  </div>
</section>
```

### 大数字陷阱（避免）
```html
<!-- ❌ 经典 hero-metric：SaaS 烂大街 -->
<div class="metric">
  <div class="big-number">$2.4M</div>
  <div class="small-label">Revenue</div>
  <div class="gradient-accent"></div>
</div>

<!-- ✅ 改为叙述、对比、可视化 -->
<section class="metrics-context">
  <h2>Q3 营收 2.4M 美元，环比增长 12%</h2>
  <p>主要来自企业合同，亚太区贡献首次过半。</p>
  <div class="chart">...</div>
</section>
```

---

## 字号与排版

### 标题字号阶
```css
--font-size-display: 4.5rem;   /* 72px - 顶级 Hero */
--font-size-h1: 3.5rem;        /* 56px */
--font-size-h2: 2.5rem;        /* 40px */
--font-size-h3: 2rem;          /* 32px */
--font-size-h4: 1.5rem;        /* 24px */
--font-size-h5: 1.25rem;       /* 20px */
```

### 排版规则
- 标题行高 1.1-1.3
- 正文行高 1.6-1.7
- 行长 65-75ch
- 字号阶比例 ≥1.25
- 中英混排用合适 fallback

---

## 导航

### 桌面端
```html
<header class="top-nav">
  <div class="nav-container">
    <a class="logo">Logo</a>
    <nav class="nav-links">
      <a>产品</a>
      <a>解决方案</a>
      <a>客户</a>
      <a>资源</a>
      <a>价格</a>
      <a>关于</a>
    </nav>
    <div class="nav-actions">
      <a class="btn-text">登录</a>
      <a class="btn-primary">开始使用</a>
    </div>
  </div>
</header>
```

```css
.top-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: 72px;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
}

.nav-container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-8);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### 移动端降级
- 折叠为汉堡菜单
- 抽屉式全屏导航
- 主 CTA 保留在导航内

---

## Footer

```html
<footer class="footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <Logo />
      <p>公司一句话描述</p>
    </div>
    <div class="footer-col">
      <h4>产品</h4>
      <a>产品 1</a>
      <a>产品 2</a>
    </div>
    <div class="footer-col">
      <h4>公司</h4>
      <a>关于</a>
      <a>团队</a>
    </div>
    <div class="footer-col">
      <h4>资源</h4>
      <a>博客</a>
      <a>文档</a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2024 公司名</p>
    <div class="footer-social">
      <a>...</a>
    </div>
  </div>
</footer>
```

```css
.footer {
  background: var(--color-surface-tinted);
  padding: var(--space-16) 0 var(--space-8);
  margin-top: var(--space-24);
}

.footer-grid {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-8);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--space-8);
}
```

---

## 推荐调色板

- **赤琥金**（默认）— 中文企业、文创
- **冷调极简**（Linear / Vercel）— 技术品牌、开发者工具
- **暖色商务**（Stripe）— 支付、电商
- **金融稳重** — 银行、财富
- **创意广告**（Apple）— 消费电子、高端品牌

---

## 反模式

- ❌ 横向滚动
- ❌ Hero 缺少主 CTA
- ❌ 段落过长（>100 字不分段）
- ❌ 移动端直接缩小桌面版（应重新设计）
- ❌ footer 只有版权没有导航
- ❌ "万能落地页"模式：Hero + 4 features + 3 testimonials + CTA + footer
- ❌ 大数字 hero-metric
- ❌ 渐变文字作为标题
- ❌ 紫色渐变 + 白色背景

---

## 验证清单

- [ ] 桌面（≥ 1024px）布局完整
- [ ] 12 列栅格 + 响应式
- [ ] 字号阶比例 ≥1.25
- [ ] 行长 65-75ch
- [ ] 触摸目标 ≥44pt
- [ ] 移动端降级可用（不破版）
- [ ] 焦点环可见
- [ ] 对比度 ≥4.5:1
- [ ] 减弱动效模式支持
- [ ] 没有 AI slop 模式
