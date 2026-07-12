# 共享组件规范（强制复用）

> 本参考文档定义 `uniapp-app-generate-skill` 生成项目的**强制复用红线**：凡是多处出现的同类 UI，必须使用 `src/components/` 下的共享组件，保证 A/B/C 页面的 button、tab、popup 等组件主题色、尺寸、圆角完全一致。

## 核心红线

1. **页面只 import，不手写同类结构**：页面需要 button / tab / popup / card / empty / input / navbar 时，必须从 `src/components/` 引入对应共享组件，**禁止**在页面内手写 `<button>`、标签栏、弹窗或复制其结构。
2. **样式只走 token**：共享组件内部只用语义/组件 token（`$color-*`、`$comp-*`、`$font-*`、`$radius-*`、`$spacing-*`），不写裸色值、裸尺寸（受 `npm run theme:check` 硬卡）。
3. **新增可复用 UI 先入 `components/`**：任何被两个及以上页面复用的 UI，必须先沉淀为共享组件并登记到本文档，再被页面引用。

## 权威组件表

| 需求 | 共享组件 | 路径 | 默认样式口径 |
|------|---------|------|-------------|
| 按钮 | `AppButton` | `src/components/AppButton` | `type: primary/secondary/ghost`，`size: small/medium/large`，高度 `$comp-button-height-*`，圆角 `$comp-button-radius` |
| 分段 / 顶部 Tab | `AppTab` | `src/components/AppTab` | `v-model` 选中 key，`items` 数据源，激活色 `$color-primary`，指示条 `$comp-tab-indicator-*`，高度 `$comp-tab-height` |
| 弹窗 / 动作面板 | `AppPopup` | `src/components/AppPopup` | `v-model` 显隐，`position: bottom/center`，遮罩 `$comp-popup-mask-bg`，圆角 `$comp-popup-radius` |
| 内容卡片 | `AppCard` | `src/components/AppCard` | 内边距 `$comp-card-padding`，圆角 `$comp-card-radius`，阴影 `$shadow-1` |
| 空状态 | `AppEmpty` | `src/components/AppEmpty` | 图 `$comp-empty-image-size`，标题/描述走 `$color-text-*` |
| 输入框 | `AppInput` | `src/components/AppInput` | 边框 `$color-border`，聚焦 `$color-primary` |
| 自定义导航栏 | `AppNavbar` | `src/components/AppNavbar` | 胶囊带独占一行，仅返回图标与胶囊同排，标题在下方独立行（见 layout-patterns） |

> 未列入的 UI（如头像 `AppAvatar`、列表项）如需复用，按「新增组件流程」补齐后登记。

## 默认样式口径（示例）

同一组件在不同页面必须呈现一致，差异只能通过组件 **props** 表达，不得通过页面级 scoped 样式覆盖尺寸/颜色：

```vue
<!-- 正确：A、B、C 页面都用同一组件，差异靠 type/size -->
<AppButton type="primary" size="medium" @tap="submit">提交</AppButton>
<AppButton type="ghost" size="small" @tap="cancel">取消</AppButton>
<AppTab v-model="tab" :items="tabs" />
<AppPopup v-model="show" position="bottom" title="选择">...</AppPopup>
```

```vue
<!-- 错误：页面内手写按钮/标签/弹窗，导致三端样式漂移 -->
<button class="my-btn">提交</button>
<view class="my-tab">...</view>
<view class="my-popup-mask">...</view>

<style scoped>
.my-btn { background: #10b981; border-radius: 12rpx; } /* 双违规：裸色 + 绕开 AppButton */
</style>
```

## 新增组件流程

1. 在 `src/components/<Name>/` 创建 `<Name>.vue` 与 `index.ts`（`index.ts` 同时导出 `default` 与具名 `<Name>`，对齐 `AppButton/index.ts`）。
2. 样式只用 token；若需新尺寸，先在 `src/styles/tokens/_components.scss` 增加 `$comp-*`，再引用。
3. 在本文档「权威组件表」补一行登记。
4. 页面通过 `import { AppXxx } from '@/components/AppXxx'` 引用。

## 校验（轻量）

交付前人工/AI 自检，结果应为空：

```bash
# 页面内不应出现原生 button（按钮统一走 AppButton）
grep -rn "<button" src/pages

# 页面内不应出现自造弹窗遮罩类名
grep -rn "popup-mask\|popup-mask\|sheet-mask\|modal-mask" src/pages

# 页面内不应出现裸色值（已由 theme:check 覆盖，此处复核）
npm run theme:check
```

## 禁止事项

- 禁止页面内手写 `<button>`、tab 栏、popup 遮罩或复制共享组件结构。
- 禁止用页面 scoped 样式去覆盖共享组件的尺寸/主题色（差异走 props / token）。
- 禁止复用 UI 不沉淀到 `src/components/`、不登记本文档。
