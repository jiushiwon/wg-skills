# card-button 按钮卡片

> 按钮组合卡片，支持背景色、尺寸、圆角、图标、全宽、固定底部悬浮等配置。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 0 / 4px / 8px / 12px / 20px |
| 背景 | 根据 type 属性 |
| 高度 | 24px / 32px / 40px / 48px |
| 位置 | 固定底部（可选） |

## 适用场景

- 操作按钮组
- 表单提交按钮
- 行动号召（CTA）
- 固定底部悬浮按钮

## HTML 演示

[card-button.html](html/card-button.html)

## 组件代码

```vue
<!-- 普通按钮组 -->
<base-card :radius="'var(--radius-md)'" :shadow="'shadow-sm'">
  <view class="btn-group">
    <button 
      class="btn" 
      :class="[type, size, radiusClass, { 'btn-block': block }]"
      :disabled="disabled"
    >
      <image v-if="icon" :src="icon" class="btn-icon" />
      <text>{{ text }}</text>
    </button>
  </view>
</base-card>

<!-- 固定底部悬浮 -->
<view class="fixed-bottom">
  <view class="fixed-bottom-inner">
    <button class="btn btn-default">取消</button>
    <button class="btn btn-primary">确定</button>
  </view>
</view>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | 'primary' | 背景色 primary/secondary/default/danger/warning |
| size | string | 'md' | 尺寸 xs/sm/md/lg |
| radius | string | 'md' | 圆角 0/4px/8px/12px/20px |
| icon | string | - | 图标地址 |
| iconPosition | string | 'left' | 图标位置 left/right |
| iconOnly | boolean | false | 仅图标按钮 |
| block | boolean | false | 全宽按钮 |
| fixed | boolean | false | 固定底部悬浮 |
| position | string | 'bottom' | 固定位置 bottom/top |
| disabled | boolean | false | 禁用状态 |
| status | string | 'default' | 状态 default/disabled/loading |
| text | string | - | 按钮文字 |

## 按钮类型对照

| 类型 | 背景色 | 适用场景 |
|------|--------|----------|
| primary | #07c160 | 主要操作、提交 |
| secondary | #ff7a45 | 次要操作 |
| default | #fff | 普通按钮 |
| danger | #ff4d4f | 危险操作、删除 |
| warning | #ff9500 | 警告、提醒 |

## 固定底部悬浮

适用于商品详情页、订单确认页等场景。

### 默认参数
- 全宽度：`left: 0; right: 0`
- 内部容器 padding：`16px`
- 按钮弧度：`border-radius: 22px`
- 按钮高度：`44px`

```vue
<view class="fixed-bottom">
  <view class="fixed-bottom-inner">
    <button class="btn btn-default">取消</button>
    <button class="btn btn-primary">确定</button>
  </view>
</view>

<style>
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
}
.fixed-bottom-inner {
  width: 100%;
  padding: var(--spacing-lg);
  display: flex;
  gap: 12px;
}
.fixed-bottom-inner .btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
}
</style>
```

### Props 扩展

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| fixed | boolean | false | 启用固定底部 |
| fixedPosition | string | 'bottom' | 固定位置 bottom/top |
| fixedPadding | string | 'var(--spacing-lg)' | 内边距 |
| fixedRadius | string | '22px' | 按钮圆角 |
| fixedHeight | string | '44px' | 按钮高度 |
| fixedGap | string | '12px' | 按钮间距 |
