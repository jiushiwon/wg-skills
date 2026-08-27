# API 契约检查清单

> 本清单用于 `uniapp-code-audit-skill` 请求层/API 契约审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. 请求层统一封装

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 缺少统一 request 封装 | P0 | 请求逻辑散落，难以维护 | 不存在 `src/api/request.ts` 或 `src/utils/request.ts` | `uniapp-standard-skill` 3.1 / `frontend-request-skill` 设计要点 1. 统一入口 | `ls src/api/request.ts src/utils/request.ts` |
| 页面直接使用 `uni.request` | P1 | 缺少统一拦截与错误处理 | `src/pages/` 中出现 `uni.request(` | `uniapp-standardization-skill` 2.1 | `grep -rnE 'uni\.request\(' src/pages/` |
| 请求封装未暴露便捷方法 | P2 | 调用方重复写配置 | 未提供 `get/post/put/del` 等便捷方法 | `uniapp-standard-skill` 3.1 | 检查 `src/api/request.ts` |

## 2. 响应结构标准化

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 缺少统一响应类型 | P2 | 前后端契约不清晰 | 未定义 `ApiResponse<T>` | `uniapp-standard-skill` 3.1 | 检查 `src/api/request.ts` |
| 各模块响应结构不一致 | P2 | 类型契约混乱 | 不同 API 文件返回不同 envelope | `frontend-request-skill` 设计要点 1. 统一入口 | 检查 `src/api/modules/*.ts` |

## 3. Token 注入与鉴权头

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未自动注入 Token | P1 | 每个调用方需手动传 Token | 请求封装未读取 Storage 中的 Token | `uniapp-components-skill/references/auth-framework.md` | 检查 `src/api/request.ts` 拦截器 |
| 不支持 `needAuth: false` | P2 | 登录/验证码等接口也被注入 Token | 请求封装无 `needAuth` 选项 | `frontend-request-skill` 设计要点 2. 鉴权衔接 / `uniapp-standard-skill` 3.1 | 检查 `RequestOptions` 定义 |
| 不支持 `authMode` 切换 | P2 | 无法适配多种鉴权头格式 | 请求封装无 `authMode: 'bearer' \| 'customer-token'` | `frontend-request-skill` 设计要点 2. 鉴权衔接 / `uniapp-standard-skill` 3.1 | 检查 `RequestOptions` 定义 |

## 4. 401 / 403 统一处理

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 401 未统一处理 | P1 | 各页面自行跳转登录，体验不一致 | 响应拦截器未识别 401 或未交给 `auth.service.ts` | `uniapp-components-skill/references/auth-framework.md` | 检查 `src/api/request.ts` 响应拦截器 |
| 401 并发未加锁 | P1 | 多个请求同时 401 导致多次跳转 | 未实现 3 秒窗口期或等效去重 | `uniapp-components-skill/references/auth-framework.md` | 检查 `src/services/auth.service.ts` |
| 403 未统一处理 | P2 | 权限不足场景无统一提示 | 响应拦截器未处理 403 | `frontend-request-skill` 设计要点 2. 鉴权衔接 | 检查 `src/api/request.ts` |
| 业务鉴权失败码未处理 | P1 | 后端自定义失效码与 401 等效处理缺失 | 未配置 `AUTH_FAILURE_CODES` | `uniapp-standard-skill` 3.5 | 检查 `src/config/api.config.ts` |

## 5. 错误提示与业务码

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 错误提示不统一 | P2 | 用户体验差 | 各页面自行调用 Toast/Modal | `frontend-request-skill` 设计要点 6. 错误处理 | 检查 `src/utils/toast.ts` 使用 |
| 业务码异常未处理 | P1 | 后端返回错误码时无提示 | 响应拦截器未判断 `data.code` | `uniapp-standard-skill` 3.3 | 检查 `src/api/request.ts` |
| 状态码判断只写 `=== 200` | P2 | 201/204 等合法状态被误判 | 响应拦截器使用 `statusCode === 200` | `frontend-request-skill` 常见错误 | `grep -rnE 'statusCode\s*===\s*200' src/` |

