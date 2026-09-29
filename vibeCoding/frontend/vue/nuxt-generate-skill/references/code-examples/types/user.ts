/** 用户信息 */
export interface User {
  id: number
  username: string
  nickname: string
  email: string
  avatar: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
  updatedAt: string
}

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应数据 */
export interface LoginResult {
  token: string
  refreshToken: string
  expiresIn: number
  user: User
}

/** 用户列表查询参数 */
export interface UserListParams {
  page?: number
  pageSize?: number
  keyword?: string
  role?: User['role']
  status?: User['status']
}

/** 创建/编辑用户参数 */
export interface UserFormParams {
  username: string
  nickname: string
  email: string
  role: User['role']
  password?: string
}
