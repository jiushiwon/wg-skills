/**
 * 全局 API 类型声明（无 import / export，纯全局声明，业务侧免导入直接使用）。
 *
 * 注意：本文件一旦出现 `export` 就变成模块，里面的类型将不再全局可用，
 * 而 api/*.ts 是直接以 `PageResponse<T>` 引用的，所以此处**不能**写 export。
 */

/** 通用 API 响应信封（与 springboot-init-skill / api-contract-auth.md 一致） */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应。
 *
 * ★ 字段名是 `list`（不是 `items` / `records`），`page` 从 1 开始。
 * 与后端 `PageResponse`、`api-contract-auth.md` §通用约定 一致。
 */
interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 分页查询入参（各模块 Query 的公共部分） */
interface PageQuery {
  page?: number;
  pageSize?: number;
}
