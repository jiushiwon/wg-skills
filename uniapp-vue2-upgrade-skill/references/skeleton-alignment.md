# 与 uniapp-app-generate-skill 标准骨架对齐

> 迁移脚手架阶段使用团队标准骨架，而非 `degit` 官方裸模板。标准骨架自带主题系统、Design Tokens、平台抽象层、预构建 UI 组件等基础设施。

## 一、为什么不用官方裸模板

| 维度 | 官方裸模板 `degit dcloudio/uni-preset-vue` | 标准骨架 `uniapp-app-generate-skill` |
|------|-------------------------------------------|--------------------------------------|
| 主题系统 | 无 | `theme.json` + `npm run theme:sync` 自动生成 |
| 色阶门禁 | 无 | `npm run theme:check` 硬编码颜色检测 |
| Design Tokens | 无 | `styles/tokens/` — 三套 Token（原始/语义/组件） |
| 平台抽象 | 无 | `utils/platform*.ts` — 平台差异集中管理 |
| UI 组件 | 无 | 7 个强制复用组件（AppButton/Card/Empty/Input/Navbar/Popup/Tab） |
| 请求层 | 无 | 标准 `utils/request.ts` — 拦截器/去重/Token 注入 |
| 代码规范 | 无 | ESLint + `npm run verify` 自检门禁 |
| 图片集成 | 无 | `utils/pexels.ts` — Pexels API 真实图片 |
| Claude 配置 | 无 | `.claudeignore` 预配置 |

## 二、对齐操作步骤

### Step 1：生成标准骨架

```
1. 调用 uniapp-app-generate-skill，在临时目录生成标准项目
2. 或在已有项目中直接执行：
   uni-app 项目初始化（uniapp-app-generate-skill 的 assets/boilerplate/）
```

### Step 2：复制标准骨架文件

从标准骨架 `assets/boilerplate/` 复制以下到迁移目标项目：

#### 配置文件

| 标准骨架文件 | 目标位置 | 说明 |
|-------------|----------|------|
| `package.json` | 根目录 | 替换原有的 Vue2 依赖列表，添加标准骨架的 scripts（theme:sync/theme:check/verify） |
| `vite.config.ts` | 根目录 | Vite + uni-app 插件配置 |
| `tsconfig.json` | 根目录 | TypeScript 配置（含 `@/*` 路径别名） |
| `.eslintrc.cjs` | 根目录 | ESLint 规则 |
| `.claudeignore` | 根目录 | Claude 索引忽略配置 |
| `theme.json` | 根目录 | **人工配置来源**，定义主题色/色阶/圆角 |

#### 工具脚本

| 标准骨架文件 | 目标位置 | 说明 |
|-------------|----------|------|
| `scripts/sync-theme.js` | `scripts/` | 从 theme.json 生成 SCSS + TS 主题文件 |
| `scripts/check-colors.js` | `scripts/` | 色阶门禁：检测业务代码中的硬编码颜色 |
| `scripts/verify.js` | `scripts/` | 一键自检：sync → check → lint → build |
| `scripts/.theme-scale.json` | `scripts/` | 色阶缓存 |

#### src/ 核心文件

| 标准骨架文件 | 目标位置 | 说明 |
|-------------|----------|------|
| `src/main.ts` | `src/` | 入口文件（createSSRApp + Pinia） |
| `src/App.vue` | `src/` | 根组件 |
| `src/pages.json` | `src/` | 保留原文件，仅更新 vueVersion |
| `src/manifest.json` | `src/` | 保留原文件，仅更新 vueVersion |
| `src/api/index.ts` | `src/api/` | API 入口 |
| `src/api/modules/demo.ts` | `src/api/modules/` | API 模块模板 |
| `src/constants/` | `src/constants/` | 常量目录（colors.ts/env.ts/enums.ts/pages.ts） |
| `src/styles/` | `src/styles/` | 样式体系（global.scss/variables/functions/mixins/tokens） |
| `src/types/` | `src/types/` | 类型定义 |
| `src/stores/` | `src/stores/` | Pinia Store（替换旧的 Vuex store/） |

#### 平台抽象层

| 标准骨架文件 | 目标位置 | 说明 |
|-------------|----------|------|
| `src/utils/platform.ts` | `src/utils/` | 平台检测与统一 API |
| `src/utils/platform-auth.ts` | `src/utils/` | 统一登录鉴权 |
| `src/utils/platform-image.ts` | `src/utils/` | 统一图片处理 |
| `src/utils/platform-share.ts` | `src/utils/` | 统一分享逻辑 |
| `src/utils/request.ts` | `src/utils/` | 请求封装（替换旧的 request.js） |
| `src/utils/storage.ts` | `src/utils/` | 本地存储封装 |

#### 标准 UI 组件

| 标准骨架文件 | 目标位置 | 说明 |
|-------------|----------|------|
| `src/components/AppButton/` | `src/components/` | 统一按钮组件 |
| `src/components/AppCard/` | `src/components/` | 统一卡片组件 |
| `src/components/AppEmpty/` | `src/components/` | 统一空状态组件 |
| `src/components/AppInput/` | `src/components/` | 统一输入框组件 |
| `src/components/AppNavbar/` | `src/components/` | 统一导航栏组件 |
| `src/components/AppPopup/` | `src/components/` | 统一弹窗组件 |
| `src/components/AppTab/` | `src/components/` | 统一 Tab 组件 |

