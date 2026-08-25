export type PlatformType = 'mp-weixin' | 'h5' | 'app' | 'mp-alipay' | 'mp-baidu' | 'mp-toutiao' | 'unknown';

/**
 * 获取当前运行平台
 */
export function getPlatform(): PlatformType {
  // #ifdef MP-WEIXIN
  return 'mp-weixin';
  // #endif

  // #ifdef H5
  return 'h5';
  // #endif

  // #ifdef APP-PLUS
  return 'app';
  // #endif

  // #ifdef MP-ALIPAY
  return 'mp-alipay';
  // #endif

  // #ifdef MP-BAIDU
  return 'mp-baidu';
  // #endif

  // #ifdef MP-TOUTIAO
  return 'mp-toutiao';
  // #endif

  return 'unknown';
}

/**
 * 当前是否为微信小程序
 */
export function isMpWeixin(): boolean {
  return getPlatform() === 'mp-weixin';
}

/**
 * 当前是否为 H5
 */
export function isH5(): boolean {
  return getPlatform() === 'h5';
}

/**
 * 当前是否为 App
 */
export function isApp(): boolean {
  return getPlatform() === 'app';
}

/**
 * 获取安全区信息
 */
export interface SafeAreaInfo {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export function getSafeArea(): SafeAreaInfo {
  const systemInfo = uni.getSystemInfoSync();
  return (
    systemInfo.safeArea || {
      top: systemInfo.statusBarHeight || 0,
      bottom: systemInfo.screenHeight || 0,
      left: 0,
      right: systemInfo.screenWidth || 0,
      width: systemInfo.screenWidth || 0,
      height: systemInfo.screenHeight || 0,
    }
  ) as SafeAreaInfo;
}

/**
 * 获取状态栏高度
 */
export function getStatusBarHeight(): number {
  return uni.getSystemInfoSync().statusBarHeight || 0;
}

/**
 * 获取底部安全区高度
 */
export function getSafeAreaBottom(): number {
  const systemInfo = uni.getSystemInfoSync();
  const safeArea = systemInfo.safeArea;
  if (safeArea) {
    return (systemInfo.screenHeight || 0) - safeArea.bottom;
  }
  return 0;
}
