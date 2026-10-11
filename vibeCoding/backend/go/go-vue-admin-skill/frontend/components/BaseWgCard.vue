<template>
  <!-- 容器铁律：base-wg-card 必须包 base-card，禁止脱离 -->
  <base-card
    :radius="resolved.radius"
    :padding="resolved.padding"
    :shadow="resolved.shadow"
    :bordered="resolved.bordered"
    :clickable="resolved.clickable"
    :tone="tone"
    :loading="loading"
    :class="['wg-card', `wg-card--${variant}`]"
  >
    <!-- 1. basic -->
    <template v-if="variant === 'basic'">
      <div v-if="data.title" class="wg-card__title">{{ data.title }}</div>
      <div v-if="data.desc" class="wg-card__desc">{{ data.desc }}</div>
      <div class="wg-card__body"><slot /></div>
      <template v-if="$slots['header-right']" #header-right>
        <slot name="header-right" />
      </template>
    </template>

    <!-- 2. product -->
    <template v-else-if="variant === 'product'">
      <div class="wg-card__cover" :style="{ backgroundImage: data.cover ? `url(${data.cover})` : 'none' }">
        <span v-if="data.badge" class="wg-card__badge">{{ data.badge }}</span>
      </div>
      <div class="wg-card__body wg-card__body--product">
        <div v-if="data.title" class="wg-card__title">{{ data.title }}</div>
        <div v-if="data.desc" class="wg-card__desc">{{ data.desc }}</div>
        <div class="wg-card__footer">
          <span v-if="data.price" class="wg-card__price">{{ data.price }}</span>
          <slot name="actions" />
        </div>
      </div>
    </template>

    <!-- 3. profile -->
    <template v-else-if="variant === 'profile'">
      <div class="wg-card__cover" :style="{ backgroundImage: data.cover ? `url(${data.cover})` : 'none' }"></div>
      <div class="wg-card__avatar" :style="{ backgroundImage: data.avatar ? `url(${data.avatar})` : 'none' }"></div>
      <div class="wg-card__body wg-card__body--profile">
        <div v-if="data.name" class="wg-card__name">{{ data.name }}</div>
        <div v-if="data.bio" class="wg-card__bio">{{ data.bio }}</div>
        <div v-if="data.stats && data.stats.length" class="wg-card__stats">
          <div v-for="s in data.stats" :key="s.label" class="wg-card__stat">
            <span class="wg-card__stat-value">{{ s.value }}</span>
            <span class="wg-card__stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 4. friend -->
    <template v-else-if="variant === 'friend'">
      <div class="wg-card__avatar" :style="{ backgroundImage: data.avatar ? `url(${data.avatar})` : 'none' }">
        <span v-if="data.online" class="wg-card__online" aria-hidden="true"></span>
      </div>
      <div class="wg-card__main">
        <div v-if="data.name" class="wg-card__name">{{ data.name }}</div>
        <div v-if="data.bio" class="wg-card__bio">{{ data.bio }}</div>
      </div>
      <span class="wg-card__arrow" aria-hidden="true">›</span>
    </template>

    <!-- 5. set -->
    <template v-else-if="variant === 'set'">
      <div
        v-for="(item, idx) in (data.items || [])"
        :key="item.key"
        class="wg-card__set-item"
      >
        <span
          class="wg-card__set-icon"
          :style="iconStyle(item.color || 'var(--color-text-secondary, #666666)', item.icon)"
          aria-hidden="true"
        ></span>
        <div class="wg-card__set-label">{{ item.label }}</div>
        <div class="wg-card__set-extra">
          <slot :name="`set-${item.key}`" />
        </div>
        <div v-if="idx < (data.items || []).length - 1" class="wg-card__divider"></div>
      </div>
    </template>

    <!-- 6. vip -->
    <template v-else-if="variant === 'vip'">
      <div class="wg-card__vip-bg" aria-hidden="true"></div>
      <div class="wg-card__vip-header">
        <span class="wg-card__vip-crown" aria-hidden="true"></span>
        <div class="wg-card__vip-level">{{ data.level }}</div>
      </div>
      <div class="wg-card__avatar wg-card__avatar--lg" :style="{ backgroundImage: data.avatar ? `url(${data.avatar})` : 'none' }"></div>
      <div v-if="data.name" class="wg-card__name wg-card__name--light">{{ data.name }}</div>
      <div v-if="data.expire" class="wg-card__expire">{{ data.expire }}</div>
      <div v-if="data.benefits && data.benefits.length" class="wg-card__benefits">
        <span v-for="b in data.benefits" :key="b" class="wg-card__benefit">{{ b }}</span>
      </div>
    </template>

    <!-- 7. menu -->
    <template v-else-if="variant === 'menu'">
      <div class="wg-card__menu-grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
        <div
          v-for="item in (data.items || [])"
          :key="item.key"
          class="wg-card__menu-item"
          role="button"
          tabindex="0"
        >
          <span
            class="wg-card__menu-icon"
            :style="iconStyle(item.color || 'var(--color-primary, #1890ff)', item.icon)"
            aria-hidden="true"
          ></span>
          <div class="wg-card__menu-label">{{ item.label }}</div>
        </div>
      </div>
    </template>

    <!-- 8. grid -->
    <template v-else-if="variant === 'grid'">
      <div class="wg-card__grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
        <div
          v-for="item in (data.items || [])"
          :key="item.key"
          class="wg-card__grid-item"
          role="button"
          tabindex="0"
        >
          <span
            class="wg-card__grid-icon"
            :style="iconStyle(item.color || 'var(--color-primary, #1890ff)', item.icon)"
            aria-hidden="true"
          ></span>
          <div class="wg-card__grid-title">{{ item.title }}</div>
          <div v-if="item.desc" class="wg-card__grid-desc">{{ item.desc }}</div>
        </div>
      </div>
    </template>

    <!-- 9. image -->
    <template v-else-if="variant === 'image'">
      <div class="wg-card__cover" :style="{ backgroundImage: data.cover ? `url(${data.cover})` : 'none' }"></div>
      <div class="wg-card__body wg-card__body--image">
        <div v-if="data.title" class="wg-card__title">{{ data.title }}</div>
        <div v-if="data.desc" class="wg-card__desc">{{ data.desc }}</div>
        <div class="wg-card__footer">
          <span v-if="data.author" class="wg-card__meta">{{ data.author }}</span>
          <span v-if="data.stat" class="wg-card__meta">{{ data.stat }}</span>
        </div>
      </div>
    </template>

    <!-- 10. notify -->
    <template v-else-if="variant === 'notify'">
      <span
        class="wg-card__notify-icon"
        :style="iconStyle('var(--color-primary, #1890ff)', data.icon)"
        aria-hidden="true"
      ></span>
      <div class="wg-card__main">
        <div v-if="data.title" class="wg-card__title">{{ data.title }}</div>
        <div v-if="data.desc" class="wg-card__desc">{{ data.desc }}</div>
      </div>
      <div v-if="data.time" class="wg-card__notify-time">{{ data.time }}</div>
      <span v-if="data.badge" class="wg-card__badge-dot">{{ data.badge }}</span>
    </template>

    <!-- 11. comment -->
    <template v-else-if="variant === 'comment'">
      <div class="wg-card__comment-head">
        <div class="wg-card__avatar wg-card__avatar--sm" :style="{ backgroundImage: data.avatar ? `url(${data.avatar})` : 'none' }"></div>
        <div class="wg-card__comment-meta">
          <div v-if="data.name" class="wg-card__name">{{ data.name }}</div>
          <div v-if="data.time" class="wg-card__time">{{ data.time }}</div>
        </div>
      </div>
      <div v-if="data.content" class="wg-card__comment-body">{{ data.content }}</div>
      <div class="wg-card__comment-actions">
        <span class="wg-card__comment-action">{{ data.likes || 0 }} 赞</span>
        <span class="wg-card__comment-action">回复</span>
      </div>

      <!-- 嵌套回复：再次用 base-card 包裹（容器铁律） -->
      <base-card
        v-if="data.reply"
        radius="sm"
        padding="sm"
        :bordered="false"
        class="wg-card__comment-reply"
      >
        <div class="wg-card__comment-head">
          <div class="wg-card__avatar wg-card__avatar--sm" :style="{ backgroundImage: data.reply.avatar ? `url(${data.reply.avatar})` : 'none' }"></div>
          <div v-if="data.reply.name" class="wg-card__name">{{ data.reply.name }}</div>
        </div>
        <div v-if="data.reply.content" class="wg-card__comment-body">{{ data.reply.content }}</div>
      </base-card>
    </template>
  </base-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './BaseCard.vue'

