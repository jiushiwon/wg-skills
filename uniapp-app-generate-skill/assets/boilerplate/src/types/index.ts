export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}
