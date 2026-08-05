# uniapp-style-skill 大版本迭代：一套规范，终结小程序样式乱象

> 从 32 条红线到 34 条，从 16 章到 18 章，从"能用"到"好看"

---

如果你做过 uniapp 微信小程序，大概率经历过这些瞬间：

> "这个文字灰色一点……不对，再灰一点……算了你看着办。"
>
> "A 页面按钮 96rpx，B 页面按钮 88rpx，C 页面按钮 100rpx——三个页面三种高度，改哪个？"
>
> "这个弹窗的出现动画为什么是突然蹦出来的？"
>
> "新来的同事建了个详情页，边距又跟别人不一样了。"

我们 3 个月前发布了 `uniapp-style-skill`，定位是**纯样式层设计系统规范**。说实话 v1 已经解决了不少问题——Design Tokens 架构、34 条红线规则、15 个核心组件规范、深色模式、屏幕适配、设计审计——但现在回头看，**缺了三样东西**：

1. **配色少了张总览图**——文字色、背景色、边框色散落在三节里，新人看不懂默认灰度体系
2. **动画只有 Token 没有现成的**——给了时长和缓动曲线，但开发者还得自己写 `@keyframes`，10 个页面写出 10 种 fade-in
3. **没有页面布局骨架**——每个新页面都是"手写 CSS 堆出来的"，同一类页面的边距、间距、底部按钮从来没有统一过

于是有了这次大版本迭代。

---

## 一、中性色阶总览：一张图讲清楚所有默认配色

这是这次最核心的补充。

整站的默认色彩其实只有 **8 个变量**：

```
文字色 4 阶（从深到浅）
  $color-text-primary    #2b2e31  ← 正文标题
  $color-text-secondary  #5b6167  ← 副标题说明
  $color-text-tertiary   #737a82  ← 时间戳辅助信息
  $color-text-disabled   #b5b9bf  ← 禁用占位符

背景色 3 阶（从亮到暗）
  $color-bg-primary      #ffffff  ← 卡片 / 弹窗 / 列表项
  $color-bg-secondary    #fafafa  ← 页面底色
  $color-bg-tertiary     #f5f5f5  ← 输入框 / 骨架屏

边框 2 阶（独立）
  $color-border          #e5e7eb  ← 分割线 / 卡片边框
  $color-border-light    #f0f0f0  ← 弱分割
```

改 `$color-text-primary` 一处 hex，三个派生色通过 `tint()` **自动变浅**，全站文字灰度联动。而背景色、边框色完全独立，不受文字色影响，也不受品牌主题色影响。

简单说：**想整体调暗文字？改一个变量。想整体变灰背景？改一个变量。各管各的，互不打架。**

这套中性色阶和 `uniapp-theme-skill` 的品牌色阶（50-900）是兄弟关系——一个管灰度，一个管彩色。两套体系各司其职，默认就安装在一起。

---

## 二、组件级 Token：任何一个按钮高度都不能写死

v1 里 Button 组件的样式是这么写的：

```scss
// ❌ 旧写法
.btn {
  &.normal { height: 96rpx; }
  &.small  { height: 64rpx; }
}
```

看着没问题对吧？问题是——整个项目里有 25 个页面、每个页面至少一个按钮。如果哪天要统一改成 88rpx，你得全局搜索 `96rpx`，然后祈祷没有别的地方也用这个值。

v2 新增了 **14 类组件的尺寸 Token**：

| 组件 | Token 示例 |
|------|-----------|
| Button | `$btn-height-normal: 96rpx` / `$btn-height-small: 64rpx` |
| Card | `$card-padding: 24rpx` / `$card-radius: 16rpx` |
| Modal | `$modal-radius: 16rpx` / `$modal-width-ratio: 0.8` |
| NavBar | `$navbar-back-hit-area: 60rpx` |
| Avatar | `$avatar-size-sm: 64rpx` / `$avatar-size-md: 96rpx` / `$avatar-size-lg: 128rpx` |
| Skeleton | `$skeleton-row-height: 32rpx` / `$skeleton-shimmer-duration: 1.5s` |
| Badge / Divider / Empty / Loading / Input / Popup / Checkbox / ListItem | ... |

**新增红线 D33**：组件内部禁止写死 rpx 值，必须引用组件级 Token。改一个变量，全站组件尺寸联动。

---

## 三、6 个动画预设类，禁止重复造轮子

v1 给了你时长和缓动曲线：

```scss
$transition-duration-fast: 150ms;
$transition-duration-normal: 250ms;
$transition-duration-slow: 400ms;
$ease-out: cubic-bezier(0, 0, 0.2, 1);
```

但 `@keyframes` 还是得自己写。于是你会在项目里找到 7 个不同版本的 `@keyframes fadeIn`，名字各有微妙差异，持续时间也不一样。

v2 一次性定义好，全局只用这些：

```scss
.animate-fade-in     // 淡入
.animate-fade-out    // 淡出
.animate-slide-up    // 上滑入场（列表项依次飞入）
.animate-slide-down  // 下滑入场（下拉菜单展开）
.animate-scale-in    // 缩放入场（弹窗内容区）
.animate-shimmer     // 骨架屏闪耀
.animate-spin        // 无限旋转（loading 指示器）
```

