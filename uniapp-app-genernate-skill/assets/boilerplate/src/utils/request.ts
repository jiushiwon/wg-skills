import { isH5 } from './platform';

/**
 * 三端 baseURL 策略：
 * - 微信小程序：必须是已配置的 request 合法域名
 * - H5：开发时通常需要代理或处理 CORS
 * - App：可访问任意 HTTPS 接口
 */
const BASE_URL = import.meta.env.VITE_BASE_URL || '';
const H5_BASE_URL = import.meta.env.VITE_H5_BASE_URL || BASE_URL;
const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL || BASE_URL;

function getBaseUrl(): string {
  // #ifdef H5
  return H5_BASE_URL;
  // #endif

  // #ifdef APP-PLUS
  return APP_BASE_URL;
  // #endif

  return BASE_URL;
}

function getToken(): string | null {
  try {
    return uni.getStorageSync('app_token') || null;
  } catch {
    return null;
  }
}

type RequestData = Record<string, unknown>;

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: RequestData;
  headers?: Record<string, string>;
  showError?: boolean;
  withToken?: boolean;
}

interface ApiErrorResponse {
  message?: string;
}

function request<T = unknown>(options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.withToken !== false) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${getBaseUrl()}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else if (res.statusCode === 401) {
          // 登录态失效，统一处理
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          reject(new Error('Unauthorized'));
        } else {
          const message = (res.data as ApiErrorResponse)?.message || `请求失败: ${res.statusCode}`;
          if (options.showError !== false) {
            uni.showToast({ title: message, icon: 'none' });
          }
          reject(new Error(message));
        }
      },
      fail: (err) => {
        const message = isH5()
          ? '网络异常，请检查跨域或代理配置'
          : '网络异常，请稍后重试';
        if (options.showError !== false) {
          uni.showToast({ title: message, icon: 'none' });
        }
        reject(new Error(JSON.stringify(err)));
      },
    });
  });
}

export const requestClient = {
  get: <T = unknown>(url: string, data?: RequestData, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'GET', data, ...options }),
  post: <T = unknown>(url: string, data?: RequestData, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'POST', data, ...options }),
  put: <T = unknown>(url: string, data?: RequestData, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PUT', data, ...options }),
  delete: <T = unknown>(url: string, data?: RequestData, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'DELETE', data, ...options }),
};

export { request };
