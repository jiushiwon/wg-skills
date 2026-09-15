# 字典模块接口契约

> 本文件由 springboot-dict-module-skill 生成，遵循 `backend/shared/module-output-spec.md`。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/dicts/types | 字典类型列表（分页） | 是 |
| POST | /api/dicts/types | 创建字典类型 | 是 |
| PUT | /api/dicts/types/{id} | 更新字典类型 | 是 |
| DELETE | /api/dicts/types/{id} | 删除字典类型 | 是 |
| GET | /api/dicts/types/{typeCode}/items | 按类型查询字典项 | 是 |
| POST | /api/dicts/items | 创建字典项 | 是 |
| PUT | /api/dicts/items/{id} | 更新字典项 | 是 |
| DELETE | /api/dicts/items/{id} | 删除字典项 | 是 |
| GET | /api/dicts/public/types/{typeCode}/items | 公开查询（无需鉴权） | 否 |

## 数据模型

### DictTypeResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| typeCode | string | 字典类型编码（唯一） |
| typeName | string | 字典类型名称 |
| remark | string | 备注 |
| createdAt | string | ISO 8601 |

### DictItemResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| typeCode | string | 所属类型编码 |
| itemLabel | string | 显示文本 |
| itemValue | string | 存储值 |
| sortOrder | integer | 排序序号 |
| status | integer | 状态（1 启用 / 0 停用） |
| remark | string | 备注 |

### CreateDictTypeRequest

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|------|---------|
| typeCode | string | 是 | 1-64 字符，唯一 |
| typeName | string | 是 | 1-128 字符 |
| remark | string | 否 | — |

### CreateDictItemRequest

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|------|---------|
| typeCode | string | 是 | 已存在的字典类型 |
| itemLabel | string | 是 | 1-128 字符 |
| itemValue | string | 是 | 1-256 字符 |
| sortOrder | integer | 否 | 默认 0 |
| status | integer | 否 | 默认 1 |

## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 字典类型已存在 | typeCode 唯一约束冲突 |
| -3002 | 字典类型不存在 | 引用了不存在的 typeCode |
| -3003 | 字典项已存在 | 同一 typeCode 下 itemValue 重复 |
