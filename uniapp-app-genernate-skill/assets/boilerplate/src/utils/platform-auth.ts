import { isApp, isH5, isMpWeixin } from './platform';

export interface AuthResult {
  token: string;
  openid?: string;
  nickname?: string;
  avatar?: string;
}

/**
 * 平台化登录
 * - 微信小程序：uni.login 获取 code，再发给后端换 token
 * - H5/App：当前仅返回 null，需按实际业务接入 OAuth/账号密码/原生 SDK
 */
export async function platformLogin(): Promise<AuthResult | null> {
  if (isMpWeixin()) {
    return new Promise<AuthResult | null>((resolve) => {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          if (res.code) {
            // 实际项目中发送到后端换取 token
            resolve({ token: res.code, openid: '' });
          } else {
            resolve(null);
          }
        },
        fail: () => resolve(null),
      });
    });
  }

  if (isH5()) {
    uni.showToast({ title: 'H5 请使用账号或第三方登录', icon: 'none' });
    return null;
  }

  if (isApp()) {
    uni.showToast({ title: 'App 请集成原生登录 SDK', icon: 'none' });
    return null;
  }

  return null;
}

/**
 * 获取用户信息
 * 微信小程序需使用 button open-type="chooseAvatar"
 * H5/App 当前未实现，按业务需要接入
 */
export async function getUserProfile(): Promise<{ nickname: string; avatar: string } | null> {
  // TODO: 按平台实现用户信息获取
  return null;
}
