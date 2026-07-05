# AGENTS.md 模板

> 本模板供 `uniapp-app-generate-skill` 在初始化项目时生成 `AGENTS.md` 使用。`AGENTS.md` 是项目规范的完整入口，包含所有开发、主题、接口、资源规则。

```markdown
# AGENTS.md - {{PROJECT_NAME}} 开发规范

> **适用范围**：本项目所有页面的开发、部署与维护  
> **目标**：标准化开发流程，保障代码质量、性能与可维护性  
> **规范入口**：本文件是项目规范的唯一入口；[CLAUDE.md](./CLAUDE.md) 仅作指引。

---

## 一、技术栈与工具链

| 类别 | 技术选型 | 说明 |
|------|----------|------|
| **框架** | uni-app（Vue3） | 优先微信小程序，兼顾 H5 |
| **语言** | TypeScript | 强类型，AI 生成代码更规范 |
| **状态管理** | Pinia | 轻量、TypeScript 友好 |
| **样式** | SCSS | 全部颜色/间距/字体走 Token |
| **构建工具** | uni-app CLI / Vite | 统一 CLI 模式 |

- **包管理器**：`npm`（推荐 v9+），禁止混用 `yarn`/`pnpm`。
- **版本锁定**：锁文件必须提交版本控制。

## 二、常用命令

| 命令 | 用途 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev:mp-weixin` | 微信小程序开发调试 |
| `npm run build:mp-weixin` | 微信小程序打包 |
| `npm run lint` | ESLint 检查，AI 生成代码后必须执行 |

## 三、核心红线规则

| 编号 | 规则 | 优先级 |
|------|------|--------|
| R01 | 禁止嵌套 v-for | 强制 |
| R02 | data 中仅存放视图数据 | 强制 |
| R03 | 优先使用 uni.xxx 标准 API | 强制 |
| R04 | DOM 节点 ≤ 800 | 强制 |
| R05 | 长列表懒加载 + 分页 | 强制 |
| R06 | 单次 setData ≤ 10KB | 强制 |
| R07 | 禁止 eval / new Function | 强制 |
| R08 | 禁止硬编码 | 强制 |
| R09 | 请求失败必须弹 message | 强制 |
| R10 | AI 生成代码后执行 lint | 强制 |
| R11 | commit message 中文，≤ 50 字 | 强制 |
| R12 | 禁止在 .vue/.scss 中写死颜色/尺寸 | 强制 |
| R13 | 禁止提交规范文件 | 强制 |
| R14 | **禁止用 CSS 渐变或纯色块充当图片资源**（Banner、空状态、装饰图必须使用真实照片） | 强制 |
| R15 | **静态真实照片优先从 Pexels 获取**；Pexels API Key 必须从 `.env` 读取，禁止硬编码 | 强制 |
| R16 | 设计关键页面前调用 `frontend-design`/`ui-ux-pro-max`；实现时遵循 `ponytail` 保持代码最简 | 强制 |
| R17 | **模板必须使用 uni-app 组件**，禁止使用 `div`、`span`、`p`、`h1~h6` 等 H5 标签 | 强制 |
| R18 | **禁止用 `background-image: url(...)` 展示重要图片**，必须使用 `image` 组件 | 强制 |
| R19 | **禁止用 CSS 自定义属性 `var(--xxx)`**，统一使用 SCSS 变量 | 强制 |

## 四、项目目录结构

详见技能参考文档 `project-structure.md`。

## 五、设计系统规范

### 5.1 主题配置

项目初始化时，应询问用户以下配置项。用户未指定时使用默认值：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| 主色 | `#10b981` | 品牌主色，派生完整主色阶 |
| 成功色 | `#4caf50` | 成功状态 |
| 警告色 | `#ff9800` | 警告状态 |
| 错误色 | `#f44336` | 错误状态 |
| 信息色 | `#2196f3` | 信息提示 |
| 灰阶基准 | `#6b7280` | 派生灰阶 50~950 |
| 间距基数 | `4rpx` | 派生 4/8/12/16/24/32/40/48rpx |
| 字体基数 | `12rpx` | 派生 12/14/16/18/24/30rpx |
| 圆角基数 | `4rpx` | 派生 4/8/12/16rpx |

配置变更后，需重新生成 `src/styles/tokens/_primitive.scss`、`src/styles/tokens/_semantic.scss`，并同步 `src/constants/colors.ts`。

### 5.2 Token 使用优先级

