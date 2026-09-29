---
name: go-frame-init-skill
description: Go Web 框架初始化技能。面向零基础小白，提供多种 Go Web 框架（Hertz/Fiber/Chi）的项目初始化、骨架生成、一键启动脚本。触发词："Go 框架"、"Go Web 框架"、"Hertz"、"Fiber"、"初始化 Go 项目"、"Go 脚手架"。
---

# Go Frame Skill

面向**零基础小白**，快速初始化 Go Web 框架项目。

## 支持的框架

| 框架 | 特点 | 场景 |
|------|------|------|
| **Gin** | 最流行、性能好 | 默认推荐 |
| **Hertz** | 阿里开源、云原生 | 高性能 HTTP |
| **Fiber** | Express 风格、易上手 | 快速开发 |
| **Chi** | 轻量、Router 链路 | API Gateway |

## 触发场景

用户说"帮我搭 Go Web 框架"或"初始化 Go 项目"时触发。

## 核心能力

| 能力 | 说明 |
|------|------|
| **项目初始化** | 多种框架可选 |
| **目录结构** | 标准 Go 项目布局 |
| **中间件** | 日志/鉴权/CORS/限流 |
| **配置管理** | Viper 配置 |
| **数据库集成** | GORM/Go-redis |
| **一键启动** | 开发/生产脚本 |

## 不做

- 不重复 go-gin-init-skill（ Gin 已在 go-gin-init-skill 中）
- 本 skill 主要用于其他框架（Hertz/Fiber/Chi）的初始化
