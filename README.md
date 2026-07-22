# wg-skills 🛠️

> Claude Code 技能集合，让 AI 更懂你的开发需求

## 什么是 Skills？

Skills 是 Claude Code 的能力扩展，通过预先定义的规则和指令，让 AI 在特定场景下表现更专业、更精准。

每个 Skill 包含：
- **触发条件**：什么情况下调用
- **审查/生成规则**：具体的检查维度或实现步骤
- **输出格式**：标准化的结果呈现
- **参考资料**：相关的技术文档与规范

## 🚀 快速开始

### 安装 Skills

skills 已经随 Claude Code 一起安装，无需额外操作。

### 使用方式

直接告诉 Claude 你要做什么：

```
帮我审查前端代码
检测这段文案有没有AI风
帮我做一个 uniapp 小程序
生成后端项目
```

Claude 会根据你的需求自动匹配并调用对应的 Skill。

### 显示可用技能

```
/skill list
```

或

```
有哪些技能
```

---

## 📦 当前可用 Skills

### 1. frontend-code-doctor 🩺

> 前端代码审查技能

**功能**：自动检测前端代码质量问题、性能问题、安全漏洞。

**使用场景**：
- 审查 Vue/React/uni-app 项目代码
- 检查 TypeScript 类型安全
- 发现性能问题和内存泄漏
- 检测安全漏洞（XSS、CSRF、敏感信息泄露）
- 审查 i18n 和 Accessibility

**使用方式**：

```
/frontend-code-doctor
```

或

```
/frontend-code-review
帮我审查下这个前端项目
看看代码有什么问题
```

**详细文档**：[frontend-code-doctor/README.md](frontend-code-doctor/README.md)

---

### 2. ai-speech-detector 🗣️

> AI 风检测技能

**功能**：检测文案中的 AI 风味词汇、套话、车轱辘话，提供量化评分、领域适配、风格校准和一键修复。

**使用场景**：
- 检测文章是否 AI 生成
- 公众号审稿
- 简历/面试文书检查
- 电商文案优化
- 社媒内容审核

**使用方式**：

```
/ai-speech-detector
```

或

```
帮我检测下这篇文章的AI风
看看像不像AI写的
去除这段文字的AI味
```

**详细文档**：[ai-speech-detector/README.md](ai-speech-detector/README.md)

---

### 3. frontend-ui-foundry 🎨

> 综合前端 UI 技能：按场景生成 / 一键优化 / Token 统一 / 品牌套用

**功能**：8 大场景 × 10 套调色板 × 58 个品牌 × 6 大技术栈的端到端 UI 工具链。提供 `forge`（从零生成）、`optimize`（智能重构）、`audit`（设计+代码审查）、`tokens`（设计资产管理）、`unify`（多页面变体收敛）、`brand`（品牌套用）、`scenario`（场景方案）、`stack`（技术栈最佳实践）共 8 个子命令。

**使用场景**：
- 从零生成新项目（落地页/官网/后台/文档/金融/3D 等）
- 智能重构现有项目（Vue/React/uniapp/HTML）
- 提取并统一设计 Token（颜色/字体/间距/圆角/动效）
- 套用品牌风格（Stripe/Linear/Vercel/Apple/Claude 等）
- 审查项目 AI slop 与可访问性

**使用方式**：

```
/frontend-ui-foundry
```

或自然语言：

```
用 foundry 帮我做一个营销落地页，用 Stripe 风格
用 foundry 优化我当前项目
用 foundry 审查这个项目
```

**8 个子命令速查**：

| 命令 | 干什么 | 例子 |
|------|--------|------|
| `forge` | 从零生成 | `forge landing-marketing --brand stripe --stack react-nextjs` |
| `optimize` | 智能重构 | `optimize --strategy gradual` |
| `audit` | 设计+代码审查 | `audit --depth deep` |
| `tokens` | Token 提取/导出 | `tokens export tailwind` |
| `unify` | 多页面统一 | `unify --scope pages` |
| `brand` | 套用品牌 | `brand apple ./my-project` |
| `scenario` | 查看场景方案 | `scenario admin-dashboard` |
| `stack` | 查看栈方案 | `stack react-nextjs` |

**详细文档**：[frontend-ui-foundry/README.md](frontend-ui-foundry/README.md)（安装说明 + 8 子命令 + 完整资源索引）

---

### 4. ui-replica-skill 🖼️

> UI 原型图复刻技能：把 AI 生成的 UI 截图/原型图系统化复刻成生产级 HTML/Vue 代码

**功能**：读图 → 结构化拆解 → 设计 Token 收敛 → 组件抽象 → 代码生成 → 验证补全。专门解决"看图复刻效果一般"的问题，强制加入中间的结构化和收敛层，让还原结果更精确、更可维护。

**使用场景**：
- 复刻 AI UI 生成器产出的原型图（Stitch、v0、Galileo AI、Uizard、Figma/AI 等）
- 把设计稿截图转成可运行的 HTML/Vue/uniapp/React 代码
- 之前复刻效果差，需要系统化方法提升还原度

**使用方式**：

```
/ui-replica-skill
```

或自然语言：

```
复刻这张图
把这张原型图转成 Vue 代码
Figma 转代码
Stitch 转代码
照着设计稿写页面
```

**详细文档**：[ui-replica-skill/README.md](ui-replica-skill/README.md)

---

### 5. backend-generate-skill 🖥️

> 后端项目骨架生成技能集合（父目录 + 7 嵌套子技能）

**功能**：从零生成标准化后端项目，按职责拆成 7 个子 skill：

