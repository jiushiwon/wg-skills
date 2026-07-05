---
name: uniapp-app-genernate-skill
description: This skill should be used when the user wants to create a standardized uni-app project for WeChat mini-program, H5, and App from scratch. It guides through pre-development brainstorming, project initialization with uni-app + Vue3 + TypeScript + Pinia, dynamic theme system setup, static asset generation, layout design, cross-platform compatibility, and post-development verification. Invoke when the user says "帮我做一个 uniapp 小程序/三端应用"、"初始化 uniapp 项目"、"uniapp 构建" or similar requests.
---

# UniApp App Generate Skill

## Overview

This skill transforms a vague mini-program idea into a production-ready uni-app project with consistent architecture, design tokens, static assets, and coding standards. It follows a four-phase workflow, and leverages `ponytail`, `ui-ux-pro-max`, `frontend-design`, and `icon-forge` skills for high-quality output with minimal code.

1. **Pre-development**: brainstorm, scope, and produce a detailed specification.
2. **Project initialization**: scaffold the project, directory structure, CLAUDE.md, AGENTS.md, and .claudeignore.
3. **Development**: implement the theme system, generate icons/images, design the layout, and build core pages.
4. **Post-development**: lint, verify the build, and hand the project back to the user.

## When to Use

Invoke this skill when the user asks for:

- "帮我做一个 uniapp 小程序"
- "初始化一个微信小程序项目"
- "用 uniapp 搭建一个 xxx 小程序"
- "帮我生成一个小程序的标准项目结构"
- Any request that involves creating a new uni-app mini-program from scratch

## Workflow Summary

```
Phase 1: Pre-development
  → Ask clarifying questions about purpose, users, features, and style
  → Write spec.md with scope, pages, data model, and API outline

Phase 2: Project Initialization
  → Copy boilerplate from assets/boilerplate/
  → Replace placeholders
  → Create standard directory structure
  → Generate CLAUDE.md and AGENTS.md from templates
  → Create .claudeignore and .env

Phase 3: Development
  → Ask for theme configuration and set up dynamic theme system
  → Optionally design with frontend-design / ui-ux-pro-max
  → Implement with ponytail principles and cross-platform rules
  → Generate icons via icon-forge (or placeholders)
  → Optionally fetch real photos via Pexels API
  → Choose layout pattern and implement tabBar + pages
  → Build core pages: home, list/detail, profile
  → Ensure WeChat / H5 / App compatibility

Phase 4: Post-development
  → Run npm run lint
  → Run npm run dev:mp-weixin or build verification
  → Check mini-program-checklist.md
  → Summarize deliverables
```

## Phase 1: Pre-development

### 1.1 Brainstorming Questions

Ask the user 3~5 focused questions. Do not ask all at once; start with the most important ones and follow up.

Required questions:

1. "这个小程序解决什么问题？核心目标用户是谁？"
2. "主要功能有哪些？请列出 3~5 个核心页面或核心流程。"
3. "你倾向哪种视觉风格？清新健康 / 极简工具 / 活泼社区 / 商务数据？"
4. "底部 TabBar 需要几个入口？分别是什么？"
5. "是否需要用户登录、我的页面、头像等社交属性？"

Optional follow-ups:

- "有没有参考的小程序或设计稿？"
- "主色有偏好吗？没有的话我会根据风格推荐。"
- "是否需要深色模式？（默认先实现浅色）"

### 1.2 Write spec.md

After gathering answers, create `spec.md` in the project root with the following sections:

```markdown
# {{PROJECT_NAME}} 小程序规格说明

## 1. 项目定位
- 产品名称：
- 目标用户：
- 核心价值：
- 对标产品：

## 2. 核心功能
1. ...
2. ...
3. ...

## 3. 页面清单
| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | pages/index/index.vue | ... |
| ... | ... | ... |

## 4. 数据模型（初版）
- User: { id, nickname, avatar }
- ...

## 5. API 轮廓（初版）
- GET /api/user/profile
- ...

## 6. 设计风格
- 风格：清新健康 / 极简工具 / 活泼社区 / 商务数据
- 主色：#10b981
- TabBar 入口：首页、数据、发现、我的
```

Show the spec to the user and confirm before proceeding. Iterate if needed.

## Phase 2: Project Initialization

### 2.1 Create the UniApp Project

Use the boilerplate included in `assets/boilerplate/` as the starting point:

```bash
# Copy the entire boilerplate into the target project directory
cp -r assets/boilerplate/* {{project-name}}/
cd {{project-name}}
npm install
```

Then replace placeholders in the following files. Match both `{{PROJECT_NAME}}` and `{{ PROJECT_NAME }}` forms:

