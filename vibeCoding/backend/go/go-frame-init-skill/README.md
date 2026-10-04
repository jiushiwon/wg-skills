# go-frame-init-skill

Go 多框架项目初始化技能。

## 支持的框架

| 框架 | 特点 | 场景 |
|------|------|------|
| **Gin** | 最流行、生态丰富 | 默认推荐 |
| **Hertz** | 阿里开源、云原生 | 高性能 HTTP |
| **Fiber** | Express 风格、易上手 | 快速开发 |
| **Chi** | 轻量、Router 链路 | API Gateway |

## 快速开始

1. 告诉 Claude："帮我初始化一个 Go 项目"
2. 选择框架（Gin/Hertz/Fiber/Chi）
3. 自动生成完整项目骨架

## 文档

- [骨架模板](references/skeleton.md)
- [启动脚本](references/startup-scripts.md)
- [数据库配置](references/db-guide.md)
- [环境探测](references/env-setup.md)
- [接口契约](references/api-contract-template.md)
- [项目指南](references/project-guide-template.md)

## 与 go-gin-init-skill 的区别

- **go-gin-init-skill**: Gin 完整脚手架（SSE、JWT、文件上传、一键启动）
- **go-frame-init-skill**: 多框架脚手架（适配多种框架的通用模板）

## 相关技能

- [go-gin-init-skill](../go-gin-init-skill) - Gin 完整脚手架
- [go-ws-module-skill](../go-ws-module-skill) - WebSocket 模块
