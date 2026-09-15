# 模块接口输出规范

> 所有后端 module-skill **必须**按本规范输出接口定义，供前端消费。

## 模块 SKILL.md 必备章节

每个 module-skill 的 SKILL.md 除常规章节外，**必须**包含以下内容：

### 1. 接口清单表

```markdown
## 接口清单

| 方法 | 路径 | 说明 | 鉴权 | 请求体 | 响应 data |
|------|------|------|------|--------|----------|
| POST | /api/xxx | 创建 xxx | 是 | CreateXxxRequest | XxxResponse |
| GET | /api/xxx | 查询列表 | 是 | — | PaginatedResponse<XxxResponse> |
| GET | /api/xxx/{id} | 查询详情 | 是 | — | XxxResponse |
| PUT | /api/xxx/{id} | 更新 | 是 | UpdateXxxRequest | XxxResponse |
| DELETE | /api/xxx/{id} | 删除 | 是 | — | null |
```

### 2. 请求/响应数据模型

```markdown
## 数据模型

### CreateXxxRequest

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|---------|------|
| name | string | 是 | 1-128 字符 | 名称 |

### XxxResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| name | string | 名称 |
| createdAt | string | ISO 8601 |
```

### 3. 错误码扩展

```markdown
## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | xxx 失败 | 具体场景 |
```

> 模块错误码**必须**使用 `-3xxx` 段，遵循 [shared/error-code-spec.md](error-code-spec.md) 的分段规则。

### 4. api-contract 文件

每个 module-skill **必须**在目录下创建 `api-contract-<module>.md` 文件，包含上述所有内容。

## 文件命名

```
springboot-auth-module-skill/
├── SKILL.md                    # 技能定义（含接口清单摘要）
├── api-contract-auth.md        # 完整接口契约（前端消费）
└── README.md                   # 人类使用说明
```

## 与 init-skill 的关系

- init-skill 生成基础接口（health / auth / upload / sse）
- module-skill 追加业务接口（xxx-module → /api/xxx/*）
- 两者共享同一套响应信封和错误码（`backend/shared/`）
- 最终的 `api-contract.md` = init-skill 基础 + 各 module-skill 追加
