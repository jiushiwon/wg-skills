/**
 * account-bridge.mjs —— 服务端桥接客户端（Node / 任意语言参考实现）
 *
 * 用途：非 Java 项目（Node / Python / Go）接入账户体系时的参考实现。
 *       只依赖 Web 标准 fetch，Node 18+ 可直接运行。
 *
 * 两种身份（对齐 universal-login-api 2026-09-28 版设计）：
 *   - 应用身份：api_key + api_secret → 对 /api/open/** 做 HmacSHA256 签名（server-to-server）
 *   - 用户身份：宿主 accessToken → 调 /api/apps/**、/api/bind/**（必须由真人登录换取）
 *
 * 红线（见 references/ai-bridge.md）：
 *   1. 本文件不得出现在前端构建产物里
 *   2. api_secret 不得硬编码、不得写日志、不得提交仓库
 *   3. 不得用它伪造用户身份（用户身份必须真人登录换 token）
 *
 * 环境变量：
 *   ACCOUNT_BASE_URL      账户体系地址，如 http://localhost:8080
 *   ACCOUNT_API_KEY       应用密钥的 api_key
 *   ACCOUNT_API_SECRET    应用密钥的 api_secret（创建密钥时返回的唯一一次）
 *   ACCOUNT_ACCESS_TOKEN  宿主 accessToken（可选，调用宿主侧接口时需要）
 */

import crypto from 'node:crypto'

