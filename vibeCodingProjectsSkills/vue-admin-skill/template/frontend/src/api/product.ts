import { get, post, put, del } from '@/utils/request';

/** 商品 VO（后端 `ProductVO`） */
export interface ProductVO {
  id: number;
  name: string;
  code: string;
  category: string | null;
  price: number;
  stock: number;
  description: string | null;
  /** 0 下架 / 1 在售 */
  status: number;
  createdAt: string;
}

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}

export interface SaveProductRequest {
  name: string;
  code: string;
  category?: string;
  price: number;
  stock: number;
  description?: string;
  status: number;
}

export function getProductList(query: ProductQuery): Promise<PageResponse<ProductVO>> {
  return get('/products', query as unknown as Record<string, unknown>);
}

export function getProduct(id: number): Promise<ProductVO> {
  return get(`/products/${id}`);
}

export function createProduct(data: SaveProductRequest): Promise<ProductVO> {
  return post('/products', data);
}

export function updateProduct(id: number, data: Partial<SaveProductRequest>): Promise<ProductVO> {
  return put(`/products/${id}`, data);
}

export function deleteProduct(id: number): Promise<void> {
  return del(`/products/${id}`);
}
