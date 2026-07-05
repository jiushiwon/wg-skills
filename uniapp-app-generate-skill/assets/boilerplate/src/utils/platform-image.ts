import { isH5, isMpWeixin } from './platform';

/**
 * 选择图片（相册/相机）
 */
export function chooseImage(count = 1): Promise<string[]> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => resolve(res.tempFilePaths),
      fail: reject,
    });
  });
}

/**
 * 平台化图片 URL 处理
 * - H5：可直接使用远程 URL
 * - 微信小程序/APP：建议下载到本地临时路径后使用
 */
export async function resolveImageUrl(url: string): Promise<string> {
  if (isH5()) {
    return url;
  }

  if (isMpWeixin()) {
    // 小程序可直接使用 HTTPS 图片 URL，但如需本地处理则下载
    return url;
  }

  return url;
}

/**
 * 下载远程图片到本地临时路径
 */
export function downloadImage(url: string): Promise<string> {
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
      fail: reject,
    });
  });
}
