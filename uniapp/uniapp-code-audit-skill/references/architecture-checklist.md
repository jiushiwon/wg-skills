# 架构与规范检查清单

> 本清单用于 `uniapp-code-audit-skill` 架构与项目规范审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. 目录结构与命名

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 缺少标准目录 | P1 | 项目结构不符合标准骨架 | 缺少 `src/api/`、`src/components/`、`src/pages/`、`src/stores/`、`src/utils/`、`src/constants/`、`src/types/`、`src/styles/` 中任意一个 | `uniapp-app-generate-skill/references/project-structure.md` | `ls -la src/` |
| `src/` 根目录散落文件 | P2 | 文件未按职责归类 | `src/` 根目录下存在 `.vue` 或 `.ts` 文件（`App.vue`、`main.ts`、`pages.json`、`manifest.json` 除外） | `uniapp-app-generate-skill/references/project-structure.md` | `ls -la src/` |
| 目录命名不规范 | P2 | 可读性差，不符合约定 | 目录名含大写、下划线或中文 | `uniapp-standard-skill` 2.2 | `ls -R src/ \| grep -E '[A-Z_一-龥]'` |
| 组件目录未使用大驼峰 | P2 | 组件命名空间不清晰 | 公共组件目录未使用 PascalCase（如 `AppButton/`） | `uniapp-app-generate-skill/references/project-structure.md` | `ls src/components/` |
| 页面目录结构混乱 | P2 | 页面文件散落 | 页面未按 `pages/页面名/index.vue` 组织 | `uniapp-app-generate-skill/references/project-structure.md` | `find src/pages -type f` |

## 2. 配置文件审计

### 2.1 `manifest.json`

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未配置微信小程序 appid | P1 | 无法正常预览/上传 | `mp-weixin.appid` 为空或为占位符 | `uniapp-app-generate-skill` 2.1 | 检查 `src/manifest.json` |
| 未声明必要权限 | P1 | 审核被拒或运行时异常 | 使用位置/相机/相册等能力但未在 `permission` 声明 | 微信小程序官方要求 | 检查 `src/manifest.json` |
| 未配置隐私保护指引 | P1 | 审核被拒 | 涉及用户隐私接口但未开启隐私校验 | 微信小程序官方要求 | 检查 `src/manifest.json` |

### 2.2 `pages.json`

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| TabBar 缺少图标 | P2 | 小程序 tabBar 无法显示 | `tabBar.list` 中 `iconPath`/`selectedIconPath` 指向不存在文件 | `uniapp-app-generate-skill` 3.5 | 检查 `src/pages.json` 与 `static/tab-bar/` |
| 自定义导航栏配置错误 | P2 | 标题或内容与胶囊重叠 | `navigationStyle: custom` 页面未按规范处理胶囊区域 | `uniapp-app-generate-skill` 3.5 / cross-platform | 检查 `src/pages.json` 与对应页面 |
| 未配置分包 | P2 | 主包体积易超限 | 页面较多但未启用 `subPackages` | `uniapp-app-generate-skill/references/mini-program-checklist.md` | 检查 `src/pages.json` |

### 2.3 `vite.config.ts`

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 缺少 `@/` alias | P1 | 源码路径引用混乱 | 未配置 `@` 指向 `src/` | `uniapp-app-generate-skill` 2.2 | 检查 `vite.config.ts` |
| 未配置 H5 代理 | P2 | H5 开发阶段 CORS 问题 | H5 目标且未配置 `server.proxy` | `uniapp-app-generate-skill` 3.8 | 检查 `vite.config.ts` |

### 2.4 `tsconfig.json`

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未启用 `strict` | P2 | 类型检查不严格 | `compilerOptions.strict` 为 false 或缺失 | `uniapp-standard-skill` R11 | 检查 `tsconfig.json` |
| 缺少 `paths` 配置 | P2 | 无法使用 `@/` 引入 | `compilerOptions.paths` 未配置 `@/*` | `uniapp-app-generate-skill` 2.2 | 检查 `tsconfig.json` |

### 2.5 `package.json`

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 缺少 lint/build 脚本 | P2 | 无法运行规范检查与构建 | 不存在 `lint`、`build:mp-weixin`、`dev:mp-weixin` | `uniapp-standard-skill` 五、R11 | 检查 `package.json` |
| 缺少 theme sync/check 脚本（如使用主题系统） | P2 | 主题系统无法校验 | 存在 `theme.json` 但无 `theme:sync`/`theme:check` | `uniapp-app-generate-skill` 3.1 | 检查 `package.json` |

