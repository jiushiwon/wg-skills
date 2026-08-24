# 跨平台兼容性检查清单

> 本清单用于 uniapp-crossplatform-audit-skill 扫描时参考

## 1. 模板标签检查

### 必须替换的 H5 标签

| H5 标签 | uniapp 组件 | 备注 |
|---------|-------------|------|
| `div` | `view` | 块级容器 |
| `span` | `text` | 行内文本 |
| `p` | `text` | 段落 |
| `h1` ~ `h6` | `text` + 样式 | 标题 |
| `img` | `image` | 图片 |
| `a` | `text` + 事件 | 链接 |
| `ul/ol` | `view` + `v-for` | 列表 |
| `li` | `view` | 列表项 |
| `section` | `view` | 区块 |
| `article` | `view` | 文章 |
| `main` | `view` | 主内容 |
| `header` | `view` | 头部 |
| `footer` | `view` | 底部 |
| `nav` | `view` | 导航 |
| `table` | `view` + flex | 表格（建议用 flex 布局） |
| `form` | `form` | 表单（可用） |
| `input` | `input` | 输入框（可用） |
| `button` | `button` | 按钮（可用） |

### 特殊场景

- **动态创建的标签**：通过 `v-html` 渲染的 HTML 字符串需要后端过滤或使用 `rich-text` 组件
- **第三方组件**：某些 UI 库内部可能使用了 H5 标签，需要升级组件库或提 issue

---

## 2. CSS 兼容性检查

### 禁止或谨慎使用

| 属性 | 风险 | 替代方案 |
|------|------|----------|
| `background-image: url()` | 小程序部分场景不显示 | 使用 `<image>` 组件 |
| `background-attachment: fixed` | 小程序不支持 | 使用固定定位的 `<image>` |
| `background-size: cover` | 背景图在小镇表现不一致 | 使用 `image` 组件 `mode="aspectFill"` |
| `object-fit` | 小程序不支持 | 使用 `image` 组件的 `mode` |
| `var(--xxx)` | 低版本基础库不支持 | 使用 SCSS 变量 `$xxx` |
| `calc()` | 兼容性一般 | 使用固定 rpx 值 |
| `vw` / `vh` | 支持但不推荐 | 使用 `rpx` 或 `%` |
| `overflow: scroll` | 需用 `scroll-view` | 使用 `scroll-view` 组件 |
| `z-index: 9999` | 小程序层级管理复杂 | 控制在 1~999 |
| `position: sticky` | 部分小程序不支持 | 使用节点查询实现 |
| `flex: 1` | 可用，但注意兼容性 | 标准 flex 即可 |
| `transition` | 可用，动画需注意 | 简单过渡即可 |
| `transform` | 可用 | 标准变换即可 |
| `opacity` | 可用 | 标准透明度 |

### 推荐使用

- `display: flex` 及相关属性
- `width/height/padding/margin`
- `border-radius`
- `font-size/font-weight/color`
- `background-color`
- `box-shadow`（避免过大）

---

## 3. API 兼容性检查

### 必须替换

| 浏览器 API | uniapp API | 备注 |
|------------|------------|------|
| `fetch()` | `uni.request()` | 网络请求 |
| `window.location` | `uni.navigateTo()` / `uni.getLocale()` | 路由/系统信息 |
| `document` | 无 | 禁止操作 DOM |
| `localStorage` | `uni.setStorageSync()` / `uni.getStorageSync()` | 本地存储 |
| `sessionStorage` | `uni.setStorageSync()` | 临时存储 |
| `alert()` | `uni.showToast()` | 提示 |
| `console.log` | `console.log`（开发可用） | 日志 |
| `setTimeout` | `setTimeout`（可用） | 定时器 |
| `setInterval` | `setInterval`（可用） | 定时器 |
| `JSON.parse/stringify` | 可用 | JSON 处理 |
| `Date/Array/Object` | 可用 | 基础对象 |

### 条件编译

当某端确实需要特殊处理时，使用条件编译：

```vue
<!-- #ifdef MP-WEIXIN -->
<text>微信小程序专属</text>
<!-- #endif -->

<!-- #ifdef H5 -->
<text>H5 专属</text>
<!-- #endif -->

<!-- #ifdef APP-PLUS -->
<text>App 专属</text>
<!-- #endif -->
```

---

## 4. 各端特殊注意事项

### 微信小程序

- request 域名必须在「开发设置」中配置
- 用户隐私需配置《用户隐私保护指引》
- 主包 ≤ 2MB，总包 ≤ 20MB
- 避免诱导分享
- 某些 API 需要用户授权（如 getLocation）

### H5

- 路由模式默认 hash，需 history 时后端要配合
- 浏览器兼容性考虑
- rpx 以 750px 为基准
- 分享使用 Web Share API 或复制链接
- 登录需使用 OAuth 或账号体系

### App

- Android/iOS 权限需在 manifest 声明
- 原生能力（扫码、定位、推送）需真机测试
- 支持 wgt 热更新
- 刘海屏/灵动岛需处理安全区

---

## 5. 检查优先级

### P0 - 必须修复（阻断上线）

1. 使用了 H5 标签（div/span/p/img）
2. 使用了 background-image 展示重要图片
3. 使用了浏览器 API（fetch/window/document）

### P1 - 应该修复（影响体验）

1. 缺少必要的条件编译
2. API 调用未做差异化处理
3. 样式使用了兼容性差的属性

### P2 - 建议修复（优化体验）

1. 某些组件在小程序/App 表现不一致
2. 长列表未做虚拟化
3. 未处理安全区

---

## 6. 修复工作量预估

| 问题类型 | 单个修复难度 | 批量修复可行性 |
|----------|--------------|----------------|
| 标签替换 | 简单 | 高 |
| 样式调整 | 简单 | 高 |
| API 替换 | 中等 | 中 |
| 条件编译 | 中等 | 低 |
| 组件重构 | 复杂 | 低 |
