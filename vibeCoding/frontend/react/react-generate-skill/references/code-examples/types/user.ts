// 用户类型

export interface User {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Banned = 'banned',
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface UserListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
}