| 子 skill | 职责 | 触发关键词 |
|----------|------|-----------|
| [backend-select-skill](backend-generate-skill/backend-select-skill/) | 入口：问答选型、分流 | `生成后端项目`、`backend generate` |
| [backend-convention-skill](backend-generate-skill/backend-convention-skill/) | 公共规范：响应信封、错误码、api-contract | `后端规范`、`api 契约` |
| [java-backend-skill](backend-generate-skill/java-backend-skill/) | Spring Boot 项目生成 | `用 Java 写后端`、`Spring Boot` |
| [go-backend-skill](backend-generate-skill/go-backend-skill/) | Gin 项目生成 | `用 Go 写后端`、`Gin 项目` |
| [python-backend-skill](backend-generate-skill/python-backend-skill/) | FastAPI 项目生成 | `用 Python 写后端`、`FastAPI` |
| [nodejs-backend-skill](backend-generate-skill/nodejs-backend-skill/) | Express / NestJS 项目生成 | `用 Node 写后端`、`Express`、`NestJS` |
| [database-skill](backend-generate-skill/database-skill/) | PG/MySQL/Mongo 选型与迁移 | `数据库选型`、`schema 设计` |

**使用场景**：
- 新建后端服务
- 搭建后端 API 骨架
- 为 uni-app 前端生成配套后端
- 统一团队后端项目结构与接口规范

**使用方式**：

```
生成后端项目              # 进入选型 skill，问答后分流
用 Java 写后端            # 直接进入 java-backend-skill
用 FastAPI 写一个后端     # 直接进入 python-backend-skill
后端规范                  # 进入 convention skill
数据库选型                # 进入 database skill
```

**设计原则**：
- 拆分不删除：原 7 套 boilerplate 全部转为现场生成，能力不丢失
- 公共规范单一来源：响应信封、错误码、契约只在 `backend-convention-skill` 定义
- 版本不腐烂：不再维护写死版本号，生成时查询官方源
- 强制双文档：每个生成项目必带 `api-contract.md`（接口 md，前后端唯一事实来源）+ `docs/project-guide.md`（介绍 & 拓展性文档：技术栈/对接前端/接口范式/拦截器/出入参）

**详细文档**：[backend-generate-skill/README.md](backend-generate-skill/README.md)

---

### 6. uniapp-app-generate-skill 📱

> uni-app 项目生成技能

**功能**：从零生成标准化 uni-app 项目，支持微信小程序、H5、App 三端。基于 Vue3 + TypeScript + Pinia + SCSS，内置主题色阶（含色阶外颜色硬卡）、强制复用组件库、跨平台抽象层、自定义导航栏（胶囊独占一行）、静态资源规范与一键自检。

**使用场景**：
- 新建微信小程序/H5/App 三端应用
- 快速搭建小程序标准目录与规范
- 为后端接口生成配套前端

**使用方式**：

```
/uniapp-app-generate-skill
```

或自然语言：

```
帮我做一个 uniapp 小程序
初始化一个微信小程序项目
用 uniapp 搭建一个商城小程序
```

**详细文档**：[uniapp-app-generate-skill/README.md](uniapp-app-generate-skill/README.md)

---

### 7. icon-forge 🎨

> 图标生成技能

**功能**：把 SVG path 或完整 SVG 批量渲染成 PNG。适合 uni-app / 小程序 / React Native / H5 等需要成套单色 PNG 图标的场景。

**使用场景**：
- 批量生成 tabBar 图标
- 生成登录页功能图标
- 统一应用图标风格与尺寸

**使用方式**：

```
/icon-forge
```

或自然语言：

```
生成图标
做一套图标
生成 png 图标
给我加几个图标
```

**详细文档**：[icon-forge/README.md](icon-forge/README.md)

---

### 8. super-deploy-skills 🚀

> 一键部署技能套件（父技能 + 5 个子技能，统一放在 `super-deploy-skills/` 目录下）

**功能**：从「检测项目技术栈」到「服务器装环境」到「生成部署脚本/Docker」一条龙。包含 5 个子技能，通过共享的 `deploy-profile.md` 串联：

| 子技能 | 职责 |
|--------|------|
| [deploy-detect-skill](super-deploy-skills/deploy-detect-skill/) | 检测项目语言/框架/数据库，生成 `deploy-profile.md` |
| [server-setup-skill](super-deploy-skills/server-setup-skill/) | 检测服务器环境，按画像装依赖（含预置安装脚本 `install.sh`/`install.ps1`） |
| [static-nginx-skill](super-deploy-skills/static-nginx-skill/) | 前端 Vue/React 静态产物 Nginx 托管配置 |
| [deploy-native-skill](super-deploy-skills/deploy-native-skill/) | 原生部署脚本（含预置 `launch.sh`/`launch.ps1` + systemd/pm2 模板） |
| [deploy-docker-skill](super-deploy-skills/deploy-docker-skill/) | Dockerfile + docker-compose 生成 |

**使用场景**：
- Node.js / Python / Java / Go 后端服务部署
- Vue / React 前端静态资源 Nginx 托管
- 服务器环境检测与依赖补齐（JDK/Node/Python/Go/Nginx/Docker）
- 原生（pm2/systemd/nohup）或 Docker 两种部署方式

**使用方式**：

```
/super-deploy-skills
```

或自然语言：

```
帮我部署这个项目
一键部署到服务器
用 Docker 部署
用原生脚本部署
```

**详细文档**：[super-deploy-skills/README.md](super-deploy-skills/README.md)（含完整使用走查）

---

### 9. backend-analysis-skill 🔍

> 后端项目全景分析技能：不运行项目，静态扫描源码，一次产出 4 份报告

**功能**：接手陌生后端项目时，一次回答四个问题——**有哪些接口？用了什么技术？数据库长什么样？业务怎么跑？** 支持 Java(Spring Boot/Cloud)、Go(Gin/Echo)、Python(FastAPI/Django/Flask)、Node.js(Express/NestJS)。

