# 依赖兼容性列表

> 本文档列出 Vue2 到 Vue3 升级过程中依赖的兼容性情况

## 核心依赖

| 包名 | Vue2 版本 | Vue3 版本 | 说明 |
|------|-----------|-----------|------|
| `vue` | ^2.6.0 | ^3.3.0 | 核心库，必须升级 |
| `vuex` | ^3.6.0 | - | 弃用，改用 Pinia |
| `vue-router` | ^3.5.0 | ^4.0.0 | 需要升级 |
| `pinia` | - | ^2.0.0 | 替代 Vuex |

## uniapp 相关

| 包名 | Vue2 版本 | Vue3 版本 | 说明 |
|------|-----------|-----------|------|
| `@dcloudio/uni-app` | ^2.0.0 | ^3.0.0 | 核心框架 |
| `@dcloudio/uni-h5` | ^2.0.0 | ^3.0.0 | H5 平台 |
| `@dcloudio/uni-mp-weixin` | ^2.0.0 | ^3.0.0 | 微信小程序 |
| `@dcloudio/uni-app-plus` | ^2.0.0 | ^3.0.0 | App 平台 |
| `@dcloudio/vite-plugin-uni` | - | ^3.0.0 | Vite 插件（仅 Vue3） |
| `@dcloudio/uni-ui` | ^1.5.0 | ^1.6.0 | UI 组件库 |

## UI 组件库

| 组件库 | Vue2 版本 | Vue3 版本 | 建议 |
|--------|-----------|-----------|------|
| uView | ^2.x | ^3.x | 升级到 3.x |
| uni-ui | ^1.5.x | ^1.6.x | 升级 |
| Vant Weapp | ^1.x | ^1.x | 兼容 |
| element-ui | ^2.x | - | 改用 element-plus |
| element-plus | - | ^2.x | 替代 element-ui |
| ant-design-vue | ^1.x | ^2.x | 升级到 2.x |

## 国际化（i18n）

| 包名 | Vue2 版本 | Vue3 版本 | 说明 |
|------|-----------|-----------|------|
| vue-i18n | ^8.x | ^9.x | 破坏性变更，`$t()` → `t()`，`$tc()` 移除，需升级 |
| vue-i18n-bridge | — | ^9.x | Vue2 → Vue3 过渡桥接（推荐渐进式迁移使用） |

**vue-i18n v8 → v9 关键变更**：

| 变更项 | v8 (Vue2) | v9 (Vue3) |
|--------|-----------|-----------|
| 实例方法 | `this.$t('key')` | `import { useI18n } from 'vue-i18n'` → `const { t } = useI18n()` |
| 复数翻译 | `$tc('key', count)` | 移除，改用 `t('key', count)` |
| 日期/数字格式化 | `$d()` / `$n()` | 移除，改用 `Intl.DateTimeFormat` |
| 组件 | `<i18n>` 在 SFC 中 | 用法相同，但需 `@vue/compiler-sfc` 支持 |
| 初始化 | `new VueI18n()` | `createI18n()` |

> **迁移策略**：在 `<script setup>` 中，使用 `const { t } = useI18n()` 替代 `this.$t()`。模板中使用 `{{ t('key') }}` 替代 `{{ $t('key') }}`。

## 网络请求

| 包名 | Vue2 | Vue3 | 说明 |
|------|------|------|------|
| axios | ✓ | ✓ | 兼容 |
| flyio | ✓ | ✓ | 兼容 |
| taro-fetch | ✓ | ✓ | 兼容 |

## 工具库

| 包名 | Vue2 | Vue3 | 说明 |
|------|------|------|------|
| lodash | ✓ | ✓ | 兼容 |
| dayjs | ✓ | ✓ | 兼容 |
| moment | ✓ | ✓ | 不推荐，太大 |
| qs | ✓ | ✓ | 兼容 |
| decimal.js | ✓ | ✓ | 兼容 |

## 构建工具

| 包名 | Vue2 | Vue3 | 说明 |
|------|------|------|------|
| webpack | 4.x | 5.x | 推荐升级 |
| vite | - | ^4.x | 推荐使用 |
| @vue/cli | 4.x | 5.x | 升级 |
| sass | ✓ | ✓ | 兼容 |
| less | ✓ | ✓ | 兼容 |

## 迁移策略

### 必须替换

