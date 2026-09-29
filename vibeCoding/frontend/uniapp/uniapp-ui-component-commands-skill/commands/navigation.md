# 导航类组件

## nav-bar 自定义导航栏

**说明**：自定义顶部导航栏，支持返回按钮、标题、右侧操作、胶囊按钮

**别名**：导航栏、header、头部、顶部菜单

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '' | 标题文字 |
| showBack | boolean | true | 显示返回按钮 |
| fixed | boolean | false | 固定顶部 |
| background | string | #fff | 背景色 |
| titleColor | string | #1C1C1E | 标题颜色 |
| capsuleRight | array | [] | 右侧胶囊按钮配置 |

**事件**：
- back：点击返回按钮
- rightClick：点击右侧区域

**插槽**：
- default：默认内容（标题）
- left：左侧区域
- right：右侧区域

**用法**：
```vue
<nav-bar title="首页" :show-back="false" fixed />
<nav-bar title="详情">
  <template #right>
    <view class="share-btn">分享</view>
  </template>
</nav-bar>
```

---

## tab-bar 底部Tab栏

**说明**：底部Tab切换，支持图标+文字、选中态

**别名**：底部导航、tab切换、底部菜单

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tabs | array | [] | Tab配置 [{name, icon, activeIcon}] |
| current | number | 0 | 当前选中索引 |
| fixed | boolean | false | 固定底部 |
| background | string | #fff | 背景色 |

**事件**：
- change：切换Tab时触发

**用法**：
```vue
<tab-bar :tabs="[
  { name: '首页', icon: 'home', activeIcon: 'home-fill' },
  { name: '我的', icon: 'user', activeIcon: 'user-fill' }
]" @change="onTabChange" />
```

---

## top-tab 顶部Tab切换

**说明**：顶部Tab横向滚动切换

**别名**：顶部tab、分类切换

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tabs | array | [] | Tab配置 [{name, id}] |
| current | number | 0 | 当前选中 |
| scroll | boolean | true | 超出滚动 |

**用法**：
```vue
<top-tab :tabs="['推荐', '热门', '最新']" v-model="current" />
```

---

## side-menu 侧边栏菜单

**说明**：侧边栏抽屉菜单

**别名**：侧边导航、抽屉

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show | boolean | false | 显示状态 |
| width | string | 80% | 抽屉宽度 |

**事件**：
- close：关闭时触发

**用法**：
```vue
<side-menu :show.sync="showDrawer">
  <view class="menu-list">菜单内容</view>
</side-menu>
```

---

## breadcrumb 面包屑

**说明**：路径导航

**别名**：路径导航

**属性**：
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | array | [] | 路径项 [{name, path}] |

**用法**：
```vue
<breadcrumb :items="[
  { name: '首页', path: '/' },
  { name: '分类', path: '/category' },
  { name: '详情' }
]" />
```
