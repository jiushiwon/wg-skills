# 性能优化详解

## 1. DOM 节点限制

### 1.1 限制指标

| 场景 | 最大节点数 |
|------|------------|
| 页面总节点 | 1000 |
| 列表项节点 | 100 |
| 列表项数 | 50 |

### 1.2 优化策略

- 使用 `virtual-list` 虚拟列表
- 避免深层嵌套
- 合理使用 `v-if` 代替 `v-show`
- 及时清理不需要的组件

## 2. setData 优化

### 2.1 数据量限制

- **单次数据量**：不超过 100KB
- **调用频率**：每秒不超过 20 次

### 2.2 优化方案

```typescript
// ❌ 每次传递整个数组
this.setData({
  list: newList
});

// ✅ 只更新变化的部分
this.setData({
  'list[0].name': newName,
  'list[0].status': newStatus
});

// ✅ 使用对象路径更新
this.setData({
  'item[0]': { ...this.data.item[0], name: newName }
});
```

### 2.3 数据精简

```typescript
// ❌ 直接存储接口原始数据
this.setData({
  list: res.data.items  // 包含大量无用字段
});

// ✅ 只存储视图需要的数据
this.setData({
  list: res.data.items.map(item => ({
    id: item.id,
    name: item.name,
    status: item.status
  }))
});
```

## 3. 长列表优化

### 3.1 分页规范

- 每页 ≤ 20 条
- 使用 `lower-threshold` 触发加载
- 加载中状态提示

### 3.2 懒加载

```vue
<template>
  <scroll-view
    scroll-y
    @scrolltolower="onLoadMore"
    :lower-threshold="100"
  >
    <view v-for="item in list" :key="item.id">
      {{ item.name }}
    </view>
    <view v-if="loading">加载中...</view>
    <view v-if="noMore">没有更多了</view>
  </scroll-view>
</template>

<script setup>
const list = ref([]);
const page = ref(1);
const loading = ref(false);
const noMore = ref(false);

async function onLoadMore() {
  if (loading.value || noMore.value) return;

  loading.value = true;
  const res = await fetchList(page.value);
  list.value.push(...res.data);
  if (res.data.length < 20) noMore.value = true;
  page.value++;
  loading.value = false;
}
</script>
```

### 3.3 虚拟列表

数量 > 1000 时使用虚拟列表：

```vue
<virtual-list
  :items="list"
  :item-height="100"
/>
```

## 4. 图片优化

### 4.1 懒加载

```vue
<image
  :src="src"
  mode="aspectFill"
  lazy-load
/>
```

### 4.2 合理尺寸

```typescript
// 使用 CDN 缩略图
const getThumbnail = (url: string, width: number) => {
  return `${url}?x-oss-process=image/resize,w_${width}`;
};
```

### 4.3 懒加载组件

```vue
<lazy-image
  :src="imageSrc"
  :default-src="placeholder"
  mode="aspectFill"
/>
```

## 5. 事件优化

### 5.1 节流

```typescript
function throttle(fn: Function, delay: number = 300) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// 使用
const onScroll = throttle(() => {
  // 处理滚动事件
}, 300);
```

### 5.2 防抖

```typescript
function debounce(fn: Function, delay: number = 300) {
  let timer: number;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用
const onInput = debounce((value) => {
  // 处理输入
}, 500);
```

## 6. 内存优化

### 6.1 及时清理

```typescript
onUnmounted(() => {
  // 清理定时器
  clearInterval(timer);
  clearTimeout(timer);

  // 清理事件监听
  uni.offSocketOpen(this.onSocketOpen);

  // 清理大数据
  this.largeData = null;
});
```

### 6.2 图片缓存

```typescript
// 使用图片缓存工具
import { getCachedImage, cacheImage } from '@/utils/imageCache';

// 预加载
cacheImage(imageUrls);

// 使用缓存
const src = getCachedImage(url);
```

## 7. 首屏优化

### 7.1 分包加载

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub/",
      "pages": [
        {
          "path": "detail/index",
          "style": { "navigationBarTitleText": "详情" }
        }
      ]
    }
  ]
}
```

### 7.2 骨架屏

```vue
<view class="skeleton">
  <view class="skeleton-avatar"></view>
  <view class="skeleton-title"></view>
  <view class="skeleton-content"></view>
</view>
```

## 8. 渲染优化

### 8.1 避免频繁更新

```typescript
// ❌ 频繁 setData
watch: {
  formData: {
    handler() {
      this.setData({ formData: this.formData });
    },
    deep: true
  }
}

// ✅ 使用防抖
watch: {
  formData: debounce(function() {
    this.setData({ formData: this.formData });
  }, 500)
}
```

### 8.2 使用计算属性

```typescript
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});
```

---

## 9. 性能检测工具

### 9.1 性能面板

使用微信开发者工具的「性能」面板监控：
- CPU 使用率
- 内存占用
- FPS
- setData 调用耗时

### 9.2 性能Trace

```typescript
// 开始性能追踪
const startTime = Date.now();

// 执行操作

// 结束追踪
console.log(`耗时: ${Date.now() - startTime}ms`);
```