| Vue2 包 | 替代方案 |
|---------|----------|
| vuex | pinia |
| @dcloudio/uni-app (Vue2) | @dcloudio/uni-app (Vue3) |
| @dcloudio/vite-plugin-uni | 保留（Vue3 专用） |

### 需要升级

| 包名 | 升级到 |
|------|--------|
| vue | ^3.3.0 |
| vue-router | ^4.0.0 |
| @dcloudio/uni-app | ^3.0.0 |
| @dcloudio/uni-ui | ^1.6.0 |

### 可以保留

- axios
- lodash
- dayjs
- sass
- less

## 常用替代方案

### 状态管理

```
Vuex → Pinia
```

### UI 组件库

```
uView 2.x → uView 3.x
element-ui → element-plus
```

### 构建工具

```
webpack → Vite (推荐)
@vue/cli → Vite
```

## 版本查询

```bash
# 查看当前项目依赖版本
npm list

# 查看某个包的最新版本
npm view vue version
npm view pinia version
npm view @dcloudio/uni-app version

# 检查兼容性
npm view vue@3 peerDependencies
```

## 推荐依赖版本组合

### uni-app Vue3 + Vite 推荐配置

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "@dcloudio/uni-app": "^3.0.0-4010520240507001",
    "@dcloudio/uni-app-plus": "^3.0.0-4010520240507001",
    "@dcloudio/uni-h5": "^3.0.0-4010520240507001",
    "@dcloudio/uni-mp-weixin": "^3.0.0-4010520240507001",
    "pinia": "^2.1.0",
    "axios": "^1.6.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@dcloudio/vite-plugin-uni": "^3.0.0-4010520240507001",
    "vite": "^5.0.0",
    "sass": "^1.69.0",
    "typescript": "^5.3.0"
  }
}
```

### uni-ui 兼容版本

| uni-app 版本 | uni-ui 版本 |
|--------------|-------------|
| Vue3 3.0.0+ | uni-ui 1.6.0+ |
| Vue3 3.0.0-4010520240507001 | uni-ui 1.5.5 |

### 常用 uni-app CLI 版本号

```
# 2024年5月版本
4010520240507001

