# base-wg-card 业务卡片组件

> **定位**：本期 card 组件——业务卡片（business card）。**与根容器 [base-card](../../base-card.md) 严格区分**：
>
> | 组件 | 角色 | 层级 |
> |------|------|------|
> | `base-card` | 根容器（6 维度参数矩阵） | L0 — 容器基底 |
> | `base-wg-card` | 业务卡片（11 种 variant） | L1 — 业务组装 |
>
> **铁律**：`base-wg-card` **必须**内部包裹 `<base-card>`，禁止脱离容器单独存在。
>
> **零样式标签铁律**：模板内仅使用 `<div>` / `<span>`，禁止 `<p>` `<h*>` `<button>` `<table>` `<input>` `<select>` `<form>` `<label>` `<fieldset>` `<option>` `<img>` `<strong>` `<em>` 等带默认样式的标签。图片一律用 `<div>` + `background-image`（或 SVG mask data URI）实现。

## 11 种 variant 速查

| # | variant | 用途 | 默认 base-card 参数 |
|---|---------|------|---------------------|
| 1 | `basic` | 基础容器卡片 | `radius=lg padding=md shadow=sm` |
| 2 | `product` | 商品卡片 | `radius=lg padding=none clickable shadow=sm` |
| 3 | `profile` | 个人中心卡片 | `radius=xl padding=none shadow=md` |
| 4 | `friend` | 好友卡片 | `radius=full padding=sm clickable` |
| 5 | `set` | 设置项卡片 | `radius=lg padding=none bordered` |
| 6 | `vip` | VIP 卡片 | `radius=xl padding=lg shadow=lg tone=warning` |
| 7 | `menu` | 九宫格菜单 | `radius=lg padding=lg bordered` |
| 8 | `grid` | 功能网格 | `radius=lg padding=md` |
| 9 | `image` | 图片流卡片 | `radius=lg padding=none clickable shadow=sm` |
| 10 | `notify` | 通知卡片 | `radius=md padding=sm tone=primary` |
| 11 | `comment` | 评论卡片 | `radius=md padding=md bordered` |

## Props（顶层）

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `variant` | `'basic' \| 'product' \| 'profile' \| 'friend' \| 'set' \| 'vip' \| 'menu' \| 'grid' \| 'image' \| 'notify' \| 'comment'` | `'basic'` | 卡片变体 |
| `data` | `object` | `{}` | 业务数据（按 variant 形状不同） |
| `radius` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | 见上表 | 覆盖默认圆角 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | 见上表 | 覆盖默认内边距 |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg'` | 见上表 | 覆盖默认阴影 |
| `bordered` | `boolean` | 见上表 | 覆盖默认边框 |
| `clickable` | `boolean` | 见上表 | 覆盖默认可点击 |
| `tone` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | 色调（联动强调条） |
| `cols` | `number` | `4` | grid/menu 列数（2/3/4/6） |
| `loading` | `boolean` | `false` | 加载态（透传 base-card） |

## Slots（按 variant 分组）

| Slot | 适用 variant | 说明 |
|------|--------------|------|
| `default` | all | 卡片主体（覆盖 variant 默认渲染） |
| `header-right` | basic/product | 头部右侧操作区 |
| `footer` | basic/product/comment | 底部操作 / 分页 |
| `actions` | product/image/notify | 行内操作按钮组 |

## 代码

