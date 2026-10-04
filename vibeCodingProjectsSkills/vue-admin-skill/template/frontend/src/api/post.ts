/**
 * 岗位管理接口
 *
 * 路径与后端 PostController 严格对齐：/api/posts
 *
 * ★ 后端 PostController.list() 返回 ApiResponse<List<PostVO>>（裸数组，非分页对象），
 *   故 listPosts() 返回 PostVO[]，调用方直接 `rows.value = res`，勿取 res.list。
 */
import { get, post, put, del } from '@/utils/request'

export interface PostVO {
  id: number
  name: string
  code: string
  tenantId?: number
  sortOrder?: number
  status?: number
  createdAt?: string
}

export interface CreatePostRequest {
  name: string
  code: string
  sortOrder?: number
  status?: number
  tenantId?: number
}

const BASE = '/api/posts'

export function listPosts(): Promise<PostVO[]> {
  return get<PostVO[]>(BASE)
}

export function createPost(payload: CreatePostRequest): Promise<PostVO> {
  return post<PostVO>(BASE, payload)
}

export function updatePost(id: number, payload: CreatePostRequest): Promise<PostVO> {
  return put<PostVO>(`${BASE}/${id}`, payload)
}

export function deletePost(id: number): Promise<void> {
  return del<void>(`${BASE}/${id}`)
}
