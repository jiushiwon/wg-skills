# APP 端使用指南（Android / iOS）

21 个组件在 APP 端和微信小程序端**标签/CSS 层完全一致**，不需要改组件代码。但 APP 端有几个「项目配置层」的坑需要处理。

## 一、最关键的：状态栏高度（影响 4 个组件）

| 受影响组件 | 原因 |
|-----------|------|
| `base-navbar` | 顶部导航栏需要让出状态栏 |
| `form-page` | 内部引用了 base-navbar |
| `home-page` | 内部引用了 base-navbar |
| `product-detail-page` | 内置简化导航栏（同理） |

**小程序端**：所有 iPhone 状态栏高度统一，可以写死 `--status-bar-height: 44px`。

**APP 端**：不同手机状态栏高度差异巨大——iPhone 14 Pro 灵动岛 54px、普通 iPhone 44px、Android 各家不同（24-48dp）。必须运行时获取。

### 方案：App.vue 动态注入

```vue
<!-- App.vue -->
<script>
export default {
  onLaunch() {
    const sys = uni.getSystemInfoSync()
    const barH = sys.statusBarHeight || 0
    // APP/H5 端注入 CSS 变量
    if (barH > 0) {
      const style = `:root { --status-bar-height: ${barH}px; }`
      // #ifdef H5 || APP-PLUS
      const el = document.createElement('style')
      el.innerHTML = style
      document.head.appendChild(el)
      // #endif
      // #ifdef MP-WEIXIN
      // 小程序不走这步，用下面方案 B
      // #endif
    }
  }
}
</script>
```

> 或用 uni-app 的 `page-meta` + `navigation-bar` 方案（HBuilderX 3.2+ 支持原生导航栏自定义），但本技能组件使用的是自定义 view 导航栏，用上述 CSS 变量方案最简单。

## 二、底部安全区（iPhone X 以上有 Home Indicator）

组件里 `base-tabbar`、`chat-page`、`product-detail-page`、`form-page` 的底部操作栏都用了：

```css
padding-bottom: env(safe-area-inset-bottom);
```

**小程序端**：自动生效。

**APP 端**：需要确认 Webview 支持 `env()`。iOS 的 WKWebView 和 Android 的 WebView 均支持。如果某台设备不生效，回退为固定值：

```css
padding-bottom: env(safe-area-inset-bottom, 12px);
```

> 你的 21 个组件已全部使用 `env(safe-area-inset-bottom)`，无需修改。如果 APP 端有设备不生效，在全局 CSS 加一行 `--safe-bottom: env(safe-area-inset-bottom, 0);` 然后用 `var(--safe-bottom)` 替代。（选做）

## 三、键盘弹出时 fixed 元素问题（影响 chat-page / form-page）

**小程序端**：键盘弹出时 `adjust-position` 自动顶起页面。

**APP 端**：iPhone 上键盘弹出时，Webview 会整体上移（和 H5 行为一致），底部 fixed 的输入栏会跟着上移——正常。但 Android 上 Webview 默认不自动上移，需要页面处理。

### 方案（仅 chat-page 需要额外处理）

```ts
// 在 chat-page 所在页面的 onLoad 或组件的 onMounted 里：
// #ifdef APP-PLUS
uni.onKeyboardHeightChange((res) => {
  // res.height > 0 表示键盘弹出
  if (res.height > 0) {
    // chat-page 的 adjust-position 已设为 true，一般无需额外处理
    // 如果 Android 上键盘遮挡输入框，手动调 scroll-top 到最新消息
  }
})
// #endif
```

> chat-page 组件内部已在 `<input>` 上设置了 `:adjust-position="true"`，大部分场景够用。Android 特殊机型可监听键盘高度微调。

## 四、原生导航栏与组件导航栏冲突

### 场景：你的 APP 有原生导航栏，你又用了 base-navbar

- `chat-page` / `form-page` / `home-page` / `product-detail-page` **自带** base-navbar
- 如果 `pages.json` 该页面没设 `navigationStyle: custom`，会同时出现原生导航栏 + 组件导航栏（双导航栏）

**解决**：

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/chat/index",
      "style": { "navigationStyle": "custom" }
    }
  ]
}
```

> APP 端 `navigationStyle: custom` 会隐藏原生导航栏，只显示组件内的 base-navbar。

## 五、组件兼容性速查（APP 端）

| 组件 | APP 端注意事项 |
|------|---------------|
| `base-navbar` | 必须动态设置 `--status-bar-height`（见第一章） |
| `base-tabbar` | 底部安全区 `env()` 自动生效，无需操作 |
| `chat-page` | 键盘问题（见第三章）；`adjust-position="true"` 已内置 |
| `product-detail-page` | 底部操作栏 `env()` 自动生效；如需沉浸式头图同小程序 |
| `form-page` | 底部提交栏 `env()` 自动生效 |
| `home-page` | 同 base-navbar + base-tabbar |
| `login-page` | 无导航栏，无特殊处理 |
| 其他 14 个组件 | 标签/CSS/交互全部与小程序一致，无需任何调整 |

## 六、一句话总结

> 21 个组件在 APP 端**不需要改代码**。只需在 `App.vue` 里注入 `--status-bar-height`（1 个操作），再给有导航栏的页面设 `navigationStyle: custom`（每个页面 1 行配置）。其余全部自动兼容。
