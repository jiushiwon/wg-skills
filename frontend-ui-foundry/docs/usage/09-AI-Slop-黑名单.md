# 09 · AI Slop 黑名单（必须避免）

> 完整版见 `references/anti-patterns.md`。本文档为速查版。

## 6 大绝对禁令（Match-and-Refuse）

### ❌ 1. 侧边色条边框
```css
border-left: 4px solid #c45c48;
```
✅ 改用：完整边框 / 背景色 / 引导数字图标 / 去掉

### ❌ 2. 渐变文字
```css
background: linear-gradient(90deg, #6366f1, #ec4899);
-webkit-background-clip: text;
color: transparent;
```
✅ 改用：单色 + 字号/字重强调

### ❌ 3. 玻璃拟态作默认
```css
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.1);
```
✅ 改用：仅在模态/抽屉/折叠层使用（暗示背景可关闭）

### ❌ 4. 大数字+小标签的 hero-metric 模板
```html
<div class="big-number">$2.4M</div>
<div class="small-label">Revenue</div>
<div class="gradient-accent"></div>
```
✅ 改用：上下文叙述 + 数据可视化 + 表格对比

### ❌ 5. 尺寸一致的卡片网格
```html
<!-- 9 个相同 icon+heading+text 卡片 -->
```
✅ 改用：变化尺寸/媒介、有视觉节奏

### ❌ 6. 模态框作为第一反应
```js
function deleteItem() { openModal({ title: '确认删除？' }); }
```
✅ 改用：行内操作 / 可撤销 toast / 进度条式流程

## 高频 AI Slop 模式

### 字体陷阱
- ❌ Inter / Roboto / Arial
- ❌ Space Grotesk（已变 AI 风格代名词）
- ❌ system-ui 作唯一字体
- ✅ 选用有个性的字体配对（见 [token/typography](../references/tokens/typography.md)）

### 颜色陷阱
- ❌ 紫色渐变 + 白色背景（最经典 AI slop 标志）
- ❌ 仪表盘=深蓝 / 医疗=白+青绿 / 金融=深蓝+金（品类反射）
- ❌ 5+ 个互不相干的高饱和色乱用
- ✅ 选定调色策略（4 档承诺度），克制使用

### 布局陷阱
- ❌ 所有内容包在 `.container mx-auto px-4`
- ❌ 三个相同卡片无限重复
- ❌ Hero + 4 features + 3 testimonials + CTA + footer 万能落地页
- ✅ 故意打破网格、制造不对称、留白或挤压

### 动效陷阱
- ❌ 入场动画用 `width/height/top/left` 触发重排
- ❌ bounce / elastic 缓动
- ❌ 全屏 parallax、滚动监听函数堆叠
- ❌ 装饰性动效（无意义的旋转 logo、闪烁边框）
- ✅ transform/opacity + ease-out 指数曲线 + 用途明确

## 品类反思维（Category-Reflex Check）

生成前自问：

**第一阶**：从品类就能猜出主题+调色板？（"可观测→深蓝"、"医疗→白+青绿"、"金融→深蓝+金"、"加密→黑+霓虹"）= 失败

**第二阶**：从品类+反参考也能猜出美学家族？（"AI 工作流工具≠ SaaS 米白→编辑性排版"、"金融≠深蓝+金→终端式深色"）= 失败

**两个都过不了，重做。** 重写场景句、重选调色策略。

## 可访问性红线

| 规则 | 阈值 |
|------|------|
| 文本对比度 | ≥4.5:1（AA）/ ≥7:1（AAA） |
| 大文本对比度 | ≥3:1 |
| 触摸目标 | ≥44×44pt（iOS）/ 48×48dp（Android） |
| 焦点环 | 2-4px 实色环可见 |
| 键盘可达 | Tab 顺序 = 视觉顺序 |
| 语义化 | h1-h6 顺序不跳级 |
| alt / aria | img 有 alt，icon-only 有 aria-label |
| 减弱动效 | 支持 `prefers-reduced-motion` |
| 系统缩放 | 支持 200% 缩放不破版 |
| 色盲 | 颜色不单独承载信息 |

## 17 项自检清单

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

**任何一项未通过 → 必须重做。**
