---
name: mobile-uiux-spec-skill
description: Use when designing or reviewing iOS, Android, 微信小程序, 移动 H5 或鸿蒙页面，涉及设计稿尺寸、pt/dp/sp/rpx/vp/fp 单位、触控目标、安全区、键盘、折叠屏和交付标注。
---

# 移动端 UI/UX 设计与交付规范

为移动端页面建立可交付的设计基线：先定运行端与页面 Variant，再定单位、布局、触控、排版和验收。目标不是把所有端强行画成一套固定像素，而是让同一设计意图在不同端都可实现、可验证。

**触发词**：移动端设计规范、UIUX 规范、iOS 尺寸、Android dp、小程序 rpx、H5 安全区、鸿蒙 UIUX、vp/fp、移动端交付、折叠屏适配。

## 何时使用

- 设计或复刻 iOS、Android、小程序、移动 H5、鸿蒙页面；
- 设计稿要交给 Vue、uni-app、React Native、ArkUI 或原生开发实现；
- 出现“同一页面在不同手机边距、底栏、字号不一样”的问题；
- 需要检查安全区、键盘、折叠态、点击区和交付标注。

不用于：

- 已有项目的安全区/键盘问题取证与修复，使用 `mobile-safe-area-audit-skill`；
- 跨页面 Token、组件、图标的一致性扫描，使用 `frontend-style-harmonizer-skill`；
- 主题变量或基础组件实现，分别使用对应 Vue / uni-app 主题与组件 Skill。

## 工作流程

1. 识别端与形态：iOS、Android、小程序、H5、鸿蒙；直板/折叠/平板、原生/自绘导航、是否有固定底栏和输入框。
2. 读取项目真源：主题 Token、基础容器、导航与底栏组件；不得重建平行组件体系。
3. 选择单位与设计稿基线：详见 `references/cross-platform-baseline.md`。基线只用于设计与标注，不用于硬编码设备状态栏高度。
4. 建立页面责任表：页面外侧 gutter、内容区、固定区、底部安全区、键盘位移各由谁负责。
5. 生成或审查设计交付：使用 `references/delivery-checklist.md`，明确默认态、加载、空态、错误态、禁用态和真机验收项。
6. 鸿蒙 Variant：阅读 `references/harmonyos-uiux.md`，对窗口尺寸、折叠态、安全区与 `vp/fp` 单列约束，不把 Android `dp` 直接照搬。

## 跨端硬规则

1. **单位不混用**：iOS 用 `pt`，Android 布局用 `dp`、文字用 `sp`，小程序用 `rpx`，H5 按场景使用 CSS `px/rem/em/vw/dvh` 与 `calc()/clamp()`，鸿蒙界面优先用 `vp/fp`。跨端交付需说明“设计值”如何映射，不能直接声称 1:1。
2. **最小点击区**：iOS 不小于 `44 × 44pt`；Android 建议不小于 `48 × 48dp`；小程序交互区不小于 `88 × 88rpx`；H5 以 `44 × 44 CSS px` 为底线。视觉图标可以更小，但命中区域不能更小。
3. **页面空间有责任方**：页面容器负责外侧 gutter；卡片负责内部 padding；固定栏负责自身安全区；滚动内容负责为固定栏预留高度。
4. **状态栏不能写死**：iOS/Android 状态栏、微信胶囊、折叠屏窗口和鸿蒙避让区都可能变化，必须通过端侧运行时信息获得。
5. **小程序胶囊独占一行**：自绘导航中，胶囊带只放返回等必要操作；标题、菜单和其他右侧按钮必须另起行并预留胶囊宽度。状态栏用 `statusBarHeight`，胶囊用 `uni.getMenuButtonBoundingClientRect()`，导航高度统一由项目容器计算。
6. **键盘只由一层处理**：页面容器或输入组件二选一；静态设计稿必须给“键盘弹起后提交/发送按钮仍可达”的状态图。
7. **设计系统优先**：颜色、字号、间距、圆角、组件外壳只引用项目已有 Token 与公共组件；本 Skill 不新造第二套主题。
8. **真机验收不可省略**：最小屏、常规屏、刘海/手势屏、Android 常规机至少覆盖；有鸿蒙或折叠屏目标时额外验证展开/折叠及窗口变更。

## 交付输出

输出以下内容，而非只交一张效果图：

```markdown
## 移动端 UI/UX 交付说明

- 目标端：微信小程序 + H5；鸿蒙为后续 Variant。
- 设计基线：小程序 750rpx；H5 375 CSS px；不把状态栏高度写死。
- 页面空间：PageContainer 负责 32rpx gutter；BaseCard 负责 24rpx padding。
- 固定区：Footer 负责 safe-area padding；滚动内容预留 Footer 高度 + 安全区。
- 键盘：页面容器统一处理，输入组件关闭二次自动位移。
- 验收：最小屏、刘海屏、Android、键盘弹起/收起、最后一项可达。
```

## 关联 Skill

| 需求 | 使用的 Skill |
| --- | --- |
| uni-app Token、容器、基础组件 | `uniapp-theme-skill`、`uniapp-base-skill`、`uniapp-style-skill` |
| Vue 移动 H5 | `vue-theme-skill`、`vue-style-skill`、`vue-base-skill` |
| 发现安全区、胶囊、键盘问题 | `mobile-safe-area-audit-skill` |
| 跨页面按钮、搜索框、图标、间距不一致 | `frontend-style-harmonizer-skill` |

## 必读参考

- `references/cross-platform-baseline.md`：五端基线与单位映射。
- `references/harmonyos-uiux.md`：鸿蒙 UI/UX 与折叠态设计边界。
- `references/delivery-checklist.md`：设计交付与真机验收清单。
