# CLAUDE.md 模板

> 本模板供 `uniapp-app-genernate-skill` 在初始化项目时生成 `CLAUDE.md` 使用。请根据实际项目替换 `{{PROJECT_NAME}}`、`{{PROJECT_DESC}}` 等占位符。

```markdown
# CLAUDE.md - {{PROJECT_NAME}} AI 开发规范

> 本项目基于 uni-app（Vue3 + TypeScript + Pinia）开发，目标平台为微信小程序。
> 所有开发规范、主题系统、目录约定详见 [AGENTS.md](./AGENTS.md)。
> 本文件是 Claude / AI 编码助手的入口指引。

---

## 必读规范

本项目所有开发规范定义在 [AGENTS.md](./AGENTS.md) 中。在协助编码前，请务必阅读 AGENTS.md，并确保完全理解其中的内容。

## 技术栈

| 类别 | 选型 | 说明 |
|------|------|------|
| 框架 | uni-app（Vue3） | 优先保障微信小程序，兼顾 H5 |
| 语言 | TypeScript | 强类型，禁止 any 滥用 |
| 状态管理 | Pinia | 轻量、TS 友好 |
| 样式 | SCSS | 所有颜色/间距/字体必须走 Token |
| 构建 | Vite / uni-app CLI | 统一使用 CLI 模式 |

## 核心红线

- 禁止嵌套 `v-for`，单个页面 `v-for` 层数 ≤ 1。
- `data` 中仅存放视图所需数据，过滤接口原始数据。
- 优先使用 `uni.xxx` 标准 API，禁止私有 API。
- DOM 节点 ≤ 800，列表项节点 ≤ 50。
- 长列表必须懒加载 + 分页，每次 10~20 条。
- 单次 setData 数据量 ≤ 10KB，高频事件加节流。
- 禁止 `eval`、`new Function` 等危险方法。
- 禁止硬编码，配置项放在 `src/constants/` 或 `src/styles/config/`。
- 请求失败必须弹出 `message` 提示，禁止仅 `console.error`。
- AI 生成代码后必须执行 `npm run lint`。
- commit message 使用中文，长度 ≤ 50 字。
- **模板必须使用 uni-app 组件（view/text/image/button 等），禁止使用 `div`、`span`、`p`、`h1~h6` 等 H5 标签。**
- **禁止用 `background-image: url(...)` 展示重要图片，必须使用 `image` 组件。**
- **禁止用 CSS 自定义属性 `var(--xxx)`，统一使用 SCSS 变量。**

## 跨平台兼容性

- 以微信小程序语法规范为优先，同时兼顾 H5 和 App。
- 模板只能使用 `view`、`text`、`image`、`scroll-view`、`swiper`、`button`、`input`、`textarea`、`picker` 等 uni-app 组件。
- 禁止使用 `div`、`span`、`p`、`h1~h6`、`section`、`article`。
- 禁止使用 `background-image: url(...)`，图片展示使用 `image` 组件。
- 禁止使用 CSS 自定义属性 `var(--xxx)`，统一使用 SCSS 变量。
- 禁止使用浏览器全局对象：`window`、`document`、`localStorage`、`fetch`。
- 尺寸统一使用 `rpx`，并处理安全区适配。

## 主题系统

- 唯一人工配置入口：`src/styles/config/_theme-config.scss`。
- 主色、间距基数、字体基数、圆角基数修改后，由 SCSS 函数自动生成完整色阶与尺寸阶。
- 业务代码使用语义 Token：`$color-primary`、`$spacing-default`、`$font-body`、`$radius-lg` 等。
- JS 侧颜色常量：`src/constants/colors.ts`，必须与 SCSS 变量保持同步。
- 主题配置项（颜色、间距、字体、圆角）可在项目初始化时询问用户并重新生成。
- 详细规则见 AGENTS.md 主题系统章节。

## 目录与文件规范

- 目录名全部小写，多单词用连字符 `-`。
- 组件目录使用大驼峰，如 `components/AppButton/`。
- 页面目录使用小写，如 `pages/profile/`。
- 接口定义在 `src/api/modules/`，每个接口必须含中文注释、Req/Res 类型。
- 常量在 `src/constants/`，工具函数在 `src/utils/`，状态在 `src/stores/`。

## 引用规范

- 组件/页面内引用：优先使用绝对别名 `@/components/...`、`@/utils/...`。
- 同一目录内文件：使用相对路径 `./Foo.vue`。
- 禁止使用 `../../..` 超过两层的相对路径。

## 静态资源

- 图标统一为 PNG，使用 `icon-forge` 技能生成。
- 真实照片/装饰图/空状态图优先通过 **Pexels API** 获取，禁止用 CSS 渐变或纯色块替代。
- Pexels API Key 写入 `.env`，代码通过 `import.meta.env.VITE_PEXELS_API_KEY` 读取，禁止硬编码。
- 禁止使用 emoji 作为图标或 UI 元素。
- 图片资源放在 `src/static/images/`，图标放在 `src/static/icons/` 或 `src/static/tab-bar/`。

## 设计与实现

- 设计关键页面前，调用 `frontend-design` 或 `ui-ux-pro-max` 产出设计方案。
- 实现功能时，调用 `ponytail` 保持代码最简，避免过度抽象和冗余。
- 所有设计输出必须映射到项目主题 Token，禁止引入新的硬编码颜色/尺寸。

## 接口与数据

- 接口字段修改必须先查契约（`src/api/` 下对应定义）。
- 时间字段格式以项目中已有的工具函数为准。
- 禁止添加契约中没有的字段，禁止修改字段名称或类型。

## AI 助手行为约束

1. 修改接口字段前，先读取 `src/api/` 对应文件确认后端契约。
2. 涉及时间字段时，先检查 `src/utils/date.ts` 中的格式化函数。
3. 涉及颜色时，先检查 `src/styles/variables.scss` 和 `src/constants/colors.ts`。
4. 生成静态图标时，调用 `icon-forge` 技能。
5. 需要真实照片/Banner/空状态图时，优先通过 Pexels API 获取；禁止用渐变色或纯色块替代。
6. 设计关键页面前，调用 `frontend-design` 或 `ui-ux-pro-max`；实现时调用 `ponytail` 保持代码精简。
7. 编写模板时，必须使用 uni-app 组件，禁止使用 H5 标签；图片使用 `image` 组件，禁止使用 `background-image`。
8. 每次修改后执行 `npm run lint`，并修复新增错误。

## 提交规范

- 提交前执行 `npm run lint` 并通过。
- commit message 遵循 Conventional Commits，使用中文，≤ 50 字。
- 规范文件（`AGENTS.md`、`CLAUDE.md`、`docs/rules/`）禁止直接提交，须单独审阅后手动合入。
```

## 生成说明

生成 `CLAUDE.md` 时：

1. 替换所有 `{{PROJECT_NAME}}`、`{{PROJECT_DESC}}` 占位符。
2. 根据用户选择的布局风格（见 [layout-patterns.md](./layout-patterns.md)）补充底部菜单、顶部导航等特殊说明。
3. 根据项目实际平台（微信小程序 / H5 / App）调整技术栈表格。
4. 保持简洁，不要一次性塞入过多细节；详细规则放在 [AGENTS.md](./AGENTS.md) 中。
