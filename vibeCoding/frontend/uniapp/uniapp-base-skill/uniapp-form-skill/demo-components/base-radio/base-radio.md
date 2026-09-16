# base-radio 单选框

> 通用单选组件，由 `base-card` 设计思想封装（与 `base-card` 同源：参数化外壳组件，包裹单选交互逻辑）。支持圆圈、打钩、标签、卡片、按钮组、列表式、芯片、图片等多种形态。

> 所有表单页面（设置、订单、支付、资料编辑）的单选都应使用本组件，避免样式碎片化。

> **容器原则**：所有涉及内容容器的组件，都必须使用 base-card 作为容器

## 形态总览

**13 种风格**，满足 90% 单选/开关场景：

### 基础单选（8 种）

| 风格 | 场景 | 类型值 | 特殊参数 |
|------|------|--------|----------|
| 标准圆圈 | 基础单选、列表选择 | `circle` | position: left/right |
| 打钩风格 | 配送方式、服务选择 | `check` | showIcon |
| 标签排列 | 筛选条件、状态切换 | `tag` | tagShape: pill/rounded/square |
| 卡片式 | 商品规格、套餐选择 | `card` | showPrice |
| 按钮组 | 支付方式、会员等级 | `button` | - |
| 列表式 | 设置项、个人资料 | `list` | showArrow |
| 芯片风格 | 圆润标签、筛选 | `chips` | variant: filter/single |
| 图片选项 | 头像选择、商品规格 | `image` | mode: avatar/image |

### 开关形态（5 种，通过 size 参数切换）

| 风格 | 场景 | 尺寸值 |
|------|------|--------|
| 标准胶囊 | 设置项、通知开关 | `normal` |
| 方形开关 | 简洁设置、工具类App | `square` |
| 图标按钮 | 功能开关、状态控制 | `icon` |
| 卡片开关 | 高级设置、带状态文字 | `card` |
| iOS风格 | 苹果风格开关 | `ios` |

## HTML 参考图

### 基础单选

| 风格 | HTML |
|------|------|
| 标准圆圈 | [radio-circle.html](html/radio-circle.html) |
| 打钩风格 | [radio-check.html](html/radio-check.html) |
| 标签排列 | [radio-tag.html](html/radio-tag.html) |
| 卡片式 | [radio-card.html](html/radio-card.html) |
| 按钮组 | [radio-button.html](html/radio-button.html) |
| 列表式 | [radio-list.html](html/radio-list.html) |
| 芯片风格 | [radio-chips.html](html/radio-chips.html) |
| 图片选项 | [radio-image.html](html/radio-image.html) |

### 开关形态

| 风格 | HTML |
|------|------|
| 标准胶囊 | [switch-standard.html](html/switch-standard.html) |
| 方形开关 | [switch-square.html](html/switch-square.html) |
| 图标按钮 | [switch-icon.html](html/switch-icon.html) |
| 卡片开关 | [switch-card.html](html/switch-card.html) |
| iOS风格 | [switch-ios.html](html/switch-ios.html) |

## 为什么需要这个组件？

单选是 App 高频交互场景，但实际开发中：
- 圆圈单选、打钩单选、标签单选各自实现，样式不统一
- 选中态、禁用态、描述文字各自处理
- 卡片式单选、按钮组单选重复开发
- 主题切换时单选样式难以同步

`base-radio` 把所有单选的共性收敛成一个组件，页面只关心选项数据。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` / `v-model` | any | - | 选中值（开关模式下为 boolean） |
| `options` | array | `[]` | 选项列表：`[{label, value, disabled, desc, image, color}]` |
| `type` | string | `'circle'` | 类型：circle / check / tag / card / button / list / chips / image |
| `position` | string | `'left'` | 圆圈位置：left / right（仅 circle 类型） |
| `tagShape` | string | `'pill'` | 标签形状：pill / rounded / square（仅 tag 类型） |
| `showPrice` | boolean | `false` | 是否显示价格（仅 card 类型） |
| `showArrow` | boolean | `false` | 是否显示箭头（仅 list 类型） |
| `showIcon` | boolean | `true` | 是否显示图标 |
| `mode` | string | `'avatar'` | 图片模式：avatar / image（仅 image 类型） |
| `variant` | string | `'single'` | 芯片变体：filter / single（仅 chips 类型） |
| `size` | string | `'normal'` | 尺寸（开关模式）：normal / large / small |
| `shape` | string | `'normal'` | 形状（开关模式）：normal / square |
| `color` | string | `'success'` | 开启颜色 |
| `disabled` | boolean | `false` | 是否禁用 |
| `label` | string | - | 左侧标签（开关模式） |
| `desc` | string | - | 描述文字（开关模式） |

## Events

| Event | 说明 |
|-------|------|
| `update:modelValue` | 选中值变化 |
| `change` | 选中变化时触发 |

## 使用示例

```vue
<template>
  <!-- 列表式单选：设置页场景 -->
  <base-card radius="var(--radius-md)" padding="0">
    <base-radio
      v-model="gender"
      type="list"
      showArrow
      :options="[
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]"
    />
  </base-card>

  <!-- 卡片式单选：套餐选择场景 -->
  <base-card radius="var(--radius-lg)" padding="var(--space-4)">
    <base-radio
      v-model="package"
      type="card"
      showPrice
      :options="[
        { label: '月卡', value: 'month', desc: '适合日常使用' },
        { label: '年卡', value: 'year', desc: '立省60元' }
      ]"
    />
  </base-card>

  <!-- 开关：设置页场景 -->
  <base-card radius="var(--radius-md)" padding="var(--space-3)">
    <base-radio
      v-model="notifications"
      :options="[
        { label: '接收推送通知', value: true, desc: '开启后接收最新消息推送' }
      ]"
      size="normal"
    />
  </base-card>

  <!-- 按钮组单选：支付方式 -->
  <base-card radius="var(--radius-md)" padding="var(--space-4)">
    <view style="font-size:14px;color:#666;margin-bottom:12px;">支付方式</view>
    <base-radio
      v-model="payment"
      type="button"
      :options="[
        { label: '微信', value: 'wechat' },
        { label: '支付宝', value: 'alipay' },
        { label: '银行卡', value: 'card' }
      ]"
    />
  </base-card>
