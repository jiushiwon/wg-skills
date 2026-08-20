# 输入框案例集（base-input）

`base-input` 是通用输入框组件，覆盖账号、密码、验证码、多行文本、带图标、OTP 格子、浮动标签、**搜索栏**等高频形态。本案例集给出 **14 种场景** 的 HTML 参考图（8 通用 + 6 搜索栏变体），每种独立成文件，方便按形态检索复用。

> 搜索栏是 base-input 的一个**变体**（带 icon + suffix action），不是独立组件。所有搜索场景的搜索栏都复用 `base-input`，不重复定义。

## 共用组件

> [base-input.md](../../base-input.md) —— 通用输入框规范、Props、Slots、变体。  
> 搜索栏是 `base-input` 的变体形态，不单独建组件，6 种形态（pill/card/bubble/flat/embed/mini）见下方案例表。

## 案例清单

### 通用输入（8 种）

| 案例 | 容器 | 输入 | 按钮 | 适用场景 | 文档 | HTML |
|------|------|------|------|----------|------|------|
| base-input-login | 8px | 8px + 全边框 | 8px | 账号密码登录、注册 | [base-input-login.md](base-input-login.md) | [html/base-input-login.html](html/base-input-login.html) |
| base-input-verify | 0 | 0 + 底线分隔 | 8px | 短信验证码、绑定手机 | [base-input-verify.md](base-input-verify.md) | [html/base-input-verify.html](html/base-input-verify.html) |
| base-input-feedback | 12px | 8px + 全边框 | 999px 胶囊 | 意见反馈、留言、备注 | [base-input-feedback.md](base-input-feedback.md) | [html/base-input-feedback.html](html/base-input-feedback.html) |
| base-input-disabled | 0 | 8px + 灰底 | — | 订单详情、提交后只读 | [base-input-disabled.md](base-input-disabled.md) | [html/base-input-disabled.html](html/base-input-disabled.html) |
| base-input-icon-prefix | 8px 全边框 | 8px | — | 前缀 icon / +86 / ¥ | [base-input-icon-prefix.md](base-input-icon-prefix.md) | [html/base-input-icon-prefix.html](html/base-input-icon-prefix.html) |
| base-input-icon-suffix | 8px 浅底 | 8px | — | 后缀清除 / 验证码按钮 / 胶囊 | [base-input-icon-suffix.md](base-input-icon-suffix.md) | [html/base-input-icon-suffix.html](html/base-input-icon-suffix.html) |
| base-input-otp | 8px | 6 位独立格子 | 999px 胶囊 | 支付、绑定、双因素、找回密码 | [base-input-otp.md](base-input-otp.md) | [html/base-input-otp.html](html/base-input-otp.html) |
| base-input-floating | 12px | 0 + 底线 + 浮动标签 | 8px | 注册、信息收集、App 启动引导 | [base-input-floating.md](base-input-floating.md) | [html/base-input-floating.html](html/base-input-floating.html) |

### 搜索栏变体（6 种独立形态）

> 每种形态单独成文件，方便按场景选用。

| 案例 | 形态 | 圆角 | 背景 | 阴影 | 适用 | 文档 | HTML |
|------|------|------|------|------|------|------|------|
| base-input-search-pill | 胶囊 | 999px | surface | shadow-sm | 顶部导航主流 | [base-input-search-pill.md](base-input-search-pill.md) | [html/base-input-search-pill.html](html/base-input-search-pill.html) |
| base-input-search-card | 小圆角卡片 | 8px | surface | shadow-sm | 搜索结果页内嵌 | [base-input-search-card.md](base-input-search-card.md) | [html/base-input-search-card.html](html/base-input-search-card.html) |
| base-input-search-bubble | 弹窗卡片 | 12px | surface | shadow-md | 全局搜索弹窗 | [base-input-search-bubble.md](base-input-search-bubble.md) | [html/base-input-search-bubble.html](html/base-input-search-bubble.html) |
| base-input-search-flat | 扁平 | 0 + 底边 | surface | none | 极简 / 工具类 | [base-input-search-flat.md](base-input-search-flat.md) | [html/base-input-search-flat.html](html/base-input-search-flat.html) |
| base-input-search-embed | 嵌入式 | 8px | --color-bg | none | 头部轻搜索 | [base-input-search-embed.md](base-input-search-embed.md) | [html/base-input-search-embed.html](html/base-input-search-embed.html) |
| base-input-search-mini | 迷你胶囊 | 999px (36px) | --color-bg | none | 头像旁内联 | [base-input-search-mini.md](base-input-search-mini.md) | [html/base-input-search-mini.html](html/base-input-search-mini.html) |

## 设计原则

1. **容器圆角随场景变化**：8px 是默认值，0 用于「面板式 / 扁平方」，12px 用于「温和包裹 / 长内容表单」。
2. **输入框边框分两种**：全边框（border-all）适合强调字段边界，底线（border-bottom）适合极简 / 多行密集排布。
3. **按钮形态区分场景**：8px 中等圆角是主流，胶囊（999px）用于强调 CTA（提交反馈、确认支付）。
4. **图标前缀/后缀用 slot**：prefix slot 放 icon / 国家码 / 货币符号，suffix slot 放清除 / 验证码按钮 / 字符计数。
5. **搜索栏是变体而非独立组件**：所有搜索页面复用 `base-input` 的搜索栏形态，不重复定义。
6. **错误态视觉一致**：边框变红 + 下方红色文字提示（详见 `base-input.md` 错误规范）。
7. **禁用/只读态用灰底**：背景填充 `--color-bg` 或 `--color-bg-soft`，文字降级为 `--color-text-tertiary`。

## 圆角 × 边框选型对照

| 容器圆角 | 输入边框 | 典型场景 | 对应案例 |
|----------|----------|----------|----------|
| `0`（扁平） | `bottom` | 验证码、极简表单 | base-input-verify |
| `0`（扁平） | `all` | 只读/禁用面板 | base-input-disabled |
| `8px` | `all` | 标准登录、注册、设置 | base-input-login / base-input-icon-prefix / base-input-icon-suffix |
| `8px` | `grid`（OTP 格子） | 6 位验证码 | base-input-otp |
| `12px` | `all` | 长文本反馈 | base-input-feedback |
| `12px` | `bottom` + 浮动标签 | 注册、信息收集 | base-input-floating |
| `999px`（胶囊） | — | 搜索栏（顶部导航 / 头像旁） | base-input-search-pill / base-input-search-mini |
| `8px` 卡片 | — | 搜索栏（结果页内嵌） | base-input-search-card |
| `12px` 卡片 | — | 搜索栏（弹窗式 / 高级感） | base-input-search-bubble |
| `0` + 底边 | — | 搜索栏（极简 / 工具类） | base-input-search-flat |
| 浅底 + `8px` | — | 搜索栏（嵌入式 / 头部轻搜索） | base-input-search-embed |