# 页面布局与平台状态取证矩阵

本矩阵用于把“页面看起来不统一”拆成可定位、可复核的审查项。每项都必须记录：页面模式、文件位置、静态或视觉证据、当前责任方、建议基线和置信度。

## 一、页面空间

| 审查项 | 静态取证信号 | 需要横向对比的页面 | 判定要点 |
|---|---|---|---|
| 页面外侧 gutter | 根节点 `padding-inline`、`padding-left/right`、`max-width`、`margin:auto` | 列表、详情、表单、工作台 | 页面外边距必须由根容器或 PageContainer 承担；子卡片 `margin` 只能作为异常证据 |
| 卡片内边距 | Card class、组件 props、`padding` | 同类信息卡、表单卡、结果卡 | 内边距由卡片组件或明确 variant 承担，不能由页面外层反向补偿 |
| 模块节奏 | `gap`、`row-gap`、`margin-block`、相邻选择器 | 同一页面模式的区块 | 优先父容器 `gap` 或 Section Token；逐项 `margin-bottom` 堆叠要检查是否造成复用断裂 |
| 顶部距离 | Header/Nav 高度、`safe-area-inset-top`、首区块 margin | 带导航与沉浸式页面 | 状态栏、导航、胶囊避让必须有明确方案；页面不能各自写魔法顶部值 |
| 居中宽度 | `max-width`、`margin-inline:auto`、容器 padding | PC 列表、详情、弹窗 | 居中容器仍应保留最小横向 padding，不能让子项 margin 代替页面 gutter |

## 二、固定操作区与安全区

| 审查项 | 静态取证信号 | 必查反向证据 | 输出结论边界 |
|---|---|---|---|
| 固定底栏 | `position:fixed/sticky`、footer/action-bar 类名 | 滚动内容是否有 `padding-bottom` 或统一占位容器；预留是否含按钮高度与安全区 | 无真机只写“遮挡风险待验证”，不可断言已遮挡 |
| 底部安全区 | `env(safe-area-inset-bottom)`、mixin、Token、容器组件 | 项目是否已有公共 safe-area 封装；同类页面是否绕开它 | 有公共封装而页面手写 `env()` 是实现漂移，不等同运行时故障 |
| 顶部安全区 | `env(safe-area-inset-top)`、导航 composable、header wrapper | 首内容是否重复预留，或遗漏导航偏移 | 必须区分自绘导航、原生导航和沉浸式活动页 |
| 底部按钮规格 | Button height、gap、footer padding、危险/次要按钮顺序 | 同一业务操作是否使用相同按钮组件和触达区域 | 操作类型不同可做 variant，报告要写清例外理由 |

## 三、键盘与输入

| 审查项 | 静态取证信号 | 检查问题 | 真机验证动作 |
|---|---|---|---|
| 自动顶起策略 | `adjust-position`、`cursor-spacing`、Web `visualViewport`、键盘事件 | 页面容器和输入组件是否同时处理位移 | 聚焦、输入、收起键盘三态截图/录屏 |
| 手动键盘高度 | `keyboardHeight`、`keyboardheightchange`、输入栏 `bottom` 计算 | 高度是否被重复叠加到 fixed footer 或 safe-area | 看输入栏是否跳两次、收起后能否归位 |
| 最后一项可达性 | 聊天消息列表、长表单、滚动容器 height | 末项是否有足够底部预留 | 滚动至末项再弹起键盘，检查是否被操作区遮挡 |
| 提交操作可达性 | 表单固定按钮、软键盘完成键 | 键盘出现时提交/下一步是否仍能操作 | Android/iOS 至少各验证一次（若项目支持） |

## 四、报告判定示例

| 现象 | 结论类型 | 正确写法 |
|---|---|---|
| A 页根容器 padding，B 页卡片 margin 模拟同样留白 | P2 实现漂移 | “视觉间距接近，但页面 gutter 责任分散，新页面无法继承；建议收口 PageContainer。” |
| fixed footer 存在，未找到内容区预留 | P1 待真机验证 | “静态证据显示无可见预留；需验证最后一项、键盘弹出与安全区三态。” |
| 页面手写 `env()`，项目已有 mixin | P1 实现漂移 | “绕开公共封装，后续 safe-area 变更不能集中治理；不宣称当前显示错误。” |
| 两处编辑图标颜色不同 | P2 待确认 | “先核对深浅背景、disabled/selected 状态；无状态理由再收口语义 Token。” |
