# 我造了一个 Claude Skill：从想法到可跑通的 UniApp 三端应用，只要一次对话

> 你是不是也经历过：每次想做一个小程序/H5/App，都要先花半天搭项目、配目录、写规范、调主题色、找图标？> 这篇文章介绍我新做的 Claude Skill —— `uniapp-app-genernate-skill`，它把这套重复劳动打包成一次标准化的对话流程。

---

## 一、为什么需要这个 Skill？

做小程序这么多年，我发现 80% 的启动工作都是重复的：

- 想清楚做什么、给谁做、怎么做；
- 初始化一个 `uni-app + Vue3 + TS + Pinia` 的项目；
- 规划 `pages/`、`components/`、`stores/`、`api/` 该放什么；
- 写一份 `CLAUDE.md` 让 AI 不乱来；
- 配一套主题色、间距、字体 Token；
- 生成 tabBar 图标、空状态图；
- 找真实照片当 Banner 和装饰图；
- 搭首页、列表页、我的页面基础布局。

这些事情不难，但每一次都做，很消耗心力。更麻烦的是，不同项目风格不一致，代码质量也看当时的状态。

所以我干脆把这些流程固化成一个 Claude Skill：**你说出想法，它帮你把项目骨架、规范、主题、资源、页面一次性生成好。**

---

## 二、这个 Skill 能做什么？

`uniapp-app-genernate-skill` 把小程序开发拆成四个阶段，并且在每个阶段都接入了专门的 Claude Skill：

- 设计阶段：`frontend-design` / `ui-ux-pro-max`
- 实现阶段：`ponytail`
- 图标生成：`icon-forge`
- 真实照片：`Pexels API`

### 1. 开发前：把模糊想法变成详细文档

很多人一开始只说"我想做个健身打卡小程序"。Skill 会引导你回答几个问题：

- 目标用户是谁？
- 核心页面有哪些？
- 喜欢哪种视觉风格？
- 底部菜单要几个入口？

然后自动生成一份 `spec.md`，把产品定位、页面清单、数据模型、API 轮廓写清楚。确认后再动手写代码，避免做到一半发现方向错了。

### 2. 开发中：一次生成标准项目骨架

项目基于 **uni-app（Vue3）+ TypeScript + Pinia + SCSS**，以微信小程序语法规范为优先，同时兼容 H5 和 App。

Skill 会自动创建：

- 标准目录结构：`api/`、`components/`、`constants/`、`pages/`、`stores/`、`styles/`、`utils/`；
- **一套可直接运行的 boilerplate 代码模板**，含首页、我的页面、主题系统、请求封装、Pinia 状态；
- `CLAUDE.md` + `AGENTS.md`：定义开发规范、主题规范、引用规范、AI 行为约束；
- `.claudeignore`：排除 node_modules、dist 等不需要 AI 读的文件；
- 动态主题系统：主色、间距基数、字体基数、圆角基数均可配置，配置后自动派生完整 Token；
- `.env` 与 Pexels 工具函数模板；
- **一组默认 tabBar 图标**：首页、我的、商城、购物车、数据、发现、消息、设置，含激活/未激活态，可直接使用或替换。

### 3. 开发中：主题、图标、布局一次搞定

**主题系统**是 Skill 的核心亮点之一。

你只需要改 `src/styles/config/_theme-config.scss` 里的主色和基数，SCSS 函数就会自动生成：

- 主色 50~900 的完整色阶；
- 灰阶 50~950；
- 间距 Token：4rpx、8rpx、12rpx、16rpx、24rpx……
- 字体 Token：12rpx、14rpx、16rpx、18rpx、24rpx……
- 圆角、阴影 Token。

业务代码里只写 `$color-primary`、`$spacing-md`、`$font-body`，再也不用在 `.vue` 文件里硬编码 `#10b981` 或 `24rpx`。

**静态资源**也做了严格约束：

- 禁止使用 emoji 当图标；
- tabBar 图标统一用 `icon-forge` 技能生成 PNG；
- **Banner、空状态、装饰图必须使用真实照片，禁止用渐变色或纯色块糊弄**；
- 真实照片统一从 **Pexels** 获取，API Key 写入 `.env`，代码从环境变量读取；
- 图片按用途分目录：`static/icons/`、`static/tab-bar/`、`static/images/`。

**布局**提供了四种预设风格：

- 清新健康风（默认）：青绿色主调，大圆角，适合健康、运动类小程序；
- 极简工具风：深灰/深蓝，小圆角，适合效率、工具类；
- 活泼社区风：暖橙/粉紫，大圆角+柔和阴影，适合社交、内容类；
- 商务数据风：藏青主调，卡片+数据看板，适合 B2B、管理类。