## 3. 红线规则对照

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 嵌套 `v-for` | P0 | 违反 R01 红线 | 模板中存在嵌套 `v-for` | `uniapp-standard-skill` R01 | `grep -rnE 'v-for.*v-for' src/` |
| `data` 直接存放接口原始数据 | P1 | 违反 R02 红线 | 页面 data 中存储未转换的接口响应 | `uniapp-standard-skill` R02 | 检查页面 `ref`/`data` 定义 |
| 使用私有 API | P1 | 违反 R03 红线 | 代码中调用非 `uni.xxx` 官方 API | `uniapp-standard-skill` R03 | 人工检查 API 调用 |
| 存在硬编码配置 | P1 | 违反 R08 红线 | 配置项未放 `src/constants/` 或 `src/config/` | `uniapp-standard-skill` R08 | `grep -rnE "['\"][^'\"]{20,}['\"]" src/` |
| 同一接口 1 秒内重复请求 | P1 | 违反 R09 红线 | 无防抖/去重逻辑 | `uniapp-standard-skill` R09 | 检查 `src/api/request.ts` |
| 失败场景无用户提示 | P1 | 违反 R10 红线 | 请求/操作失败后未调用 Toast/Modal | `uniapp-standard-skill` R10 | 检查错误处理逻辑 |
| Mock 数据写在 API 文件或页面中 | P1 | 违反 R16 红线 | `src/api/modules/*.ts` 或 `src/pages/` 中出现 Mock 数据 | `uniapp-standard-skill` R16 | `grep -rnE 'MOCK\|mockData\|mock' src/api/modules/ src/pages/` |
| 请求传递完整域名或 `/api/v1` 前缀 | P1 | 违反 R17 红线 | API 调用中写死域名或 prefix | `uniapp-standard-skill` R17 | `grep -rnE 'https?://.*/api\|/api/v1' src/api/ src/pages/` |
| SCSS 未使用 Token | P2 | 违反 R15 红线 | 样式中写死色值/尺寸 | `uniapp-standard-skill` R15 | `grep -rnE '#[0-9a-fA-F]{3,6}\|[0-9]+px' src/` |

## 4. Vue3 / Composition API 规范

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 组件未使用 `script setup` | P3 | 代码冗余 | 新项目组件仍使用 Options API | `uniapp-app-generate-skill` 3.6 | 抽样检查 `.vue` 文件 |
| 生命周期副作用未清理 | P1 | 内存泄漏 | `watch`、`setInterval`、`uni.$on` 未在 `onUnmounted` 清理 | 通用代码规范（内存与生命周期） | 检查 `.vue` 文件生命周期 |
| 大量使用 `any` | P1 | 类型系统失效 | 源码中 `: any` / `as any` 过多 | `uniapp-standard-skill` R11 | `grep -rnE ': any\|as any' src/` |

## 5. 状态管理

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未使用 Pinia | P1 | 全局状态管理混乱 | 项目未引入 Pinia | `uniapp-app-generate-skill` 3.7 | 检查 `package.json` 与 `src/stores/` |
| store 未按领域拆分 | P2 | store 臃肿 | 所有状态集中在一个文件 | `uniapp-standard-skill` 2.1 | `ls src/stores/modules/` |
| Storage Key 未集中定义 | P2 | 命名冲突、难以维护 | `uni.setStorageSync` 直接使用字符串 key | `uniapp-components-skill` 3.3 | `grep -rnE 'setStorageSync\("' src/` |

## 6. 错误处理与日志

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 错误提示不统一 | P2 | 用户体验差 | 各页面自行处理错误提示 | `uniapp-request-skill` 设计要点 6. 错误处理 | 检查 `src/utils/toast.ts` 使用情况 |
| 错误上报泄露用户信息 | P1 | 隐私泄露 | 上报内容含 Token、完整手机号 | `uniapp-components-skill` A06 | 检查错误上报封装 |

## 7. 构建 / CI / Lint

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未配置 lint 脚本 | P2 | 无法做代码规范检查 | `package.json` 无 `lint` | `uniapp-standard-skill` R11/R12 | `cat package.json \| grep lint` |
| lint 不通过 | P1 | 代码存在规范错误 | `npm run lint` 返回错误 | `uniapp-standard-skill` R11 | `npm run lint` |
| 构建失败 | P0 | 无法打包上线 | `npm run build:mp-weixin` 失败 | `uniapp-app-generate-skill` 4.2 | `npm run build:mp-weixin` |
| 缺少 `.claudeignore` | P3 | Claude 索引无关文件 | 项目根目录无 `.claudeignore` | `uniapp-app-generate-skill` 2.5 | `ls -la .claudeignore` |

## 8. 依赖与供应链

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 已知漏洞依赖 | P1 | 存在 CVE 风险 | `npm audit` 报告漏洞 | 通用供应链安全 | `npm audit` |
| 过期核心依赖 | P2 | 兼容性与维护风险 | Vue/uni-app 等核心依赖版本过旧 | 通用工程规范 | `cat package.json` |
| 未使用依赖 | P3 | 体积与维护成本 | 依赖未被源码引用 | 通用工程规范 | `npm ls` / 检查引用 |
| 依赖版本锁定缺失 | P3 | 构建结果不稳定 | 无 `package-lock.json` 或 `pnpm-lock.yaml` | 通用工程规范 | `ls package-lock.json pnpm-lock.yaml yarn.lock` |