</template>
```

### 标准圆圈（左侧）

```vue
<base-radio
  v-model="gender"
  :options="[
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
  ]"
  position="left"
/>
```

### 标准圆圈（右侧）

```vue
<base-radio
  v-model="gender"
  :options="[
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
  ]"
  position="right"
/>
```

### 打钩风格（带描述）

```vue
<base-radio
  v-model="delivery"
  type="check"
  :options="[
    { label: '标准配送', value: 'normal', desc: '3-5天送达' },
    { label: '加急配送', value: 'fast', desc: '当天送达' }
  ]"
/>
```

### 标签排列

```vue
<base-radio
  v-model="sort"
  type="tag"
  tagShape="pill"
  :options="[
    { label: '综合', value: 'default' },
    { label: '销量', value: 'sales' },
    { label: '价格', value: 'price' }
  ]"
/>
```

### 卡片式（带价格）

```vue
<base-radio
  v-model="package"
  type="card"
  showPrice
  :options="[
    { label: '月卡', value: 'month', desc: '¥30/月' },
    { label: '年卡', value: 'year', desc: '¥300/年' }
  ]"
/>
```

### 列表式（带箭头）

```vue
<base-radio
  v-model="shipping"
  type="list"
  showArrow
  :options="[
    { label: '顺丰快递', value: 'sf', desc: '时效最快' },
    { label: '圆通快递', value: 'yt', desc: '价格实惠' }
  ]"
/>
```

### 图片选项（头像）

```vue
<base-radio
  v-model="avatar"
  type="image"
  mode="avatar"
  :options="[
    { label: '头像1', value: '1', image: '/images/avatar1.jpg' },
    { label: '头像2', value: '2', image: '/images/avatar2.jpg' }
  ]"
/>
```

### 芯片风格

```vue
<base-radio
  v-model="skill"
  type="chips"
  variant="single"
  :options="[
    { label: '前端开发', value: 'fe' },
    { label: '后端开发', value: 'be' },
    { label: '移动端', value: 'mobile' }
  ]"
/>
```

### 开关（标准胶囊）

```vue
<base-radio
  v-model="notifications"
  :options="[
    { label: '接收推送通知', value: true, desc: '开启后接收最新消息推送' }
  ]"
  size="normal"
/>
```

## 主题变量

| 变量 | 用途 |
|------|------|
| `var(--color-primary)` | 选中态颜色 |
| `var(--color-primary-light)` | 选中态背景 |
| `var(--color-bg-surface)` | 选项背景 |
| `var(--color-border)` | 边框 |
| `var(--radius-md)` | 圆角 |

## 触发词

```markdown
# 基础单选
/uniapp-base-skill 做一个单选
/uniapp-base-skill 做一个圆圈单选
/uniapp-base-skill 做一个打钩单选

# 筛选/标签
/uniapp-base-skill 做一个标签单选
/uniapp-base-skill 做一个芯片单选

# 卡片/按钮
/uniapp-base-skill 做一个卡片单选
/uniapp-base-skill 做一个按钮组单选
/uniapp-base-skill 做一个列表单选

# 特殊形态
/uniapp-base-skill 做一个图片选项单选

# 开关形态（通过 size 参数）
/uniapp-base-skill 做一个开关
/uniapp-base-skill 做一个胶囊开关
/uniapp-base-skill 做一个方正开关
/uniapp-base-skill 做一个图标开关
/uniapp-base-skill 做一个卡片开关
/uniapp-base-skill 做一个iOS风格开关
```

## 演示

[查看 HTML 演示](html/radio-circle.html)
