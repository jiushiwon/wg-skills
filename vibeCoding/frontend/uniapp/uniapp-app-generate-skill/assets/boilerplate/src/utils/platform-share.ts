import { isApp, isH5, isMpWeixin } from './platform';

export interface ShareOptions {
  title?: string;
  path?: string;
  imageUrl?: string;
  query?: string;
  url?: string;
}

/**
 * 平台化分享
 * - 微信小程序：在页面 onShareAppMessage 中返回配置（本函数仅打印日志）
 * - H5：优先调用 Web Share API，不支持则提示复制链接
 * - App：调用系统分享菜单（uni.shareWithSystem）
 */
export function platformShare(options: ShareOptions): void {
  if (isMpWeixin()) {
    // 微信小程序需在页面 onShareAppMessage 中返回配置
    console.log('[share] wechat', options);
    return;
  }

  // #ifdef H5
  if (isH5() && typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({
      title: options.title || '',
      url: options.url || window.location.href,
    }).catch(() => {
      // 用户取消或不支持
    });
    return;
  }
  uni.showToast({ title: '请手动复制链接分享', icon: 'none' });
  // #endif

  // #ifdef APP-PLUS
  if (isApp()) {
    uni.shareWithSystem({
      type: 'text',
      summary: options.title,
      href: options.url || options.path,
    });
  }
  // #endif
}