用法一行：

```vue
<view class="animate-slide-up" :style="{ animationDelay: index * 60 + 'ms' }">
  {{ item.name }}
</view>
```

所有动画只用 `transform` 和 `opacity`（遵守已有红线 D08），全局一次定义，禁止重复造轮子。

骨架屏动画也统一收敛到 `.animate-shimmer`，Skeleton 组件内部不再自己写 `@keyframes`。同时骨架屏本身也做了增强——原来只有基础文本行，现在支持圆形头像占位、矩形图片占位、复合卡片骨架屏三种常见变体。

---

## 四、10 个 layout zone 类：页面布局不用再手写 CSS 堆

这是本次最"立竿见影"的补充。

你要建一个列表页？以前大概是自己在 `<view>` 上写一堆 `padding` `margin` `flex`，跟其他页面对不齐。现在：

```vue
<template>
  <view class="lyt-page">
    <NavBar title="订单列表" />
    <view class="lyt-header">
      <!-- 搜索栏随便放 -->
    </view>
    <view class="lyt-body">
      <view v-for="item in list" :key="item.id" class="lyt-cell">
        {{ item.name }}
      </view>
    </view>
  </view>
</template>
```

`.lyt-page` / `.lyt-header` / `.lyt-body` / `.lyt-cell` ——全用 class，**不依赖任何组件**。里面放 `<view>` 还是 `<swiper>` 还是自定义组件都行，但边距、间距、safe-area 是 layout class 保证的。

一共 10 个 zone 类，覆盖 5 种页面骨架：

| 页面类型 | 组合方式 |
|----------|---------|
| 列表页 | `.lyt-page` + `.lyt-header` + `.lyt-body` + `.lyt-cell` × N |
| 详情页 | `.lyt-page` + `.lyt-hero` + `.lyt-body` + `.lyt-section` × N + `.lyt-footer` |
| 表单页 | `.lyt-page` + `.lyt-body` + `.lyt-footer` |
| 设置页 | `.lyt-page` + `.lyt-body` + `.lyt-cell` × N |
| 首页 | `.lyt-page` + `.lyt-hero` + `.lyt-body` + `.lyt-col3` + `.lyt-sticky-top` |

以后新增任何页面，先查这张表，套对应的 zone 骨架，再填业务内容。**类名统一 = 全站布局统一。**

---

## 五、无障碍对比度：要好看，也要看得清

这是 v2 从"视觉规范"到"质量规范"的一次重要跃迁。

**新增红线 D34**：正文与背景色对比度必须 ≥ 4.5:1（WCAG AA 标准）。审计自动检测。

我们检查了本规范默认配色的所有组合，发现 3 处低对比度风险：

| 组合 | 对比度 | 风险 |
|------|--------|------|
| `$color-primary`（主题色背景）+ 白色文字 | 2.7:1 | 品牌色按钮上的小字看不清 |
| `$color-text-tertiary`（辅助文字）+ 白色背景 | 3.7:1 | 时间戳辅助信息对比度不够 |
| `$color-text-disabled` + 白色背景 | 2.1:1 | 禁用态免检，但提醒注意 |

每个组合都给出了修复策略。如果你自己定了新的主题色，规范里也提供了快速检测方法。

---

## 六、顺手修了几个暗坑

- **`page {}` 全局文字基底**：现在 `<text>` 标签自动继承设计系统的默认字号和文字色，不用每个页面写 `class="text-body"`
- **主题衔接更明确了**：中性色阶归 style-skill 管，品牌色阶归 theme-skill 管，未安装 theme-skill 时有兜底默认值 `#1CC8C4`
- **审计更完整**：红线从 32 条扩到 34 条，审计覆盖自动 21 条 + 人工 13 条
- **Demo 速查盘**：打开 `demo.html` 就能看到所有色彩、尺寸、组件 Token、动效预览、触发词，主题色可切换即时预览

---

## 怎么用

如果你已经在用 v1，升级方式是：

1. 把新增的 `_layout.scss`（layout zone 类）和 `_animations.scss`（动画预设）全局引入
2. 把组件中的硬编码尺寸改成引用 §6.9 的组件级 Token
3. 跑一次设计审计，会自动扫出新的 D33/D34 违规

如果是新项目，直接从 SKILL.md 第一章开始啃，或者打开 `demo.html` 速查盘先感受一下。

---

## 下一次迭代预告

本次补了**配色总览**、**动画预设**、**布局模式**、**无障碍**四个方向。下次计划攻克**图标规范**和**微交互反馈**——前者终结"10 个页面 10 种图标尺寸"的乱象，后者从"能用"到"精致"再拉一把品质感。

可以在 demo.html 里直接预览所有新增内容。

---

*uniapp-style-skill v2 · 4788 行 · 18 章 · 34 条红线 · 10 layout zone · 6 动画预设 · 14 组组件 Token*
