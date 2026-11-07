# 移动端安全区审计清单

## 一、先区分页面 Variant

| Variant | 顶部责任 | 底部责任 | 常见误判 |
|---|---|---|---|
| 原生导航页 | 运行端原生导航 | 内容 / 固定区安全区 | 又手写一层顶部高度 |
| 自绘导航页 | NavBar / safe-top composable | 页面 Footer / safe-bottom 容器 | 各页写 44、88、96rpx 顶部值 |
| 沉浸式首屏 | Hero Variant 明确承担 | 首屏与后续内容分层 | 把 Hero 偏移复制到普通页 |
| 聊天 / 输入页 | Header 与消息区 | InputBar 单一键盘策略 | 页面和输入组件同时顶起 |
| 长表单 / 确认页 | 常规导航 | fixed 提交栏 + 内容预留 | 最后一项被提交栏挡住 |

## 二、静态扫描关键词

| 类别 | 查找关键词 / 信号 | 必须反查 |
|---|---|---|
| 顶部 | `safe-area-inset-top`、`statusBarHeight`、`menuButton`、`navigationStyle` | 项目导航容器 / composable |
| 底部 | `safe-area-inset-bottom`、`safe-area-bottom`、`padding-bottom` | 公共 mixin、Footer、TabBar |
| 固定区 | `position: fixed`、`position: sticky`、`bottom:`、`action-bar` | 滚动内容预留、按钮高度、安全区 |
| 键盘 | `keyboardHeight`、`keyboardheightchange`、`adjust-position`、`cursor-spacing` | 页面与输入组件是否重复处理 |
| Web H5 | `visualViewport`、`100vh`、`100dvh`、`env()` | iOS Safari 与 Android 浏览器策略 |

## 三、真机最小验证矩阵

| 场景 | iOS 刘海 / Home Indicator | Android | 必须观察 |
|---|---|---|---|
| 普通列表 | 是 | 是 | 首项顶部、末项底部 |
| fixed 底栏 | 是 | 是 | 按钮可点、末项不遮挡 |
| 长表单 | 是 | 是 | 聚焦末项、提交按钮可达 |
| 聊天输入 | 是 | 是 | 键盘弹起、收起、消息末项 |
| 自绘导航 | 是 | 是 | 胶囊 / 状态栏不重叠 |

