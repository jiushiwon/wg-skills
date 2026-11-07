// 项目环境变量统一入口
export const PROJECT_NAME = import.meta.env.VITE_PROJECT_NAME || 'uniapp-app';
export const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';

if (import.meta.env.DEV && !PEXELS_API_KEY) {
  console.warn('[env] PEXELS_API_KEY is not configured');
}
