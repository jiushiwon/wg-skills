#!/usr/bin/env node
/**
 * account-hub MCP server —— 把账户体系暴露成 AI 可调用的工具
 *
 * 作用：让 AI（Claude / Codex / 任意支持 MCP 的 Agent）能**直接操作**账户体系，
 *       而不是"教用户怎么操作"。
 *
 * 身份（对齐 universal-login-api 2026-09-28 版设计）：
 *   - 应用身份：api_key + api_secret，对 /api/open/** 做 HmacSHA256 签名
 *   - 用户身份：宿主 accessToken，调 /api/apps/** 与 /api/bind/**（必须由真人登录换取）
 *
 * 红线：见 ../references/ai-bridge.md —— 本 server 不提供"伪造用户 token"的工具。
 *
 * ── 安装 ────────────────────────────────────────────────────────────
 *   cd templates/ai
 *   npm i @modelcontextprotocol/sdk
 *
 * ── 配置（写入你的 MCP 配置） ──────────────────────────────────────
 *   {
 *     "mcpServers": {
 *       "account-hub": {
 *         "command": "node",
 *         "args": ["<abs-path>/templates/ai/mcp-server.mjs"],
 *         "env": {
 *           "ACCOUNT_BASE_URL": "http://localhost:8080",
 *           "ACCOUNT_API_KEY": "<应用密钥的 api_key>",
 *           "ACCOUNT_API_SECRET": "<api_secret，仅创建密钥时返回一次>",
 *           "ACCOUNT_ACCESS_TOKEN": "<可选：真人登录换来的宿主 accessToken>"
 *         }
 *       }
 *     }
 *   }
 *
 * ── 自检（不依赖 MCP 客户端） ─────────────────────────────────────
 *   node mcp-server.mjs --selfcheck
 */

