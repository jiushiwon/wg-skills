<script setup lang="ts">
/**
 * 接口 API 管理页（固定路由 /api-docs，不进菜单）。
 *
 * 用途：
 *  - 给「人」看：统一的出入参契约，避免每次翻源码。
 *  - 给「AI」看：固定的 method + 路径后缀 + 入参/出参类型名，AI 对接时可直接索引。
 *
 * 设计要点：
 *  - 部署地址自适应：baseUrl 取 window.location.origin（部署在哪就是哪的地址）。
 *  - 固定部分：所有后端接口都在固定前缀 /api 之下，路径后缀与出入参类型见下表。
 *  - 本页为纯文档，不依赖任何 vue-* skill 组件，确保稳定渲染。
 */
import { computed, ref } from 'vue'

const baseUrl = window.location.origin
const prefix = '/api'
const filter = ref('')

/** 方法 → 徽标配色（REST 通行约定，非金融红绿） */
const methodClass: Record<string, string> = {
  GET: 'm-get',
  POST: 'm-post',
  PUT: 'm-put',
  DELETE: 'm-del'
}

interface ApiRow {
  method: string
  path: string
  req: string
  res: string
  desc: string
}

interface ApiGroup {
  group: string
  items: ApiRow[]
}

const groups: ApiGroup[] = [
  {
    group: '认证与账户 (auth)',
    items: [
      { method: 'POST', path: '/api/auth/login', req: 'LoginRequest { username, password }', res: 'LoginResponse', desc: '账号密码登录，返回 JWT（accessToken / refreshToken）' },
      { method: 'POST', path: '/api/auth/refresh', req: 'RefreshTokenRequest { refreshToken }', res: 'LoginResponse', desc: '用 refreshToken 换发新的 accessToken / refreshToken' },
      { method: 'POST', path: '/api/auth/logout', req: '—', res: 'void', desc: '无状态登出（前端清除 token 即视为登出）' },
      { method: 'GET', path: '/api/auth/me', req: '—', res: 'UserInfoResponse', desc: '当前登录用户信息，含 roles / permissions（三段式权限码）' },
      { method: 'PUT', path: '/api/auth/password', req: '{ oldPassword, newPassword }', res: 'void', desc: '当前用户修改密码' },
      { method: 'GET', path: '/api/auth/menus', req: '—', res: 'MenuNode[]', desc: '当前用户可见菜单树（仅含本人有权限的菜单）' }
    ]
  },
  {
    group: '用户 (users)',
    items: [
      { method: 'GET', path: '/api/users', req: 'UserQuery { page, pageSize, username?, status? }', res: 'PageResponse<UserVO>', desc: '用户分页列表' },
      { method: 'GET', path: '/api/users/{id}', req: '—', res: 'UserVO', desc: '用户详情（含 roles / posts）' },
      { method: 'POST', path: '/api/users', req: 'CreateUserRequest', res: 'UserVO', desc: '创建用户' },
      { method: 'PUT', path: '/api/users/{id}', req: 'UpdateUserRequest', res: 'UserVO', desc: '更新用户（不可改 username / password）' },
      { method: 'DELETE', path: '/api/users/{id}', req: '—', res: 'void', desc: '删除用户' },
      { method: 'PUT', path: '/api/users/{id}/roles', req: '{ roleIds: number[] }', res: 'void', desc: '分配角色（全量覆盖，空数组即清空）' },
      { method: 'PUT', path: '/api/users/{id}/posts', req: '{ postIds: number[] }', res: 'void', desc: '分配岗位（全量覆盖，空数组即清空）' },
      { method: 'GET', path: '/api/users/{id}/roles', req: '—', res: 'number[]', desc: '回填：当前已选角色 id' },
      { method: 'GET', path: '/api/users/{id}/posts', req: '—', res: 'number[]', desc: '回填：当前已选岗位 id' },
      { method: 'PUT', path: '/api/users/{id}/password', req: '{ newPassword }', res: 'void', desc: '管理员重置该用户密码' }
    ]
  },
  {
    group: '角色 (roles)',
    items: [
      { method: 'GET', path: '/api/roles', req: 'RoleQuery { page, pageSize, keyword?, status? }', res: 'PageResponse<RoleVO>', desc: '角色分页列表' },
      { method: 'GET', path: '/api/roles/{id}', req: '—', res: 'RoleVO', desc: '角色详情' },
      { method: 'POST', path: '/api/roles', req: 'CreateRoleRequest', res: 'RoleVO', desc: '创建角色' },
      { method: 'PUT', path: '/api/roles/{id}', req: 'UpdateRoleRequest', res: 'RoleVO', desc: '更新角色（code 不可改）' },
      { method: 'DELETE', path: '/api/roles/{id}', req: '—', res: 'void', desc: '删除角色' },
      { method: 'PUT', path: '/api/roles/{id}/menus', req: '{ menuIds: number[] }', res: 'void', desc: '分配菜单权限（全量覆盖，空数组即清空）' },
      { method: 'GET', path: '/api/roles/{id}/menus', req: '—', res: 'number[]', desc: '回填：当前已选菜单 id' }
    ]
  },
  {
    group: '菜单 (menus)',
    items: [
      { method: 'GET', path: '/api/menus', req: '—', res: 'MenuVO[]', desc: '菜单树（全量，不受当前角色限制）' },
      { method: 'POST', path: '/api/menus', req: 'SaveMenuRequest', res: 'MenuVO', desc: '创建菜单/目录/按钮' },
      { method: 'PUT', path: '/api/menus/{id}', req: 'Partial<SaveMenuRequest>', res: 'MenuVO', desc: '更新菜单' },
      { method: 'DELETE', path: '/api/menus/{id}', req: '—', res: 'void', desc: '删除菜单' }
    ]
  },
  {
    group: '组织 (orgs)',
    items: [
      { method: 'GET', path: '/api/orgs', req: '—', res: 'OrgVO[]', desc: '我的组织树（单表树形，parentId 递归）' },
      { method: 'POST', path: '/api/orgs', req: 'SaveOrgRequest', res: 'OrgVO', desc: '创建组织节点' },
      { method: 'PUT', path: '/api/orgs/{id}', req: 'Partial<SaveOrgRequest>', res: 'OrgVO', desc: '更新组织节点' },
      { method: 'DELETE', path: '/api/orgs/{id}', req: '—', res: 'void', desc: '删除组织节点' }
    ]
  },
  {
    group: '岗位 (posts)',
    items: [
      { method: 'GET', path: '/api/posts', req: '—', res: 'PostVO[]', desc: '岗位列表（裸数组，非分页对象）' },
      { method: 'POST', path: '/api/posts', req: 'CreatePostRequest', res: 'PostVO', desc: '创建岗位' },
      { method: 'PUT', path: '/api/posts/{id}', req: 'CreatePostRequest', res: 'PostVO', desc: '更新岗位' },
      { method: 'DELETE', path: '/api/posts/{id}', req: '—', res: 'void', desc: '删除岗位' }
    ]
  },
  {
    group: '应用 (apps)',
    items: [
      { method: 'GET', path: '/api/apps', req: 'AppQuery { page, pageSize, appName?, status? }', res: 'PageResponse<AppVO>', desc: '接入方应用分页列表' },
      { method: 'GET', path: '/api/apps/{id}', req: '—', res: 'AppVO', desc: '应用详情（apiSecret 永不在响应中）' },
      { method: 'POST', path: '/api/apps', req: 'CreateAppRequest', res: 'AppVO', desc: '创建应用（appKey 可留空自动生成）' },
      { method: 'PUT', path: '/api/apps/{id}', req: 'UpdateAppRequest', res: 'AppVO', desc: '更新应用' },
      { method: 'DELETE', path: '/api/apps/{id}', req: '—', res: 'void', desc: '删除应用' },
      { method: 'GET', path: '/api/apps/{appId}/keys', req: 'AppQuery', res: 'PageResponse<AppKeyVO>', desc: '应用密钥分页列表' },
      { method: 'POST', path: '/api/apps/{appId}/keys', req: 'CreateAppKeyRequest', res: 'CreatedAppKeyVO', desc: '创建密钥（仅此响应含 apiSecret，只返回一次）' },
      { method: 'DELETE', path: '/api/apps/{appId}/keys/{keyId}', req: '—', res: 'void', desc: '停用密钥' }
    ]
  },
  {
    group: '应用绑定 (bind)',
    items: [
      { method: 'GET', path: '/api/bind', req: 'PageQuery?', res: 'BindVO[]', desc: '我的绑定列表（裸数组，非分页对象）' },
      { method: 'POST', path: '/api/bind/code', req: 'CreateBindCodeRequest { appId, direction? }', res: 'BindCodeVO', desc: '宿主生成绑定码（供第三方应用扫码认领）' },
      { method: 'POST', path: '/api/bind/confirm', req: 'BindConfirmRequest { code }', res: 'BindVO', desc: '宿主确认绑定（身份取自登录态，仅 code 一个字段）' },
      { method: 'DELETE', path: '/api/bind/{id}', req: '—', res: 'void', desc: '解绑' },
      { method: 'PUT', path: '/api/bind/{id}/default', req: '—', res: 'void', desc: '设为默认绑定' }
    ]
  }
]