### Step 3：安装依赖

```bash
npm install
```

### Step 4：运行自检

```bash
npm run verify
```

此命令会依次执行：
1. `theme:sync` — 同步主题文件
2. `theme:check` — 色阶门禁
3. `lint` — ESLint 检查
4. `build` — 构建验证

### Step 5：合并旧项目配置

#### pages.json 合并

```json
{
  "pages": [
    // 保留标准骨架的页面（如 index.vue）
    // 追加旧项目的页面路径
  ],
  "subPackages": [
    // 保留旧项目的分包配置
  ]
}
```

#### manifest.json 合并

```json
{
  "name": "旧项目名称",
  "appid": "旧项目 appid",
  "vueVersion": "3",
  // ... 保留旧项目的其他配置
}
```

### Step 6：主题迁移

1. 从旧项目提取全局颜色变量
2. 写入 `theme.json` 的 `colors` 字段
3. 运行 `npm run theme:sync` 生成主题文件
4. 运行 `npm run theme:check` 检测硬编码颜色
5. 批量替换页面中的硬编码颜色为 Design Token

## 三、迁移后旧组件替换策略

迁移过程中，如果旧项目的组件与标准骨架组件功能重叠，**优先使用标准组件**：

| 旧项目组件 | 标准替代 | 说明 |
|-----------|---------|------|
| 各种自定义按钮 | `AppButton` | 统一按钮样式和交互 |
| 各种自定义卡片 | `AppCard` | 统一卡片结构 |
| 各种空状态 | `AppEmpty` | 统一空状态展示 |
| 各种输入框封装 | `AppInput` | 统一输入框 |
| 自定义导航栏 | `AppNavbar` | 统一导航栏（小程序通常需要自定义导航栏） |
| 各种弹窗/Modal | `AppPopup` | 统一弹窗 |
| 各种 Tab 切换 | `AppTab` | 统一 Tab |

**替换原则**：
- 标准组件的 props 和 slots 设计为通用接口，大部分场景可直接替换
- 如果标准组件无法满足特定业务场景 → 基于标准组件扩展，而非保留旧组件
- 替换后删除旧组件文件，避免双版本维护

## 四、标准骨架与迁移项目的目录对比

```
旧项目（Vue2）                          新项目（Vue3 + 标准骨架）
─────────────────────────────────────  ─────────────────────────────────────
src/                                   src/
├── App.vue (Options API)              ├── App.vue (<script setup>)
├── main.js                            ├── main.ts
├── pages.json                         ├── pages.json (更新 vueVersion)
├── manifest.json                      ├── manifest.json (更新 vueVersion)
├── pages/                             ├── pages/
│   ├── user/                          │   ├── user/
│   ├── goods/                         │   ├── goods/
│   └── order/                         │   └── order/
├── components/ (混乱)                  ├── components/
│   ├── Button.vue                     │   ├── AppButton/  ← 标准组件
│   ├── Card.vue                       │   ├── AppCard/
│   ├── Empty.vue                      │   ├── AppEmpty/
│   └── ...                            │   ├── ...
├── store/ (Vuex)                      ├── stores/ (Pinia)
│   ├── index.js                       │   ├── index.ts
│   └── modules/                       │   └── modules/
│       └── user.js                    │       └── user.ts
├── utils/                             ├── utils/
│   ├── request.js                     │   ├── request.ts  ← 标准化
│   └── ...                            │   ├── platform.ts  ← 新增
├── static/                            │   ├── platform-auth.ts
├── styles/                            │   ├── platform-image.ts
│   └── ...                            │   ├── platform-share.ts
                                       │   ├── storage.ts  ← 新增
                                       │   └── ...
                                       ├── static/  ← 旧 static 内容
                                       ├── styles/  ← 标准 Design Tokens
                                       ├── constants/  ← 新增
                                       ├── types/  ← 新增
                                       └── api/  ← 标准化
                                           └── modules/
```

## 四、体积评估

Vue3 编译产物通常比 Vue2 略大。标准骨架额外引入 7 个 App* 组件、theme 系统、platform*.ts 等文件。**迁移前必须先评估**：

```bash
# 对比迁移前后的包体积
npm run build:mp-weixin
ls -la dist/build/mp-weixin/

# 微信小程序主包限制 2MB，每个分包限制 2MB
# 如果超出限制，需优化：
# 1. 将大页面移入 subPackages
# 2. 静态资源上传 CDN（不在包内引用大图片）
# 3. 启用 tree-shaking
```

## 五、platform-auth.ts 对接说明

标准骨架的 `platform-auth.ts` 提供统一的登录鉴权抽象层。迁移旧项目的登录逻辑时：

```typescript
// 旧项目的登录鉴权代码 → 迁移到 platform-auth.ts

// platform-auth.ts 暴露统一接口：
export function login(provider: string): Promise<UserInfo>
export function logout(): void
export function getToken(): string
export function isLoggedIn(): boolean

// 旧项目中分散的 uni.login / uni.getUserInfo / token 存储逻辑
// 集中封装到以上接口中，页面代码仅调用 platform-auth
```
