# uniapp-auth-skill 个体规范

> 上位规范：[uniapp/AGENTS.md](../AGENTS.md)
> 本文件只写本模块特有约束；与上位规范重复的内容不再赘述。

## 一、模块定位

**第 2 层：专项层（认证与会话）。**

本模块负责 uni-app 小程序的**登录、鉴权、令牌存储与刷新、用户态管理**。

> **边界**：本模块是认证的**唯一收口方**（对应 R20）。请求层的通用封装归 `uniapp-request-skill`；本模块向其提供 Token 注入点与 401 处理器，不重复实现请求封装。

## 二、依赖

| 依赖 | 方向 | 用途 |
|------|------|------|
| `uniapp-standard-skill` | 依赖（前置规范） | 目录结构、存储规范、R20 |
| `uniapp-request-skill` | 依赖（数据层） | 提供请求入口 |

## 三、目录约定

```
src/
├── api/auth.ts        # 登录/登出/刷新/验证码 接口
├── stores/auth.ts     # Pinia：token、用户信息、登录态
├── services/auth.ts   # 业务服务
└── utils/storage.ts   # 令牌读写封装
```

- 令牌**不写在** `localStorage` 裸键，统一走 `utils/storage.ts` 封装。
- 用户信息与 token **分键存储**，便于单独清除用户态。

## 四、内容清单

| 章节 | 内容 |
|------|------|
| §1 登录流程 | 微信授权 / 手机号 / 账号密码 |
| §2 令牌存储 | 存取、过期判断、清除 |
| §3 令牌刷新 | 触发时机、单例并发 |
| §4 登录态 | Pinia 状态、派生 getter、页面守卫 |
| §5 路由拦截 | 未登录跳转与回跳 |

## 五、内置约束

**A01** 认证服务收口（R20）：所有登录态读写只能经本模块，页面与组件**禁止**直接 `uni.getStorageSync('token')`。

**A02** 令牌刷新必须**单例**：并发 401 只触发一次刷新，其余请求挂起等待结果，失败后统一跳登录。

**A03** 登录态判定统一用一个派生值（如 `isLoggedIn`），禁止多处重复判断 `token && userInfo`。

**A04** 登出必须**清干净**：token、用户信息、缓存的敏感数据、必要的本地状态，一并清除。

**A05** 密码/验证码等敏感值**禁止**写入日志、禁止明文存储。

**A06** 未登录访问受限页面必须走统一守卫 + 回跳参数，不允许各页面各写一套。

**A07** 本模块不实现 UI；登录页属于 `uniapp-page-components-skill` 的 `login-page`，本模块只提供状态与动作。

**A08** 依赖 `uniapp-standard-skill` 的存储规范（`references/storage-guide.md`）。

## 六、变更纪律

- 改令牌结构 → 同步 `uniapp-request-skill` 的注入点说明与 `references/storage-guide.md`。
- 改登录流程 → 同步 `README.md` 示例与 `SKILL.md` §1。

## 七、自检

- [ ] 无组件/页面直接读 token
- [ ] 刷新逻辑单例
- [ ] 登出清项完整
- [ ] 敏感值无日志
- [ ] `bash scripts/check-skills.sh` 错误为 0
