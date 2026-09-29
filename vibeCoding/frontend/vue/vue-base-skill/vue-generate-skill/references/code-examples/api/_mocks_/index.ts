// src/api/_mocks_/index.ts
// ponytail: MOCK_MAP 集中注册表。所有 *.mock.ts 必须 import './xxx.mock' 才能生效（避免 tree-shaking 清空）。
// 业务代码 import { MOCK_MAP, type MockEntry } from '@/api/_mocks_'。
// 参考 frontend-request-skill/references/mock-guide.md。

export interface MockEntry<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export const MOCK_MAP: Record<string, MockEntry> = {};

// 必须显式 import，否则会被 tree-shaking 清空
import './auth.mock';
// 后续业务模块追加：import './user.mock'; import './order.mock';