# 前端契约消费规范

> 本文件定义前端请求层如何读取和执行契约，**不是**响应信封、错误码、JWT 或分页规则的定义源。

## 一、契约来源与优先级

前端实现请求层前，按以下顺序读取规范；下层不得改写上层事实。

| 优先级 | 文件 | 拥有的事实 | 前端职责 |
|---|---|---|---|
| 1 | [`backend/shared/response-envelope-spec.md`](../../../backend/shared/response-envelope-spec.md) | 响应信封 `{ code, message, data }` | 按信封解析 |
| 1 | [`backend/shared/error-code-spec.md`](../../../backend/shared/error-code-spec.md) | 全局错误码与模块扩展区间 | 映射用户文案 |
| 1 | [`backend/shared/jwt-auth-spec.md`](../../../backend/shared/jwt-auth-spec.md) | JWT 载荷、请求头与刷新约束 | 注入与刷新 Token |
| 1 | [`backend/shared/pagination-spec.md`](../../../backend/shared/pagination-spec.md) | 分页请求和响应结构 | 传递和解析分页参数 |
| 2 | 项目根 `api-contract.md` | 该项目真实端点、字段、模块扩展错误码 | 生成 `src/api/` 定义 |
| 3 | 本文件 | 请求层目录、读取流程、前端职责边界 | 统一落地实现 |

公共规则与项目实例分属不同作用域：`backend/shared/` 是跨语言公共真源，项目 `api-contract.md` 是该项目接口实例真源。两者冲突时，先修正项目契约对公共规则的违背；前端不得另建第三份全局规则。

## 二、接入流程

1. 读取四份 `backend/shared/` 公共规范，确认响应、错误码、JWT 和分页的基础规则。
2. 读取项目根 `api-contract.md` 与各 `api-contract-<module>.md`，取得端点、请求参数、响应数据模型和模块错误码。
3. 在 `src/api/` 建立与项目契约一一对应的接口函数和类型；禁止根据页面、路由或历史接口猜测字段。
4. 将 Token、重试、错误展示、请求取消等公共行为放入统一请求层；页面只能调用 `src/api/` 或 `services/` 暴露的函数。
5. 项目契约变更后，先更新 `src/api/` 类型和 `ERROR_CODE_MAP`，再修改页面调用。

## 三、前端目录职责

```text
src/
├── api/                          # 网络接口：路径、参数、响应类型
│   ├── request.ts                # 统一请求封装
│   ├── upload.ts                 # 文件上传
│   ├── sse.ts                    # SSE 请求
│   ├── modules/                  # 按项目契约的业务模块拆分
│   ├── types/                    # 请求和响应类型
│   └── _mocks_/                  # Mock 数据字典
├── services/                     # 业务编排；可依赖 api，不能反向依赖
├── config/
│   ├── api.config.ts             # 基础 URL、超时、重试等运行配置
│   └── error.config.ts           # 项目实际错误码到用户文案的映射
├── utils/
│   ├── auth.ts                   # Token 存取
│   ├── toast.ts                  # 用户提示
│   └── error.ts                  # 错误信息提取
└── composables/                  # 仅存放可复用状态逻辑
```

- `api/` 只负责网络协议，不写页面状态和业务判断。
- `services/` 负责登录后写入 Token、刷新失败回跳、多个接口的数据编排等业务行为。
- 页面和组件禁止直接调用底层网络 API；uni-app 页面也禁止散落 `uni.request`。
- 接口相对路径由项目 `api-contract.md` 决定；本文件不定义 `/auth/*` 或业务模块端点。

## 四、错误与鉴权的消费规则

- `code === 0` 的成功判定、负数错误码、`-1002` 的未授权语义、模块 `-3xxx` 扩展区间，全部以 [`error-code-spec.md`](../../../backend/shared/error-code-spec.md) 为准。
- 收到 HTTP `401` 或业务 `code === -1002` 时，进入单例 Token 刷新队列；刷新失败才清理登录态并回跳登录页。
- `ERROR_CODE_MAP` 只能为项目实际使用的错误码补充用户文案，不能改变公共错误码含义。
- 密码、Token、刷新令牌、请求头中的敏感值不得写入前端日志、Toast 或监控事件正文。
- `showError`、HTTP 5xx 的用户可见行为、重试和 SSE 处理，执行 [`../SKILL.md`](../SKILL.md) 的请求层规则；页面不得自行绕过统一处理。

## 五、变更纪律

| 变更 | 必须同步 |
|---|---|
| 公共响应、错误码、JWT、分页规则 | 只修改对应 `backend/shared/` 真源，并更新项目契约引用 |
| 新增或变更业务端点 | 更新项目 `api-contract.md`、`src/api/` 类型和接口函数 |
| 新增模块错误码 | 更新 `api-contract-<module>.md` 与前端 `ERROR_CODE_MAP` |
| 请求层行为变化 | 更新 `frontend-request-skill/SKILL.md` 与本文件的消费流程 |

## 六、自检

- [ ] 已读取公共规范和项目实际契约，而非依据页面猜接口。
- [ ] `src/api/` 的路径、参数、类型与项目 `api-contract.md` 一一对应。
- [ ] `-1002` 只按未授权和 Token 失效流程处理；不存在历史鉴权码误写。
- [ ] 页面、组件没有直接调用 `fetch`、`axios`、`uni.request` 或重复的 Token 刷新逻辑。
- [ ] 错误提示、日志与监控没有泄露密码、Token 或其他敏感值。