## 6. 防抖去重

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未实现请求去重 | P1 | 重复点击导致重复提交 | 同一 key 并发请求未缓存 pending Promise | `uniapp-standard-skill` R09 / `frontend-request-skill` 设计要点 4. 防抖去重 | 检查 `src/api/request.ts` |
| 去重 key 生成错误 | P2 | 属性顺序不同导致去重失效 | 直接使用 `JSON.stringify` 生成 key | `frontend-request-skill` 常见错误 | 检查 `src/api/request.ts` |
| 文件上传复用 request 防抖 | P1 | 上传被错误去重 | 上传接口走 request 防抖逻辑 | `frontend-request-skill` 常见错误 | 检查 `src/api/upload.ts` |

## 7. Mock 机制

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| Mock 数据写入生产包 | P0 | 数据泄露/行为异常 | Mock 逻辑未由环境变量控制 | `frontend-request-skill` 常见错误 | 检查 `src/api/request.ts` 与 `src/api/_mocks_/` |
| Mock 模式默认非 `none` | P1 | 生产环境可能误启用 Mock | `MOCK_MODE` 默认不为 `none` | `uniapp-standard-skill` 3.5 | 检查 `src/config/api.config.ts` |
| Mock 数据写在 API 文件或页面中 | P1 | 违反 R16 红线 | Mock 数据未放 `src/api/_mocks_/` | `uniapp-standard-skill` R16 | `grep -rnE 'mockData\|MOCK' src/api/modules/ src/pages/` |

## 8. 文件上传 / SSE

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 上传未单独封装 | P1 | 大文件/多文件被错误去重 | 上传复用 `request.ts` | `frontend-request-skill` 设计要点 1. 统一入口 / 常见错误 | `ls src/api/upload.ts` |
| SSE 未跨端兼容 | P1 | 小程序端无法使用 | H5 使用 `EventSource`，小程序未使用 `enableChunked` | `frontend-request-skill` 设计要点 7. SSE 流式请求 | 检查 `src/api/sse.ts` |
| SSE 未返回可中断任务 | P2 | 页面卸载后内存泄漏 | `sse()` 未返回 `requestTask` | `frontend-request-skill` 设计要点 7. SSE 流式请求 | 检查 `src/api/sse.ts` |

## 9. 业务路径规范

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| API 调用传递完整 URL | P1 | 环境切换困难，违反 R17 | 业务代码中写死 `https://` 或 `/api/v1` | `uniapp-standard-skill` R17 | `grep -rnE 'https?://\|/api/v1' src/api/modules/ src/pages/` |
| API 模块未按业务拆分 | P2 | 接口文件臃肿 | 所有接口集中在单个文件 | `uniapp-app-generate-skill/references/project-structure.md` | `ls src/api/modules/` |
| API 模块缺少 Req/Res 类型 | P2 | 类型契约缺失 | 接口函数未定义请求/响应类型 | `uniapp-app-generate-skill/references/project-structure.md` | 检查 `src/api/modules/*.ts` |

## 10. 超时与重试

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未配置默认超时 | P2 | 请求可能长时间挂起 | `RequestOptions.timeout` 无默认值 | `uniapp-standard-skill` 3.1 | 检查 `src/api/request.ts` |
| Token 刷新失败未统一登出 | P1 | 反复重试导致死循环 | 刷新失败后未调用 `auth.service.ts` 登出 | `frontend-request-skill` 设计要点 8. Token 自动刷新与失败重试 | 检查 `src/services/auth.service.ts` |
| Token 刷新未排队 | P1 | 并发刷新导致多次登录 | 多个 401 同时触发多次刷新 | `frontend-request-skill` 常见错误 | 检查 `src/services/auth.service.ts` |

## API 契约评分参考

| 级别 | 描述 |
|------|------|
| A | 统一封装、拦截器完整、类型清晰 |
| B | 基本统一，少量细节缺失 |
| C | 存在明显缺口，需要治理 |
| D | 无统一封装，请求逻辑散落 |