const BASE_URL = (process.env.ACCOUNT_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const API_KEY = process.env.ACCOUNT_API_KEY || ''
const API_SECRET = process.env.ACCOUNT_API_SECRET || ''
const ACCESS_TOKEN = process.env.ACCOUNT_ACCESS_TOKEN || ''

/** 契约：响应信封 { code, message, data }；code === 0 才是成功 */
function unwrap(json) {
  if (!json || typeof json.code === 'undefined') {
    throw new Error(`响应不符合契约（缺少 code 字段）: ${JSON.stringify(json)?.slice(0, 200)}`)
  }
  if (json.code !== 0) {
    const err = new Error(json.message || `业务失败 code=${json.code}`)
    err.code = json.code
    throw err
  }
  return json.data
}

/**
 * 应用级签名头。
 * 签名串 = {apiKey}\n{timestamp}\n{nonce}\n{HTTP_METHOD}\n{requestPath}
 * 签名   = hex(HmacSHA256(api_secret, 签名串))，requestPath **不含 query string**。
 */
function signHeaders(method, path) {
  if (!API_KEY || !API_SECRET) {
    throw new Error('缺少 ACCOUNT_API_KEY / ACCOUNT_API_SECRET，无法以应用身份调用 /api/open/**')
  }
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomBytes(8).toString('hex')
  const payload = [API_KEY, timestamp, nonce, method.toUpperCase(), path].join('\n')
  const signature = crypto.createHmac('sha256', API_SECRET).update(payload).digest('hex')
  return {
    'X-App-Key': API_KEY,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': signature
  }
}

/**
 * @param {string} path   含 query 的路径
 * @param {object} opts
 * @param {'GET'|'POST'|'PUT'|'DELETE'} [opts.method]
 * @param {object} [opts.body]
 * @param {string} [opts.token]     显式传入宿主 token
 * @param {'app'|'user'} [opts.identity] app=签名（/api/open/**）；user=宿主 JWT
 */
async function request(path, { method = 'GET', body, token, identity = 'app' } = {}) {
  const headers = { 'Content-Type': 'application/json;charset=UTF-8' }

  if (identity === 'app') {
    Object.assign(headers, signHeaders(method, path.split('?')[0]))
  } else {
    const bearer = token || ACCESS_TOKEN
    if (!bearer) {
      throw new Error('该接口需要宿主登录态：请传入 token，或配置 ACCOUNT_ACCESS_TOKEN（必须由真人登录换取）')
    }
    headers['Authorization'] = `Bearer ${bearer}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`响应不是 JSON（HTTP ${res.status}）: ${text.slice(0, 200)}`)
  }

  // 契约：HTTP 401 或 code === -1002 都表示鉴权失效（未登录 / 签名无效 / 时间戳过期）
  if (res.status === 401 || json?.code === -1002) {
    const err = new Error(json?.message || '未登录 / 签名无效 / 时间戳过期')
    err.code = -1002
    throw err
  }
  return unwrap(json)
}

// ---------------------------------------------------------------- 用户身份（宿主侧）

/**
 * 用真人的用户名 / 密码换取 token。
 * 注意：username / password 必须来自真人输入，不得由调用方硬编码或由 AI 代填。
 */
export async function login(username, password) {
  const headers = { 'Content-Type': 'application/json;charset=UTF-8' }
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ username, password })
  })
  return unwrap(await res.json())
}

/** 取当前用户信息（含 roles / permissions） */
export async function me(token) {
  return request('/api/auth/me', { token, identity: 'user' })
}

/** 取当前用户菜单树（已按角色过滤） */
export async function menus(token) {
  return request('/api/auth/menus', { token, identity: 'user' })
}

// ---------------------------------------------------------------- 应用（宿主登录态）

export async function listApps(options = {}) {
  const page = options.page || 1
  const pageSize = options.pageSize || 10
  return request(`/api/apps?page=${page}&pageSize=${pageSize}`, { identity: 'user', token: options.token })
}

/** 创建应用。app_key / owner_id 由服务端生成与注入，请求体不接受。 */
export async function createApp({ appName, description, logo, callbackUrl } = {}) {
  return request('/api/apps', {
    method: 'POST',
    identity: 'user',
    body: { appName, description, logo, callbackUrl }
  })
}

export async function listKeys(appId) {
  return request(`/api/apps/${appId}/keys`, { identity: 'user' })
}

/** 创建密钥。返回的 apiSecret 只此一次 —— 立刻写入服务端环境变量，不要落日志。 */
export async function createKey(appId, keyName = '默认密钥') {
  return request(`/api/apps/${appId}/keys`, { method: 'POST', identity: 'user', body: { keyName } })
}

export async function deleteKey(appId, keyId) {
  return request(`/api/apps/${appId}/keys/${keyId}`, { method: 'DELETE', identity: 'user' })
}

// ---------------------------------------------------------------- 绑定（宿主登录态）

/** 我的绑定列表。主体取自登录态，不接受 userId 入参。 */
export async function listBindings() {
  return request('/api/bind/list', { identity: 'user' })
}

/** 宿主发起：生成绑定码，交给第三方应用认领（direction = user_initiated）。 */
export async function createBindCode(appId) {
  return request('/api/bind/code', { method: 'POST', identity: 'user', body: { appId } })
}

/** 宿主确认：用绑定码完成绑定（direction = app_initiated）。★ 只传 code，不收密码。 */
export async function confirmBind(code) {
  return request('/api/bind/confirm', { method: 'POST', identity: 'user', body: { code } })
}

/** 设为默认应用（只能设置自己的）。 */
export async function setDefaultBinding(id) {
  return request(`/api/bind/${id}/default`, { method: 'PUT', identity: 'user' })
}

/** 解绑（破坏性操作，调用前需二次确认） */
export async function cancelBind(id) {
  return request(`/api/bind/${id}`, { method: 'DELETE', identity: 'user' })
}

// ---------------------------------------------------------------- 开放接口（应用签名）

/** 应用发起绑定：为应用侧用户申请绑定码（direction = app_initiated） */
export async function applyBind({ appUserId, appUserName }) {
  return request('/api/open/bind/apply', {
    method: 'POST',
    identity: 'app',
    body: { appUserId, appUserName }
  })
}

/** 应用认领绑定码（扫码流程，direction = user_initiated） */
export async function claimBind({ code, appUserId, appUserName }) {
  return request('/api/open/bind/claim', {
    method: 'POST',
    identity: 'app',
    body: { code, appUserId, appUserName }
  })
}

/** 按应用侧用户 ID 换取宿主用户信息；未绑定时 bound === false */
export async function getUserInfo(appUserId) {
  return request(`/api/open/userinfo?appUserId=${encodeURIComponent(appUserId)}`, { identity: 'app' })
}

// ---------------------------------------------------------------- CLI 自检

/**
 * 用法：
 *   node account-bridge.mjs ping
 *   node account-bridge.mjs userinfo <appUserId>
 *   node account-bridge.mjs bindings
 */
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const cmd = process.argv[2] || 'ping'
  const run = async () => {
    switch (cmd) {
      case 'ping':
        console.log('health =', await request('/api/health', { identity: 'app' }))
        break
      case 'userinfo':
        console.log(JSON.stringify(await getUserInfo(process.argv[3] || ''), null, 2))
        break
      case 'bindings':
        console.table(await listBindings())
        break
      default:
        console.log('可用命令: ping | userinfo <appUserId> | bindings')
    }
  }
  run().catch((e) => {
    console.error(`[bridge] 失败 code=${e.code ?? '-'} message=${e.message}`)
    process.exitCode = 1
  })
}

export default {
  login, me, menus,
  listApps, createApp, listKeys, createKey, deleteKey,
  listBindings, createBindCode, confirmBind, setDefaultBinding, cancelBind,
  applyBind, claimBind, getUserInfo
}
