/**
 * 统一请求封装 —— 基于 axios
 *
 * 设计要点：
 * 1. 自动注入 Bearer Token
 * 2. 响应拦截器处理信封：code === 0 时返回 data，401 时跳登录
 * 3. 提供 get/post/put/del 四个快捷方法
 */
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './auth';
import { ErrorCode } from './error';
import router from '@/router';

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === ErrorCode.SUCCESS) return data.data;
      // -1002 = 未登录 / token 失效（信封里是负数业务码，不是 HTTP 401）
      if (data.code === ErrorCode.UNAUTHORIZED) {
        removeToken();
        router.push('/login');
        return Promise.reject(new Error(data.message || '登录已失效，请重新登录'));
      }
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return instance.get(url, { params });
}

export function post<T>(url: string, data?: unknown): Promise<T> {
  return instance.post(url, data);
}

export function put<T>(url: string, data?: unknown): Promise<T> {
  return instance.put(url, data);
}

export function del<T>(url: string): Promise<T> {
  return instance.delete(url);
}

export type RequestOptions = AxiosRequestConfig;
export default instance;