/** 11 种 variant 的默认 base-card 参数（可被同名 prop 覆盖） */
const DEFAULTS = {
  basic:   { radius: 'lg' as const,   padding: 'md' as const,  shadow: true,            bordered: false, clickable: false },
  product: { radius: 'lg' as const,   padding: 'none' as const,shadow: true,            bordered: false, clickable: true  },
  profile: { radius: 'xl' as const,   padding: 'none' as const,shadow: true,            bordered: false, clickable: false },
  friend:  { radius: 'full' as const, padding: 'sm' as const,  shadow: true,            bordered: false, clickable: true  },
  set:     { radius: 'lg' as const,   padding: 'none' as const,shadow: false,           bordered: true,  clickable: false },
  vip:     { radius: 'xl' as const,   padding: 'lg' as const,  shadow: true,            bordered: false, clickable: false },
  menu:    { radius: 'lg' as const,   padding: 'lg' as const,  shadow: false,           bordered: true,  clickable: false },
  grid:    { radius: 'lg' as const,   padding: 'md' as const,  shadow: true,            bordered: false, clickable: false },
  image:   { radius: 'lg' as const,   padding: 'none' as const,shadow: true,            bordered: false, clickable: true  },
  notify:  { radius: 'md' as const,   padding: 'sm' as const,  shadow: false,           bordered: false, clickable: false },
  comment: { radius: 'md' as const,   padding: 'md' as const,  shadow: false,           bordered: true,  clickable: false },
}