| 报告 | 内容 |
|------|------|
| `01-api-report.md` | 全部 API 清单：方法/路径/入参/出参/鉴权 + 无鉴权接口预警 |
| `02-tech-report.md` | 语言框架版本、中间件（Redis/MQ/ES）、第三方 API（短信/支付/推送）、架构组件（拦截器/全局异常/跨域）、安全隐患 |
| `03-database-report.md` | 数据库类型、表清单、核心表结构、迁移脚本、Redis 缓存设计 |
| `04-business-report.md` | 模块划分、核心业务流程（带调用链）、定时任务、对外集成点 |
| `00-overview.md` | 项目画像 + 规模统计 + Top 风险 + 接手阅读顺序 |

**特点**：项目跑不起来也能分析（纯静态扫描）；每条结论标注来源 `file:line`；密钥密码自动打码；报告默认写入目标项目 `docs/backend-analysis/`。

**使用场景**：
- 接手老项目、新人 onboarding
- 补交接文档、接口文档、数据字典
- 技术盘点、重构/迁移前摸底

**使用方式**：

```
帮我分析下这个后端项目，出完整报告
梳理下这个项目所有接口
盘点下技术栈和第三方服务
出一份数据库文档
```

**详细文档**：[backend-analysis-skill/README.md](backend-analysis-skill/README.md)

---

### 10. icon-image-catch-skill 🖼️

> 远程素材抓取套件（父技能 + 2 个子技能）：说「一只猫的图片」就去找猫的图，说「home 图标」就去找合适的 home icon；也支持项目素材需求审计。

**功能**：根据自然语言语义，动态抓取**专业图标**与**高清图片**，根治 VibeCoding 页面两大顽疾：粗糙 Emoji 图标 + 渐变占位。支持图标展示公共 class、本地压缩/切图、SVG→PNG 一键渲染、项目素材需求报告、自动探测项目类型与平台尺寸、**可配置远程图片源**。

| 子技能 | 职责 | 数据源 | 配置 |
|--------|------|--------|------|
| [icon-catch-skill](icon-image-catch-skill/icon-catch-skill/) | 语义搜图标 → 下载 SVG；一键转 PNG；抓图后可输出 `.icon-box` 图标展示公共 class | Iconify（20 万+ 图标，含 lucide/tabler/heroicons 等 100+ 图标集） | **零配置，免费无需 Key** |
| [image-catch-skill](icon-image-catch-skill/image-catch-skill/) | 语义搜图片 → 下载高清图；本地压缩/切图/格式转换；按项目类型自动推荐尺寸；**支持自定义远程源** | 自定义源 / Pexels / Pixabay / Unsplash / Lorem Flickr / Picsum 兜底 | 可选 Key + `npm install` |

**使用场景**：
- 把页面中的 Emoji 全部替换为专业图标
- 给 Hero 区域 / 卡片 / banner 配真实高清图片
- 批量抓取成套图标（tabBar、功能入口），并输出 `.icon-box` 展示样式
- 审计项目素材需求，自动探测框架/平台/主题色，输出 `assets-requirements-report.md`

**使用方式**：

```
帮我抓一个 home 图标，放到 static/icons
给首页 Hero 区域抓一张科技感办公背景图
把这个页面的 Emoji 全部换成 lucide 风格的专业图标
帮我审计一下这个项目需要哪些素材
扫描一下这个项目，把需要图的地方都补上
图标展示
```

**详细文档**：[icon-image-catch-skill/README.md](icon-image-catch-skill/README.md)

---

### 11. image-forge-skill 🛠️

> 本地图片处理工具：压缩、转格式、改尺寸、裁剪、base64、水印、遮罩、多图合成

**功能**：对项目本地图片进行**压缩、转格式、改尺寸、裁剪、base64 编码、水印、遮罩、多图合成**。与 `icon-image-catch-skill` 互补：后者负责找图，本技能负责处理图。

**使用场景**：
- 把项目里的 JPG 批量转 WebP 并压缩
- 把大图裁剪成指定比例的封面图
- 给图片加文字/Logo 水印或黑色半透明遮罩
- 把多张图合成 banner 或分享卡
- 生成 base64 Data URI 内联使用

**使用方式**：

```
把 photo.jpg 压缩成 800 宽的 webp
给 banner 加黑色遮罩和白色标题文字
把 logo.png 合成到 photo.jpg 右上角
```

**详细文档**：[image-forge-skill/README.md](image-forge-skill/README.md)

---

### 12. module-generate-skill 🧩

> 后端业务模块生成套件（父技能 + 5 个子技能）：骨架之上，按统一规范长出具体业务模块

**功能**：与 `backend-generate-skill` 互补——后者搭骨架，本套件在骨架上生成**业务模块**：领域模型、表结构 DDL、接口契约增量（追加进项目 `api-contract.md`）、四语言（Java/Go/Python/Node）实现要点。自动检测已有项目技术栈；无骨架时串联 backend-generate-skill 先生成。所有模块强制遵循 backend-convention-skill（响应信封/错误码/JWT/契约模板，引用不复制）。

| 子技能 | 模块 | 内容 |
|--------|------|------|
| [auth-skill](module-generate-skill/auth-skill/) | 登录鉴权 | JWT 双令牌 + 轮换重放检测、密码/验证码登录、登出拉黑、失败锁定 |
| [org-permission-skill](module-generate-skill/org-permission-skill/) | 组织与权限 | 组织树、RBAC、菜单/按钮权限、数据权限 |
| [ai-chat-skill](module-generate-skill/ai-chat-skill/) | AI 聊天（带记忆） | 会话管理、消息持久化、短期+长期记忆、SSE 流式、上下文裁剪 |
| [notification-skill](module-generate-skill/notification-skill/) | 短信邮箱通知 | 阿里云短信参考实现、SMTP 邮件、模板、限流、发送记录 |
| [payment-skill](module-generate-skill/payment-skill/) | 支付 | 微信/支付宝下单、回调验签、退款、幂等、对账（金额一律整数分） |