const types: { name: string; fields: string }[] = [
  { name: 'ApiResponse<T>', fields: '{ code: number; message: string; data: T }' },
  { name: 'PageResponse<T>', fields: '{ list: T[]; total: number; page: number; pageSize: number }' },
  { name: 'LoginRequest', fields: '{ username: string; password: string }' },
  { name: 'LoginResponse', fields: '{ accessToken; refreshToken; tokenType; expiresIn: number }' },
  { name: 'UserInfoResponse', fields: '{ id; username; nickname; email?; phone?; avatar?; tenantId?; orgId?; orgName?; status: 0|1; roles: string[]; permissions: string[] }' },
  { name: 'UserVO', fields: '{ id; username; nickname; email?; phone?; avatar?; tenantId?; orgId?; orgName?; status: 0|1; createdAt; roles?: RoleBrief[]; posts?: PostBrief[] }' },
  { name: 'RoleVO', fields: '{ id; name; code; description?; dataScope; sortOrder; status: 0|1; menuCount: number; createdAt }' },
  { name: 'MenuVO', fields: '{ id; parentId?; name; path?; component?; menuType: M|C|F; icon?; permission?; sortOrder; visible: 0|1; status: 0|1; children? }' },
  { name: 'OrgVO', fields: '{ id; parentId?; name; sortOrder; leaderUserId?; phone?; email?; status: 0|1; children? }' },
  { name: 'PostVO', fields: '{ id; name; code; tenantId?; sortOrder?; status?; createdAt? }' },
  { name: 'AppVO', fields: '{ id; appName; appKey; description?; logo?; callbackUrl?; status: 0|1; ownerId; ownerName?; createdAt; updatedAt }' },
  { name: 'AppKeyVO', fields: '{ id; appId; keyName?; apiKey; status: 0|1; lastUsedAt?; createdAt }（CreatedAppKeyVO 额外含 apiSecret）' },
  { name: 'BindVO', fields: '{ id; sysUserId; appId; appName?; appKey?; appLogo?; appUserId?; appUserName?; bindType; isDefault: 0|1; bindAt; createdAt }' },
  { name: 'BindCodeVO', fields: '{ code; qrContent; expireAt; direction }' }
]

