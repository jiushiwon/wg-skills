# AI Slop 黑名单（Anti-Patterns）

**生成或优化 UI 前必读**。如果触犯以下任一模式，即使功能正确也算失败。

## 绝对禁令（Match-and-Refuse）

发现下列模式 → 立即停止，重写元素结构。

### 1. 侧边色条边框
```css
/* ❌ 严禁 */
border-left: 4px solid #c45c48;
border-right: 4px solid #6366f1;
```

```css
/* ✅ 改用：完整边框 / 背景色 / 引导数字图标 / 干脆去掉 */
border: 1px solid var(--color-border);
background: var(--color-surface-tinted);
```

### 2. 渐变文字
```css
/* ❌ 严禁 */
.gradient-text {
  background: linear-gradient(90deg, #6366f1, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

```css
/* ✅ 改用：单色 + 字号/字重强调 */
.emphasis {
  color: var(--color-primary);
  font-weight: 700;
}
```

### 3. 玻璃拟态作默认
```css
/* ❌ 严禁（默认就上 glass） */
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.1);
```

```css
/* ✅ 改用：仅在模态/抽屉/折叠层使用，作用是"暗示背景可关闭" */
.modal-backdrop {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.4);
}
```

### 4. 大数字+小标签的 hero-metric 模板
```html
<!-- ❌ 严禁 -->
<div class="metric">
  <div class="big-number">$2.4M</div>
  <div class="small-label">Revenue</div>
  <div class="supporting-stats">+12% vs last quarter</div>
  <div class="gradient-accent"></div>
</div>
```

```html
<!-- ✅ 改用：上下文叙述、数据可视化、表格、对比 -->
<div class="metric-context">
  <h3>Q3 Revenue: $2.4M</h3>
  <p>Up 12% from Q2, primarily driven by enterprise contracts.</p>
  <table>...</table>
</div>
```

### 5. 尺寸一致的卡片网格
```html
<!-- ❌ 严禁（无限重复 icon + heading + text） -->
<div class="grid">
  <div class="card"><i/><h3/><p/></div> x 9
</div>
```

```html
<!-- ✅ 改用：变化尺寸/媒介、有视觉节奏 -->
<div class="feature-mix">
  <article class="feature-hero">...</article>
  <article class="feature-secondary">...</article>
  <article class="feature-quote">...</article>
</div>
```

### 6. 模态框作为第一反应
```js
/* ❌ 严禁（任何"取消/确认"都先弹模态） */
function deleteItem() {
  openModal({ title: '确认删除？' });
}
```

```js
/* ✅ 改用：行内操作 / 可撤销 toast / 进度条式流程 */
function deleteItem() {
  softDelete(id);
  showToast({ message: '已删除', action: { label: '撤销', onClick: restore } });
}
```

---

## 高频 AI Slop 模式

### 字体陷阱
- ❌ Inter / Roboto / Arial（任何地方任何角色）
- ❌ Space Grotesk（已被滥用成"AI 风格"代名词）
- ❌ system-ui 作为唯一字体（显得偷懒）
- ✅ 选用有个性的字体配对（见 tokens/typography.md）

### 颜色陷阱
- ❌ 紫色渐变 + 白色背景（最经典的 AI slop 标志）
- ❌ 仪表盘=深蓝/医疗=白+青绿/金融=深蓝+金（品类反射）
- ❌ 5+ 个互不相干的高饱和色乱用
- ✅ 选定调色策略（4 档承诺度之一），克制使用

### 布局陷阱
- ❌ 所有内容包在 `.container mx-auto px-4` 里
- ❌ 三个相同卡片 + icon + heading + paragraph + button 无限重复
- ❌ Hero + 4 features + 3 testimonials + CTA + footer 的"万能落地页"
- ✅ 故意打破网格、制造不对称、留白或挤压

### 动效陷阱
- ❌ 入场动画用 `width/height/top/left` 触发重排
- ❌ bounce / elastic 缓动（违背物理）
- ❌ 全屏 parallax、滚动监听函数堆叠
- ❌ 装饰性动效（无意义的旋转 logo、闪烁边框）
- ✅ transform/opacity + ease-out 指数曲线 + 用途明确

### 交互陷阱
- ❌ 工具提示/弹窗里塞太多内容
- ❌ hover 才显示关键信息（移动端不可用）
- ❌ 加载状态只有 spinner，没有骨架屏或进度
- ❌ Toast 3 秒后还在屏幕中间挡视线
- ✅ 关键信息移动端也可访问 / 进度可感 / 错误可恢复

---

## 品类反思维（Category-Reflex Check）

生成前自问：

**第一阶**："如果有人从品类就能猜出主题+调色板（'可观测→深蓝'、'医疗→白+青绿'、'金融→深蓝+金'、'加密货币→黑+霓虹'），就是训练数据反射。"

**第二阶**："如果有人从品类+反参考也能猜出美学家族（'AI 工作流工具≠ SaaS 米白→编辑性排版'、'金融≠深蓝+金→终端式深色'），就是二阶反射。"

**两个都过不了，必须重做**。重写场景句、重选调色策略，直到两个答案都不显然。

---

## 可访问性红线

无论设计多好看，触发以下任一即失败：

| 规则 | 阈值 |
|------|------|
| 文本对比度 | ≥4.5:1（AA）/ ≥7:1（AAA） |
| 大文本对比度 | ≥3:1 |
| 触摸目标 | ≥44×44pt（iOS）/ 48×48dp（Android） |
| 焦点环可见 | 2-4px 实色环，不靠颜色 |
| 键盘可达 | 所有交互元素 Tab 可达 |
| 语义化 | h1-h6 顺序不跳级，按钮/链接语义正确 |
| 替代文本 | img 有 alt，icon-only 有 aria-label |
| 减弱动画 | 尊重 `prefers-reduced-motion` |
| 系统缩放 | 支持 200% 缩放不破版 |
| 色盲友好 | 颜色不单独承载信息（加图标/文字） |

---

## 自检清单

生成或优化完成后，逐项打勾：

- [ ] 没用 Inter/Roboto/Arial
- [ ] 没用紫色渐变
- [ ] 没用侧边色条边框
- [ ] 没用渐变文字
- [ ] 玻璃拟态仅在必要时使用
- [ ] 卡片网格有变化尺寸/媒介
- [ ] 模态框不是默认交互
- [ ] 入场动画用 transform/opacity
- [ ] 缓动用 ease-out 指数曲线
- [ ] hover 之外有 touch 反馈
- [ ] 加载有骨架/进度
- [ ] 触摸目标 ≥44pt
- [ ] 文本对比度 ≥4.5:1
- [ ] 焦点环可见
- [ ] 键盘可达
- [ ] 支持 prefers-reduced-motion
- [ ] 没有"AI 一眼看出"的反射性设计

**任何一项未通过 → 必须重做**。