Skill 会根据你的选择生成 `pages.json`、tabBar 配置、首页和我的页面基础结构。

**跨平台兼容**也被纳入默认规则：

- 模板使用 `view`/`text`/`image`/`button` 等 uni-app 组件，不写 `div`/`span`/`p`/`h1~h6`；
- 图片用 `image` 组件展示，不用 `background-image: url(...)`；
- 主题用 SCSS 变量 `$color-primary`，不用 CSS 自定义属性 `var(--xxx)`；
- 尺寸用 `rpx`，并处理刘海屏/底部横条安全区；
- 登录、分享、图片选择等能力已抽象为 `platform-auth.ts`、`platform-share.ts`、`platform-image.ts`，业务代码不直接写 `#ifdef`。

### 不止如此：用其他 Skill 把界面和代码一起卷上去

这个 Skill 不是单打独斗，它会主动调用 Claude 生态里几个很能打的 Skill：

- **`frontend-design`** / **`ui-ux-pro-max`**：在写关键页面前先产出设计方案，避免"AI 味"界面；
- **`ponytail`**：实现时把关，删掉多余抽象，能用一行不用十行；
- **`icon-forge`**：批量生成风格统一的 PNG 图标；
- **Pexels API**：用真实照片替换掉那些"渐变冒充 Banner"的偷懒做法。

也就是说，你不只拿到一个能跑的项目，还能拿到一个**代码精简、界面在线、图片真实**的项目。

### 4. 开发后：自动 lint + 构建验证 + 上线检查

代码生成后，Skill 会执行 `npm run lint`，并尝试 `npm run dev:mp-weixin` 或 `npm run build:mp-weixin` 验证能否跑通。同时还会对照内置的 `mini-program-checklist.md`，检查登录、分享、分包、版本更新、主包体积等小程序特有事项。

---

## 三、使用示例

假设你说：

> "帮我做一个记录喝水的小程序，首页显示今天喝了多少杯，底部有首页、统计、我的三个入口，风格清新一点。"

Skill 会这样执行：

1. 生成 `spec.md`：产品名"水润打卡"，核心功能"记录饮水、查看统计、个人中心"；
2. 初始化 uni-app 项目，安装 Pinia 和 Sass；
3. 复制 boilerplate 代码模板；
4. 询问并配置主题色、间距、字体、圆角等参数，重新生成 Token；
5. 创建标准目录；
6. 生成 `CLAUDE.md` 和 `AGENTS.md`；
7. 配置主题系统，主色 `#10b981`；
8. 用 `frontend-design` 设计首页，再用 `ponytail` 精简实现；
9. 用 `icon-forge` 生成 3 对 tabBar 图标；
10. 从 Pexels 拉取一张"健康生活方式"的真实照片当 Banner；
11. 生成首页、统计页、我的页面；
12. 跑 lint 和构建验证。

你要做的，只是在关键节点确认方向，然后拿到一个可直接继续开发的代码库。

---

## 四、Skill 的设计哲学

做这个 Skill 时，我坚持了三个原则：

**1. 一次配置，全局生效**

主题色、间距、字体只在一个入口配置，其他地方自动派生。换肤时不用满世界改颜色。

**2. 规范先行，AI 不乱来**

`CLAUDE.md` 和 `AGENTS.md` 在写业务代码之前就位，明确告诉 AI：禁止硬编码、禁止 emoji、必须 lint、接口字段先查契约。后续迭代时，AI 会按这套规则执行。

**3. 只生成骨架，不替代思考**

Skill 不帮你写业务逻辑，它解决的是"每次都要重新搭架子"的问题。产品决策、交互细节、后端接口设计，仍然需要人来定。

---

## 五、适合谁用？

- 经常需要快速验证小程序想法的产品/开发者；
- 团队里想统一小程序项目结构和代码规范的人；
- 用 Claude Code 写代码，但不想每次重复讲"用 uni-app + TS + Pinia"的人。

---

## 六、写在最后

`uniapp-app-genernate-skill` 不是魔法，它只是把"做小程序前的标准动作"自动化了。但它省下的时间很实在：以前搭一个项目半天，现在一次对话几分钟骨架就齐了。

如果你也在用 Claude Code 做小程序，不妨试试这个 Skill。让它帮你把重复的留给机器，把创意的留给自己。

---

**Skill 名称**：`uniapp-app-genernate-skill`  
**适用平台**：Claude Code  
**技术栈**：uni-app（Vue3）+ TypeScript + Pinia + SCSS  
**核心能力**：规范化初始化、boilerplate 代码模板、动态主题系统、设计 Skill 集成（ponytail / ui-ux-pro-max / frontend-design）、静态资源生成、Pexels 真实照片接入、布局风格选择、小程序上线检查清单、lint/构建验证
