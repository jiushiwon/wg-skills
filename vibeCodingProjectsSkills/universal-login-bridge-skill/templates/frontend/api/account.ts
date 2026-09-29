/**
 * 账户体系 API 模块（接入侧模板）
 *
 * 放在接入项目的 src/api/account.ts。
 * 铁律：本文件不含任何密码加密 / JWT 签发逻辑 —— 身份只有一份，在宿主 `{prefix}_sys_user`。
 *
 * 已对齐 universal-login-api 2026-09-28 版设计：
 *   - 接口路径统一 `/api` 前缀，因此本文件里的路径不带 `/api`（请求层 baseURL 已含）
 *   - 应用级密钥 = `api_key` + `api_secret`；`apiSecret` **只在创建密钥的响应里出现一次**
 *   - 绑定码方向 `bindType` = `app_initiated` / `user_initiated`
 *
 * 依赖：接入项目自己的请求层（如 @/utils/request），需遵守 frontend-request-skill 契约：
 *   - 响应信封 { code, message, data }
 *   - Authorization: Bearer <accessToken>
 *   - 鉴权失效 = HTTP 401 或 code === -1002
 */

import { get, post, put, del } from '@/utils/request'

/** 应用（一个接入的业务系统）。★ 不含任何 secret 字段 */
export interface AppVO {
  id: number
  appName: string
  appKey: string
  description?: string | null
  logo?: string | null
  callbackUrl?: string | null
  status: number
  createdAt?: string
}

/** 应用密钥出参。★ 没有 apiSecret —— 列表 / 详情永远拿不到密钥 */
export interface AppKeyVO {
  id: number
  keyName?: string | null
  apiKey: string
  status: number
  lastUsedAt?: string | null
  createdAt?: string
}

/** 创建密钥的响应。★ 唯一带 apiSecret 的类型，只此一次 */
export interface CreatedAppKeyVO {
  id: number
  keyName?: string | null
  apiKey: string
  apiSecret: string
  status: number
  createdAt?: string
}

/** 绑定方式 / 绑定码方向 */
export type BindType = 'app_initiated' | 'user_initiated'

/** 绑定（宿主账户 ↔ 应用账号 的映射） */
export interface BindVO {
  id: number
  appId: number
  appKey: string
  appName: string
  logo?: string | null
  appUserId: string
  appUserName?: string | null
  bindType: BindType
  isDefault: boolean
  bindAt: string
}

/** 绑定码响应（一次性，默认 5 分钟有效） */
export interface BindCodeVO {
  code: string
  direction: BindType
  expireSeconds: number
}

/**
 * 开放接口：宿主用户信息（应用侧换取）。
 * 未绑定时 `bound === false`，且不含任何宿主用户字段。
 *
 * 注意：该接口走 `/api/open/userinfo`，需要应用级 HmacSHA256 签名，
 * 由**应用侧服务端**调用，不在前端使用；此类型仅作与后端 DTO 的对齐声明。
 */
export interface OpenUserInfoVO {
  bound: boolean
  bindingId?: number | null
  userId?: number | null
  username?: string | null
  nickname?: string | null
  avatar?: string | null
  email?: string | null
  phone?: string | null
  appUserId: string
}

/** 分页信封 */
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ---------------------------------------------------------------- 应用

export function listApps(params?: { page?: number; pageSize?: number }): Promise<PageResponse<AppVO>> {
  return get('/apps', params)
}

export function getApp(id: number): Promise<AppVO> {
  return get(`/apps/${id}`)
}

/** 创建应用。★ 不接受 appKey / ownerId —— 均由服务端生成与注入 */
export function createApp(data: {
  appName: string
  description?: string
  logo?: string
  callbackUrl?: string
}): Promise<AppVO> {
  return post('/apps', data)
}

export function updateApp(
  id: number,
  data: { appName?: string; description?: string; logo?: string; callbackUrl?: string; status?: number }
): Promise<AppVO> {
  // 注意：appKey 不可改
  return put(`/apps/${id}`, data)
}

export function deleteApp(id: number): Promise<void> {
  return del(`/apps/${id}`)
}

// ---------------------------------------------------------------- API 密钥

export function listKeys(appId: number): Promise<AppKeyVO[]> {
  return get(`/apps/${appId}/keys`)
}

/**
 * 创建密钥。
 * 返回的 apiSecret 只此一次，服务端不再可取 —— 接入方必须写进服务端环境变量，
 * 绝不能落到前端代码 / git 仓库 / 日志。
 */
export function createKey(appId: number, keyName = '默认密钥'): Promise<CreatedAppKeyVO> {
  return post(`/apps/${appId}/keys`, { keyName })
}

export function deleteKey(appId: number, keyId: number): Promise<void> {
  return del(`/apps/${appId}/keys/${keyId}`)
}

// ---------------------------------------------------------------- 绑定（宿主侧）

/** 我的绑定列表。主体取自登录态，不接受 userId 入参。 */
export function listBindings(): Promise<BindVO[]> {
  return get('/bind/list')
}

/** 宿主发起：生成绑定码，交给第三方应用认领（direction = user_initiated） */
export function createBindCode(appId: number): Promise<BindCodeVO> {
  return post('/bind/code', { appId })
}

/**
 * 宿主确认：用绑定码完成绑定（direction = app_initiated）。
 * ★ 只传 code 一个字段 —— 被绑定身份取自登录态，不收也不传任何密码。
 */
export function confirmBind(data: { code: string }): Promise<BindVO> {
  return post('/bind/confirm', data)
}

export function setDefaultBinding(id: number): Promise<void> {
  return put(`/bind/${id}/default`)
}

export function cancelBind(id: number): Promise<void> {
  return del(`/bind/${id}`)
}
