# 标准 UniApp 小程序项目结构

> 本参考文档定义使用 `uniapp-app-genernate-skill` 初始化项目时应采用的目录结构与文件组织约定。结构以 **uni-app（Vue3 + TypeScript）** 为基础，兼顾微信小程序与 H5 编译。

```
project-root/
├── .claude/                 # Claude Code 本地配置（可选，由技能自动创建）
│   └── settings.json
├── .claudeignore            # 忽略不需要进入上下文的文件
├── CLAUDE.md                # 项目级 AI 规范（开发规范、主题系统、引用规范）
├── theme.json               # 主题唯一人工源头
├── scripts/                 # 构建/同步脚本
│   ├── sync-theme.js        # 由 theme.json 生成 SCSS/TS 主题文件
│   └── verify.js            # lint + build 一键自检
├── src/
│   ├── App.vue              # 应用根组件
│   ├── api/                 # 接口封装
│   │   ├── index.ts         # 请求拦截器/统一导出
│   │   ├── modules/         # 按业务模块组织的接口定义
│   │   │   ├── user.ts
│   │   │   └── ...
│   │   └── types/           # 接口 DTO/VO 类型
│   │       └── user.ts
│   ├── components/          # 全局公共组件
│   │   ├── AppButton/
│   │   │   ├── AppButton.vue
│   │   │   └── index.ts
│   │   ├── AppCard/
│   │   │   ├── AppCard.vue
│   │   │   └── index.ts
│   │   ├── AppEmpty/
│   │   │   ├── AppEmpty.vue
│   │   │   └── index.ts
│   │   ├── AppInput/
│   │   │   ├── AppInput.vue
│   │   │   └── index.ts
│   │   └── ...
│   ├── constants/           # 常量集合
│   │   ├── colors.ts        # JS 侧主题色（与 SCSS 变量同源）
│   │   ├── enums.ts         # 枚举常量
│   │   ├── index.ts         # 统一导出
│   │   └── pages.ts         # 页面路由/标题等页面级常量
│   ├── main.ts              # 应用入口
│   ├── manifest.json        # 各端小程序配置
│   ├── pages/               # 业务页面
│   │   ├── index/
│   │   │   └── index.vue
│   │   ├── list/
│   │   │   └── index.vue
│   │   ├── form/
│   │   │   └── index.vue
│   │   ├── profile/
│   │   │   └── index.vue
│   │   └── ...
│   ├── pages.json           # 页面路由、tabBar、导航栏配置
│   ├── static/              # 纯静态资源（不经过 webpack）
│   │   ├── icons/           # tabBar/导航图标（PNG，不含 emoji）
│   │   ├── images/          # 页面装饰图/空状态图
│   │   └── tab-bar/         # tabBar 激活/未激活图标
│   ├── stores/              # Pinia 状态管理
│   │   ├── index.ts
│   │   ├── modules/
│   │   │   ├── user.ts
│   │   │   └── app.ts
│   │   └── types.ts
│   ├── styles/              # 全局样式与设计 Token
│   │   ├── config/
│   │   │   └── _theme-config.scss   # 唯一人工配置入口
│   │   ├── tokens/
│   │   │   ├── _primitive.scss      # 基础色板/尺寸（不直接使用）
│   │   │   ├── _semantic.scss       # 语义 Token
│   │   │   └── _components.scss     # 组件级尺寸 Token
│   │   ├── _functions.scss          # SCSS 函数
│   │   ├── _mixins.scss             # SCSS 混入
│   │   ├── global.scss              # 全局通用样式
│   │   └── variables.scss           # 统一入口，自动注入所有 .scss
│   ├── types/               # 全局 TypeScript 类型
│   │   ├── index.ts         # 全局类型入口（必须）
│   │   ├── api.ts           # 接口 DTO/VO（业务需要时创建）
│   │   └── components.ts    # 组件 Props 类型（业务需要时创建）
│   └── utils/               # 工具函数
│       ├── date.ts
│       ├── format.ts        # 数字/价格/文本格式化
│       ├── request.ts       # 基于 uni.request 的封装
│       ├── storage.ts       # 本地缓存封装
│       └── validate.ts      # 通用校验
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...
```

## 目录命名约定

- 全部小写，多单词用连字符 `-` 分隔。
- 组件目录使用大驼峰（与组件名一致），如 `AppButton/`。
- 业务页面目录使用小写，如 `pages/profile/`。
- 禁止在 `src/` 根目录下直接堆放 `.vue` 文件或 `.ts` 文件。

## 关键文件说明

### src/api/modules/*.ts

每个业务模块一个文件，必须包含：
- 接口地址
- 请求方法
- 请求参数类型（Req 后缀）
- 响应数据类型（Res 后缀）
- 字段中文注释

### `theme.json`（项目根目录）

主题唯一人工源头，包含原始颜色、语义颜色、间距/字体/圆角基数、以及深色模式预留值。修改后运行 `npm run theme:sync`，由 `scripts/sync-theme.js` 自动生成 SCSS 配置与 JS 常量。

### src/constants/colors.ts

JS 运行时使用的颜色常量，由 `theme.json` 经 `scripts/sync-theme.js` 自动生成，禁止手动修改。

### src/styles/config/_theme-config.scss

由 `theme.json` 自动生成的 SCSS 配置入口。禁止在其他 `.scss` 或 `.vue` 中写死颜色/尺寸。

### src/utils/request.ts

封装 `uni.request`，统一处理：
- baseURL
- 请求/响应拦截
- token 注入
- 错误提示（调用 `uni.showToast`）
- loading 控制

### .claudeignore

排除不需要进入 Claude 上下文的文件，典型条目：

```
node_modules/
dist/
unpackage/
*.log
.DS_Store
```

### `src/styles/tokens/_components.scss`

组件级尺寸 Token 定义文件，统一按钮、TabBar、导航栏、列表项、头像、空状态、卡片等常见组件的高度 / 宽度 / 圆角 / 边距。业务代码应优先使用 `$comp-*` Token，而不是写死具体 `rpx`。

### `src/constants/pages.ts`

页面路径与标题常量，避免页面路径在代码中硬编码。

### `src/utils/format.ts`

通用格式化工具（数字、价格、文本等）。

### `src/utils/validate.ts`

通用校验工具（空值、手机号、邮箱等）。

## 禁止事项

- 禁止在 `.vue` / `.scss` 中直接写 `#xxx`、`rgb()`、具体 `rpx` 数值。
- 禁止在 `data` 中存放接口原始数据，必须先转换。
- 禁止嵌套 `v-for`。
- 禁止硬编码，配置项必须放在 `src/constants/` 或 `src/styles/config/`。
- 禁止使用 emoji 作为图标或 UI 元素。
