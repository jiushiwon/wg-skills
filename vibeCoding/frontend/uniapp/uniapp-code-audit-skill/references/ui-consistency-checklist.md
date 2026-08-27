# UI/主题一致性检查清单

> 本清单用于 `uniapp-code-audit-skill` UI/主题一致性审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. 颜色一致性

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 同一颜色多处硬编码 | P2 | 主题难以统一修改 | 同一色值在多个文件重复出现 | `uniapp-app-generate-skill` theme-system | `grep -rnE '#[0-9a-fA-F]{3,6}' src/ \| sort` |
| 业务代码使用 off-scale 颜色 | P1 | 脱离主题系统，视觉不一致 | SCSS 中出现非 `$primary-*/$gray-*/$color-*` 的裸色值 | `uniapp-app-generate-skill` theme-system | `grep -rnE '#[0-9a-fA-F]{3,6}\|rgb\(|rgba\(|hsl\(' src/` |
| 主色未提取到 Token | P2 | 品牌色散落 | 主色 `#10b981` 等价色在多处手写 | `uniapp-app-generate-skill` theme-system | 检查 `src/styles/tokens/` 与业务代码 |
| 状态色不统一 | P2 | 成功/警告/错误颜色不一致 | 同一状态色存在多个色值 | `uniapp-app-generate-skill` theme-system | 人工检查常见状态色 |

## 2. 字号一致性

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 标题字号不统一 | P2 | 视觉层级混乱 | 同层级标题使用不同 `font-size` | `uniapp-app-generate-skill` theme-system | `grep -rnE 'font-size:\s*[0-9]+rpx' src/` |
| 正文字号散乱 | P2 | 阅读体验不一致 | 正文出现多种字号 | `uniapp-app-generate-skill` theme-system | `grep -rnE 'font-size:\s*[0-9]+rpx' src/pages/` |
| 未使用 `$font-*` Token | P2 | 字号系统未落地 | 字号直接写 `28rpx`、`32rpx` 等裸值 | `uniapp-app-generate-skill` theme-system | 检查 `src/styles/tokens/_semantic.scss` 与业务代码 |

## 3. 间距一致性

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| margin 值散乱 | P3 | 间距系统未落地 | margin 出现非 4/8/12/16/24/32/40/48rpx 的随机值 | `uniapp-app-generate-skill` theme-system | `grep -rnE 'margin[^:]*:\s*[0-9]+rpx' src/` |
| padding 值散乱 | P3 | 间距系统未落地 | padding 出现非 Token 的随机值 | `uniapp-app-generate-skill` theme-system | `grep -rnE 'padding[^:]*:\s*[0-9]+rpx' src/` |
| 未使用 `$spacing-*` Token | P2 | 间距无法统一维护 | 间距直接写裸 `rpx` | `uniapp-app-generate-skill` theme-system | 检查 `src/styles/tokens/_semantic.scss` 与业务代码 |

## 4. 圆角与阴影

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 圆角值不统一 | P3 | 卡片/按钮视觉不一致 | 同类组件使用不同圆角值 | `uniapp-app-generate-skill` theme-system | `grep -rnE 'border-radius:\s*[0-9]+rpx' src/` |
| 阴影效果不统一 | P3 | 视觉层级不一致 | 阴影色值/偏移/模糊度散落 | `uniapp-app-generate-skill` theme-system | `grep -rnE 'box-shadow' src/` |
| 未使用 `$radius-*` / `$shadow-*` Token | P2 | 圆角/阴影系统未落地 | 直接写 `border-radius: 8rpx` | `uniapp-app-generate-skill` theme-system | 检查 `src/styles/tokens/_components.scss` |

## 5. 组件复用

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 相同 UI 未沉淀为共享组件 | P2 | 重复实现导致不一致 | 两个及以上页面存在相同 UI 片段 | `uniapp-app-generate-skill` component-standards | 人工比对页面模板 |
| 页面手写原生 `<button>` | P1 | 未使用 `AppButton` 共享组件 | `src/pages/` 中出现原生 `<button>` 标签（非 `AppButton`/`button-group` 等自定义组件） | `uniapp-app-generate-skill` component-standards | `grep -rnE '<button(\s\|>)' src/pages/ \| grep -vE '<(AppButton\|button-group\|button-wrapper)'` |
| 页面手写 tab 栏/弹窗遮罩 | P2 | 未使用 `AppTab`/`AppPopup` 共享组件 | 页面内实现 tab 切换或弹窗遮罩 | `uniapp-app-generate-skill` component-standards | 人工检查 tab/弹窗实现 |
| 未使用 `AppEmpty` 空状态 | P2 | 空状态实现不一致 | 页面空状态各自手写 | `uniapp-app-generate-skill` component-standards | 检查空状态实现 |
| 共享组件内部使用裸色值/裸尺寸 | P1 | 破坏主题系统一致性 | `src/components/` 中出现 `#hex` 或具体 `rpx` | `uniapp-app-generate-skill` component-standards | `grep -rnE '#[0-9a-fA-F]{3,6}\|font-size:\s*[0-9]+rpx\|margin[^:]*:\s*[0-9]+rpx' src/components/` |

## 6. 交互反馈

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 按钮无点击态 | P3 | 用户无法感知点击 | 原生 `<button>` 或自定义按钮未设置 `hover-class` | `uniapp-app-generate-skill` component-standards | `grep -rnE '<button(\s\|>)' src/ \| grep -v 'hover-class'` |
| 请求无 loading 状态 | P2 | 用户无法感知加载中 | 提交/请求时未显示 loading | `uniapp-standard-skill` R10 | 检查页面请求逻辑 |
| 无空状态 | P2 | 数据为空时页面空白 | 列表/详情未处理空数据 | `uniapp-app-generate-skill` component-standards | 检查 `v-if`/`v-else` 分支 |
| 无错误状态 | P2 | 请求失败后页面无提示 | 失败后未展示错误状态或重试入口 | `uniapp-standard-skill` R10 | 检查错误处理逻辑 |
| 无网络状态提示 | P2 | 断网时无反馈 | 未监听网络状态并提示 | 通用交互规范 | 检查 `uni.onNetworkStatusChange` 使用 |

## 7. 对齐与布局

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 文字对齐不一致 | P3 | 同一页面文字对齐方式混乱 | 同类型文本使用不同 `text-align` | 通用 UI 规范 | `grep -rnE 'text-align' src/pages/` |
| 元素居中方式多样 | P3 | 代码难以维护 | 同一项目使用多种居中实现 | 通用 UI 规范 | 人工检查居中实现 |
| 混用 `px` 与 `rpx` | P2 | 跨端尺寸不一致 | 样式中同时出现 `px` 和 `rpx` | `uniapp-app-generate-skill` cross-platform | `grep -rnE '[0-9]+px' src/ \| grep -v 'upx'` |

## UI 一致性评分参考

| 级别 | 描述 |
|------|------|
| A | 高度一致，完整使用主题 Token 与共享组件 |
| B | 基本一致，少量裸值 |
| C | 不够一致，需要治理 |
| D | 混乱，大量硬编码与重复实现 |