import crypto from 'node:crypto'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const BASE_URL = (process.env.ACCOUNT_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const API_KEY = process.env.ACCOUNT_API_KEY || ''
const API_SECRET = process.env.ACCOUNT_API_SECRET || ''
const ACCESS_TOKEN = process.env.ACCOUNT_ACCESS_TOKEN || ''

const LIST_LIMIT = 50 // 读工具返回条数上限，避免把整表塞进上下文

// ------------------------------------------------------------------ 传输层

/**
 * 应用级签名头。
 * 签名串 = {apiKey}\n{timestamp}\n{nonce}\n{METHOD}\n{path}
 * 签名   = hex(HmacSHA256(api_secret, 签名串))，path **不含 query string**。
 */
function signHeaders(method, path) {
  if (!API_KEY || !API_SECRET) {
    throw new Error('未配置 ACCOUNT_API_KEY / ACCOUNT_API_SECRET，无法以应用身份调用 /api/open/**')
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

function unwrap(json) {
  if (!json || typeof json.code === 'undefined') {
    throw new Error(`响应不符合契约（缺少 code）: ${JSON.stringify(json)?.slice(0, 200)}`)
  }
  if (json.code !== 0) {
    const err = new Error(json.message || `业务失败 code=${json.code}`)
    err.code = json.code
    throw err
  }
  return json.data
}

/**
 * 调账户体系。
 * @param {string} path       含 query 的完整路径
 * @param {object} opts
 * @param {'GET'|'POST'} [opts.method]
 * @param {object} [opts.body]
 * @param {'app'|'user'} [opts.identity] app=HmacSHA256 签名（/api/open/**）；user=宿主 JWT
 */
async function call(path, { method = 'GET', body, identity = 'app' } = {}) {
  const headers = { 'Content-Type': 'application/json;charset=UTF-8' }
  if (identity === 'app') {
    Object.assign(headers, signHeaders(method, path.split('?')[0]))
  } else {
    if (!ACCESS_TOKEN) {
      throw new Error('该工具需要宿主登录态，请配置 ACCOUNT_ACCESS_TOKEN（必须由真人登录换取）')
    }
    headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`
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
  if (res.status === 401 || json?.code === -1002) {
    const err = new Error(json?.message || '未登录 / 签名无效 / 时间戳过期')
    err.code = -1002
    throw err
  }
  return unwrap(json)
}

const ok = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] })
const fail = (e) => ({
  isError: true,
  content: [{ type: 'text', text: `调用失败：code=${e.code ?? '-'} message=${e.message}` }]
})

// ------------------------------------------------------------------ 工具定义

const TOOLS = [
  {
    name: 'account_open_apply_bind',
    description:
      '【应用身份/签名】为第三方应用里的某个用户申请一个绑定码（应用发起 → 宿主确认）。返回 code / direction=app_initiated / expireSeconds（默认 300 秒，一次性）。拿到后需由真人在宿主侧登录并确认。',
    inputSchema: {
      type: 'object',
      properties: {
        appUserId: { type: 'string', description: '第三方系统里的用户 ID，原样填写' },
        appUserName: { type: 'string', description: '第三方系统里的用户名（可选，仅展示）' }
      },
      required: ['appUserId'],
      additionalProperties: false
    }
  },
  {
    name: 'account_open_claim_bind',
    description:
      '【应用身份/签名】认领宿主用户生成的绑定码（宿主发起 → 应用认领）。code 来自宿主用户在「我的绑定」里生成的绑定码；direction 必须是 user_initiated。成功返回绑定对象。',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: '宿主生成的绑定码' },
        appUserId: { type: 'string', description: '第三方系统里的用户 ID，原样填写' },
        appUserName: { type: 'string', description: '第三方系统里的用户名（可选）' }
      },
      required: ['code', 'appUserId'],
      additionalProperties: false
    }
  },
  {
    name: 'account_open_userinfo',
    description:
      '【应用身份/签名】按第三方用户 ID 换取宿主用户信息。未绑定时返回 bound=false 且不含任何宿主用户字段；已绑定返回 bound=true + userId/username/nickname 等。',
    inputSchema: {
      type: 'object',
      properties: {
        appUserId: { type: 'string', description: '第三方系统里的用户 ID' }
      },
      required: ['appUserId'],
      additionalProperties: false
    }
  },
  {
    name: 'account_list_apps',
    description:
      '【宿主登录态】列出当前登录用户拥有的应用。返回 id / appName / appKey / status / callbackUrl。写操作前先用它确认应用是否已注册。',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: '页码，默认 1' },
        pageSize: { type: 'number', description: '每页条数，默认 10，最大 100' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'account_list_bindings',
    description:
      '【宿主登录态】列出当前登录用户的账户绑定关系。返回 id / appId / appKey / appName / appUserId / appUserName / bindType / isDefault / bindAt。仅返回自己的绑定。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'account_create_app',
    description:
      '【宿主登录态】注册一个新应用（新项目接入第一步）。★ app_key 由服务端生成，本工具不接受 appKey / ownerId 入参。',
    inputSchema: {
      type: 'object',
      properties: {
        appName: { type: 'string', description: '应用名称，如 我的博客' },
        description: { type: 'string', description: '应用描述（可选）' },
        logo: { type: 'string', description: 'Logo 地址（可选）' },
        callbackUrl: { type: 'string', description: '回调地址（可选）' }
      },
      required: ['appName'],
      additionalProperties: false
    }
  },
  {
    name: 'account_create_key',
    description:
      '【宿主登录态】为指定应用创建一把 API 密钥。返回的 apiSecret 只此一次可取——拿到后必须立刻写入服务端环境变量，绝不能落到前端代码 / 日志 / 仓库。',
    inputSchema: {
      type: 'object',
      properties: {
        appId: { type: 'number', description: '应用 ID（来自 account_list_apps）' },
        keyName: { type: 'string', description: '密钥名称，默认「默认密钥」' }
      },
      required: ['appId'],
      additionalProperties: false
    }
  },
  {
    name: 'account_confirm_bind',
    description:
      '【宿主登录态】用绑定码确认绑定（应用发起 → 宿主确认）。★ 只接受 code 一个字段：被绑定身份取自当前登录态，不接受也不需要任何主账户密码。',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: '应用侧申请的绑定码（direction=app_initiated）' }
      },
      required: ['code'],
      additionalProperties: false
    }
  }
]

// ------------------------------------------------------------------ 工具实现

async function handle(name, args = {}) {
  switch (name) {
    case 'account_open_apply_bind': {
      const code = await call('/api/open/bind/apply', {
        method: 'POST',
        identity: 'app',
        body: { appUserId: args.appUserId, appUserName: args.appUserName }
      })
      return ok({
        ...code,
        next: '请引导真人在宿主侧登录后调用 account_confirm_bind(code) 完成绑定'
      })
    }

    case 'account_open_claim_bind': {
      const binding = await call('/api/open/bind/claim', {
        method: 'POST',
        identity: 'app',
        body: { code: args.code, appUserId: args.appUserId, appUserName: args.appUserName }
      })
      return ok(binding)
    }

    case 'account_open_userinfo': {
      const info = await call(
        `/api/open/userinfo?appUserId=${encodeURIComponent(args.appUserId)}`,
        { identity: 'app' }
      )
      return ok(info)
    }

    case 'account_list_apps': {
      const page = args.page || 1
      const pageSize = Math.min(args.pageSize || 10, LIST_LIMIT)
      const data = await call(`/api/apps?page=${page}&pageSize=${pageSize}`, { identity: 'user' })
      const list = Array.isArray(data) ? data : data?.list || []
      return ok({ total: data?.total ?? list.length, page, pageSize, items: list })
    }

    case 'account_list_bindings': {
      const list = await call('/api/bind/list', { identity: 'user' })
      return ok({ total: list.length, limit: LIST_LIMIT, items: list.slice(0, LIST_LIMIT) })
    }

    case 'account_create_app': {
      const app = await call('/api/apps', {
        method: 'POST',
        identity: 'user',
        body: {
          appName: args.appName,
          description: args.description,
          logo: args.logo,
          callbackUrl: args.callbackUrl
        }
      })
      return ok({
        app,
        next: `下一步请调 account_create_key(appId=${app.id}) 发一把密钥，并把 apiSecret 写入服务端环境变量`
      })
    }

    case 'account_create_key': {
      const key = await call(`/api/apps/${args.appId}/keys`, {
        method: 'POST',
        identity: 'user',
        body: { keyName: args.keyName || '默认密钥' }
      })
      return ok({
        key,
        warning:
          'apiSecret 只此一次可取，列表 / 详情接口都不会再返回。请立刻写入服务端环境变量（如 ACCOUNT_API_SECRET），不要出现在前端代码 / 日志 / 仓库里。'
      })
    }

    case 'account_confirm_bind': {
      const binding = await call('/api/bind/confirm', {
        method: 'POST',
        identity: 'user',
        body: { code: args.code }
      })
      return ok(binding)
    }

    default:
      throw new Error(`未知工具: ${name}`)
  }
}

// ------------------------------------------------------------------ 启动

async function main() {
  const server = new Server(
    { name: 'account-hub', version: '2.0.0' },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params
    try {
      return await handle(name, args)
    } catch (e) {
      return fail(e)
    }
  })

  await server.connect(new StdioServerTransport())
  // 注意：stdout 是 MCP 协议通道，任何调试信息只能走 stderr
  console.error(
    `[account-hub] MCP server 已启动，baseUrl=${BASE_URL}，apiKey=${API_KEY || '(未配置)'}，` +
      `hostToken=${ACCESS_TOKEN ? '已配置' : '(未配置)'}`
  )
}

// 自检模式：直接跑一次读工具，验证连通性与凭证
if (process.argv.includes('--selfcheck')) {
  ;(async () => {
    console.error(`[selfcheck] baseUrl=${BASE_URL} apiKey=${API_KEY || '(未配置)'}`)
    try {
      console.error('[selfcheck] health =', JSON.stringify(await call('/api/health', { identity: 'app' })))
    } catch (e) {
      console.error(`[selfcheck] health 失败: ${e.message}`)
    }
    try {
      const apps = await call('/api/apps', { identity: 'user' })
      const list = Array.isArray(apps) ? apps : apps?.list || []
      console.error(`[selfcheck] apps = ${list.length} 个`)
    } catch (e) {
      console.error(`[selfcheck] apps 失败: code=${e.code ?? '-'} ${e.message}`)
      process.exitCode = 1
    }
  })()
} else {
  main().catch((e) => {
    console.error('[account-hub] 启动失败:', e)
    process.exit(1)
  })
}
