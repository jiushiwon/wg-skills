# uniapp 技能模块

> uni-app（微信小程序 / H5 / App）侧的技能集合，共 15 个技能。
>
> 规范总控：[`AGENTS.md`](AGENTS.md)（10 章 + 小程序端专项，判据唯一来源）
> 单技能规范：各 skill 目录下的 `STANDARD.md`

---

## 一、模块结构

技能**不是并列的**，分三层，依赖单向：

```
第 0 层  变量真源层   uniapp-theme-skill            提供 base.css 全量变量
          ↓
第 1 层  容器层       uniapp-base-skill              根容器 + 基础零件 + 组件索引
          ↓
第 2 层  专项层       style / request / auth / standard / page-components
                      app-generate / ui-replica / ui-template-builder
                      member-center / diagnostic / code-audit
                      crossplatform-audit / vue2-upgrade
```

**唯一真源**（同一份事实只允许存在一份）：

| 事实 | 真源 |
|------|------|
| 主题变量 | `uniapp-theme-skill/templates/src/static/css/base.css` |
| 卡片 / 弹窗 / 表单项 / 头像 / 顶栏 / 底栏外壳 | `uniapp-base-skill/containers/` |
| 组件清单与别名 | `uniapp-base-skill/commands/` + `components/_registry.json` |
| 全局关键帧 | `uniapp-base-skill/styles/animation.scss` |

---

## 二、小白全链路地图

> 假设「我是个小白，想做一个小程序」，按顺序走这 15 步，每一步都有对应 skill。

| # | 环节 | 用哪个 skill | 触发词举例 | 产出 |
|---|------|-------------|-----------|------|
| 1 | 初始化项目 | `uniapp-app-generate-skill` | 「帮我做一个 uniapp 小程序」「初始化 uniapp 项目」 | 可运行的三端骨架 + 动态主题 + 静态资源 |
| 2 | 目录 / 命名 / 红线 | `uniapp-standard-skill` | 「uniapp 目录规范」「开发红线有哪些」 | 目录结构、R01-R20 红线、接口 / 状态管理规范 |
| 3 | 主题与变量 | `uniapp-theme-skill` | 「主题系统」「换肤」「多主题色阶」 | `base.css` 变量真源 + 主题切换 |
| 4 | 视觉与样式 | `uniapp-style-skill` | 「样式规范」「设计系统」「修复硬编码样式」 | Design Tokens 架构、排版 / 间距 / 圆角阶梯、动画预设 |
| 5 | 基础容器与组件 | `uniapp-base-skill` | 「做一个卡片」「做一个输入框」「做一个弹窗」 | 6 个根容器 + 26 个内置组件 + 组件索引 |
| 6 | 页面级组件 | `uniapp-page-components-skill` | 「组件化页面」「聊天页」「商品详情页」「登录页」 | 17 个页面 / 业务组件，slot 自由填充 |
| 7 | 会员中心 / 积分 | `uniapp-member-center-skill` | 「会员中心」「积分商城」「签到」 | 会员身份、权益、积分任务与兑换 |
| 8 | 请求层 | `uniapp-request-skill` | 「请求层怎么封装」「拦截器」「Token 刷新」 | request 封装、拦截器、去重、Mock、上传、SSE |
| 9 | 登录鉴权 | `uniapp-auth-skill` | 「uniapp 登录」「token 管理」「401 处理」 | 登录流程、Token 生命周期、接口与数据安全 |
| 10 | 页面模板 | `uniapp-ui-template-builder-skill` | 「一键生成登录页」「商品页模板」 | 多套风格的成品页面模板（带 mock 数据） |
| 11 | 视觉复刻 | `uniapp-ui-replica-skill` | 「复刻这张图」「截图转代码」「照着设计稿写页面」 | 高还原的可运行页面 |
| 12 | 全维度审计 | `uniapp-code-audit-skill` | 「审计这个 uniapp 项目」 | 10 维度审计报告 |
| 13 | 跨端审计 | `uniapp-crossplatform-audit-skill` | 「跨平台兼容检查」「三端差异」 | 跨端兼容性审计报告 |
| 14 | 运行时诊断 | `uniapp-diagnostic-skill` | 「uniapp 规范化」「项目结构诊断」 | 与标准骨架的差距清单 + 整改方案 |
| 15 | Vue2 升级 | `uniapp-vue2-upgrade-skill` | 「把 Vue2 项目升级到 Vue3」 | 升级方案、迁移指南、差异清单 |