- `package.json` → `{{PROJECT_NAME}}`, `{{PROJECT_DESC}}`
- `src/manifest.json` → `{{PROJECT_NAME}}`, `{{WECHAT_APPID}}`
- `src/pages.json` → `{{PROJECT_NAME}}`
- `src/pages/index/index.vue` → `{{PROJECT_NAME}}` / `{{ PROJECT_NAME }}`
- `index.html` → `{{PROJECT_NAME}}`
- `README.md` → `{{PROJECT_NAME}}`, `{{PROJECT_DESC}}`

If the user already has a project directory, merge the boilerplate carefully. Do not overwrite existing files without asking.

### 2.1a Alternative: Fresh CLI Scaffold

If the boilerplate is not suitable, use the official uni-app CLI:

```bash
npx degit dcloudio/uni-preset-vue#vite-ts {{project-name}}
cd {{project-name}}
npm install
npm install pinia sass
```

Then apply the directory structure and files from `assets/boilerplate/` manually.

### 2.2 Standard Directory Structure

The boilerplate in `assets/boilerplate/` already contains the standard directory structure. If not using the boilerplate, create the directories defined in `references/project-structure.md`. At minimum:

```
src/
├── api/
│   ├── modules/
│   └── types/
├── components/
├── constants/
├── pages/
│   ├── index/
│   ├── profile/
│   └── ...
├── static/
│   ├── icons/
│   ├── tab-bar/
│   └── images/
├── stores/
│   └── modules/
├── styles/
│   ├── config/
│   ├── tokens/
│   ├── _functions.scss
│   ├── _mixins.scss
│   ├── global.scss
│   └── variables.scss
├── types/
└── utils/
```

The boilerplate also includes ready-to-use utilities:

- `src/utils/platform.ts` — platform detection and safe area
- `src/utils/platform-auth.ts` — abstract login for WeChat / H5 / App
- `src/utils/platform-share.ts` — abstract share for WeChat / H5 / App
- `src/utils/platform-image.ts` — image picker and URL resolution
- `src/utils/pexels.ts` — Pexels API search and download
- `src/utils/request.ts` — `uni.request` wrapper with platform-specific baseURL
- `src/utils/storage.ts` — unified local storage
- `src/utils/date.ts` — date formatting helpers

And default static assets:

- `static/tab-bar/` — default icons for home, profile, shop, cart, data, discover, message, settings (active + inactive)
- `static/images/empty-data.png` — empty state placeholder
- `static/avatar-placeholder.png` — avatar placeholder

These default icons are generated by `icon-forge` and can be replaced later.

### 2.3 Generate CLAUDE.md

Use the template in `references/claude-md-template.md`. Replace placeholders and adapt to the chosen style.

Key contents:

- Project overview and tech stack
- Core red-line rules
- Theme system summary
- Directory conventions
- Reference conventions
- Static asset rules
- AI behavior constraints
- Commit rules

### 2.4 Generate AGENTS.md

Use the template in `references/agents-md-template.md`. This is the full specification entry. Keep CLAUDE.md as the concise redirect.

### 2.5 Create .claudeignore

Create `.claudeignore` at project root with:

```
node_modules/
dist/
unpackage/
*.log
.DS_Store
.vscode/
.idea/
```

### 2.6 Create .env for Pexels API Key

Create `.env` at project root for the Pexels API key:

```bash
VITE_PEXELS_API_KEY=your_pexels_api_key_here
```

Also create `.env.example` (committed to version control) and add `.env` to `.gitignore`:

```gitignore
.env
```

If the user does not yet have a Pexels API key, leave the placeholder and remind them to get one from https://www.pexels.com/api/.

## Phase 3: Development

### 3.1 Set Up the Theme System

Follow `references/theme-system.md` to configure the theme.

#### 3.1.1 Ask for Theme Configuration

Before generating theme files, ask the user for the following values. Use defaults if not specified.

| Config | Default | Description |
|--------|---------|-------------|
| Primary color | `#10b981` | Brand color, generates full palette |
| Success color | `#4caf50` | Success state |
| Warning color | `#ff9800` | Warning state |
| Error color | `#f44336` | Error state |
| Info color | `#2196f3` | Info state |
| Gray base | `#6b7280` | Generates gray scale 50~950 |
| Spacing base | `4rpx` | Generates 4/8/12/16/24/32/40/48rpx |
| Font base | `12rpx` | Generates 12/14/16/18/24/30rpx |
| Radius base | `4rpx` | Generates 4/8/12/16rpx |

#### 3.1.2 Generate Theme Files

Required files:

- `src/styles/config/_theme-config.scss` — single manual config entry
- `src/styles/tokens/_primitive.scss` — generated primitive tokens
- `src/styles/tokens/_semantic.scss` — semantic tokens
- `src/styles/_functions.scss` — SCSS utilities
- `src/styles/_mixins.scss` — common mixins
- `src/styles/variables.scss` — auto-injected entry
- `src/constants/colors.ts` — JS-side color constants synced with SCSS

Principles:

- One primary color generates a full palette (50~900).
- One spacing base generates a spacing scale.
- One font base generates a font scale.
- Business code uses only semantic tokens.

After the user changes `_theme-config.scss`, regenerate `tokens/_primitive.scss` and update `src/constants/colors.ts` accordingly.

### 3.2 Design Pages (Optional but Recommended)

Before implementing key pages, optionally invoke a design skill for a polished result:

- For general UI/UX decisions, multi-style comparison, and accessibility review: use `ui-ux-pro-max`.
- For distinctive, production-grade interface design with concrete Vue/uni-app code: use `frontend-design`.

If these skills are unavailable or the user declines, proceed with the chosen layout pattern from `references/layout-patterns.md`.

Prompt example:

```text
/ ui-ux-pro-max
Design a home page for a water-tracking mini-program. Style: clean and healthy, primary color #10b981. Required elements: today's progress ring, quick-add buttons, recent records. Output component structure and SCSS token usage for uni-app.
```

After receiving the design, confirm it maps to the project's theme tokens before writing code.

### 3.3 Implement with ponytail (Optional but Recommended)

When writing components and pages, optionally invoke `ponytail` to keep the implementation minimal:

```text
/ponytail full
Implement the home page for a water-tracking mini-program using the design above. Use uni-app Vue3 + TypeScript + SCSS. Keep components small and avoid unnecessary abstractions.
```

Guidelines from ponytail to enforce:

- Prefer `uni.xxx` APIs and native platform features over custom code.
- Do not create interfaces or configs with only one implementation.
- Delete unused code rather than keeping it "for later".
- One-line solutions are acceptable when correct.

If `ponytail` is unavailable, apply the same principles manually.

### 3.4 Generate Static Assets

Follow `references/static-assets-guide.md`.

For every project:

1. **Icons**: Generate tabBar icons via `icon-forge` skill. If `icon-forge` is unavailable, use placeholder PNGs and document that they need replacement.
2. **Avatar placeholder**: Generate or fetch a placeholder avatar.
3. **Real photos**: Fetch banners, empty states, and decorative images via Pexels API. If the user has no Pexels API key, use default placeholder images and document the limitation.
4. Record the asset list in CLAUDE.md / AGENTS.md.

Example prompts:

```text
/ icon-forge
Generate a set of clean health-style tabBar icons: home, data, discover, profile. Each icon needs active (primary color fill) and inactive (gray outline) states. Size 81x81px, PNG, output to static/tab-bar/.
```

For Pexels images, follow `references/pexels-integration.md`:

- Create `.env` with `PEXELS_API_KEY=...`
- Create `src/utils/pexels.ts`
- Search and download images, compress them, and place in `static/images/`

**Important**: Never use CSS gradients or solid color blocks as image resources. Always use real photos or user-provided images.

### 3.5 Choose Layout Pattern

Use `references/layout-patterns.md` to select a layout style based on the user's answers.

Then implement:

1. `pages.json` with tabBar, navigation bar, and page routes.
2. `App.vue` with global styles and safe-area handling.
3. Common layout components: `AppHeader`, `AppTabBar` if custom tabBar is needed.
4. Core pages:
   - `pages/index/index.vue` — home
   - `pages/profile/index.vue` — profile (avatar, nickname, settings)
   - Additional pages from spec.md

### 3.6 Build Core Components and Pages

Use the theme tokens and generated assets. Follow the rules in CLAUDE.md / AGENTS.md.

Common components to create:

- `AppButton` — primary/secondary/ghost variants
- `AppCard` — content card with shadow and radius
- `AppEmpty` — empty state with real image and text
- `AppAvatar` — user avatar with placeholder

### 3.7 Implement State Management

Set up Pinia:

- `src/stores/index.ts` — store export
- `src/stores/modules/user.ts` — user state
- `src/stores/modules/app.ts` — app-level state

### 3.8 Use Platform Abstraction Layer

Use the utilities provided in the boilerplate to handle platform differences without scattering `#ifdef` throughout business code:

