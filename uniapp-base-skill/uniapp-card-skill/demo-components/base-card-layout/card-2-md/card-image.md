# card-image 图片卡片

> 大图+内容组合卡片，适用于封面、图册、相册等场景。

## 形态特征

| 特征 | 值 |
|------|-----|
| 圆角 | 12px |
| 背景 | --color-bg-surface |
| 阴影 | shadow-sm |
| 图片高度 | 120px / 160px / 200px |

## 适用场景

- 相册、图册展示
- 文章封面、专题Banner
- 商品预览、活动宣传
- 视频封面+标题组合

## HTML 演示

[card-image.html](html/card-image.html)

## 组件代码

```vue
<base-card
  :radius="'var(--radius-md)'"
  :padding="0"
  :shadow="'shadow-sm'"
>
  <image 
    class="card-image" 
    :src="image" 
    :style="{ height: imageHeight }"
    mode="aspectFill" 
  />
  <view class="card-body">
    <text class="card-title">{{ title }}</text>
    <text class="card-desc">{{ desc }}</text>
    <view class="card-footer" v-if="showFooter">
      <view class="card-meta">
        <image class="card-avatar" :src="avatar" />
        <text class="card-name">{{ name }}</text>
      </view>
      <text class="card-time">{{ time }}</text>
    </view>
  </view>
</base-card>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| image | string | - | 图片地址 |
| imageHeight | string | '120px' | 图片高度 |
| imagePosition | string | 'top' | 图片位置 top/left/right |
| title | string | - | 标题 |
| desc | string | - | 描述 |
| showFooter | boolean | false | 是否显示底部信息 |
| avatar | string | - | 头像地址 |
| name | string | - | 用户名 |
| time | string | - | 时间 |
| showTag | boolean | false | 是否显示标签 |

## 变体参考

- 大图顶部 → card-image（默认）
- 横向图文 → card-image（imagePosition: left）
- 带标签 → card-image（showTag: true）
- 带底部信息 → card-image（showFooter: true）
