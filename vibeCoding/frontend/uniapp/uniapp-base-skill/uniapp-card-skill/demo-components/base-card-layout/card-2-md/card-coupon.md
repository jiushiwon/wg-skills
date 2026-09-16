# card-coupon 优惠券卡片

> 异形满减券卡片，左侧金额 + 中间虚线分隔 + 右侧使用按钮，支持多种状态（未使用 / 已使用 / 已过期）。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | `var(--radius-md)` |
| 背景 | 渐变色（橙 / 紫等可配置） |
| 阴影 | 颜色匹配的光晕阴影 |
| 异形 | 左右两侧半圆缺口 + 中间虚线 |
| 高度 | ≥ 96 px |

## 适用场景

- 我的优惠券列表
- 领券中心、营销活动
- 支付结算页满减提示

## HTML 演示

[card-coupon.html](../card-2-html/card-coupon.html)

## 组件代码

```vue
<base-card :radius="'var(--radius-md)'" :padding="0">
  <view
    v-for="item in couponList"
    :key="item.id"
    class="coupon-item"
    :class="`coupon-${item.variant}`"
  >
    <view class="coupon-amount">
      <text class="coupon-currency">{{ item.currency || '¥' }}</text>
      <text class="coupon-value">{{ item.value }}</text>
      <text class="coupon-condition">满 {{ item.minSpend }} 可用</text>
    </view>

    <view class="coupon-divider"></view>

    <view class="coupon-body">
      <text class="coupon-title">{{ item.title }}</text>
      <text class="coupon-scope">{{ item.scope }}</text>
      <text class="coupon-time">有效期至 {{ item.expireAt }}</text>
    </view>

    <view class="coupon-action">
      <view
        class="coupon-btn"
        :class="{ disabled: item.status !== 'unused' }"
        @click="onUse(item)"
      >
        {{ statusText[item.status] }}
      </view>
      <text class="coupon-tag">{{ item.variant === 'vip' ? 'VIP' : '' }}</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | number | - | 优惠金额 |
| currency | string | '¥' | 货币符号 |
| minSpend | number | - | 使用门槛 |
| title | string | - | 券名称 |
| scope | string | - | 使用范围 |
| expireAt | string | - | 过期时间 |
| status | 'unused' \| 'used' \| 'expired' | 'unused' | 券状态 |
| variant | 'default' \| 'vip' | 'default' | 配色变体 |

## 变体参考

- 默认橙 → `card-coupon`（variant: 'default'）
- VIP 紫 → `card-coupon`（variant: 'vip'）
- 折扣券（7.5 折）→ `currency: ''`，`value: 7.5`，单位"折"
- 已使用 → `status: 'used'`（按钮置灰"已使用"）
- 已过期 → `status: 'expired'`（按钮置灰"已过期"）

## 设计要点

- **异形**：使用 `::before` / `::after` 伪元素 + 中间 `coupon-divider` 虚线营造撕券感
- **配色**：背景渐变 + 阴影色匹配（视觉一体感）
- **状态**：通过 `status` 控制按钮可用性，无需额外样式判断