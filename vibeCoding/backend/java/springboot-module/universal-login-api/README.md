# universal-login-api

> 多系统账户互通后端模块：**宿主账户 ↔ 第三方应用身份**的绑定，以及第三方应用的注册与密钥管理。

## 定位

**叠加模块，不是新项目。** 在已有 `springboot-init-skill` + `springboot-auth-module-skill` 的 Spring Boot 项目上，增加：

- 应用注册与密钥管理（`wg_sys_app` / `wg_sys_app_key`）
- 账户绑定（`wg_sys_app_binding`）与一次性绑定码（`wg_sys_bind_code`）
- 面向第三方应用的应用级签名鉴权（`/api/open/**`）

## 明确不做

| 不做 | 归属 |
|------|------|
| 登录 / 注册 / 找回密码 / 验证码 / JWT | `springboot-init-skill` + `springboot-auth-module-skill` |
| 账户表 | `wg_sys_user`（auth 模块） |
| 角色 / 菜单 / 权限 | `wg_sys_role` / `_sys_menu`（auth 模块） |
| 统一响应信封 / 异常处理 / 分页 | `springboot-init-skill` |

> 历史版本自带 `sys_main_account` / `sys_role` / `sys_permission`，形成第二套账户与第二套 RBAC，
> 与宿主账户无映射 → "绑定"功能实际不成立。**该设计已作废并删除。**

## 使用

```bash
# 触发技能
用户：帮我加一个多系统账户绑定后端
```

## 文档

- [SKILL.md](./SKILL.md) —— 技能定义、表设计、接口清单、红线、自检
- [api-contract-universal-login.md](./api-contract-universal-login.md) —— 接口契约（DTO + 签名算法 + 错误码）
- [references/security-integration.md](./references/security-integration.md) —— `SecurityConfig` 两处必改 + 客户端签名示例
- [templates/](./templates/) —— 代码模板（含 Flyway `V20`）