```vue
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
    role="region"
  >
    <!-- 1. basic -->
    <template v-if="variant === 'basic'">
      <div class="wg-card__title">{{ data.title }}</div>
      <div v-if="data.desc" class="wg-card__desc">{{ data.desc }}</div>
      <div class="wg-card__body"><slot /></div>
      <template #header-right>
        <slot name="header-right" />
      </template>
    </template>

    <!-- 2. product -->
    <template v-else-if="variant === 'product'">
      <div class="wg-card__cover" :style="{ backgroundImage: `url(${data.cover})` }">
        <span v-if="data.badge" class="wg-card__badge">{{ data.badge }}</span>
      </div>
      <div class="wg-card__body wg-card__body--product">
        <div class="wg-card__title">{{ data.title }}</div>
        <div v-if="data.desc" class="wg-card__desc">{{ data.desc }}</div>
        <div class="wg-card__footer">
          <span class="wg-card__price">{{ data.price }}</span>
          <slot name="actions" />
        </div>
      </div>
    </template>

    <!-- 3. profile -->
    <template v-else-if="variant === 'profile'">
      <div class="wg-card__cover" :style="{ backgroundImage: `url(${data.cover})` }"></div>
      <div class="wg-card__avatar" :style="{ backgroundImage: `url(${data.avatar})` }"></div>
      <div class="wg-card__body wg-card__body--profile">
        <div class="wg-card__name">{{ data.name }}</div>
        <div v-if="data.bio" class="wg-card__bio">{{ data.bio }}</div>
        <div class="wg-card__stats">
          <div v-for="s in data.stats" :key="s.label" class="wg-card__stat">
            <span class="wg-card__stat-value">{{ s.value }}</span>
            <span class="wg-card__stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 4. friend -->
    <template v-else-if="variant === 'friend'">
      <div class="wg-card__avatar" :style="{ backgroundImage: `url(${data.avatar})` }">
        <span v-if="data.online" class="wg-card__online"></span>
      </div>
      <div class="wg-card__main">
        <div class="wg-card__name">{{ data.name }}</div>
        <div v-if="data.bio" class="wg-card__bio">{{ data.bio }}</div>
      </div>
      <span class="wg-card__arrow">›</span>
    </template>

    <!-- 5. set -->
    <template v-else-if="variant === 'set'">
      <div
        v-for="(item, idx) in data.items"
        :key="item.key"
        class="wg-card__set-item"
      >
        <span
          class="wg-card__set-icon"
          :style="{
            backgroundColor: item.color || 'var(--color-bg)',
            maskImage: `url(${item.icon})`,
            WebkitMaskImage: `url(${item.icon})`
          }"
        ></span>
        <div class="wg-card__set-label">{{ item.label }}</div>
        <div class="wg-card__set-extra">
          <slot :name="`set-${item.key}`" />
        </div>
        <div v-if="idx < data.items.length - 1" class="wg-card__divider"></div>
      </div>
    </template>

    <!-- 6. vip -->
    <template v-else-if="variant === 'vip'">
      <div class="wg-card__vip-bg"></div>
      <div class="wg-card__vip-header">
        <span class="wg-card__vip-crown"></span>
        <div class="wg-card__vip-level">{{ data.level }}</div>
      </div>
      <div class="wg-card__avatar wg-card__avatar--lg" :style="{ backgroundImage: `url(${data.avatar})` }"></div>
      <div class="wg-card__name wg-card__name--light">{{ data.name }}</div>
      <div class="wg-card__expire">{{ data.expire }}</div>
      <div class="wg-card__benefits">
        <span v-for="b in data.benefits" :key="b" class="wg-card__benefit">{{ b }}</span>
      </div>
    </template>

    <!-- 7. menu -->
    <template v-else-if="variant === 'menu'">
      <div class="wg-card__menu-grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
        <div v-for="item in data.items" :key="item.key" class="wg-card__menu-item">
          <span
            class="wg-card__menu-icon"
            :style="{
              backgroundColor: item.color || 'var(--color-primary)',
              maskImage: `url(${item.icon})`,
              WebkitMaskImage: `url(${item.icon})`
            }"
          ></span>
          <div class="wg-card__menu-label">{{ item.label }}</div>
        </div>
      </div>
    </template>

    <!-- 8. grid -->
    <template v-else-if="variant === 'grid'">
      <div class="wg-card__grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
        <div v-for="item in data.items" :key="item.key" class="wg-card__grid-item">
          <span
            class="wg-card__grid-icon"
            :style="{
              backgroundColor: item.color || 'var(--color-primary)',
              maskImage: `url(${item.icon})`,
              WebkitMaskImage: `url(${item.icon})`
            }"
          ></span>
          <div class="wg-card__grid-title">{{ item.title }}</div>
          <div v-if="item.desc" class="wg-card__grid-desc">{{ item.desc }}</div>
        </div>
      </div>
    </template>

    <!-- 9. image -->
    <template v-else-if="variant === 'image'">
      <div class="wg-card__cover" :style="{ backgroundImage: `url(${data.cover})` }"></div>
      <div class="wg-card__body wg-card__body--image">
        <div class="wg-card__title">{{ data.title }}</div>
        <div v-if="data.desc" class="wg-card__desc">{{ data.desc }}</div>
        <div class="wg-card__footer">
          <span class="wg-card__meta">{{ data.author }}</span>
          <span class="wg-card__meta">{{ data.stat }}</span>
        </div>
      </div>
    </template>

    <!-- 10. notify -->
    <template v-else-if="variant === 'notify'">
      <span
        class="wg-card__notify-icon"
        :style="{
          backgroundColor: 'var(--color-primary)',
          maskImage: `url(${data.icon})`,
          WebkitMaskImage: `url(${data.icon})`
        }"
      ></span>
      <div class="wg-card__main">
        <div class="wg-card__title">{{ data.title }}</div>
        <div v-if="data.desc" class="wg-card__desc">{{ data.desc }}</div>
      </div>
      <div class="wg-card__notify-time">{{ data.time }}</div>
      <span v-if="data.badge" class="wg-card__badge-dot">{{ data.badge }}</span>
    </template>

    <!-- 11. comment -->
    <template v-else-if="variant === 'comment'">
      <div class="wg-card__comment-head">
        <div class="wg-card__avatar wg-card__avatar--sm" :style="{ backgroundImage: `url(${data.avatar})` }"></div>
        <div class="wg-card__comment-meta">
          <div class="wg-card__name">{{ data.name }}</div>
          <div class="wg-card__time">{{ data.time }}</div>
        </div>
      </div>
      <div class="wg-card__comment-body">{{ data.content }}</div>
      <div class="wg-card__comment-actions">
        <span class="wg-card__comment-action">{{ data.likes }} 赞</span>
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
          <div class="wg-card__avatar wg-card__avatar--sm" :style="{ backgroundImage: `url(${data.reply.avatar})` }"></div>
          <div class="wg-card__name">{{ data.reply.name }}</div>
        </div>
        <div class="wg-card__comment-body">{{ data.reply.content }}</div>
      </base-card>
    </template>
  </base-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './base-card.vue'

/** 11 种 variant 的默认 base-card 参数（可被同名 prop 覆盖） */
const DEFAULTS = {
  basic:   { radius: 'lg',   padding: 'md',  shadow: 'sm',   bordered: false, clickable: false },
  product: { radius: 'lg',   padding: 'none',shadow: 'sm',   bordered: false, clickable: true  },
  profile: { radius: 'xl',   padding: 'none',shadow: 'md',   bordered: false, clickable: false },
  friend:  { radius: 'full', padding: 'sm',  shadow: 'sm',   bordered: false, clickable: true  },
  set:     { radius: 'lg',   padding: 'none',shadow: 'none', bordered: true,  clickable: false },
  vip:     { radius: 'xl',   padding: 'lg',  shadow: 'lg',   bordered: false, clickable: false },
  menu:    { radius: 'lg',   padding: 'lg',  shadow: 'none', bordered: true,  clickable: false },
  grid:    { radius: 'lg',   padding: 'md',  shadow: 'sm',   bordered: false, clickable: false },
  image:   { radius: 'lg',   padding: 'none',shadow: 'sm',   bordered: false, clickable: true  },
  notify:  { radius: 'md',   padding: 'sm',  shadow: 'none', bordered: false, clickable: false },
  comment: { radius: 'md',   padding: 'md',  shadow: 'none', bordered: true,  clickable: false },
} as const

type Variant = keyof typeof DEFAULTS

const props = withDefaults(defineProps<{
  variant?: Variant
  data?: Record<string, any>
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
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

/** ponytail: 单点配置中心，11 行覆盖 11 个 variant 的容器形态 */
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
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  line-height: var(--leading-tight);
}
.wg-card__desc {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
  line-height: var(--leading-normal);
}
.wg-card__name {
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}
.wg-card__bio {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

/* ---- 头像（div + background-image） ---- */
.wg-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg);
  background-size: cover;
  background-position: center;
  position: relative;
  flex-shrink: 0;
}
.wg-card__avatar--sm { width: 32px; height: 32px; }
.wg-card__avatar--lg { width: 64px; height: 64px; border: 3px solid var(--color-surface); box-shadow: var(--shadow-md); }

/* ---- product ---- */
.wg-card__cover {
  width: 100%;
  aspect-ratio: 16 / 10;
  background-color: var(--color-bg);
  background-size: cover;
  background-position: center;
  position: relative;
}
.wg-card__badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  padding: 2px var(--space-2);
  background: var(--color-danger);
  color: var(--color-text-inverse);
  font-size: var(--font-2xs);
  border-radius: var(--radius-sm);
}
.wg-card__body--product { padding: var(--space-3) var(--space-4) var(--space-4); }
.wg-card__price { color: var(--color-danger); font-size: var(--font-lg); font-weight: var(--weight-bold); }

/* ---- profile ---- */
.wg-card__body--profile { padding: var(--space-12) var(--space-4) var(--space-4); text-align: center; }
.wg-card__stats { display: flex; justify-content: space-around; margin-top: var(--space-4); }
.wg-card__stat { display: flex; flex-direction: column; gap: var(--space-1); }
.wg-card__stat-value { font-size: var(--font-lg); font-weight: var(--weight-bold); color: var(--color-text); }
.wg-card__stat-label { font-size: var(--font-xs); color: var(--color-text-tertiary); }

/* ---- friend ---- */
.wg-card__main { flex: 1; min-width: 0; }
.wg-card__online {
  position: absolute; right: 0; bottom: 0;
  width: 10px; height: 10px;
  background: var(--color-success);
  border: 2px solid var(--color-surface);
  border-radius: var(--radius-full);
}
.wg-card__arrow { color: var(--color-text-tertiary); font-size: var(--font-xl); }

/* ---- set ---- */
.wg-card__set-item {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  position: relative;
}
.wg-card__set-icon {
  width: 20px; height: 20px;
  background-color: var(--color-text-secondary);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  flex-shrink: 0;
}
.wg-card__set-label { flex: 1; font-size: var(--font-md); color: var(--color-text); }
.wg-card__set-extra { color: var(--color-text-tertiary); font-size: var(--font-sm); }
.wg-card__divider { position: absolute; left: var(--space-4); right: var(--space-4); bottom: 0; height: 1px; background: var(--color-border); }

/* ---- vip ---- */
.wg-card__vip-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--color-warning-500), var(--color-warning-700));
  border-radius: inherit;
  z-index: 0;
}
.wg-card__vip-header, .wg-card__avatar--lg, .wg-card__name--light, .wg-card__expire, .wg-card__benefits { position: relative; z-index: 1; }
.wg-card__vip-header { display: flex; align-items: center; gap: var(--space-2); }
.wg-card__vip-crown {
  width: 20px; height: 20px;
  background-color: var(--color-text-inverse);
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 8l4 6 6-10 6 10 4-6-2 12H4z"/></svg>') center / contain no-repeat;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 8l4 6 6-10 6 10 4-6-2 12H4z"/></svg>') center / contain no-repeat;
}
.wg-card__vip-level { color: var(--color-text-inverse); font-size: var(--font-md); font-weight: var(--weight-semibold); }
.wg-card__name--light { color: var(--color-text-inverse); margin-top: var(--space-2); }
.wg-card__expire { color: var(--color-text-inverse); font-size: var(--font-sm); opacity: 0.8; margin-top: var(--space-1); }
.wg-card__benefits { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-3); }
.wg-card__benefit {
  padding: 2px var(--space-2);
  background: color-mix(in srgb, var(--color-text-inverse) 20%, transparent);
  color: var(--color-text-inverse);
  font-size: var(--font-xs);
  border-radius: var(--radius-sm);
}

/* ---- menu / grid ---- */
.wg-card__menu-grid, .wg-card__grid {
  display: grid;
  gap: var(--space-3);
}
.wg-card__menu-item, .wg-card__grid-item {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.15s;
}
.wg-card__menu-item:hover, .wg-card__grid-item:hover { background: var(--color-bg); }
.wg-card__menu-icon, .wg-card__grid-icon {
  width: 32px; height: 32px;
  background-color: var(--color-primary);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}
.wg-card__menu-label { font-size: var(--font-sm); color: var(--color-text); }
.wg-card__grid-title { font-size: var(--font-md); color: var(--color-text); font-weight: var(--weight-medium); }
.wg-card__grid-desc { font-size: var(--font-xs); color: var(--color-text-tertiary); }

/* ---- image ---- */
.wg-card__body--image { padding: var(--space-3) var(--space-4) var(--space-4); }

/* ---- notify ---- */
.wg-card__notify-icon {
  width: 32px; height: 32px;
  background-color: var(--color-primary);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  flex-shrink: 0;
}
.wg-card__notify-time { font-size: var(--font-xs); color: var(--color-text-tertiary); flex-shrink: 0; }
.wg-card__badge-dot {
  min-width: 18px; height: 18px; padding: 0 4px;
  background: var(--color-danger); color: var(--color-text-inverse);
  font-size: var(--font-2xs);
  border-radius: var(--radius-full);
  display: inline-flex; align-items: center; justify-content: center;
  margin-left: var(--space-1);
}

/* ---- comment ---- */
.wg-card__comment-head { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
.wg-card__comment-meta { display: flex; flex-direction: column; gap: 2px; }
.wg-card__time { font-size: var(--font-xs); color: var(--color-text-tertiary); }
.wg-card__comment-body { font-size: var(--font-md); color: var(--color-text); line-height: var(--leading-relaxed); }
.wg-card__comment-actions { display: flex; gap: var(--space-4); margin-top: var(--space-3); font-size: var(--font-sm); color: var(--color-text-tertiary); }
.wg-card__comment-reply { margin-top: var(--space-3); }
</style>
```