**使用场景**：
- 在已有后端项目里加登录鉴权 / RBAC 权限
- 对接微信支付、支付宝，要退款和对账
- 做带记忆的 AI 聊天后端（会话持久化 + 流式输出）
- 接入阿里云短信验证码 / 邮件通知
- 新建项目时与 backend-generate-skill 串联：先骨架后模块

**使用方式**：

```
帮我加一个登录鉴权模块，手机号 + 验证码登录
现有 Spring Boot 项目里加一套 RBAC 权限，要菜单权限和数据权限
对接微信支付和支付宝，需要退款和对账
做一个带记忆的 AI 聊天模块，会话要持久化
用 Go 搭个后端，然后加上组织权限和短信通知模块
```

**设计原则**：
- 每个模块内置「红线」：把该模块最容易做错的事（支付验签幂等、令牌安全、短信限流…）写成强制约束
- 模块为主、语言为参考：12 模块规划下避免「模块×语言」技能爆炸
- 二期规划：电商、工作流与定时任务、三方 API 对接、文件存储

**详细文档**：[module-generate-skill/README.md](module-generate-skill/README.md)

---

### 13. skill-auditor 🔒

> Skill 安全审计技能(基础版)。对任意 Claude Code / Agent Skill 做投毒与恶意行为审查,识别数据外泄链、隐藏脚本/供应链投毒、破坏性命令、Prompt 注入话术、权限放大、货不对板 6 大维度,产出结构化风险报告。

**使用场景**：
- 安装外部 Skill 前做安全检查
- 审计自己仓库里的 Skill 是否有风险
- 排查「货不对板」的克隆品

**使用方式**：

```
审查这个 skill 有没有毒
检测这个 skill 安全吗
skill 安全审计
```

**详细文档**：[skill-auditor/README.md](skill-auditor/README.md)

---

### 14. xhs-style-writer-skill ✍️

> 小红书个人风格写作技能

**功能**：学习本人/对标账号的 3-10 篇笔记提取可复用风格档案（语气、口头禅、emoji 习惯、排版、标题套路，全部带原文例句），按档案写出"像本人写的"笔记并强制去 AI 味自检。

**使用场景**：
- 给账号建立风格档案（一次建档，长期复用）
- 按档案写小红书笔记：3 标题候选 + 正文 + 标签 + 首图文案
- 给现成文案去 AI 味、改写降重

**使用方式**：

```
这是我的 5 篇笔记：<粘贴原文>，帮我建风格档案
按我的风格档案，写一篇"打工人带饭"的笔记
这篇文案帮我改得像人写的：<粘贴文案>
```

**详细文档**：[xhs-style-writer-skill/README.md](xhs-style-writer-skill/README.md)

---

### 15. frontend-style-harmonizer-skill 🎯

> 前端样式一致性治理技能

**功能**：发现跨页面样式重复、同类组件（按钮/tab/输入框）尺寸不一致、硬编码裸值，给出收敛方案并可自动落地为公共 CSS / 公共组件 / CSS 变量。

**使用场景**：
- 多页面公共样式抽取（复用）
- 同类组件跨页面对齐（按钮/tab/输入框/标签/列表项高度统一）
- 硬编码值（`14rpx`、`#c45c48`）变量化
- 消除固定高度容器（头部 tab）跨页面不一致导致的跳变

**使用方式**：

```
统一各页面样式
样式对齐
抽取公共样式
去硬编码
按钮对齐
tab高度不一致
样式治理
样式审查
```

**详细文档**：[frontend-style-harmonizer-skill/README.md](frontend-style-harmonizer-skill/README.md)

---

### 16. ui-component-commands-skill 🎯

> 前端UI组件指令系统 - 通过预定义指令+CSS变量绑定，一句话生成精确样式的UI组件

**功能**：解决AI生成UI时的反复拉扯问题。通过预定义指令（如 `btn-primary`、`solid-line`、`icon-tag`）绑定具体CSS class，AI直接调用而非自由发挥。

**核心优势**：
- **确定性**：AI调用预定义class，结果可预测
- **一致性**：所有按钮都用同一个class，项目风格统一
- **可维护性**：改一次CSS，全项目生效
- **对抗幻觉**：预定义代码就在那里，AI无法凭空创造

**使用场景**：
- 说"做一个按钮" → 自动使用项目主题色、border-radius:10px、height:40px、font-size:16px
- 说"加个分割线" → 直接输出 `<view class="solid-line"></view>`
- 说"图标+标签" → 输出 `<view class="icon-tag">...</view>`

**指令示例**：

| 指令 | 效果 |
|------|------|
| `btn-primary` | 主按钮（主题色、圆角10px、高40px） |
| `btn-secondary` | 次按钮（灰色） |
| `btn-ghost` | 幽灵按钮（透明背景+边框） |
| `solid-line` | 1px实线分割线 |
| `dashed-line` | 虚线 |
| `semi-circle` | 半圆图形 |
| `icon-tag` | 图标+文字标签组合 |
| `badge` | 徽章/角标 |
| `card-basic` | 基础卡片 |

**使用方式**：

```
做一个主按钮
帮我加个分割线
显示一个半圆
图标+文字的标签
```

**详细文档**：[ui-component-commands-skill/README.md](ui-component-commands-skill/README.md)

---

### 17. uniapp-crossplatform-audit-skill 🌐

> uniapp 跨平台兼容性审计技能

**功能**：审计 uniapp 项目的跨平台兼容性，检测 H5/小程序/App 差异问题。包括模板标签检查（div/span/img → view/text/image）、CSS 兼容性检查（background-image/var()/calc()）、API 检查（fetch/window/document → uni API），输出按文件维度组织的兼容性问题清单。