# 查看可用版本
npm view @dcloudio/uni-app versions --json | tail -20
```

## SDK / 云服务 / 原生插件分类

> 迁移时按以下分类处理，避免对无需改动的 SDK 做不必要的重写。

### 可跳过 — 不依赖 Vue 版本，直接复制使用

| SDK | 说明 | 迁移方式 |
|-----|------|----------|
| 微信 API（`wx.*`） | 微信原生 API，不依赖 Vue | 直接复制调用代码 |
| uni API（`uni.*`） | uni-app 内置 API，V2/V3 通用 | 直接复制调用代码 |
| `qs` / `lodash` / `dayjs` / `decimal.js` | 纯 JS 工具库 | npm 直接安装即可 |
| `crypto-js` / `jsencrypt` | 加密库 | npm 直接安装即可 |
| `uuid` / `nanoid` | ID 生成 | npm 直接安装即可 |
| ECharts / uCharts | 图表库 | 检查初始化代码中是否正确注册组件 |
| QRCode.js / wxbarcode | 二维码/条形码 | 直接复制使用 |

### 需核对 — 检查 Vue3 兼容性后确认

| SDK | Vue2 用法 | Vue3 检查点 | 结论 |
|-----|----------|-------------|------|
| uView UI ^2.x | 通过 `Vue.use()` 注册 | 3.x 版本支持 Vue3，但 API 有变化 | 升级到 ^3.x |
| uni-ui ^1.5.x | uni_modules 方式引入 | 1.6.x+ 支持 Vue3 | 升级到 ^1.6.x |
| Vant Weapp | 小程序原生组件，不依赖 Vue | 无需改动 | 保留 |
| vant | Vue2 版本 | 需使用 vant@4 或 vant-weapp | 替换 |
| Element UI | Vue2 专用 | 不支持 Vue3 | 替换为 Element Plus |
| Ant Design Vue ^1.x | Vue2 专用 | 2.x+ 支持 Vue3 | 升级到 ^2.x |
| @escook/request-miniprogram | 小程序请求封装 | 通过 uni.request 二次封装 | 替换为 request.ts |

### 需适配 — 在新骨架中重新对接

| SDK | 原项目位置 | 适配要点 |
|-----|----------|----------|
| 阿里云 OSS（`ali-oss`） | `utils/oss.js` | 复制到 `utils/sdk-oss.ts`，检查 API 兼容性，将 `Vue.prototype.$oss` 改为直接 import |
| 腾讯云 COS（`cos-js-sdk-v5`） | `utils/cos.js` | 同上，检查初始化逻辑 |
| 七牛云（`qiniu-js`） | `utils/qiniu.js` | 同上 |
| uniCloud | `uniCloud.callFunction()` | API 不变，将调用代码从 Vue.prototype → 独立模块 |
| 微信云开发 | `wx.cloud.xxx()` | 检查初始化时机（从 main.ts 移到 App.vue onLaunch） |
| 阿里云短信 SDK | `utils/sms.js` | 通常是对 REST API 的封装，直接复制 |
| 腾讯 IM（TIM SDK） | `utils/tim.js` | 检查最新版本是否兼容 Vue3，将 `Vue.prototype.$tim` 改为直接 import |
| WebSocket / Socket.IO | `utils/socket.js` | 不依赖 Vue，直接复制即可 |
| 百度地图 / 高德地图 / 腾讯地图 | `components/Map*.vue` | SDK 调用不依赖 Vue，但地图组件的语法需要迁移 |
| 微信支付 / 支付宝支付 | `uni.requestPayment()` | API 不变，直接保留 |

### 必须改 — 深度绑定 Vue2，必须重写

| 类型 | 示例 | 替换方案 |
|------|------|----------|
| Vue2 插件（`Vue.use(xxx)`） | 自定义 toast/loading 插件 | 改为 composable 或 import 直接调用 |
| `Vue.prototype.$xxx` | `Vue.prototype.$api` | 改为直接 import 模块 |
| Vuex 插件（`vuex-persistedstate`） | 数据持久化 | 改为 Pinia 插件或 `uni.setStorageSync` |
| 依赖 `this` 的工具函数 | 如 `this.$utils.xxx()` | 重构为纯函数 + 直接 import |

### 原生插件（App 端）

| 插件类型 | 迁移注意事项 |
|----------|-------------|
| uni-app 原生插件（uni_modules） | 检查插件是否有 Vue3 版本，升级到对应版本 |
| 自定义原生插件 | 需要重新用 Vue3 API 编译，工作量较大 |
| 微信小程序插件 | 不依赖 Vue 版本，直接保留 |

**uni_modules 专项处理**：

uni_modules 是 uni-app 的插件管理目录，很多项目通过它引入第三方插件（如 `uni-id`、`uni-pay`、`uni-upgrade-center` 等）。

```bash
# 列出所有 uni_modules 插件
ls uni_modules/

# 检查每个插件是否有 Vue3 版本的升级指引
# 方式1：查看插件根目录的 package.json 中是否声明 vue3 兼容
grep -r '"vue"' uni_modules/*/package.json

# 方式2：查看插件文档是否提到 Vue3
# 方式3：在 uni-app 插件市场搜索该插件最新版本
```

**uni_modules 处理策略**：

| 插件状态 | 处理方式 |
|----------|----------|
| 已声明 Vue3 兼容 | 直接升级到对应版本 |
| 未声明但市场有 Vue3 版本 | 从插件市场重新下载 Vue3 版本 |
| 无 Vue3 版本 | 评估是否可替换为 npm 包或自行开发 |
| 仅含原生组件（不依赖 Vue） | 直接保留，无需改动 |
| 已废弃/无人维护 | 标记为 P2 风险，寻找替代方案 |

**常见 uni_modules 兼容情况**：

| 插件 | Vue3 兼容 | 备注 |
|------|-----------|------|
| uni-id / uni-id-pages | ✓ | DCloud 官方维护，支持 Vue3 |
| uni-pay | ✓ | DCloud 官方，支持 Vue3 |
| uni-upgrade-center | ✓ | DCloud 官方，支持 Vue3 |
| 其他社区插件 | 逐个检查 | 需在插件市场确认 |

**原生插件评估清单**：
```
□ 列出所有使用的原生插件（搜索 manifest.json 中的 "plugins" / "nativePlugins"）
□ 检查每个插件的文档是否声明 Vue3 兼容
□ 无法兼容的插件 → 寻找替代品或评估自行开发成本
□ 将插件评估结果写入迁移报告
```
