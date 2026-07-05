import { requestClient } from '@/utils/request';

export interface UserProfile {
  /** 用户 ID */
  id: string;
  /** 昵称 */
  nickname: string;
  /** 头像 URL */
  avatar: string;
}

export function getUserProfile(): Promise<UserProfile> {
  return requestClient.get<UserProfile>('/api/user/profile');
}
