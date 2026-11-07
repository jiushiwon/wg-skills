<!--
  SplitLayout.vue - 半屏分屏登录布局（左右 50/50）

  用法见 SKILL.md Wrappers 章节。

  ponytail: 比例 50/50（与 SKILL.md 形态四一致）。
  品牌区配色 / 渐变 / icon 由 #brand 槽决定，不在此组件硬编码。
-->
<template>
  <div class="split-layout">
    <!-- 左品牌区 -->
    <div class="split-layout__brand">
      <slot name="brand">
        <div class="split-layout__brand-default">
          <div class="split-layout__brand-icon">{{ brandInitial }}</div>
          <h2 class="split-layout__brand-title">{{ brandTitle }}</h2>
          <p class="split-layout__brand-subtitle">{{ brandSubtitle }}</p>
        </div>
      </slot>
    </div>

    <!-- 右表单区 -->
    <div class="split-layout__form">
      <slot name="form" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 品牌区默认首字母（M） */
  brandInitial?: string
  /** 品牌区默认标题（#brand 槽未填时使用） */
  brandTitle?: string
  /** 品牌区默认副标题 */
  brandSubtitle?: string
}

withDefaults(defineProps<Props>(), {
  brandInitial: 'M',
  brandTitle: '管理系统',
  brandSubtitle: '一站式管理后台',
})
</script>

<style>
/* ponytail: 拆 scoped 是因为 Vue 3 scoped CSS 会给 ">" 中间层级也加 [data-v-xxx]，
     消费者的 slot 内容（包装根 div + 子 h2/p/ul）没这个属性，selector 永远命中不了。
     所有 class 都有 .split-layout__ BEM 前缀命名空间隔离，不污染其他组件。 */
.split-layout {
  display: flex;
  min-height: 100vh;
}

/* 左品牌区：主题色渐变（凡有颜色必用 token，禁止硬编码）。
   ponytail: 首元素顶部对齐到右侧 cardTitle 顶部（实测 logo.top=278 vs cardTitle.top=199 差 79px）。
   不用 flex 自然居中（stack 几何中心虽等于 card 几何中心 450，但 logo 顶比 cardTitle 顶低 79px，
   视觉上左侧 brand 内容"挤在屏幕中部"！右侧 title 顶离屏幕顶部更近，看起来"右侧偏高"）。
   上移 80px 让 logo.top ≈ 199 ≈ cardTitle.top，让两个标题 logo 水平对齐。 */
.split-layout__brand {
  flex: 1;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  position: relative;
  overflow: hidden;
}
.split-layout__brand > * {
  transform: translateY(-80px);   /* 用户反馈：右侧仍偏高，让 logo 顶跟 cardTitle 顶对齐 */
}
/* ponytail: 槽位内容由消费者用一个根 div 包裹（自行控制 flex-direction / align），
     这样 Vue 3 scoped :slotted(*) 不支持的坑可以避开。
   这里给槽位内"裸标签"（h2/p/ul/li/svg）提供默认间距，否则消费者第一次用会感觉文字粘连。*/
.split-layout__brand > * > h2 {
  font-size: var(--font-3xl);
  font-weight: var(--weight-semibold);
  margin: var(--space-4) 0 var(--space-10);   /* 用户反馈：title 和 subtitle 之间间距太小，加大到 40px */
  text-align: center;
  letter-spacing: 2px;
}
.split-layout__brand > * > p {
  font-size: var(--font-base);
  opacity: 0.85;
  margin: 0 0 var(--space-12);   /* subtitle 和 ul 之间再加大到 48px，让左视觉重量饱满 */
  text-align: center;
  line-height: 1.6;
}
.split-layout__brand > * > ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);   /* 用户反馈：间隔太小，再加大到 32px */
  text-align: left;
}
.split-layout__brand > * > ul > li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-base);
  line-height: 1.6;
}
.split-layout__brand > * > ul > li > svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  fill: var(--color-success);   /* 主题色 token */
}

.split-layout__brand-default {
  text-align: center;
  max-width: 400px;
}

.split-layout__brand-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-6);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-text-inverse) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text-inverse) 30%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-3xl);
  font-weight: var(--weight-semibold);
  backdrop-filter: blur(10px);
}

.split-layout__brand-title {
  font-size: var(--font-3xl);
  font-weight: var(--weight-semibold);
  margin: 0 0 var(--space-4);
}

.split-layout__brand-subtitle {
  font-size: var(--font-base);
  opacity: 0.8;
  margin: 0;
}

/* 右表单区：surface token（凡有颜色必用 token） */
.split-layout__form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  background: var(--color-surface);
}

/* 响应式：768px 以下品牌区折叠到顶部 */
@media (max-width: 768px) {
  .split-layout {
    flex-direction: column;
  }
  .split-layout__brand {
    min-height: 200px;
  }
}
</style>