<!--
  SplitProLayout.vue - 全屏品牌分屏登录布局（左 55% / 右 45%）

  用法见 SKILL.md Wrappers 章节。

  ponytail: 比例 55/45（与 SKILL.md 形态八一致；落地页强调品牌存在感）。
  品牌区自带 radial-gradient 双光晕装饰，与 demo 08-split-pro 一致。
-->
<template>
  <div class="split-pro-layout">
    <!-- 左品牌区：紫蓝渐变 + 双光晕 -->
    <div class="split-pro-layout__brand">
      <div class="split-pro-layout__glow split-pro-layout__glow--top" />
      <div class="split-pro-layout__glow split-pro-layout__glow--bottom" />
      <div class="split-pro-layout__brand-content">
        <slot name="brand">
          <div class="split-pro-layout__brand-icon">M</div>
          <h1 class="split-pro-layout__hero">{{ brandHero }}</h1>
          <p class="split-pro-layout__sub">{{ brandSub }}</p>
        </slot>
      </div>
    </div>

    <!-- 右表单区 -->
    <div class="split-pro-layout__form">
      <slot name="form" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 品牌区大标题 */
  brandHero?: string
  /** 品牌区副标题 */
  brandSub?: string
}

withDefaults(defineProps<Props>(), {
  brandHero: '欢迎使用考拉写作',
  brandSub: '专业的 AI 写作助手，让创作更高效',
})
</script>

<style scoped>
.split-pro-layout {
  display: flex;
  min-height: 100vh;
}

/* 左品牌区：55% 宽度，主题色渐变（凡有颜色必用 token） */
.split-pro-layout__brand {
  flex: 55;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  position: relative;
  overflow: hidden;
}
/* ponytail: 槽位内容由消费者用一个根 div 包裹（自行控制 flex-direction / align），
     这样 Vue 3 scoped :slotted(*) 不支持的坑可以避开。*/

/* 双 radial-gradient 光晕装饰：accent 色用主题色 token */
.split-pro-layout__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
}
.split-pro-layout__glow--top {
  top: -100px;
  left: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%);
}
.split-pro-layout__glow--bottom {
  bottom: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
}

.split-pro-layout__brand-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
}

.split-pro-layout__brand-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-6);
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

.split-pro-layout__hero {
  font-size: 36px;
  font-weight: var(--weight-semibold);
  margin: 0 0 var(--space-4);
  line-height: 1.2;
}

.split-pro-layout__sub {
  font-size: var(--font-base);
  opacity: 0.85;
  margin: 0;
  line-height: 1.6;
}

/* 右表单区：45% 宽度，surface token */
.split-pro-layout__form {
  flex: 45;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  background: var(--color-surface);
}

@media (max-width: 768px) {
  .split-pro-layout {
    flex-direction: column;
  }
  .split-pro-layout__brand {
    min-height: 240px;
  }
}
</style>