- `src/utils/platform.ts` — `getPlatform()`, `isH5()`, `isMpWeixin()`, `isApp()`, `getSafeAreaBottom()`
- `src/utils/platform-auth.ts` — `platformLogin()`, `getUserProfile()`
- `src/utils/platform-share.ts` — `platformShare()`
- `src/utils/platform-image.ts` — `chooseImage()`, `resolveImageUrl()`, `downloadImage()`
- `src/utils/request.ts` — automatically uses `VITE_BASE_URL` / `VITE_H5_BASE_URL` / `VITE_APP_BASE_URL`

Example:

```typescript
import { platformLogin } from '@/utils/platform-auth';
import { platformShare } from '@/utils/platform-share';

const auth = await platformLogin();
platformShare({ title: '分享标题', path: '/pages/index/index' });
```

### 3.9 Ensure Cross-Platform Compatibility

Follow `references/cross-platform-compatibility.md` to ensure the generated code works on WeChat mini-program, H5, and App.

Key rules:

- Use uni-app components: `view`, `text`, `image`, `scroll-view`, `swiper`, `button`, etc.
- Do not use H5 tags: `div`, `span`, `p`, `h1~h6`, `section`, `article`.
- Do not use `background-image: url(...)` for important images; use the `image` component.
- Do not use CSS custom properties `var(--xxx)`; use SCSS variables.
- Prefer `uni.xxx` APIs over browser APIs (`fetch`, `window`, `document`, `localStorage`).
- Use `rpx` for responsive sizing.
- Handle safe-area for notched screens.

When platform-specific behavior is required, use uni-app conditional compilation:

```vue
<!-- #ifdef MP-WEIXIN -->
<text>WeChat only</text>
<!-- #endif -->
```

## Phase 4: Post-development

### 4.1 Run Lint

Always run:

```bash
npm run lint
```

Fix any errors introduced by the generated code. Pre-existing errors should be reported to the user but not silently fixed.

### 4.2 Build Verification

Run the development server or production build:

```bash
npm run dev:mp-weixin
# or
npm run build:mp-weixin
```

Confirm the build starts without module-resolution errors.

### 4.3 Check Against mini-program-checklist.md

Use `references/mini-program-checklist.md` to verify the project is ready:

- Theme system configured
- Static assets generated
- Core pages implemented
- Lint and build pass
- WeChat-specific features considered (login, share, update, subpackages if needed)

### 4.4 Summarize Deliverables

Provide the user with:

1. Project structure overview
2. Generated files list
3. Theme color and layout style chosen
4. Lint/build status
5. Pexels API key status (configured or placeholder)
6. Suggested next steps

## Resources

This skill includes the following reference documents and bundled assets. Load them as needed during execution:

- `assets/boilerplate/` — minimal runnable uni-app project template with theme system, stores, request util, and sample pages
- `references/project-structure.md` — standard directory structure and naming conventions
- `references/theme-system.md` — dynamic theme system specification and configuration prompts
- `references/cross-platform-compatibility.md` — rules for WeChat / H5 / App compatibility
- `references/design-skills-guide.md` — when and how to use ponytail, ui-ux-pro-max, frontend-design
- `references/pexels-integration.md` — Pexels API setup, .env template, and fetch utility
- `references/wechat-common-patterns.md` — login, share, subpackages, payment, update, image upload
- `references/mini-program-checklist.md` — launch → dev → test → release checklist
- `references/claude-md-template.md` — template for generating CLAUDE.md
- `references/agents-md-template.md` — template for generating AGENTS.md
- `references/layout-patterns.md` — layout style options and tabBar configuration
- `references/static-assets-guide.md` — icon/image generation rules and asset list

## Best Practices

- Always confirm the spec with the user before writing code.
- Do not commit code on behalf of the user.
- Keep CLAUDE.md concise; put detailed rules in AGENTS.md.
- Prioritize WeChat mini-program syntax; ensure H5 and App compatibility.
- Never use H5 tags (`div`, `span`, `p`, `h1~h6`) in templates.
- Never use `background-image: url(...)` for important images; use the `image` component.
- Never use CSS custom properties `var(--xxx)`; use SCSS variables.
- Never use emoji in the generated UI.
- Never use gradients or solid color blocks as image resources; use Pexels for real photos.
- Generate icons via `icon-forge` when available; otherwise use placeholder PNGs.
- Fetch photos via Pexels API with key from `.env` when available; otherwise use default placeholders.
- Invoke `frontend-design` or `ui-ux-pro-max` before key pages when available.
- Invoke `ponytail` during implementation when available, or apply its principles manually.
- Ask the user for theme configuration (colors, spacing, font, radius) and regenerate tokens accordingly.
- Use the `references/mini-program-checklist.md` before claiming the project is done.
- After every code generation pass, run `npm run lint`.
