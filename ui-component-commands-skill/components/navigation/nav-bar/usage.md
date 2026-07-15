# nav-bar 使用示例

## 基础用法

```vue
<nav-bar title="首页" />
```

## 显示返回按钮

```vue
<nav-bar title="详情页" :show-back="true" @back="goBack" />
```

## 固定顶部

```vue
<nav-bar title="固定导航" fixed />
```

## 自定义右侧胶囊按钮

```vue
<nav-bar
  title="标题"
  :capsule-right="[{text: '分享', action: 'share'}, {text: '更多', action: 'more'}]"
  @capsuleClick="handleCapsule"
/>
```

## 使用插槽

```vue
<nav-bar>
  <template #left>
    <view class="custom-left">左侧</view>
  </template>
  <template #right>
    <view class="custom-right">右侧</view>
  </template>
</nav-bar>
```
