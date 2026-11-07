# CLAUDE.md 模板

本文件用于为新生成的后端项目创建 CLAUDE.md。请替换占位符后使用。

```markdown
# {{PROJECT_NAME}}

## 项目概述

- 名称：{{PROJECT_NAME}}
- 技术栈：{{STACK}}
- 数据库：{{DATABASE}}
- 表/集合前缀：{{DB_PREFIX}}
- 端口：{{APP_PORT}}

## 版本锁定

参见项目根目录 `versions.md`，所有运行时、框架、数据库、中间件版本以该文件为准。

## 核心红线

1. 所有接口必须返回统一格式 `{ code, message, data }`。
2. `code >= 0` 表示成功，`code < 0` 表示失败。
3. 禁止使用 HTTP 状态码表达业务状态；所有业务请求返回 200。
4. 所有配置项必须从环境变量读取，禁止硬编码敏感信息。
5. 数据库表名/集合名使用 `{{DB_PREFIX}}_` 前缀 + snake_case。
6. **`api-contract.md` 是前后端对接的唯一事实来源**：接口路径、字段、类型、必填、枚举值、错误码均以契约为准。
7. **接口变更必须先更新契约，再改实现**：实现与契约冲突时以契约为准，禁止让前端绕过。
8. **枚举值是闭集**：禁止新增、修改已发布枚举的含义；新增枚举值必须写入契约并通知前端。

## 目录约定

```
{{DIRECTORY_TREE}}
```

> 按所选栈的实际骨架填写（Java：`src/main/java/<base>/{controller,service,repository,entity,dto,common,config}`；Go：`cmd/` + `internal/{handlers,services,repositories,models,middlewares}`；Python：`app/{routers,models,schemas,services}`；Node：`src/{common,modules}`），完整目录见 `AGENTS.md`。

## 接口规范

- 基础路径：`/api`
- 健康检查：`GET /api/health`
- 统一响应：`{ code, message, data }`
- 分页列表：`{ page, pageSize, total, list }`

## 环境变量

参见 `.env.example`。

## 常用命令

```bash
# 启动开发服务
{{START_COMMAND}}

# 构建
{{BUILD_COMMAND}}

# 运行测试
{{TEST_COMMAND}}
```

## 提交规范

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档
- `refactor:` 重构
- `test:` 测试
- `chore:` 杂项
```
