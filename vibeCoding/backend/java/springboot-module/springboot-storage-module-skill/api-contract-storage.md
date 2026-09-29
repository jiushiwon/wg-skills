# 存储模块接口契约

> 本文件由 springboot-storage-module-skill 生成，遵循 `backend/shared/module-output-spec.md`。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/storage/upload | 上传到对象存储 | 是 |
| POST | /api/storage/upload/presigned | 获取预签名上传 URL | 是 |
| GET | /api/storage/files | 文件列表（分页） | 是 |
| GET | /api/storage/files/{id} | 文件详情 | 是 |
| DELETE | /api/storage/files/{id} | 删除文件 | 是 |
| GET | /api/storage/files/{id}/download | 下载文件 | 是 |

## 数据模型

### StorageFileResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 文件 ID |
| bucket | string | 存储桶名 |
| objectKey | string | 对象 key |
| url | string | 访问 URL |
| filename | string | 原始文件名 |
| size | integer | 文件大小（字节） |
| mimeType | string | MIME 类型 |
| etag | string | ETag |
| createdAt | string | ISO 8601 |

### PresignedUrlResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| uploadUrl | string | 预签名上传 URL |
| objectKey | string | 对象 key |
| expiresIn | integer | URL 有效期（秒） |

## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 存储服务不可用 | MinIO/OSS 连接失败 |
| -3002 | 存储桶不存在 | 配置的 bucket 未创建 |
| -3003 | 文件已过期 | 文件已被清理 |