const filteredGroups = computed(() => {
  const kw = filter.value.trim().toLowerCase()
  if (!kw) return groups
  return groups
    .map((g) => ({
      group: g.group,
      items: g.items.filter(
        (r) =>
          r.path.toLowerCase().includes(kw) ||
          r.desc.toLowerCase().includes(kw) ||
          r.req.toLowerCase().includes(kw) ||
          r.res.toLowerCase().includes(kw)
      )
    }))
    .filter((g) => g.items.length > 0)
})
</script>

<template>
  <div class="api-docs">
    <header class="docs-header">
      <h1>接口 API 管理</h1>
      <p class="subtitle">部署自适应 · 固定后缀与出入参契约（供人与 AI 对接参考）</p>

      <div class="endpoint-bar">
        <div class="kv">
          <span class="label">当前部署地址 (baseUrl)</span>
          <code class="value">{{ baseUrl }}</code>
        </div>
        <div class="kv">
          <span class="label">固定前缀</span>
          <code class="value">{{ prefix }}</code>
        </div>
      </div>

      <p class="note">
        说明：页面随服务部署位置自动取 <code>window.location.origin</code>；后端所有接口均位于固定前缀
        <code>/api</code> 之下，完整地址 = <code>{{ baseUrl }}/api/...</code>，出入参与类型见下表。
      </p>

      <input v-model="filter" class="filter" placeholder="过滤：路径 / 说明 / 入参 / 出参，例如 users、绑定、AppVO" />
    </header>

    <section class="envelope">
      <strong>响应信封</strong>：所有响应均为 <code>ApiResponse&lt;T&gt; { code, message, data }</code>。
      分页接口 <code>data</code> 为 <code>PageResponse&lt;T&gt; { list, total, page, pageSize }</code>；
      列表接口（<code>/api/posts</code>、<code>/api/bind</code>）<code>data</code> 为 <code>T[]</code> 裸数组（调用方直接取返回值，勿再取 <code>.list</code>）。
    </section>

    <section v-for="g in filteredGroups" :key="g.group" class="module">
      <h2>{{ g.group }}</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="col-method">方法</th>
              <th class="col-path">路径（固定后缀）</th>
              <th class="col-req">入参</th>
              <th class="col-res">出参</th>
              <th class="col-desc">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in g.items" :key="i">
              <td class="col-method">
                <span :class="['badge', methodClass[r.method]]">{{ r.method }}</span>
              </td>
              <td class="col-path"><code>{{ r.path }}</code></td>
              <td class="col-req"><code>{{ r.req }}</code></td>
              <td class="col-res"><code>{{ r.res }}</code></td>
              <td class="col-desc">{{ r.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="types">
      <h2>出入参类型速查</h2>
      <div class="type-grid">
        <div v-for="t in types" :key="t.name" class="type-card">
          <div class="type-name"><code>{{ t.name }}</code></div>
          <div class="type-fields"><code>{{ t.fields }}</code></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.api-docs {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 28px 64px;
  color: #1f2329;
  font-size: 14px;
  line-height: 1.6;
}
.docs-header h1 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
}
.subtitle {
  margin: 0 0 16px;
  color: #6b7280;
  font-size: 13px;
}
.endpoint-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.kv {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  background: #f5f7fa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-width: 280px;
}
.kv .label {
  font-size: 12px;
  color: #6b7280;
}
.kv .value {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
  word-break: break-all;
}
.note {
  margin: 0 0 14px;
  color: #4b5563;
  font-size: 13px;
}
.note code,
.envelope code,
.col-path code,
.col-req code,
.col-res code,
.type-card code {
  background: #eef2f7;
  padding: 1px 6px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12.5px;
  color: #b45309;
}
.filter {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}
.filter:focus {
  border-color: #2563eb;
}
.envelope {
  margin: 18px 0 24px;
  padding: 12px 16px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
  font-size: 13px;
}
.module {
  margin-bottom: 28px;
}
.module h2 {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 10px;
  padding-left: 10px;
  border-left: 4px solid #2563eb;
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  text-align: left;
  padding: 9px 12px;
  border-bottom: 1px solid #eef0f3;
  vertical-align: top;
}
thead th {
  background: #f5f7fa;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}
tbody tr:hover {
  background: #fafbfc;
}
.col-method {
  width: 84px;
}
.col-path {
  width: 26%;
}
.col-req {
  width: 26%;
}
.col-res {
  width: 18%;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}
.m-get {
  background: #2563eb;
}
.m-post {
  background: #16a34a;
}
.m-put {
  background: #d97706;
}
.m-del {
  background: #dc2626;
}
.types {
  margin-top: 8px;
}
.types h2 {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 12px;
  padding-left: 10px;
  border-left: 4px solid #16a34a;
}
.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 10px;
}
.type-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff;
}
.type-name {
  margin-bottom: 4px;
}
.type-name code {
  color: #1d4ed8 !important;
  background: #eff6ff !important;
  font-weight: 700;
}
.type-fields {
  color: #4b5563;
  word-break: break-word;
}
</style>
