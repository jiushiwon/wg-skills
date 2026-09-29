/**
 * 多账户体系：宿主账户 ↔ 应用绑定
 *
 * 路径与后端 universal-login-api 对齐：
 *   BindController（宿主登录态）→ /api/bind/**
 *
 * ★ 绑定身份只来自登录态，confirm 接口只接收 `{ code }` 一个字段
 *   —— 旧版的 mainUsername/mainPassword 是越权漏洞，已删除。
 *
 * ★ 换用户信息走开放接口 /api/open/userinfo，不在本文件。
 */
import request from '@/utils/request'
import type { PageQuery, PageResponse } from '@/types/api'

export interface BindVO {
  id: number
  sysUserId: number
  appId: number
  appName?: string
  appKey?: string
  appLogo?: string
  appUserId?: string
  appUserName?: string
  bindType: 'app_initiated' | 'user_initiated'
  isDefault: 0 | 1
  bindAt: string
  createdAt: string
}

export interface BindCodeVO {
  code: string
  /** 二维码内容（前端可直接生成 QR） */
  qrContent: string
  expireAt: string
  direction: 'app_initiated' | 'user_initiated'
}

export interface CreateBindCodeRequest {
  appId: number
  /** 默认为宿主发起（user_initiated） */
  direction?: 'app_initiated' | 'user_initiated'
}

export interface BindConfirmRequest {
  /** ★ 唯一字段。身份取自登录态 */
  code: string
}

const BASE = '/api/bind'

export function listMyBindings(query: PageQuery): Promise<PageResponse<BindVO>> {
  return request.get<PageResponse<BindVO>>(BASE, { params: query })
}

/** 宿主生成绑定码（供第三方应用扫码认领） */
export function createBindCode(payload: CreateBindCodeRequest): Promise<BindCodeVO> {
  return request.post<BindCodeVO>(`${BASE}/code`, payload)
}

/** 宿主确认绑定（消费应用发起的绑定码） */
export function confirmBind(payload: BindConfirmRequest): Promise<BindVO> {
  return request.post<BindVO>(`${BASE}/confirm`, payload)
}

export function unbind(id: number): Promise<void> {
  return request.delete<void>(`${BASE}/${id}`)
}

export function setDefault(id: number): Promise<void> {
  return request.put<void>(`${BASE}/${id}/default`)
}