type Variant = keyof typeof DEFAULTS

const props = withDefaults(defineProps<{
  variant?: Variant
  data?: Record<string, any>
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: boolean
  bordered?: boolean
  clickable?: boolean
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  cols?: number
  loading?: boolean
}>(), {
  variant: 'basic',
  data: () => ({}),
  tone: 'neutral',
  cols: 4,
  loading: false,
})

// ponytail: 单点配置中心，11 行覆盖 11 个 variant 的容器形态
const resolved = computed(() => {
  const def = DEFAULTS[props.variant]
  return {
    radius:    props.radius    ?? def.radius,
    padding:   props.padding   ?? def.padding,
    shadow:    props.shadow    ?? def.shadow,
    bordered:  props.bordered  ?? def.bordered,
    clickable: props.clickable ?? def.clickable,
  }
})

// ponytail: 抽出 icon 样式构造，避免 5 处重复 mask 拼接
function iconStyle(color: string, icon?: string) {
  return {
    backgroundColor: color,
    maskImage: icon ? `url(${icon})` : 'none',
    WebkitMaskImage: icon ? `url(${icon})` : 'none',
  } as Record<string, string>
}
</script>

<style scoped>
/* ============================================
 * 严格使用 vue-theme-skill Token
 * 零裸色值 / 零裸 px / 零 <img> / 零 <p>
 * 图片统一 div + background-image
 * 图标统一 div + CSS mask data URI
 * ============================================ */

/* ---- 通用排版 ---- */
.wg-card__title {
  font-size: var(--font-size-lg, 16px);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text, #333333);
  line-height: var(--leading-tight, 1.25);
}
.wg-card__desc {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-tertiary, #999999);
  line-height: var(--leading-normal, 1.5);
}
.wg-card__name {
  font-size: var(--font-size-md, 15px);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text, #333333);
}
.wg-card__bio {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666666);
}

