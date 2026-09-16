# Pexels 图片资源集成

> 本参考文档定义 `uniapp-app-generate-skill` 如何从 Pexels 获取真实照片作为小程序静态图片资源，并禁止用 CSS 渐变或纯色块充当图片。

## 核心规则

1. **禁止用渐变色/色块替代图片**：Banner、空状态、头像占位、装饰图等必须使用真实照片或真实插画。
2. **首选 Pexels**：需要真实照片时，优先从 [Pexels](https://www.pexels.com) 搜索并下载。
3. **API Key 管理**：Pexels API Key 写入 `.env`，项目代码从环境变量读取，禁止硬编码在源码中。
4. **合规使用**：下载的图片仅用于演示/开发，上线前需确认授权范围；Pexels 图片可免费使用，但仍建议查看具体授权说明。

## 获取 Pexels API Key

1. 访问 [Pexels 开发者页面](https://www.pexels.com/api/)。
2. 注册/登录后创建 API Key。
3. 复制 Key，准备写入 `.env`。

## 项目级配置

### 1. 创建 .env 文件

在小程序项目根目录创建 `.env`：

```bash
PEXELS_API_KEY=your_pexels_api_key_here
```

如果项目需要提交到版本库，应创建 `.env.example` 并忽略真实 `.env`：

```bash
# .env.example
PEXELS_API_KEY=your_pexels_api_key_here
```

```gitignore
# .gitignore
.env
```

### 2. 创建 src/utils/pexels.ts

```typescript
// src/utils/pexels.ts
import { PEXELS_API_KEY } from '@/constants/env';

const PEXELS_API_BASE = 'https://api.pexels.com/v1';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
}

/**
 * 从 Pexels 搜索图片
 * @param query 搜索关键词，如 "water drinking", "fitness", "healthy food"
 * @param perPage 返回数量，默认 10
 */
export async function searchPexelsPhotos(
  query: string,
  perPage = 10,
): Promise<PexelsPhoto[]> {
  const url = `${PEXELS_API_BASE}/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'GET',
      header: {
        Authorization: PEXELS_API_KEY,
      },
      success: (res) => {
        const data = res.data as PexelsSearchResponse;
        if (res.statusCode === 200 && Array.isArray(data.photos)) {
          resolve(data.photos);
        } else {
          reject(new Error(`Pexels search failed: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`Pexels request failed: ${JSON.stringify(err)}`));
      },
    });
  });
}

/**
 * 选择最合适的图片尺寸
 * @param photo Pexels 图片对象
 * @param size 期望尺寸类型
 */
export function getPexelsImageUrl(
  photo: PexelsPhoto,
  size: 'small' | 'medium' | 'large' | 'original' = 'medium',
): string {
  return photo.src[size];
}

/**
 * 下载 Pexels 图片到本地临时路径
 * @param url 图片 URL
 */
export function downloadPexelsImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200 && res.tempFilePath) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error(`Download failed: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`Download failed: ${JSON.stringify(err)}`));
      },
    });
  });
}
```

### 3. 创建 src/constants/env.ts

```typescript
// src/constants/env.ts
/**
 * 项目环境变量统一入口
 * uni-app 在编译时会读取 .env 文件（需配置 vite-plugin-uni 或自定义脚本）
 * 运行时可通过 import.meta.env 读取
 */
export const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';

if (!PEXELS_API_KEY) {
  console.warn('[env] PEXELS_API_KEY is not configured');
}
```

### 4. Vite 配置读取 .env

在 `vite.config.ts` 中确保环境变量以 `VITE_` 前缀暴露：

```typescript
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  define: {
    'import.meta.env.VITE_PEXELS_API_KEY': JSON.stringify(process.env.PEXELS_API_KEY || ''),
  },
});
```

## 使用示例

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { searchPexelsPhotos, getPexelsImageUrl } from '@/utils/pexels';

const bannerUrl = ref('');

onMounted(async () => {
  try {
    const photos = await searchPexelsPhotos('healthy lifestyle', 5);
    if (photos.length > 0) {
      bannerUrl.value = getPexelsImageUrl(photos[0], 'large');
    }
  } catch (err) {
    console.error('Failed to load banner:', err);
  }
});
</script>

<template>
  <image v-if="bannerUrl" :src="bannerUrl" mode="aspectFill" class="banner" />
</template>
```

## 推荐搜索词

| 场景 | 搜索词 |
|------|--------|
| 健康打卡 | healthy lifestyle, fitness, exercise |
| 饮水提醒 | water glass, hydration, drinking water |
| 饮食记录 | healthy food, meal prep, salad |
| 空状态 | empty, minimal, calm |
| 个人中心头像占位 | portrait, person avatar, profile |

## 禁止事项

- 禁止用 `linear-gradient` 或纯色背景充当 Banner/空状态图。
- 禁止把 Pexels API Key 硬编码在 `pexels.ts` 或任何 `.vue` 文件中。
- 禁止在 `.env` 缺失时静默失败，必须给出明确警告或降级方案。
- 禁止下载过大图片，单张建议 ≤ 200KB，用于小程序时需进一步压缩。

## 离线/无 Key 时的降级方案

如果用户暂时没有 Pexels API Key：

1. 在 `.env.example` 中保留占位符。
2. 在 `src/static/images/` 中放置一张默认占位图。
3. 当 `PEXELS_API_KEY` 为空时，组件显示默认占位图，而不是报错或显示色块。
