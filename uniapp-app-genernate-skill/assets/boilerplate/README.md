# {{PROJECT_NAME}}

基于 uni-app（Vue3 + TypeScript + Pinia + SCSS）的三端应用模板，支持微信小程序、H5、App。

## 快速开始

```bash
# 安装依赖
npm install

# 微信小程序开发
npm run dev:mp-weixin

# H5 开发
npm run dev:h5

# App 开发
npm run dev:app
```

## 首次配置

1. 复制 `.env.example` 为 `.env`，并填写：
   - `VITE_PEXELS_API_KEY`（可选，用于拉取真实图片）
   - `VITE_BASE_URL`（微信小程序接口域名）
   - `VITE_H5_BASE_URL`（H5 接口域名/代理）
   - `VITE_APP_BASE_URL`（App 接口域名）

2. 修改 `src/manifest.json`：
   - 微信小程序：`mp-weixin.appid`
   - App：`app-plus.distribute.android/ios` 相关配置

3. 修改 `src/pages.json` 中的页面路径、tabBar 配置。

## 主题配置

编辑项目根目录的 `theme.json`：

```json
{
  "colors": {
    "primary": "#10b981"
  },
  "spacing": { "base": "4rpx" },
  "font": { "base": "12rpx" },
  "radius": { "base": "4rpx" }
}
```

然后运行：

```bash
npm run theme:sync
```

脚本会自动生成 `src/styles/config/_theme-config.scss` 与 `src/constants/colors.ts`，无需手动同步。

`npm run dev:*` / `npm run build:*` 前也会自动执行同步。

## 项目结构

```
src/
├── api/           # 接口封装
├── components/    # 公共组件
├── constants/     # 常量
├── pages/         # 业务页面
├── static/        # 静态资源
│   ├── tab-bar/   # tabBar 图标
│   ├── images/    # 图片资源
│   └── ...
├── stores/        # Pinia 状态
├── styles/        # 主题与全局样式
├── types/         # 类型定义
└── utils/         # 工具函数
    ├── platform*.ts   # 平台抽象
    ├── request.ts     # 网络请求
    ├── pexels.ts      # Pexels 图片
    └── ...
```

## 跨平台注意

- 模板使用 `view`/`text`/`image`/`button` 等 uni-app 组件，禁止使用 H5 标签。
- 图片使用 `image` 组件，禁止使用 `background-image: url(...)`。
- 使用 SCSS 变量 `$color-primary`，禁止使用 CSS 自定义属性 `var(--xxx)`。
- 平台差异通过 `src/utils/platform.ts` 系列文件处理。

## 代码规范

```bash
# ESLint 检查
npm run lint

# 一键自检：lint + build:h5 + 产物检查
npm run verify
```

## 默认资源

- `static/tab-bar/`：首页、我的、商城、购物车、数据、发现、消息、设置 的激活/未激活图标
- `static/images/empty-data.png`：空状态占位图
- `static/avatar-placeholder.png`：头像占位图

这些默认图标来自 icon-forge，后续可替换为项目真实图标。
