// API 通用类型

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface RequestError {
  code: number;
  message: string;
  status?: number;
}
