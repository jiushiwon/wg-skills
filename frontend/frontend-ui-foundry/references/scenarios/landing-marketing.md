# 场景：营销落地页（Landing Marketing）

推广活动、产品发布、品牌故事、单页滚动。**视觉冲击 > 信息密度**。

---

## 适用

- 产品发布落地页
- 营销活动单页
- 品牌故事
- 创意机构作品集
- 活动注册页

## 不适用

- SaaS 后台（用 `admin-dashboard`）
- 文档（用 `docs-site`）
- 长期运营的企业官网（用 `pc-corporate`）

---

## 核心组件

| 组件 | 说明 |
|------|------|
| **Hero** | 戏剧性标题 + CTA + 视觉，640-720px |
| **Visual Proof** | 大图、视频、3D 演示 |
| **Feature Showcase** | 交替图文，制造节奏 |
| **Social Proof** | 客户 logo 墙、引用、案例 |
| **Stats** | 关键数据（避免 hero-metric） |
| **Comparison** | 前后对比、竞品对比 |
| **FAQ** | 折叠列表 |
| **Final CTA** | 底部主行动区 |
| **Sticky CTA** | 滚动时固定底部 CTA（可选） |
| **Exit Intent Modal** | 离开意图弹窗（克制使用） |

---

## 布局基线

### 滚动节奏

营销页是**单列长滚动**，每个 section 是一个"屏"或"半屏"：

```css
.section {
  padding: var(--space-24) var(--space-4);  /* 96px 上下 */
  max-width: var(--container-xl);
  margin: 0 auto;
}

.section.full-height {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.section.alternate {
  background: var(--color-surface-tinted);
}

/* 不对称布局，制造张力 */
.section.split-6-4 {
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: var(--space-12);
  align-items: center;
}

.section.split-4-6 {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: var(--space-12);
  align-items: center;
}

@media (max-width: 1023px) {
  .section.split-6-4,
  .section.split-4-6 {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}
```

---

## Hero 设计

### 戏剧性 Hero（推荐）

```html
<section class="hero">
  <div class="hero-content">
    <span class="hero-eyebrow">新产品</span>
    <h1 class="hero-title">让设计 <em>重新</em> 有趣</h1>
    <p class="hero-subtitle">
      把 6 周的工作量压缩到 6 分钟，所有约束都为你提前预设。
    </p>
    <div class="hero-ctas">
      <a class="btn-primary btn-lg">立即开始 →</a>
      <a class="btn-ghost btn-lg">观看演示</a>
    </div>
    <p class="hero-meta">无需信用卡 · 14 天免费试用</p>
  </div>
  <div class="hero-visual">
    <img src="..." alt="产品截图" />
  </div>
</section>
```

### Hero 排版规则

```css
.hero-title {
  font-size: clamp(2.5rem, 5vw + 1rem, 5rem);  /* 响应式字号 */
  font-weight: var(--font-weight-bold);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-6);
}

.hero-title em {
  /* 强调用斜体+字重，不靠颜色 */
  font-style: italic;
  font-weight: var(--font-weight-bold);
}

.hero-subtitle {
  font-size: clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem);
  line-height: 1.5;
  color: var(--color-on-surface-muted);
  max-width: 600px;
  margin-bottom: var(--space-8);
}

.btn-lg {
  height: 56px;
  padding: 0 var(--space-8);
  font-size: var(--font-size-lg);
}
```

### Hero 反模式

```html
<!-- ❌ 无价值主张 -->
<h1>欢迎来到 XXX</h1>

<!-- ❌ 价值主张用模板 -->
<h1>智能 · 高效 · 强大</h1>

<!-- ❌ 大数字开屏 -->
<div class="big-number">$2.4M</div>

<!-- ✅ 独特价值主张 + 具体收益 -->
<h1>让设计 <em>重新</em> 有趣</h1>
<p>把 6 周的工作量压缩到 6 分钟</p>
```

---

## Social Proof

### Logo 墙（克制）

```html
<section class="logo-wall">
  <p class="logo-wall-title">被 500+ 团队信任</p>
  <div class="logo-grid">
    <img src="logo1.svg" alt="公司 1" />
    <img src="logo2.svg" alt="公司 2" />
    <!-- 5-8 个，灰度显示 -->
  </div>
</section>
```

```css
.logo-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-8);
  align-items: center;
}

.logo-grid img {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: opacity 200ms;
}

.logo-grid img:hover {
  filter: grayscale(0);
  opacity: 1;
}
```

### 客户引用

