/**
 * 错误码映射 + 错误信息提取
 */

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return '请求失败';
}

/**
 * 业务错误码（与 springboot-auth-module-skill / api-contract-auth.md 一致）。
 *
 * ★ 信封里的 `code` 是**负数业务码**，不是 HTTP 状态码；
 *   HTTP 状态码只用于传输层（-1002 对应 HTTP 401、-1003 对应 HTTP 403）。
 */
export const ErrorCode = {
  SUCCESS: 0,
  /** 参数校验失败 / 用户名密码错 */
  BAD_REQUEST: -1001,
  /** 未登录 / token 失效 */
  UNAUTHORIZED: -1002,
  /** 无权限 */
  FORBIDDEN: -1003,
  /** 资源不存在 */
  NOT_FOUND: -1004,
  /** 资源冲突（数据已存在 / 存在依赖） */
  CONFLICT: -1005,
  /** 系统异常 */
  SERVER_ERROR: -2000
} as const;
