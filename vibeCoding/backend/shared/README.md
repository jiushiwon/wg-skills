# shared/ — 后端公共规范层

> 本目录拥有跨语言公共协议的定义权。所有后端 init-skill、module-skill 与前端请求层必须引用本目录，不得内联重复定义。

## 真源边界

| 作用域 | 真源 | 内容 |
|---|---|---|
| 跨语言公共规则 | 本目录的各 `*-spec.md` | 响应信封、错误码、JWT、分页、模块输出约束 |
| 单个项目接口实例 | 项目根 `api-contract.md` | 真实端点、字段、项目配置和已接入模块 |
| 单个模块接口扩展 | `api-contract-<module>.md` | 模块端点和 `-3xxx` 扩展错误码 |
| 前端消费流程 | `frontend-request-skill/references/api-contract.md` | 如何读取项目契约、落位 `src/api/` 和处理请求 |

项目契约必须引用本目录的公共规范；它可以补充项目事实，但不得重新定义公共响应、错误码、JWT 或分页规则。

## 文件清单

| 文件 | 职责 | 引用方 |
|------|------|--------|
| `response-envelope-spec.md` | 统一响应信封 `{ code, message, data }` | 所有 init-skill、module-skill、frontend-request-skill |
| `error-code-spec.md` | 全局错误码（单一事实来源） | 所有 init-skill、module-skill、frontend-request-skill |
| `jwt-auth-spec.md` | JWT Bearer 鉴权规范 | 所有 init-skill |
| `pagination-spec.md` | 分页请求/响应格式 | 所有 init-skill、module-skill |
| `api-contract-template.md` | 通用接口契约模板（语言无关） | 所有 init-skill（作为生成 api-contract.md 的基础） |
| `module-output-spec.md` | 模块接口输出规范 | 所有 module-skill |

## 引用方式

在各 skill 的 SKILL.md 或 references/ 中引用：

```markdown
> 本 skill 的响应信封、错误码、JWT 规范、分页约定遵循 `backend/shared/` 公共规范。
> 详见 [shared/response-envelope-spec.md](../shared/response-envelope-spec.md)。
```

## 设计原则

1. **单一事实来源**：错误码、响应格式等跨语言规范只在此处定义一次
2. **语言无关**：所有规范不绑定特定编程语言或框架
3. **前后端对齐**：`frontend-request-skill` 的 ERROR_CODE_MAP 必须与 `error-code-spec.md` 一致
4. **向后兼容**：新增错误码只能追加，不得修改已有错误码的含义
