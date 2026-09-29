/** 后端统一响应信封 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页响应 */
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 请求错误 */
export interface RequestError {
  code: number;
  message: string;
  data?: unknown;
}