**使用场景**：
- 检查项目能否同时跑小程序和 App
- 审计 H5 标签在小程序的兼容性问题
- 修复跨平台 API 调用差异
- 生成兼容性修复报告

**使用方式**：

```
/uniapp-crossplatform-audit-skill
```

或自然语言：

```
审计多端兼容性
检查 uniapp 跨平台问题
小程序 App 兼容性问题
```

**详细文档**：[uniapp-crossplatform-audit-skill/README.md](uniapp-crossplatform-audit-skill/README.md)

---

### 18. uniapp-code-audit-skill 🔍

> uniapp 代码安全和 UI 审计技能

**功能**：审计 uniapp 项目的代码质量、安全漏洞、性能问题和 UI 规范。包含安全扫描（敏感信息硬编码、域名配置、隐私合规）、性能扫描（图片压缩、包体积、长列表优化）、代码质量（any 滥用、硬编码、重复代码）、UI 一致性（颜色/字号/间距不统一），输出按严重程度分级的问题清单。

**使用场景**：
- 全面审计小程序代码质量
- 检测安全漏洞和风险
- 扫描性能问题
- 检查 UI 一致性

**使用方式**：

```
/uniapp-code-audit-skill
```

或自然语言：

```
审计 uniapp 代码
帮我看看这个项目有什么问题
小程序代码质量审计
```

**详细文档**：[uniapp-code-audit-skill/README.md](uniapp-code-audit-skill/README.md)

---

### 19. uniapp-standardization-skill 📐

> uniapp 项目规范化技能

**功能**：诊断现有 uniapp 项目与标准骨架的差距，出具规范化诊断报告和重构计划。对比当前目录结构 vs 标准骨架（api/stores/components/pages/styles 等），检测 API 层/状态管理/组件/样式规范，输出缺失目录/文件清单和按优先级排序的调整建议。

**使用场景**：
- 项目结构混乱，需要规范化
- 接手老项目，需要诊断问题
- 重构前了解现状
- 制定规范化调整计划

**使用方式**：

```
/uniapp-standardization-skill
```

或自然语言：

```
项目规范化
uniapp 规范化
帮我看看项目结构有什么问题
```

**详细文档**：[uniapp-standardization-skill/README.md](uniapp-standardization-skill/README.md)

---

### 20. uniapp-vue2-upgrade-skill ⬆️

> uniapp Vue2 升级到 Vue3 技能

**功能**：将 Vue2 小程序或 uniapp Vue2 项目迁移到 Vue3+TypeScript+Pinia。包含现状扫描（技术栈检测、依赖兼容性评估）、语法对照（v2→v3 语法差异）、脚手架升级（Vite + TS + Pinia）、代码迁移（按优先级迁移），输出迁移难度评估和详细步骤。

**使用场景**：
- Vue2 项目升级到 Vue3
- uniapp 项目从 Vue2 迁移
- 小程序项目升级
- 技术栈升级

**使用方式**：

```
/uniapp-vue2-upgrade-skill
```

或自然语言：

```
vue2 升级 vue3
uniapp 迁移
帮我把这个项目从 Vue2 升级到 Vue3
```

**详细文档**：[uniapp-vue2-upgrade-skill/README.md](uniapp-vue2-upgrade-skill/README.md)

---

### 21. vibecoding-guide-skill 🧭

> VibeCoding / AI 开发全流程知识导师（父技能 + 3 嵌套子技能）

**功能**：把用户分流到三条独立路线——VibeCoding 产品落地、Agent 系统学习、Agent 工程师面试准备。只做推荐，不执行具体生成任务。

**子技能**：

| 子技能 | 职责 |
|--------|------|
| [vibecoding-workflow-skill](vibecoding-guide-skill/vibecoding-workflow-skill/) | 工具→模型→IDE→提示词→产品模块→开发→联调→测试→部署 |
| [agent-learning-skill](vibecoding-guide-skill/agent-learning-skill/) | Agent 概念→制作→模型底层→算法→Skill 学习 |
| [agent-interview-skill](vibecoding-guide-skill/agent-interview-skill/) | 面试知识树 + 项目包装 + 模拟题 |

**使用方式**：

```
/vibecoding
我想学 VibeCoding
AI 编程怎么入门
```

**详细文档**：[vibecoding-guide-skill/README.md](vibecoding-guide-skill/README.md)

---

## 📋 Skill 一览

