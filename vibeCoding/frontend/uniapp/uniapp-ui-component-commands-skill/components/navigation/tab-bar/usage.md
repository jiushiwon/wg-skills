# tab-bar 使用示例

## 基础用法

```vue
<tab-bar
  :tabs="[
    { name: '首页', icon: '/static/home.png', activeIcon: '/static/home-active.png' },
    { name: '我的', icon: '/static/user.png', activeIcon: '/static/user-active.png' }
  ]"
  @change="onTabChange"
/>
```

## 固定底部

```vue
<tab-bar :tabs="tabs" fixed @change="onTabChange" />
```

## 自定义颜色

```vue
<tab-bar
  :tabs="tabs"
  active-color="#ff6b6b"
  inactive-color="#999"
  @change="onTabChange"
/>
```