```html
<blockquote class="testimonial">
  <p class="testimonial-quote">
    "以前要做 6 周的工作，现在 6 分钟就完成了。我们终于有时间关注真正重要的事。"
  </p>
  <footer class="testimonial-author">
    <img class="testimonial-avatar" src="..." alt="" />
    <div>
      <cite>张三</cite>
      <span>某公司 CTO</span>
    </div>
  </footer>
</blockquote>
```

**注意**：
- 引用要具体（数字、场景、收益）
- 头像真实（不用 stock photo）
- 公司名真实可查

---

## Feature Showcase（交替图文）

```html
<section class="feature-split">
  <div class="feature-visual">
    <img src="..." alt="特性 1 截图" />
  </div>
  <div class="feature-content">
    <span class="feature-number">01</span>
    <h2>用对话构建界面</h2>
    <p>描述你想要什么，AI 直接生成可用的代码。</p>
    <ul class="feature-list">
      <li>✓ 60+ 设计系统</li>
      <li>✓ 实时预览</li>
      <li>✓ 一键导出</li>
    </ul>
  </div>
</section>

<section class="feature-split reverse">
  <div class="feature-visual">...</div>
  <div class="feature-content">...</div>
</section>
```

```css
.feature-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
}

.feature-split.reverse {
  /* 交替方向 */
  direction: rtl;
}
.feature-split.reverse > * {
  direction: ltr;
}

.feature-number {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.1em;
}

@media (max-width: 1023px) {
  .feature-split {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}
```

---

## FAQ

```html
<section class="faq">
  <h2>常见问题</h2>
  <div class="faq-list">
    <details class="faq-item">
      <summary>
        <span>价格如何？</span>
        <span class="faq-icon">+</span>
      </summary>
      <div class="faq-answer">
        <p>个人版免费，团队版 $20/人/月，企业版联系销售。</p>
      </div>
    </details>
  </div>
</section>
```

```css
.faq-item {
  border-bottom: 1px solid var(--color-border);
}

.faq-item summary {
  padding: var(--space-6) 0;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item[open] .faq-icon {
  transform: rotate(45deg);
}

.faq-icon {
  transition: transform 200ms var(--ease-out-quart);
}

.faq-answer {
  padding: 0 0 var(--space-6);
  color: var(--color-on-surface-muted);
}
```

---

## Final CTA

```html
<section class="final-cta">
  <h2>准备好开始了吗？</h2>
  <p>14 天免费试用，无需信用卡。</p>
  <div class="cta-group">
    <a class="btn-primary btn-lg">立即开始</a>
    <a class="btn-text">联系销售</a>
  </div>
</section>
```

---

## 滚动触发动效

```js
// Intersection Observer - 滚动时淡入
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach((el) => {
  observer.observe(el);
});
```

```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 600ms var(--ease-out-quart),
              transform 600ms var(--ease-out-quart);
}

.animate-on-scroll.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* 减弱动效 */
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

---

## 关键 Token 偏向

```css
/* 字号大、视觉冲击 */
--font-size-h1: clamp(2.5rem, 5vw + 1rem, 5rem);  /* 40-80px 响应式 */
--font-size-h2: clamp(2rem, 3vw + 1rem, 3.5rem);

/* 间距大、戏剧性 */
--space-section: var(--space-24);   /* 96px */

/* 圆角大、亲和 */
--radius-button: var(--radius-lg);  /* 12px */
--radius-card: var(--radius-xl);    /* 16px */
```

---

## 推荐调色板

- **赤琥金**（默认）— 中文品牌、文化、文学
- **暖色商务**（Stripe）— 增长型 SaaS
- **冷调极简**（Linear / Vercel）— 开发者工具
- **创意广告**（Apple）— 消费电子、高端品牌
- **3D 沉浸** — 创意机构、AI 产品
- **金融稳重** — 银行、财富产品

---

## 反模式

- ❌ "智能·高效·强大"模板口号
- ❌ 大数字 hero-metric
- ❌ 9 个相同 icon+heading+text 卡片
- ❌ 紫色渐变 + 白色背景
- ❌ 全屏 parallax 滚动
- ❌ 装饰性动效（旋转 logo、闪烁）
- ❌ 渐变文字
- ❌ 自动播放视频（带声音）
- ❌ "万能落地页" 套路

---

## 验证清单

- [ ] Hero 有独特价值主张（不用模板）
- [ ] 标题字号戏剧性
- [ ] Feature 交替图文有节奏
- [ ] Social proof 真实具体
- [ ] FAQ 折叠合理
- [ ] 主 CTA 显著
- [ ] 移动端布局完整
- [ ] 减弱动效模式
- [ ] 触摸目标 ≥44pt
- [ ] 加载性能 < 3s
- [ ] 没有 AI slop