## 使用示例

### 1. basic（基础卡片）

```vue
<base-wg-card
  variant="basic"
  :data="{ title: '账户安全', desc: '管理密码与登录方式' }"
>
  <div>这里是卡片正文</div>
  <template #header-right>
    <base-button type="primary" size="sm">编辑</base-button>
  </template>
</base-wg-card>
```

### 2. product（商品卡片）

```vue
<base-wg-card
  variant="product"
  :data="{
    cover: 'https://api.dicebear.com/9.x/shapes/svg?seed=product-1&backgroundColor=b6e3f4',
    badge: '新品',
    title: '商品名',
    desc: '一句话描述',
    price: '¥ 99'
  }"
>
  <template #actions>
    <base-button type="primary" size="sm">购买</base-button>
  </template>
</base-wg-card>
```

### 3. profile（个人中心卡片）

```vue
<base-wg-card
  variant="profile"
  :data="{
    cover: 'https://api.dicebear.com/9.x/shapes/svg?seed=cover-1&backgroundColor=ffd5dc',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=user-1&backgroundColor=ffdfbf',
    name: '昵称',
    bio: '签名一句话',
    stats: [
      { value: 128, label: '关注' },
      { value: '1.2k', label: '粉丝' },
      { value: 56, label: '获赞' }
    ]
  }"
/>
```

