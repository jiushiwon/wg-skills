---
name: rust-backend-skill
description: Rust 后端项目一键初始化技能。面向零基础开发者，提供 Axum Web 框架项目生成、TOML 配置、SQLx 数据库集成、JWT 鉴权、RESTful API 骨架、热重载启动脚本。触发词："Rust 后端"、"Rust Web"、"Axum 项目"、"初始化 Rust"、"Rust 脚手架"、"rust backend"。
---

# Rust Backend Skill

面向**零基础开发者**，一键生成标准化、开箱即用的 Rust Web 后端服务。

## 与其他后端技能的区别

| 维度 | Python FastAPI | Java Spring Boot | Rust Axum |
|------|----------------|-------------------|------------|
| 性能 | 中 | 中 | **极高** |
| 生态 | 丰富 | 丰富 | 快速增长 |
| 学习曲线 | 低 | 中 | **高** |
| 内存占用 | 中 | 高 | **极低** |

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **环境检测** | 自动检测 Rust/Cargo 安装与版本 |
| 2 | **项目生成** | 基于 Axum + Tower 生成 Web 骨架 |
| 3 | **数据库集成** | SQLx + MySQL/PostgreSQL |
| 4 | **JWT 鉴权** | jsonwebtoken 集成 |
| 5 | **热重载** | cargo-watch 开发模式 |
| 6 | **统一响应** | 响应信封 `{ code, message, data }` |
| 7 | **错误处理** | 全局错误捕获 |

## 触发关键词

```
Rust 后端、Rust Web、Axum 项目、初始化 Rust、Rust 脚手架
```

## 待实现

- [ ] 环境检测与安装指引
- [ ] 项目骨架生成
- [ ] 数据库集成
- [ ] 鉴权模块
- [ ] API 接口契约