```
1. 语义 Token（$color-primary, $font-body, $spacing-default）
2. 工具函数（rgba-with-alpha($color-primary, 0.08)）
❌ 禁止：直接写 #xxx、rgb()、具体 rpx 数值
```

### 5.3 禁止事项

| 禁止项 | 错误示例 | 正确示例 |
|--------|---------|---------|
| 颜色硬编码 | `color: #ff6b9d;` | `color: $color-primary;` |
| 间距硬编码 | `padding: 24rpx;` | `padding: $spacing-md;` |
| 字体硬编码 | `font-size: 28rpx;` | `font-size: $font-body;` |

## 六、接口规范

1. 接口定义在 `src/api/modules/`，按业务模块拆分。
2. 每个接口必须包含：地址、方法、请求参数、响应参数。
3. 每个字段必须包含中文注释。
4. 字段类型必须与后端契约一致。
5. 禁止添加契约中没有的字段。

## 七、静态资源规范

1. 禁止使用 emoji 作为图标或 UI 元素。
2. 图标统一为 PNG，tabBar 图标建议 81×81px；优先使用 `icon-forge` 技能生成。
3. **真实照片/Banner/空状态图优先从 Pexels API 获取**。
4. **禁止用 CSS 渐变（`linear-gradient`）或纯色块充当图片资源**。
5. Pexels API Key 写入 `.env`，代码通过 `import.meta.env.VITE_PEXELS_API_KEY` 读取，禁止硬编码。
6. 图片资源放在 `static/images/`，图标放在 `static/icons/` 或 `static/tab-bar/`。

## 八、跨平台兼容性规范

1. 以微信小程序语法规范为优先，同时兼顾 H5 和 App。
2. 模板必须使用 uni-app 组件：`view`、`text`、`image`、`scroll-view`、`swiper`、`button`、`input`、`textarea`、`picker` 等。
3. **禁止使用 H5 标签**：`div`、`span`、`p`、`h1~h6`、`section`、`article`。
4. **禁止用 `background-image: url(...)` 展示重要图片**，必须使用 `image` 组件。
5. **禁止用 CSS 自定义属性 `var(--xxx)`**，统一使用 SCSS 变量。
6. 禁止使用浏览器全局对象：`window`、`document`、`localStorage`、`fetch`。
7. 尺寸统一使用 `rpx`，并处理安全区适配。
8. 平台差异化需求使用 uni-app 条件编译 `#ifdef` / `#ifndef`。

## 九、布局规范

1. 底部 TabBar 固定高度 `100rpx`（含安全区）。
2. 顶部导航栏统一高度 `88rpx` + 状态栏。
3. 内容区左右内边距 `$spacing-md`。
4. 我的页面必须包含头像、昵称、设置入口。

详细布局模式见技能参考文档 `layout-patterns.md`。

## 十、AI 助手行为约束

1. 修改接口字段前，先读取 `src/api/` 对应文件确认后端契约。
2. 涉及时间字段时，先检查 `src/utils/date.ts` 中的格式化函数。
3. 涉及颜色时，先检查 `src/styles/variables.scss` 和 `src/constants/colors.ts`。
4. 生成静态图标时，调用 `icon-forge` 技能。
5. 需要真实照片时，调用 Pexels 工具（`src/utils/pexels.ts`）；禁止用渐变色/色块替代图片。
6. 设计关键页面前，调用 `frontend-design` 或 `ui-ux-pro-max` 产出设计方案。
7. 实现功能时，调用 `ponytail` 保持代码最简，避免过度抽象。
8. 编写模板时，必须使用 uni-app 组件，禁止使用 H5 标签；图片展示使用 `image` 组件。
9. 每次修改后执行 `npm run lint`。

## 十一、规范文件管理

- `AGENTS.md`、`CLAUDE.md` 属于项目级规范，禁止直接提交。
- 规范变更须经项目负责人审阅后，由维护者手动合入。
- 提交业务代码前，将规范文件从暂存区移除：
  ```bash
  git reset HEAD AGENTS.md CLAUDE.md
  ```
```

## 生成说明

生成 `AGENTS.md` 时：

1. 替换 `{{PROJECT_NAME}}` 占位符。
2. 根据用户选择的布局风格，补充底部菜单、顶部导航、我的页面等具体说明。
3. 根据实际业务增删 Rxx 规则，但核心红线（无硬编码、无 emoji、必须 lint）保持不变。
4. 保持结构清晰，不要与 `CLAUDE.md` 重复；`CLAUDE.md` 只保留摘要和重定向。
