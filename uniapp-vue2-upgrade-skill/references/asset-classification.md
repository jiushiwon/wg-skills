# 资产四分类规则

> 迁移前自动扫描项目，将每个文件/依赖按处理方式分为四类，避免一刀切全部重写。

## 分类概览

| 分类 | 代号 | 处理策略 | 工时占比 |
|------|------|----------|----------|
| **可跳过** | SKIP | 直接复制到新项目 | 0% |
| **需核对** | CHECK | 检查 Vue3 兼容版本后确认 | 10% |
| **需适配** | ADAPT | 在新骨架中重新对接 | 20% |
| **必须改** | REWRITE | 完整语法迁移 | 70% |

---

## 一、可跳过（SKIP）— 直接复制

### 1.1 静态资源文件

| 类型 | 规则 | 说明 |
|------|------|------|
| 图片 | `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.svg`, `*.webp`, `*.ico` | 直接复制到 `src/static/` |
| 字体 | `*.ttf`, `*.woff`, `*.woff2`, `*.otf`, `*.eot` | 直接复制到 `src/static/fonts/` |
| 音频 | `*.mp3`, `*.wav`, `*.ogg`, `*.aac` | 直接复制到 `src/static/audio/` |
| 视频 | `*.mp4`, `*.webm`, `*.mov` | 建议：≤ 5MB 复制到 `static/`；> 5MB 上传 CDN，代码中引用 CDN 地址 |
| 文档 | `*.pdf`, `*.doc`, `*.xlsx` | 同视频策略 |

### 1.2 纯配置文件（非 Vue 相关）

| 文件 | 条件 | 说明 |
|------|------|------|
| `*.json` | 非 `pages.json`、`manifest.json` | 直接复制，无需改动 |
| `*.md` | 全部 | 直接复制 |
| `.gitignore` | — | 基于标准骨架的版本覆盖 |
| `.editorconfig` | — | 基于标准骨架的版本覆盖 |

### 1.3 目录级跳过

```
整个目录符合条件时，直接批量复制：
- static/ 或 assets/ → src/static/
- docs/ → 复制到新项目根目录
- mock/ → 复制到 src/mock/（如有）
```

---

## 二、需核对（CHECK）— 检查兼容版本

### 2.1 uniapp 生态依赖

| 包名 | Vue2 版本 | Vue3 兼容版本 | 处理 |
|------|-----------|---------------|------|
| `@dcloudio/uni-app` | ^2.x | ^3.x | 升级到骨架指定版本 |
| `@dcloudio/uni-ui` | ^1.5.x | ^1.6.x+ | 核对版本后升级 |
| `@dcloudio/uni-mp-weixin` | ^2.x | ^3.x | 升级 |
| `@dcloudio/uni-h5` | ^2.x | ^3.x | 升级 |
| `@dcloudio/vite-plugin-uni` | — | ^3.x+ | Vue3 专用，直接安装 |
| `@dcloudio/uni-cloud` | ^2.x | ^3.x | 升级 |

### 2.2 UI 组件库

| 包名 | Vue2 版本 | Vue3 兼容版本 | 处理 |
|------|-----------|---------------|------|
| uView | ^1.x / ^2.x | ^3.x | 需升级到 3.x，API 有变化 |
| uni-ui | ^1.5.x | ^1.6.x+ | 需核对属性和事件名变化 |
| Vant Weapp | ^1.x | ^1.x | 兼容，内部不依赖 Vue 版本 |
| ThorUI | — | — | 检查是否有 Vue3 版本 |
| FirstUI | — | — | 检查是否有 Vue3 版本 |
| TMUI | — | — | 检查是否有 Vue3 版本 |

### 2.3 通用工具库

| 包名 | 兼容性 | 处理 |
|------|--------|------|
| `axios` | ✓ Vue2+Vue3 兼容 | 直接保留 |
| `dayjs` | ✓ 兼容 | 直接保留 |
| `lodash` | ✓ 兼容 | 直接保留 |
| `qs` | ✓ 兼容 | 直接保留 |
| `decimal.js` | ✓ 兼容 | 直接保留 |
| `crypto-js` | ✓ 兼容 | 直接保留 |
| `mitt` | ✓ 兼容 | Vue3 Event Bus 替代品 |
| `uuid` | ✓ 兼容 | 直接保留 |

### 2.4 核对流程

```
for each 第三方依赖:
  1. 查 npm 或 GitHub → 确认最新版本是否声明 Vue3 兼容
  2. 查看 CHANGELOG → 确认 Vue3 迁移注意事项
  3. 小范围 POC 测试 → 确认功能正常
  4. 标记为 CHECK_OK（可用）或 CHECK_FAIL（需替换）
```

---

## 三、需适配（ADAPT）— 在新骨架中重新对接

### 3.1 云服务 SDK

| SDK 类型 | 原项目使用方式 | 新骨架适配方式 |
|----------|---------------|---------------|
| 阿里云 OSS | `ali-oss` npm 包 + 直接初始化的 `utils/oss.js` | 复制 `utils/oss.js`，检查 API 是否变化，在新骨架 `utils/` 中封装 |
| 腾讯云 COS | `cos-js-sdk-v5` + `utils/cos.js` | 同上 |
| 七牛云 | `qiniu-js` + `utils/qiniu.js` | 同上 |
| uniCloud | `uniCloud.callFunction()` | uni-app Vue3 支持 uniCloud，API 不变，直接复制调用代码 |
| 微信云开发 | `wx.cloud.xxx()` | 复制调用代码，检查初始化位置（从 main.ts 移到 App.vue onLaunch） |
| 阿里云短信 | `utils/sms.js` 封装的 API 调用 | 直接复制，API 不变 |

