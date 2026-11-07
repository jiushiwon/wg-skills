# 页面空间与平台状态审查规则

页面空间不是“看起来有留白”就算通过。它必须回答：留白由谁负责、在固定区/安全区/键盘出现时是否仍可用、新页面该复用哪一种写法。

## 一、空间责任模型

| 区域 | 推荐唯一责任方 | 禁止的漂移 |
|---|---|---|
| 页面外侧 gutter | 页面根容器或公共 `PageContainer` | 子卡片各自用 margin 模拟页面边距 |
| 卡片内部 padding | Card 组件或卡片 variant | 页面通过外层 padding 补卡片内边距 |
| 模块间距 | Stack / Section / 页面节奏 Token | 通过相邻元素随意 margin 叠加 |
| 顶部安全区与导航 | 公共导航容器或项目 composable | 页面各自写状态栏、胶囊或顶部高度 |
| 底部安全区 | 公共 safe-area mixin / 容器 | 页面各自手写 `env(safe-area-inset-bottom)` |
| 固定底部操作区 | 公共 FooterAction / 页面固定区变体 | 内容区未预留高度、按钮区直接覆盖内容 |
| 键盘顶起 | 输入容器 / 页面键盘策略 | 页面与输入组件同时各算一遍键盘高度 |

### padding 与 margin 的判定

`padding` 与 `margin` 视觉可能相同，但语义不同：

- **页面根容器到屏幕边缘**：默认由根容器 `padding-inline` 负责。
- **兄弟模块之间的距离**：默认由父容器 `gap` 或 Section 的 `margin-block` 负责，不能让每张卡片分别背负外边距。
- **卡片内容到卡片边界**：由 Card 的 `padding` 负责。
- **居中最大宽度布局**：由容器 `max-width + margin-inline:auto + padding-inline` 共同负责；只靠子元素 margin 不能视为通用 gutter。

审查报告必须写出“视觉一致但责任不同”的证据，而非只比较最终像素。

## 二、检查矩阵

| 维度 | 取证字段 | 常见问题 |
|---|---|---|
| 页面 gutter | 根容器 class、padding-inline、max-width、margin-auto | A 页根 padding，B 页卡片 margin，新页无任何边距 |
| 顶部距离 | nav composable、safe top、header height、首模块 margin | 标题被状态栏/胶囊遮挡，页面各写 44/88/96rpx |
| 模块节奏 | gap、section margin、卡片间距 Token | 16/20/24/28rpx 混用且无业务理由 |
| 固定底栏 | fixed/sticky、内容 padding-bottom、按钮高度、safe-area | 最后一项被按钮遮挡或预留重复 |
| 键盘 | adjust-position、cursor-spacing、键盘高度、输入栏 bottom | 键盘和 fixed footer 双重位移、输入被遮挡 |
| 安全区 | 公共 mixin / CSS 变量 / 直接 env | 同项目同时存在多种手写方案 |

## 三、固定区与键盘红线

1. 发现 `position: fixed` 或 `sticky`，必须反查对应内容区是否预留等于“操作区高度 + 安全区”的底部空间。
2. 发现 `env(safe-area-inset-bottom)`，必须先检查项目是否已有公共 mixin 或 Token；存在时标记为**实现漂移**，不直接认定运行时错误。
3. 键盘场景必须检查输入组件和页面容器是否重复处理 `keyboardHeight`、`adjust-position` 或 `cursor-spacing`。
4. 未启动真机时，只能报告静态风险；不得宣称“键盘一定遮挡”或“安全区一定失效”。

## 四、报告示例

| 类型 | 文件:行 | 证据 | 风险 | 建议 |
|---|---|---|---|---|
| gutter 责任漂移 | `pages/a.vue:120` | 根容器无 padding，子卡片 `margin: 0 24rpx` | P2 | 迁移到 PageContainer 的 gutter Token |
| safe-area 绕开 | `pages/b.vue:80` | 直接写 `env()`，项目已有 `safe-area-bottom` mixin | P1 | 先确认变体，再收口至 mixin |
| 固定区避让待核实 | `pages/c.vue:200` | fixed footer 存在，内容区无可见 bottom 预留 | P1 | 真机验证最后一项与键盘态 |