### 4. friend（好友卡片）

```vue
<base-wg-card
  variant="friend"
  :data="{
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=friend-1&backgroundColor=c0aede',
    name: '昵称',
    bio: '最后消息...',
    online: true
  }"
/>
```

### 5. set（设置项卡片）

```vue
<base-wg-card
  variant="set"
  :data="{
    items: [
      { key: 'push',   label: '消息推送', icon: 'data:image/svg+xml;utf8,<svg ...>', color: 'var(--color-primary)' },
      { key: 'dark',   label: '深色模式', icon: 'data:image/svg+xml;utf8,<svg ...>', color: 'var(--color-text-secondary)' }
    ]
  }"
>
  <template #set-push><base-switch v-model="enabled" /></template>
  <template #set-dark><base-switch v-model="darkMode" /></template>
</base-wg-card>
```

### 6. vip（VIP 卡片）

```vue
<base-wg-card
  variant="vip"
  :data="{
    level: '钻石会员',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=vip-1&backgroundColor=ffd5dc',
    name: 'VIP 用户名',
    expire: '有效期至 2027-12-31',
    benefits: ['专属客服', '折扣特权', '优先发货']
  }"
/>
```

### 7. menu（九宫格菜单）

```vue
<base-wg-card
  variant="menu"
  :cols="3"
  :data="{
    items: [
      { key: 'a', label: '订单',  icon: 'data:image/svg+xml;utf8,<svg ...>' },
      { key: 'b', label: '收藏',  icon: 'data:image/svg+xml;utf8,<svg ...>' },
      { key: 'c', label: '钱包',  icon: 'data:image/svg+xml;utf8,<svg ...>' }
    ]
  }"
/>
```