| Skill | 说明 | 触发关键词 |
|------|------|-----------|
| [frontend-code-doctor](frontend-code-doctor/) | 前端代码审查 | `审查代码`、`code review` |
| [ai-speech-detector](ai-speech-detector/) | AI 风检测 | `AI风`、`AI味`、`像AI写的` |
| [frontend-ui-foundry](frontend-ui-foundry/) | 综合前端 UI | `生成 UI`、`优化项目`、`Token 统一` |
| [ui-replica-skill](ui-replica-skill/) | UI 原型图复刻（读图→结构化→Token→组件→代码） | `复刻这张图`、`Figma 转代码`、`Stitch 转代码`、`原型图复刻` |
| [backend-generate-skill](backend-generate-skill/) | 后端项目骨架生成（7 子技能：选型/规范/Java/Go/Python/Node/数据库） | `生成后端`、`backend generate`、`用 Java/Go/Python/Node 写后端` |
| [uniapp-app-generate-skill](uniapp-app-generate-skill/) | uni-app 项目生成 | `uniapp 小程序`、`初始化微信小程序` |
| [icon-forge](icon-forge/) | 图标生成 | `生成图标`、`icon 生成`、`png 图标` |
| [super-deploy-skills](super-deploy-skills/) | 一键部署套件（5 子技能：检测/装机/Nginx/原生/Docker） | `部署项目`、`一键部署`、`deploy`、`Docker 部署` |
| [backend-analysis-skill](backend-analysis-skill/) | 后端项目全景分析（接口/技术栈/数据库/业务 4 份报告） | `分析后端项目`、`梳理接口`、`盘点技术栈`、`出数据库文档`、`接手老项目` |
| [icon-image-catch-skill](icon-image-catch-skill/) | 素材抓取套件（2 子技能：图标抓取 Iconify 免 Key + SVG→PNG + 图标展示 class / 图片抓取自定义源·三源自动降级·Lorem Flickr 无 Key 语义兜底·Picsum 占位兜底 + 本地压缩切图 + 项目素材审计·自动探测项目类型与平台尺寸·扫描项目自动抓取） | `抓图标`、`下载 icon`、`抓图片`、`找配图`、`背景图`、`项目素材审计`、`图标展示`、`扫描项目` |
| [image-forge-skill](image-forge-skill/) | 本地图片处理工具：压缩/转格式/改尺寸/裁剪/base64/水印/遮罩/多图合成 | `压缩图片`、`转 webp`、`改尺寸`、`裁剪图片`、`加水印`、`图片合成`、`base64 图片`、`处理图片` |
| [module-generate-skill](module-generate-skill/) | 后端业务模块生成套件（5 子技能：登录鉴权/组织权限/AI 聊天/短信邮箱/支付） | `加登录`、`加权限`、`RBAC`、`对接支付`、`短信验证码`、`AI 聊天`、`带记忆的对话` |
| [skill-auditor](skill-auditor/) | Skill 安全审计（6 维度：数据外泄/供应链/破坏命令/注入话术/权限放大/货不对板） | `审查 skill`、`检测有毒吗`、`skill 安全审计`、`audit skill` |
| [xhs-style-writer-skill](xhs-style-writer-skill/) | 小红书个人风格写作（建档/写作/去 AI 味三模式） | `写小红书笔记`、`种草笔记`、`爆款标题`、`学我的风格写`、`去 AI 味` |
| [frontend-style-harmonizer-skill](frontend-style-harmonizer-skill/) | 前端样式一致性治理（复用抽取/对齐收敛/硬编码变量化） | `统一各页面样式`、`样式对齐`、`去硬编码`、`按钮对齐`、`tab高度不一致`、`样式治理` |
| [ui-component-commands-skill](ui-component-commands-skill/) | UI组件指令系统（按钮/线条/图形/组合） | `做按钮`、`加分割线`、`图标+标签`、`半圆`、`徽章` |
| [uniapp-crossplatform-audit-skill](uniapp-crossplatform-audit-skill/) | uniapp 跨平台兼容性审计 | `多端兼容`、`跨平台审计`、`小程序 App 兼容` |
| [uniapp-code-audit-skill](uniapp-code-audit-skill/) | uniapp 代码安全和 UI 审计 | `uniapp 审计`、`小程序代码审计`、`漏洞扫描` |
| [uniapp-standardization-skill](uniapp-standardization-skill/) | uniapp 项目规范化 | `uniapp 规范化`、`项目结构诊断`、`代码规范` |
| [uniapp-vue2-upgrade-skill](uniapp-vue2-upgrade-skill/) | uniapp Vue2 升级到 Vue3 | `vue2 升级 vue3`、`uniapp 迁移`、`小程序升级` |
| [vibecoding-guide-skill](vibecoding-guide-skill/) | VibeCoding / AI 开发知识导师（3 子技能） | `/vibecoding`、`我想学 VibeCoding` |

> 注：`demo/foundry-demo` 是 [frontend-ui-foundry](frontend-ui-foundry/) 的端到端示例，不是独立 Skill。
> 注：`super-deploy-skills` 是父技能，包含 5 个子技能，统一放在 `super-deploy-skills/` 目录下；`deploy-detect-skill` 是其余子技能的共享前置。

---

## 🔗 部署技能套件组合使用

5 个部署技能通过共享的 `deploy-profile.md` 串联，典型流程：

```
1. deploy-detect-skill      检测项目技术栈 → 生成 deploy-profile.md
2. server-setup-skill       检测服务器环境 → 对比画像 → 生成/执行安装命令
3. static-nginx-skill       (仅前端项目) 配置 Nginx 托管静态产物
4a. deploy-native-skill     二选一：生成原生部署脚本（systemd/pm2/...）
4b. deploy-docker-skill     二选一：生成 Dockerfile + docker-compose.yml
5. (可选) 配置自动重新检测   git hook / CI 在代码变更后刷新 deploy-profile.md
```

自然语言示例：

```
帮我部署这个项目                    → 触发 deploy-detect-skill
检测下服务器能不能跑                → 触发 server-setup-skill
用 Docker 部署                      → 触发 deploy-docker-skill（读画像）
用原生脚本部署                      → 触发 deploy-native-skill（读画像）
前端用 Nginx 托管                   → 触发 static-nginx-skill（读画像）
代码更新了，重新检测下部署画像       → 再次触发 deploy-detect-skill
```

**关键约定**：

- 父技能 `super-deploy-skills` 是统一入口，按意图路由到 5 个子技能（位于 `super-deploy-skills/` 目录下）。
- 所有技能默认**只生成脚本/命令，不自动执行**；执行安装或部署需二次确认。
- **数据库初始化永不自动执行**，由用户审查命令后手动跑。
- **端口统一 `APP_PORT`**（默认 8080），贯穿启动脚本、systemd/pm2、Dockerfile、Nginx；详见 [script-standards.md](super-deploy-skills/deploy-native-skill/references/script-standards.md)。
- **预置脚本**：装机用 [`install.sh`](super-deploy-skills/server-setup-skill/assets/install.sh) / [`install.ps1`](super-deploy-skills/server-setup-skill/assets/install.ps1)，部署用 [`launch.sh`](super-deploy-skills/deploy-native-skill/assets/launch.sh) / [`launch.ps1`](super-deploy-skills/deploy-native-skill/assets/launch.ps1)，统一日志格式 `[时间] [级别] 消息`。
- 项目变更后重新跑 `deploy-detect-skill` 即可刷新画像，无需手动改文档。

