/**
 * Pexels 图片搜索工具（可选）
 *
 * 如果你的项目不需要从 Pexels 获取真实照片，可以直接删除本文件。
 * 需要使用时，在 .env 中配置 VITE_PEXELS_API_KEY。
 */

import { PEXELS_API_KEY } from '@/constants/env';

const PEXELS_API_BASE = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
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

export interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
}

/**
 * 从 Pexels 搜索图片
 * @param query 搜索关键词
 * @param perPage 返回数量
 */
export async function searchPexelsPhotos(
  query: string,
  perPage = 10,
): Promise<PexelsPhoto[]> {
  if (!PEXELS_API_KEY) {
    if (import.meta.env.DEV) {
      console.warn('[pexels] PEXELS_API_KEY is empty, skip search');
    }
    return [];
  }

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
 */
export function getPexelsImageUrl(
  photo: PexelsPhoto,
  size: 'small' | 'medium' | 'large' | 'original' = 'medium',
): string {
  return photo.src[size];
}

/**
 * 下载 Pexels 图片到本地临时路径
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