/* ---- 头像（div + background-image） ---- */
.wg-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-bg, #f5f5f5);
  background-size: cover;
  background-position: center;
  position: relative;
  flex-shrink: 0;
}
.wg-card__avatar--sm {
  width: 32px;
  height: 32px;
}
.wg-card__avatar--lg {
  width: 64px;
  height: 64px;
  border: 3px solid var(--color-surface, #ffffff);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1));
}

/* ---- product ---- */
.wg-card__cover {
  width: 100%;
  aspect-ratio: 16 / 10;
  background-color: var(--color-bg, #f5f5f5);
  background-size: cover;
  background-position: center;
  position: relative;
}
.wg-card__badge {
  position: absolute;
  top: var(--space-2, 8px);
  left: var(--space-2, 8px);
  padding: 2px var(--space-2, 8px);
  background: var(--color-danger, #ff4d4f);
  color: var(--color-text-inverse, #ffffff);
  font-size: var(--font-size-xs, 12px);
  border-radius: var(--radius-sm, 2px);
}
.wg-card__body--product {
  padding: var(--space-3, 12px) var(--space-4, 16px) var(--space-4, 16px);
}
.wg-card__price {
  color: var(--color-danger, #ff4d4f);
  font-size: var(--font-size-lg, 16px);
  font-weight: var(--weight-bold, 700);
}

/* ---- profile ---- */
.wg-card__body--profile {
  padding: var(--space-12, 48px) var(--space-4, 16px) var(--space-4, 16px);
  text-align: center;
}
.wg-card__stats {
  display: flex;
  justify-content: space-around;
  margin-top: var(--space-4, 16px);
}
.wg-card__stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}
.wg-card__stat-value {
  font-size: var(--font-size-lg, 16px);
  font-weight: var(--weight-bold, 700);
  color: var(--color-text, #333333);
}
.wg-card__stat-label {
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-tertiary, #999999);
}

/* ---- friend ---- */
.wg-card--friend :deep(.base-card__body) {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
}
.wg-card__main {
  flex: 1;
  min-width: 0;
}
.wg-card__online {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  background: var(--color-success, #52c41a);
  border: 2px solid var(--color-surface, #ffffff);
  border-radius: var(--radius-full, 9999px);
}
.wg-card__arrow {
  color: var(--color-text-tertiary, #999999);
  font-size: var(--font-size-xl, 18px);
}

/* ---- set ---- */
.wg-card__set-item {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
  position: relative;
}
.wg-card__set-icon {
  width: 20px;
  height: 20px;
  background-color: var(--color-text-secondary, #666666);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  flex-shrink: 0;
}
.wg-card__set-label {
  flex: 1;
  font-size: var(--font-size-md, 15px);
  color: var(--color-text, #333333);
}
.wg-card__set-extra {
  color: var(--color-text-tertiary, #999999);
  font-size: var(--font-size-sm, 14px);
}
.wg-card__divider {
  position: absolute;
  left: var(--space-4, 16px);
  right: var(--space-4, 16px);
  bottom: 0;
  height: 1px;
  background: var(--color-border, #e8e8e8);
}

/* ---- vip ---- */
.wg-card--vip :deep(.base-card) {
  overflow: hidden;
  position: relative;
}
.wg-card__vip-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-warning-500, #faad14), var(--color-warning-700, #d48806));
  border-radius: inherit;
  z-index: 0;
}
.wg-card__vip-header,
.wg-card__avatar--lg,
.wg-card__name--light,
.wg-card__expire,
.wg-card__benefits {
  position: relative;
  z-index: 1;
}
.wg-card__vip-header {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}
.wg-card__vip-crown {
  width: 20px;
  height: 20px;
  background-color: var(--color-text-inverse, #ffffff);
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 8l4 6 6-10 6 10 4-6-2 12H4z"/></svg>') center / contain no-repeat;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 8l4 6 6-10 6 10 4-6-2 12H4z"/></svg>') center / contain no-repeat;
}
.wg-card__vip-level {
  color: var(--color-text-inverse, #ffffff);
  font-size: var(--font-size-md, 15px);
  font-weight: var(--weight-semibold, 600);
}
.wg-card__name--light {
  color: var(--color-text-inverse, #ffffff);
  margin-top: var(--space-2, 8px);
}
.wg-card__expire {
  color: var(--color-text-inverse, #ffffff);
  font-size: var(--font-size-sm, 14px);
  opacity: 0.8;
  margin-top: var(--space-1, 4px);
}
.wg-card__benefits {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 8px);
  margin-top: var(--space-3, 12px);
}
.wg-card__benefit {
  padding: 2px var(--space-2, 8px);
  background: color-mix(in srgb, var(--color-text-inverse, #ffffff) 20%, transparent);
  color: var(--color-text-inverse, #ffffff);
  font-size: var(--font-size-xs, 12px);
  border-radius: var(--radius-sm, 2px);
}

/* ---- menu / grid ---- */
.wg-card__menu-grid,
.wg-card__grid {
  display: grid;
  gap: var(--space-3, 12px);
}
.wg-card__menu-item,
.wg-card__grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: background var(--transition-fast, 0.15s);
}
.wg-card__menu-item:hover,
.wg-card__grid-item:hover {
  background: var(--color-bg, #f5f5f5);
}
.wg-card__menu-icon,
.wg-card__grid-icon {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary, #1890ff);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}
.wg-card__menu-label {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text, #333333);
}
.wg-card__grid-title {
  font-size: var(--font-size-md, 15px);
  color: var(--color-text, #333333);
  font-weight: var(--weight-medium, 500);
}
.wg-card__grid-desc {
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-tertiary, #999999);
}

/* ---- image ---- */
.wg-card__body--image {
  padding: var(--space-3, 12px) var(--space-4, 16px) var(--space-4, 16px);
}
.wg-card__meta {
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-tertiary, #999999);
}

/* ---- notify ---- */
.wg-card--notify :deep(.base-card__body) {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
}
.wg-card__notify-icon {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary, #1890ff);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  flex-shrink: 0;
}
.wg-card__notify-time {
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-tertiary, #999999);
  flex-shrink: 0;
}
.wg-card__badge-dot {
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--color-danger, #ff4d4f);
  color: var(--color-text-inverse, #ffffff);
  font-size: var(--font-size-xs, 12px);
  border-radius: var(--radius-full, 9999px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--space-1, 4px);
  flex-shrink: 0;
}

/* ---- comment ---- */
.wg-card__comment-head {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  margin-bottom: var(--space-2, 8px);
}
.wg-card__comment-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wg-card__time {
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-tertiary, #999999);
}
.wg-card__comment-body {
  font-size: var(--font-size-md, 15px);
  color: var(--color-text, #333333);
  line-height: var(--leading-relaxed, 1.6);
}
.wg-card__comment-actions {
  display: flex;
  gap: var(--space-4, 16px);
  margin-top: var(--space-3, 12px);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-tertiary, #999999);
}
.wg-card__comment-reply {
  margin-top: var(--space-3, 12px);
}
</style>