**两个已知空缺**（模块内暂无对应 skill，需到后端 / 通用技能里找）：

| 能力 | 现状 | 建议去处 |
|------|------|---------|
| 小程序支付 | 前端 0 个 skill，支付在后端侧 | `springboot-wechat-pay-skill` 等后端技能 |
| 扫码登录 | 依赖的 `universal-identity-bridge-skill` 仓库内不存在 | 需先补建或改用 `uniapp-auth-skill` 手工实现 |

---

## 三、常见任务怎么找 skill

| 你要做的事 | 先找 |
|-----------|------|
| 从零起一个项目 | `app-generate` → `standard` → `theme` → `base` |
| 页面里加个卡片 / 弹窗 / 输入框 | `base-skill`（用别名检索，别自己写外壳） |
| 换主题色 / 改字号间距 | `theme-skill`（改 `base.css`）或 `style-skill`（改阶梯） |
| 登录没做 / token 过期 | `auth-skill` + `request-skill` |
| 页面做完了不确定对不对 | `code-audit-skill`（全维度）/ `crossplatform-audit-skill`（多端） |
| 键盘顶起 / 胶囊遮挡 / 安全区 | 规范见 [`AGENTS.md` §9](AGENTS.md)，实现用 `base-skill` 的 `base-navbar` / `base-form-item` / `base-tabbar` |

> 组件检索：中文需求 → 组件的映射规则在 `uniapp-base-skill/references/matching-rules.md`，
> 完整清单在 `uniapp-base-skill/commands/`（由注册表生成，改实现后必须重跑生成脚本）。

---

## 四、常用自检命令

```bash
# 技能目录结构 / 引用完整性（仓库级）
bash scripts/check-skills.sh

# base-skill：相对 import 可解析 + 注册表路径齐全
node vibeCoding/frontend/uniapp/uniapp-base-skill/scripts/check-imports.js

# base-skill：commands/*.md 的 GFM 表格未被竖线打断
node vibeCoding/frontend/uniapp/uniapp-base-skill/scripts/check-tables.js

# base-skill：重新生成组件索引与 easycom 注册块（改组件后必跑）
node vibeCoding/frontend/uniapp/uniapp-base-skill/scripts/gen-commands.js
node vibeCoding/frontend/uniapp/uniapp-base-skill/scripts/gen-easycom.js

# 小程序端专项（胶囊避让 / 键盘顶起 / 小程序不可用写法）
node vibeCoding/frontend/uniapp/uniapp-code-audit-skill/scripts/check-miniprogram.js <项目根目录>
```

---

## 五、跨层调用时的红线

1. **内容型组件的外壳必须来自容器**（`base-card` / `base-popup` / `base-form-item` / `base-avatar` / `base-navbar` / `base-tabbar`），禁止手写卡片圆角、分割线、遮罩。
2. **颜色 / 尺寸 / 间距一律 `var(--token, 兜底)`**，兜底值与 `base.css` 真值一致；组件内不出现裸 hex、裸 px。
3. **组件内不写 `@keyframes`**，全局关键帧真源是 `base-skill/styles/animation.scss`。
4. **只用小程序内置组件**（`view` / `text` / `image` / `input` / `textarea` / `scroll-view` / `picker` …），不用 HTML 标签、不用 DOM API。
5. **改组件实现 → 同步 `props.json` / `usage.md` / 注册表 / `commands/`**；**改目录 → 同步 `SKILL.md` 目录树与本文件**。

完整条款见 [`AGENTS.md`](AGENTS.md)。
