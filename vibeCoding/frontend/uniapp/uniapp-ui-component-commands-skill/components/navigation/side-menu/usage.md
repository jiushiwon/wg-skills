# side-menu 使用示例

## 基础用法

```vue
<side-menu :show.sync="showDrawer" title="导航菜单">
  <view class="menu-list">
    <view class="menu-item">首页</view>
    <view class="menu-item">分类</view>
    <view class="menu-item">我的</view>
  </view>
</side-menu>

<script>
export default {
  data() {
    return {
      showDrawer: false
    }
  }
}
</script>
```

## 使用插槽自定义头部

```vue
<side-menu :show.sync="showDrawer">
  <template #header>
    <view class="custom-header">自定义头部</view>
  </template>
  <view>内容</view>
</side-menu>
```
