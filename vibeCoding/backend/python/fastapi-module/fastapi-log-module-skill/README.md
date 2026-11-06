# fastapi-log-module-skill

> 面向已有 FastAPI 项目，快速集成操作日志 / 登录日志 / 审计追踪能力。

## 快速上手

在已有 FastAPI 项目中触发：

```
帮我加一个日志审计模块
给这个项目加操作日志和登录日志
```

按 `SKILL.md` 复制数据模型（`wg_operation_log` / `wg_login_log`）与查询接口（`/api/log/operation/list`、`/api/log/login/list`）到项目即可。

## 覆盖能力

操作日志、登录日志、审计追踪、日志查询。

## 边界

- 不负责日志存储方案选型
- 不做日志分析（交给 ELK 等专门工具）

## 详细规范 → [SKILL.md](SKILL.md)
