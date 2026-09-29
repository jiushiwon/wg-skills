# vue-admin-skill — AVATARS 头像接入指南

> 本文档说明 vue-admin-skill 如何接入 image-forge-skill（图片生成/处理）规范

## 1. 当前实现：纯文字首字母头像

`AdminLayout.vue` 顶栏右侧默认显示用户**首字母头像**（首字母大写 + 主题色背景）：

```vue
<div class="admin-layout__avatar">
  {{ username?.charAt(0)?.toUpperCase() || 'U' }}
</div>
```

**优点**：
- 零依赖
- 加载快（无需请求图片）
- 符合 vue-base-skill "零硬编码图片资源" 原则

**缺点**：
- 没有个性化（所有用户首字母都是纯背景色块）

## 2. 个性化头像：复用 image-forge-skill

### 场景

需要为用户生成**专属头像**（如 Gravatar / DiceBear 风格）时，复用 `image-forge-skill`：

```
image-forge-skill/ （vibeCoding/frontend/）
├── SKILL.md
└── references/   ← sharp 库封装（PNG / WebP / 圆角 / 压缩）
```

`image-forge-skill` 核心能力（基于 [sharp](https://sharp.pixelplumbing.com/)）：
- PNG/JPG/WebP 互转
- 圆角 / 缩略图 / 压缩
- 水印 / 滤镜
- **本地程序化生成**（无需外部 API）

### 方案 A：用 DiceBear 风格（推荐）

DiceBear 提供 9+ 种程序化头像风格（avataaars / bottts / identicon / initials 等），所有风格都能 URL 生成。

**前端接入**（无需后端）：

```vue
<!-- AdminLayout.vue 顶栏头像替换为 -->
<div class="admin-layout__avatar">
  <img
    :src="`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`"
    :alt="username"
    width="32" height="32"
  />
</div>
```

**优点**：
- 零依赖（直接 URL）
- 9+ 风格可选
- 每个用户头像唯一（基于 username seed）

### 方案 B：用 image-forge-skill 本地生成（离线 / 内网场景）

```javascript
// scripts/generate-avatar.js （用 sharp 调用 image-forge-skill 规范）
import sharp from 'sharp';
import { createHash } from 'crypto';

const username = process.argv[2] || 'admin';
const hash = createHash('md5').update(username).digest('hex');
const hue = parseInt(hash.substring(0, 2), 16);
const bg = `hsl(${hue}, 70%, 50%)`;

// 生成 SVG → PNG
const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${bg}"/>
  <text x="50%" y="55%" text-anchor="middle"
        fill="#fff" font-size="80" font-family="sans-serif"
        font-weight="600">${username.charAt(0).toUpperCase()}</text>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(64, 64)
  .png()
  .toFile(`public/avatars/${username}.png`);

console.log(`✅ 头像生成: public/avatars/${username}.png`);
```

**执行**：
```bash
node scripts/generate-avatar.js admin
```

**前端引用**：
```vue
<img :src="`/avatars/${username}.png`" :alt="username" />
```

### 方案 C：用户上传（生产级）

走 `vue-upload-skill` 上传 → 后端存到 `wg_sys_user.avatar` 字段（数据库已有）。

**流程**：
1. 用户在"个人中心"上传头像
2. 前端用 `vue-upload-skill` 调 `POST /api/upload`
3. 后端用 `image-forge-skill` 的 sharp 压缩 + 转 WebP 存盘
4. URL 写回 `wg_sys_user.avatar`

## 3. 三种方案对比

| 维度 | 方案 A（DiceBear URL） | 方案 B（image-forge 本地） | 方案 C（用户上传） |
|------|-----------------------|---------------------------|-------------------|
| 个性化 | ✅ 9+ 风格 | ✅ 基于 hash 颜色 | ✅ 完全自定义 |
| 离线可用 | ❌ 需联网 | ✅ 完全本地 | ✅ 完全本地 |
| 部署复杂度 | 零 | 1 个脚本 | 完整上传链路 |
| vue-base-skill 合规 | ⚠️ 依赖第三方 URL | ✅ 零依赖 | ✅ 走 vue-upload-skill |
| 推荐场景 | Demo / 内部工具 | 内网 / 离线环境 | 生产级 |

## 4. 推荐路线

```
Phase 1（当前）：纯文字首字母头像  ← AdminLayout.vue 已实现
Phase 2（如需个性化）：方案 B（image-forge-skill 本地生成）
Phase 3（生产级）：方案 C（vue-upload-skill + image-forge-skill 压缩）
```

## 5. 与现有 vue-upload-skill 的关系

`vue-upload-skill`（vibeCoding/frontend/vue/vue-base-skill/vue-upload-skill/）负责**前端上传组件**，但**不处理图片压缩**。压缩/转 WebP 仍需 `image-forge-skill`（sharp）在后端完成——这是 vue-base-skill 的设计分工。

## 6. 故障排查

**Q1：头像加载慢？**
- DiceBear 首次访问需联网；本地缓存到 `index.html` 加 `<link rel="preconnect">`
- 或切换到方案 B 完全本地

**Q2：中文用户名首字母乱码？**
- `username.charAt(0)` 取的是首字符，中文会显示汉字（如"张三"显示"张"）
- 解决：用 `username.slice(0, 1)` 或基于 hash 取英文字母

**Q3：想让头像有 hover 效果？**
- 加 CSS `:hover { transform: scale(1.1); }` + `transition: transform 0.2s`