### 8. grid（功能网格）

```vue
<base-wg-card
  variant="grid"
  :cols="4"
  :data="{
    items: [
      { key: 'a', title: '应用中心', desc: '12 个应用', icon: 'data:image/svg+xml;utf8,<svg ...>' },
      { key: 'b', title: '数据中心', desc: '实时统计', icon: 'data:image/svg+xml;utf8,<svg ...>' }
    ]
  }"
/>
```

### 9. image（图片流卡片）

```vue
<base-wg-card
  variant="image"
  :data="{
    cover: 'https://api.dicebear.com/9.x/shapes/svg?seed=img-1&backgroundColor=b6e3f4',
    title: '小红书风格标题',
    desc: '简短描述...',
    author: '@昵称',
    stat: '1.2k likes · 56 comments'
  }"
/>
```

### 10. notify（通知卡片）

```vue
<base-wg-card
  variant="notify"
  tone="primary"
  :data="{
    icon: 'data:image/svg+xml;utf8,<svg ...>',
    title: '系统升级通知',
    desc: '本次升级新增了 X 3 个功能...',
    time: '5 分钟前',
    badge: '3'
  }"
/>
```

### 11. comment（评论卡片）

```vue
<base-wg-card
  variant="comment"
  :data="{
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=cmt-1&backgroundColor=c0aede',
    name: '昵称',
    time: '2 小时前',
    content: '评论内容...',
    likes: 128,
    reply: {
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=cmt-2&backgroundColor=b6e3f4',
      name: '回复者昵称',
      content: '回复内容...'
    }
  }"
/>
```

