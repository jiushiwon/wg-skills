# Electron Builder 打包配置指南

本指南介绍如何使用 **electron-builder** 将 Electron + Vue3 应用打包为可执行文件。

## 打包流程

```
npm run build
    ↓
electron-vite build（构建主进程 + 预加载 + 渲染进程）
    ↓
electron-builder（打包为可执行文件）
    ↓
输出：.exe / .dmg / .AppImage
```

---

## 配置文件（electron-builder.json5）

```json5
{
  // 应用唯一标识（反向域名格式）
  appId: 'com.{{project-name}}.app',

  // 产品名称（显示在标题栏、安装包）
  productName: '{{project-name}}',

  // 版权信息
  copyright: 'Copyright © 2025 {{author}}',

  // 构建资源目录（图标等）
  directories: {
    buildResources: 'build',
    output: 'dist'
  },

  // 包含的文件（electron-vite 构建输出）
  files: ['out/**/*'],

  // ASAR 打包（将源码打包为单个文件）
  asar: true,

  // Windows 配置
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'resources/icon.png',
    // 请求管理员权限
    requestedExecutionLevel: 'asInvoker'
  },

  // macOS 配置
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'resources/icon.png',
    category: 'public.app-category.productivity',
    // 硬化运行时（macOS 公证需要）
    hardenedRuntime: true,
    gatekeeperAssess: false
  },

  // Linux 配置
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      }
    ],
    icon: 'resources/icon.png',
    category: 'Utility'
  },

  // NSIS 安装包配置（Windows）
  nsis: {
    // 允许用户选择安装目录
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    // 创建桌面快捷方式
    createDesktopShortcut: true,
    // 创建开始菜单快捷方式
    createStartMenuShortcut: true,
    // 卸载时是否删除用户数据
    deleteAppDataOnUninstall: false,
    // 安装包名称
    shortcutName: '{{project-name}}',
    // 安装包图标
    installerIcon: 'resources/icon.png',
    uninstallerIcon: 'resources/icon.png'
  },

  // DMG 配置（macOS）
  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ],
    window: {
      width: 540,
      height: 380
    }
  },

  // 自动更新配置（可选）
  publish: null
}
```

---

## 打包命令

```bash
# 构建 + 打包（当前平台）
npm run build

# 仅打包（跳过构建，使用上次构建结果）
npx electron-builder --dir  # 输出目录，不生成安装包

# 指定平台打包
npm run build:win      # Windows .exe
npm run build:mac      # macOS .dmg
npm run build:linux    # Linux .AppImage
```

---

## 应用图标

### 图标规格

| 平台 | 格式 | 尺寸 | 位置 |
|------|------|------|------|
| Windows | PNG/ICO | 256x256 | `resources/icon.png` |
| macOS | PNG | 512x512（或 1024x1024） | `resources/icon.png` |
| Linux | PNG | 512x512 | `resources/icon.png` |

### 生成图标

可以使用在线工具生成多尺寸图标：
- https://icon.kitchen — 在线生成 Electron 图标
- https://www.iconfinder.com — 图标素材

---

## 版本管理

### package.json 中的版本号

```json
{
  "version": "1.0.0"
}
```

版本号格式：`主版本.次版本.修订版本`

- 主版本：重大功能变更
- 次版本：新功能
- 修订版本：Bug 修复

### 自动更新（进阶）

如需自动更新，配置 `publish` 字段：

```json5
{
  "publish": {
    "provider": "github",
    "owner": "{{github-username}}",
    "repo": "{{project-name}}"
  }
}
```

然后在主进程中集成 `electron-updater`：

```bash
npm install electron-updater
```

---

## 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 打包后白屏 | 渲染进程路径错误 | 检查 `electron.vite.config.ts` 的 `outDir` |
| 安装包太大 | 未排除开发依赖 | 确保 `devDependencies` 不会被打包 |
| Windows 杀毒软件误报 | 未签名 | 购买代码签名证书 |
| macOS 无法打开 | 未公证 | 使用 Apple Developer 账号公证 |
| Linux 无法运行 | 缺少权限 | `chmod +x *.AppImage` |
| 图标不显示 | 图标格式/路径错误 | 使用 PNG 格式，检查路径 |

---

## 代码签名（进阶）

### Windows

```json5
{
  "win": {
    "signingHashAlgorithms": ["sha256"],
    "sign": "./scripts/sign.js"  // 自定义签名脚本
  }
}
```

### macOS

```json5
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)",
    "hardenedRuntime": true,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  }
}
```

---

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: release-${{ matrix.os }}
          path: dist/
```
