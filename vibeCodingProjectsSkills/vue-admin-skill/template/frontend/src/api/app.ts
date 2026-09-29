/**
 * 多账户体系：第三方应用（接入方）管理接口
 *
 * 路径与后端 universal-login-api 严格对齐：
 *   AppController → /api/apps/**
 *   AppKeyController → /api/apps/{id}/keys/**
 *
 * ★ `AppVO.apiSecret` 永远不存在（密钥只返回一次）；
 *   详情/列表拿不到密钥，只能看到 keyName + apiKey + status + lastUsedAt。
 */
import request from '@/utils/request'
import type { PageQuery, PageResponse } from '@/types/api'

export interface AppVO {
  id: number
  appName: string
  appKey: string
  description?: string
  logo?: string
  callbackUrl?: string
  status: 0 | 1
  ownerId: number
  ownerName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAppRequest {
  appName: string
  appKey?: string                  // 不填则后端自动生成
  description?: string
  logo?: string
  callbackUrl?: string
}

export interface UpdateAppRequest {
  appName?: string
  description?: string
  logo?: string
  callbackUrl?: string
  status?: 0 | 1
}

export interface AppKeyVO {
  id: number
  appId: number
  keyName?: string
  apiKey: string
  /** ★ 永远不出现在列表/详情；只有创建响应 CreatedAppKeyVO 才会有 */
  apiSecret?: never
  status: 0 | 1
  lastUsedAt?: string
  createdAt: string
}

export interface CreatedAppKeyVO extends AppKeyVO {
  apiSecret: string                // ★ 仅创建响应
}

export interface CreateAppKeyRequest {
  keyName?: string
}

export interface AppQuery extends PageQuery {
  appName?: string
  status?: 0 | 1
}

const BASE = '/api/apps'

export function pageApps(query: AppQuery): Promise<PageResponse<AppVO>> {
  return request.get<PageResponse<AppVO>>(BASE, { params: query })
}

export function getApp(id: number): Promise<AppVO> {
  return request.get<AppVO>(`${BASE}/${id}`)
}

export function createApp(payload: CreateAppRequest): Promise<AppVO> {
  return request.post<AppVO>(BASE, payload)
}

export function updateApp(id: number, payload: UpdateAppRequest): Promise<AppVO> {
  return request.put<AppVO>(`${BASE}/${id}`, payload)
}

export function deleteApp(id: number): Promise<void> {
  return request.delete<void>(`${BASE}/${id}`)
}

/** 应用密钥管理 */
export function pageAppKeys(appId: number, query: PageQuery): Promise<PageResponse<AppKeyVO>> {
  return request.get<PageResponse<AppKeyVO>>(`${BASE}/${appId}/keys`, { params: query })
}

export function createAppKey(appId: number, payload: CreateAppKeyRequest): Promise<CreatedAppKeyVO> {
  return request.post<CreatedAppKeyVO>(`${BASE}/${appId}/keys`, payload)
}

export function disableAppKey(appId: number, keyId: number): Promise<void> {
  return request.delete<void>(`${BASE}/${appId}/keys/${keyId}`)
}