## 参数矩阵总览

| variant | radius | padding | shadow | bordered | clickable |
|---------|--------|---------|--------|----------|-----------|
| basic   | lg     | md      | sm     | -        | -         |
| product | lg     | none    | sm     | -        | ✓         |
| profile | xl     | none    | md     | -        | -         |
| friend  | full   | sm      | sm     | -        | ✓         |
| set     | lg     | none    | -      | ✓        | -         |
| vip     | xl     | lg      | lg     | -        | -         |
| menu    | lg     | lg      | -      | ✓        | -         |
| grid    | lg     | md      | sm     | -        | -         |
| image   | lg     | none    | sm     | -        | ✓         |
| notify  | md     | sm      | -      | -        | -         |
| comment | md     | md      | -      | ✓        | -         |

## 红线

- ❌ **禁止脱离 base-card**：base-wg-card 必须内部包裹 base-card，否则破坏容器原则
- ❌ **禁止使用 `<p>` `<h*>` `<button>` `<table>` `<input>` `<select>` `<form>` `<img>` `<strong>` `<em>` 等带默认样式的标签**
- ❌ **禁止在 .md 实现代码中使用裸 emoji**（业务 SVG 图标走 CSS mask）
- ❌ **禁止硬编码颜色 / 间距 / 字号 / 圆角 / 阴影值**（必须 Token）
- ❌ **禁止混入 Element Plus / 任何第三方 UI 库的卡片组件**
- ❌ **禁止 11 种 variant 之外的私有变体**（必须扩展 base-wg-card 而不是另起组件）

## 关联

- [base-card.md](../../base-card.md) — 根容器规格（6 维度参数，必读）
- [SKILL.md](SKILL.md) — 父技能入口
- [vue-theme-skill](../../vue-theme-skill/) — Token 唯一来源
- [vue-style-skill](../../vue-style-skill/) — 通用样式规范
- [vue-button-skill](../../vue-button-skill/base-button.md) — 内嵌按钮
- [vue-tag-skill](../../vue-tag-skill/base-tag.md) — 内嵌标签
- [vue-switch-skill](../../vue-switch-skill/base-switch.md) — set 卡片内嵌开关