完整使用走查见 [super-deploy-skills/README.md](super-deploy-skills/README.md)。

---

## ➕ 添加新 Skill

### 方式一：手动创建

```
wg-skills/
├── new-skill/
│   ├── SKILL.md          # 必须：技能定义
│   ├── README.md         # 可选：使用文档
│   └── references/       # 可选：参考规则
│       └── xxx-rules.md
```

### SKILL.md 必填字段

```yaml
---
name: skill-name
description: 技能的简短描述
---

# Skill Title

## 使用方式
xxx

## 审查维度
xxx
```

### 方式二：使用 skill-creator

直接告诉 Claude：

```
帮我创建一个 xxx 技能
```

---

## 📁 项目结构

```
wg-skills/
├── README.md                   # 本文件：仓库总览
├── CLAUDE.md                   # 项目级规范
├── .claudeignore               # Claude 索引忽略配置
├── .gitignore
├── LICENSE
├── frontend-code-doctor/       # 前端代码审查技能
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── typescript-rules.md
│       ├── vue3-rules.md
│       ├── react-rules.md
│       ├── security-rules.md
│       ├── i18n-rules.md
│       ├── a11y-rules.md
│       ├── performance.md
│       └── uniapp-rules.md
├── ai-speech-detector/         # AI 风检测技能
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── ai-words.md
│       ├── english-words.md
│       ├── structural-patterns.md
│       ├── domain-patterns.md
│       ├── mixed-language.md
│       └── voice-calibration.md
├── frontend-ui-foundry/        # 综合前端 UI 技能
│   ├── SKILL.md
│   ├── README.md
│   ├── docs/                   # 完整使用文档
│   ├── references/             # 知识库（tokens / scenarios / brands / stacks / commands）
│   ├── scripts/                # 工具脚本
│   ├── templates/              # Token 模板
│   └── demo/                   # 端到端验证
├── ui-replica-skill/           # UI 原型图复刻技能
│   ├── SKILL.md                # 技能入口与核心流程
│   ├── README.md               # 使用说明与示例
│   ├── examples/               # 复刻样例（中后台/移动端/营销页）
│   └── references/             # 复刻流程/检查清单/Token模板/结构模板/复杂组件/集成指引/多图梳理
│       ├── workflow.md
│       ├── checklist.md
│       ├── token-template.md
│       ├── structure-template.md
│       ├── complex-components.md
│       ├── integration-guide.md
│       └── multi-mockups.md
├── backend-generate-skill/     # 后端项目骨架生成技能集合（父目录 + 7 嵌套子技能）
│   ├── SKILL.md
│   ├── README.md
│   ├── backend-select-skill/        # 选型入口：问答 → 推荐 → 分流
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/tech-stack-decision-matrix.md
│   ├── backend-convention-skill/    # 公共规范：响应信封/错误码/契约/项目模板
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       ├── response-format.md
│   │       ├── api-contract-spec.md
│   │       ├── default-api-contract.md     # 默认接口 md 模板（生成 api-contract.md 的起点）
│   │       ├── project-guide-template.md   # 介绍&拓展性文档模板（生成 docs/project-guide.md）
│   │       ├── env-config-guide.md
│   │       ├── versions-template.md
│   │       ├── claude-md-template.md
│   │       └── agents-md-template.md
│   ├── java-backend-skill/          # Spring Boot 生成器
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       ├── skeleton.md          # 含 project-guide 填充段
│   │       └── middleware.md        # Redis/Kafka/RabbitMQ/Actuator 接入指引
│   ├── go-backend-skill/            # Gin 生成器
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/skeleton.md   # 含 project-guide 填充段
│   ├── python-backend-skill/        # FastAPI 生成器
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/skeleton.md   # 含 project-guide 填充段
│   ├── nodejs-backend-skill/        # Express / NestJS 生成器
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       ├── skeleton-express.md  # 含 project-guide 填充段
│   │       └── skeleton-nestjs.md   # 含 project-guide 填充段
│   └── database-skill/              # PG/MySQL/Mongo 选型与迁移
│       ├── SKILL.md
│       ├── README.md
│       └── references/
│           ├── base-schemas.md
│           └── migration-guide.md
├── uniapp-app-generate-skill/  # uni-app 项目生成技能
│   ├── SKILL.md
│   ├── README.md
│   ├── assets/
│   │   └── boilerplate/        # 可直接运行的 uni-app 项目模板
│   └── references/
│       ├── agents-md-template.md
│       ├── claude-md-template.md
│       ├── component-standards.md
│       ├── cross-platform-compatibility.md
│       ├── design-skills-guide.md
│       ├── layout-patterns.md
│       ├── mini-program-checklist.md
│       ├── pexels-integration.md
│       ├── project-structure.md
│       ├── static-assets-guide.md
│       ├── theme-system.md
│       └── wechat-common-patterns.md
├── icon-forge/                 # 图标生成技能
│   ├── SKILL.md
│   ├── README.md
│   ├── forge-icons.js          # 基于 sharp 的 PNG 渲染器
│   ├── package.json
│   └── svgs/                   # 示例 SVG 源文件
├── super-deploy-skills/        # 一键部署技能套件（父技能 + 5 子技能）
│   ├── SKILL.md                # 父入口：路由规则
│   ├── README.md               # 完整使用走查
│   ├── deploy-detect-skill/    # 子技能：项目技术栈检测
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       ├── detection-rules.md
│   │       ├── profile-spec.md
│   │       └── auto-redetect.md
│   ├── server-setup-skill/     # 子技能：服务器环境检测与依赖安装
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── assets/
│   │   │   ├── install.sh      # Linux 幂等安装脚本
│   │   │   └── install.ps1     # Windows 幂等安装脚本
│   │   └── references/
│   │       ├── os-detection.md
│   │       ├── install-commands.md
│   │       └── database-setup.md
│   ├── static-nginx-skill/     # 子技能：前端 Nginx 托管
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       └── nginx-config-spec.md
│   ├── deploy-native-skill/    # 子技能：原生部署
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── assets/
│   │   │   ├── launch.sh       # Linux 部署脚本
│   │   │   ├── launch.ps1      # Windows 部署脚本
│   │   │   ├── my-api.service  # systemd 模板
│   │   │   └── ecosystem.config.js  # pm2 模板
│   │   └── references/
│   │       ├── script-standards.md
│   │       └── script-pipeline.md
│   └── deploy-docker-skill/    # 子技能：Docker 部署
│       ├── SKILL.md
│       ├── README.md
│       └── references/
│           └── dockerfile-spec.md
├── backend-analysis-skill/     # 后端项目全景分析技能（4 份报告）
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── detection-rules.md        # 语言/框架/ORM/数据库识别规则
│       ├── api-scan-patterns.md      # 各框架接口扫描模式
│       ├── tech-scan-patterns.md     # 中间件/第三方API/架构组件/安全隐患扫描
│       ├── database-scan-patterns.md # 各 ORM 实体扫描 + SQL/迁移收集
│       └── report-templates.md       # 4 份报告 + 总览的输出模板
├── icon-image-catch-skill/     # 素材抓取套件（父技能 + 2 子技能）
│   ├── SKILL.md                # 父入口：意图判断、路由、素材审计
│   ├── README.md
│   ├── package.json            # sharp 依赖
│   ├── .env.example            # 图片源 API Key 模板
│   ├── scripts/assets-audit.js # 项目素材需求审计
│   ├── icon-catch-skill/       # 子技能：图标抓取（Iconify，免 Key）
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── scripts/icon-catch.js    # 零依赖抓取脚本
│   │   ├── scripts/icon-to-png.js   # SVG → PNG 渲染
│   │   └── references/icon-sources.md
│   └── image-catch-skill/      # 子技能：图片抓取（三源自动降级 + 压缩切图）
│       ├── SKILL.md
│       ├── README.md
│       ├── scripts/image-catch.js   # 抓取 + 本地压缩/切图
│       └── references/image-sources.md
├── image-forge-skill/          # 本地图片处理工具
│   ├── SKILL.md                # 技能定义
│   ├── README.md
│   ├── image-forge.js          # 主处理脚本
│   ├── package.json            # sharp 依赖
│   └── references/
│       └── operation-schema.md # JSON Spec 字段说明
├── module-generate-skill/      # 后端业务模块生成套件（父技能 + 5 子技能）
│   ├── SKILL.md                # 父入口：模块识别 + 分流 + 技术栈检测
│   ├── README.md
│   ├── auth-skill/             # 登录鉴权（JWT 双令牌/验证码登录/登出拉黑）
│   ├── org-permission-skill/   # 组织与权限（组织树/RBAC/菜单/数据权限）
│   ├── ai-chat-skill/          # AI 聊天（会话/记忆/流式/上下文裁剪）
│   ├── notification-skill/     # 短信邮箱（阿里云短信/SMTP/模板/限流）
│   └── payment-skill/          # 支付（微信/支付宝/回调验签/退款/对账）
│       # 每个子技能同构：SKILL.md + README.md + references/
│       # （domain-model.md 表结构、api-contract.md 契约增量、java/go/python/nodejs.md）
├── skill-auditor/              # Skill 安全审计（6 维度语义审查）
│   ├── SKILL.md                # 触发条件 + 审查流程
│   ├── README.md               # 使用文档
│   └── references/
│       ├── threat-cases.md     # 真实投毒案例库
│       └── audit-dimensions.md # 6 维判断细则 + 信号词表 + 报告模板
├── ui-component-commands-skill/   # UI组件指令系统
│   ├── SKILL.md                 # 技能核心定义
│   ├── README.md                # 使用文档
│   ├── templates/
│   │   ├── ui-variables.scss   # CSS变量模板
│   │   └── ui-components.scss  # 组件class定义
│   ├── commands/
│   │   ├── button.md           # 按钮指令
│   │   ├── line.md             # 线条指令
│   │   ├── shape.md            # 图形指令
│   │   └── combo.md            # 组合指令
│   └── references/
│       └── matching-rules.md    # 模糊匹配规则
├── uniapp-crossplatform-audit-skill/   # uniapp 跨平台兼容性审计
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── cross-platform-checklist.md
│       ├── tag-mapping.md
│       └── api-mapping.md
├── uniapp-code-audit-skill/           # uniapp 代码安全和 UI 审计
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── security-checklist.md
│       ├── performance-checklist.md
│       ├── code-quality-checklist.md
│       └── ui-consistency-checklist.md
├── uniapp-standardization-skill/       # uniapp 项目规范化
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── standard-structure.md
│       ├── api-spec.md
│       ├── store-spec.md
│       └── component-spec.md
├── uniapp-vue2-upgrade-skill/         # uniapp Vue2 升级到 Vue3
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── vue2-vue3-diff.md
│       ├── upgrade-steps.md
│       └── dependency-compat.md
└── demo/
    └── foundry-demo/           # frontend-ui-foundry 端到端示例
        ├── index.html
        ├── assets/css/tokens.css
        ├── tailwind.config.js
        ├── README.md
        └── forge-report.md
```

---

## 🤝 贡献

欢迎提交新的 Skill！

1. Fork 项目
2. 创建新技能目录（kebab-case）
3. 添加 `SKILL.md` 和 `README.md`
4. 按需创建 `references/`
5. 更新根目录 `README.md` 的「当前可用 Skills」与「Skill 一览」表格
6. 提交 Pull Request

---

## 📄 License

MIT License
