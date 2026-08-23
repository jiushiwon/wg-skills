# 弹窗案例集（base-popup）

`base-popup` 是通用弹窗/抽屉组件，由 `base-card` 设计思想封装。内部仍然是卡片，但外层可以设置方向、圆角、高度，固定携带遮罩层，支持滑入滑出动画。作为根组件（空组件），内部通过 slot 自由填充内容。

> 弹窗是 base-popup 的内容区域，不单独建组件。

## 共用组件

> [base-popup.md](../../base-popup.md) —— 通用弹窗规范、Props、Slots、变体。  
> 弹窗内容由业务决定，不单独定义组件。

## 案例清单

### 4 种弹出方向

| 案例 | 形态 | 适用场景 | HTML |
|------|------|----------|------|
| popup-bottom | 底部弹出 + 操作菜单 | 底部操作菜单、分享、选择器 | [popup-demo.html](html/popup-demo.html) |
| popup-top | 顶部弹出 + 通知 | 系统通知、公告 | [popup-demo.html](html/popup-demo.html) |
| popup-left | 左侧抽屉 + 头像菜单 | 侧边抽屉、侧滑菜单 | [popup-demo.html](html/popup-demo.html) |
| popup-right | 右侧筛选 + 确定重置 | 筛选面板、侧边设置 | [popup-demo.html](html/popup-demo.html) |

> 所有方向在一个 HTML 文件中展示，通过按钮切换演示。

## 设计原则

1. **方向参数化**：`direction` 支持 `top` / `bottom` / `left` / `right` 四种方向，默认 `bottom`。
2. **遮罩层内置**：默认显示遮罩层，点击可关闭，可通过 `mask` 和 `maskClosable` 控制。
3. **动画滑入滑出**：固定携带滑入滑出动画，时长可通过 `duration` 自定义，默认 300ms。
4. **圆角随方向变化**：弹出方向的对侧圆角为 0，同侧圆角为 `radius`（默认 16px）。
5. **安全区域适配**：底部弹出默认适配 safe-area，通过 `safeArea` 控制。
6. **内容自由填充**：作为空组件，通过 `<slot />` 注入任意业务内容。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | boolean | `false` | 是否显示 |
| `direction` | string | `'bottom'` | 弹出方向：`top` / `bottom` / `left` / `right` |
| `radius` | string | `'16px'` | 弹窗圆角 |
| `height` | string | `'auto'` | 高度（top/bottom 生效） |
| `width` | string | `'280px'` | 宽度（left/right 生效） |
| `mask` | boolean | `true` | 是否显示遮罩层 |
| `maskClosable` | boolean | `true` | 点击遮罩是否关闭 |
| `duration` | number | `300` | 动画时长（ms） |
| `safeArea` | boolean | `true` | 是否适配安全区域 |

## 方向 × 场景对照

| 方向 | 典型场景 | 圆角设置 |
|------|----------|----------|
| `bottom` | 底部操作菜单、分享、选择器 | 顶部圆角 0，底部圆角 radius |
| `top` | 系统通知、公告 | 顶部圆角 radius，底部圆角 0 |
| `left` | 侧边抽屉、侧滑菜单 | 左侧圆角 0，右侧圆角 radius |
| `right` | 筛选面板、侧边设置 | 左侧圆角 radius，右侧圆角 0 |

## 组合使用

`base-popup` 作为空组件，可与 base-select、base-switch 等组合：

```vue
<!-- 组合 base-select 的弹出面板模式 -->
<base-popup v-model:show="show" direction="bottom">
  <base-select :options="options" @change="onChange" />
</base-popup>

<!-- 组合 base-switch 的设置面板 -->
<base-popup v-model:show="show" direction="right" width="320px">
  <view class="settings">
    <base-switch v-model="wifi" label="WiFi" />
    <base-switch v-model="bluetooth" label="蓝牙" />
  </view>
</base-popup>
```

## 待完善组件

- base-radio / base-select / base-switch

---

> ⚠️ Demo 案例仅供参考，非完美实现
