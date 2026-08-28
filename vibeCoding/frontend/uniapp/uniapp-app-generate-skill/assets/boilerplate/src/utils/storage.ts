const PREFIX = 'uniapp_';

export const storage = {
  get<T>(key: string): T | null {
    try {
      return uni.getStorageSync(`${PREFIX}${key}`) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      uni.setStorageSync(`${PREFIX}${key}`, value);
    } catch (e) {
      console.error('[storage] set failed:', e);
    }
  },

  remove(key: string): void {
    try {
      uni.removeStorageSync(`${PREFIX}${key}`);
    } catch (e) {
      console.error('[storage] remove failed:', e);
    }
  },

  /**
   * 清空所有带 `uniapp_` 前缀的缓存
   */
  clear(): void {
    try {
      const keys = uni.getStorageInfoSync().keys || [];
      keys.forEach((key) => {
        if (key.startsWith(PREFIX)) {
          uni.removeStorageSync(key);
        }
      });
    } catch (e) {
      console.error('[storage] clear failed:', e);
    }
  },
};
