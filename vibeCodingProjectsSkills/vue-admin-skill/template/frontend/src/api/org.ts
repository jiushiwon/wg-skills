import { get, post, put, del } from '@/utils/request';

/** 组织 VO（后端 `OrgVO`；单表树形，parentId 递归） */
export interface OrgVO {
  id: number;
  parentId: number | null;
  name: string;
  sortOrder: number;
  leaderUserId: number | null;
  phone: string | null;
  email: string | null;
  /** 0 禁用 / 1 启用 */
  status: number;
  children?: OrgVO[];
}

export interface SaveOrgRequest {
  name: string;
  parentId?: number | null;
  sortOrder?: number;
  leaderUserId?: number | null;
  phone?: string | null;
  email?: string | null;
  status?: number;
}

/** 组织树 */
export function getOrgTree(): Promise<OrgVO[]> {
  return get('/orgs');
}

export function createOrg(data: SaveOrgRequest): Promise<OrgVO> {
  return post('/orgs', data);
}

export function updateOrg(id: number, data: Partial<SaveOrgRequest>): Promise<OrgVO> {
  return put(`/orgs/${id}`, data);
}

export function deleteOrg(id: number): Promise<void> {
  return del(`/orgs/${id}`);
}
