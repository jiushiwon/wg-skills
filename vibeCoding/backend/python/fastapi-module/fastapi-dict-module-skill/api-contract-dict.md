# 字典模块接口契约

> 本文件由 fastapi-dict-module-skill 生成，遵循 `backend/shared/module-output-spec.md`。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/dicts/types | 字典类型列表（分页） | 是 |
| POST | /api/dicts/types | 创建字典类型 | 是 |
| PUT | /api/dicts/types/{id} | 更新字典类型 | 是 |
| DELETE | /api/dicts/types/{id} | 删除字典类型 | 是 |
| GET | /api/dicts/types/{type_code}/items | 按类型查询字典项 | 是 |
| POST | /api/dicts/items | 创建字典项 | 是 |
| PUT | /api/dicts/items/{id} | 更新字典项 | 是 |
| DELETE | /api/dicts/items/{id} | 删除字典项 | 是 |
| GET | /api/dicts/public/types/{type_code}/items | 公开查询（无需鉴权） | 否 |

## 数据模型

### DictTypeResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| type_code | string | 字典类型编码（唯一） |
| type_name | string | 字典类型名称 |
| remark | string | 备注 |
| created_at | string | ISO 8601 |

### DictItemResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| type_code | string | 所属类型编码 |
| item_label | string | 显示文本 |
| item_value | string | 存储值 |
| sort_order | integer | 排序序号 |
| status | integer | 状态（1 启用 / 0 停用） |
| remark | string | 备注 |

## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 字典类型已存在 | type_code 唯一约束冲突 |
| -3002 | 字典类型不存在 | 引用了不存在的 type_code |
| -3003 | 字典项已存在 | 同一 type_code 下 item_value 重复 |
