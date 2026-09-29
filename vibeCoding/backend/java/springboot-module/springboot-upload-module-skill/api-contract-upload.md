# 上传模块接口契约

> 本文件由 springboot-upload-module-skill 生成，遵循 `backend/shared/module-output-spec.md`。
> 响应信封、错误码遵循 `backend/shared/` 公共规范。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/upload | 单文件上传 | 是 |
| POST | /api/uploads | 多文件上传 | 是 |
| GET | /api/files | 文件列表（分页） | 是 |
| GET | /api/files/{id} | 文件详情 | 是 |
| DELETE | /api/files/{id} | 删除文件 | 是 |

## 数据模型

### UploadResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 文件记录 ID |
| url | string | 文件访问 URL |
| filename | string | 原始文件名 |
| size | integer | 文件大小（字节） |
| mimeType | string | MIME 类型 |
| createdAt | string | 上传时间（ISO 8601） |

### FileResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 文件记录 ID |
| url | string | 文件访问 URL |
| filename | string | 原始文件名 |
| size | integer | 文件大小（字节） |
| mimeType | string | MIME 类型 |
| uploaderId | integer | 上传者 ID |
| createdAt | string | 上传时间（ISO 8601） |

## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -1031 | 请求体过大 | 文件超过 UPLOAD_MAX_SIZE（默认 10MB） |
| -1032 | 不支持的文件类型 | MIME 不在白名单（jpg/jpeg/png/gif/pdf） |

## 配置项

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| UPLOAD_MAX_SIZE | 最大文件大小 | 10MB |
| UPLOAD_ALLOWED_TYPES | 允许的 MIME 类型 | jpg,jpeg,png,gif,pdf |
| UPLOAD_DIR | 存储目录 | ./uploads |