### 3.2 即时通讯 SDK

| SDK | 适配要点 |
|-----|----------|
| 腾讯 IM（TIM SDK） | 检查最新版本 Vue3 兼容性，初始化代码从 `Vue.prototype` 迁移到 `provide/inject` 或独立模块 |
| Socket.IO | `socket.io-client` 本身不依赖 Vue，直接复制 `utils/socket.js` |
| WebSocket 封装 | 直接复制，与 Vue 版本无关 |

### 3.3 地图 SDK

| SDK | 适配要点 |
|-----|----------|
| 百度地图 | 小程序中通过 `<map>` 组件使用，与 Vue 版本无关 |
| 高德地图 | 同上 |
| 腾讯地图 | 同上 |

**注意**：如果原项目封装了 `components/MapPicker` 等地图组件，该组件本身属于"必须改"分类（因为使用了 Options API），但其底层 SDK 调用属于"需适配"分类。

### 3.4 支付 SDK

| SDK | 适配要点 |
|-----|----------|
| 微信支付 | uni.requestPayment() API 不变，直接保留 |
| 支付宝支付 | uni.requestPayment() 不变 |
| 聚合支付封装 | `utils/payment.js` 复制后检查 API 调用 |

### 3.5 适配流程

```
for each 云服务依赖:
  1. 识别文件中的云服务 SDK 调用点
  2. 提取为独立的 utils/sdk-xxx.ts 模块（便于管理和替换）
  3. 在新骨架中创建对应模块
  4. 检查初始化逻辑：从 Vue.prototype → Pinia Store 或独立模块
  5. 验证 SDK 版本兼容性
  6. 编写简单的连接测试
```

---

## 四、必须改（REWRITE）— 完整语法迁移

### 4.1 自动识别规则

| 文件类型 | 识别规则 | 说明 |
|----------|----------|------|
| 单文件组件 | `*.vue` 文件中包含 `export default {` | Options API 组件 |
| Vuex Store | `store/` 目录下文件包含 `new Vuex.Store` | Vuex 状态管理 |
| Vue 插件 | 文件包含 `Vue.use(` 或 `Vue.prototype.` | Vue2 插件模式 |
| 混入 Mixin | 文件导出对象包含 `data(){}`、`methods:{}`、`computed:{}` | 需转换为 composable |
| 指令 Directive | 文件包含 `Vue.directive(` 或 `directives: {` | Vue2 自定义指令 |
| 过滤器 Filter | 文件包含 `filters: {` 或 `Vue.filter(` | Vue2 过滤器 |

### 4.2 不包含 Vue 逻辑的纯 JS 文件

| 条件 | 处理 |
|------|------|
| 纯工具函数，不引用 `vue`，不引用 Vuex | 直接复制，可选添加 TS 类型 |
| 引用了 `vue`（如 `import Vue from 'vue'`） | 需要重构 |
| 引用了 Vuex（如 `import store from '@/store'`） | 需要重构 |

### 4.3 迁移性价比排序

在大项目逐模块迁移中，优先改动性价比高的文件：

| 优先级 | 文件类型 | 理由 |
|--------|----------|------|
| P0 | Store (Vuex → Pinia) | 全局影响，早迁早受益 |
| P0 | Mixin → Composable | 被大量页面引用，迁移后所有页面受益 |
| P0 | 公共组件 | 被大量页面使用 |
| P1 | 业务页面 | 每个页面独立迁移 |
| P2 | 一次性的工具函数 | 影响范围小 |

---

## 五、扫描脚本示例

```bash
#!/bin/bash
# classify-assets.sh — 资产分类扫描脚本

echo "=== 资产分类扫描 ==="
echo ""

# 1. 可跳过 — 静态资源
echo "【可跳过】静态资源："
find src -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.gif" -o -name "*.svg" -o -name "*.ttf" -o -name "*.woff2" -o -name "*.mp3" -o -name "*.mp4" \) | wc -l
echo "个文件"

# 2. 需核对 — 第三方依赖
echo ""
echo "【需核对】第三方依赖："
cat package.json | grep -E '"dependencies"' -A 50 | grep '"' | grep -v '"dependencies"' | grep -v '}'

# 3. 需适配 — SDK/云服务
echo ""
echo "【需适配】SDK/云服务："
grep -rl "wx\.cloud\|uniCloud\|ali-oss\|cos-js\|qiniu\|TIM\|io(" src/utils/ src/ 2>/dev/null | head -20

# 4. 必须改 — Vue 组件
echo ""
echo "【必须改】Vue 组件："
echo "  总 .vue 文件数: $(find src -name '*.vue' | wc -l)"
echo "  Options API 组件: $(grep -rl 'export default {' src --include='*.vue' | wc -l)"
echo "  Vuex Store: $(grep -rl 'Vuex.Store\|new Vuex' src/store/ 2>/dev/null | wc -l)"
echo "  Mixin 文件: $(grep -rl 'data()\|methods:' src --include='*.js' | grep -v node_modules | wc -l)"
```
