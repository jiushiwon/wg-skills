# Go gRPC Init Skill

Go gRPC 服务初始化技能，面向需要构建**高性能 RPC 服务**或**微服务通信**的开发者。

## 功能

- 4 种 RPC 模式（Unary / Server Streaming / Client Streaming / Bidirectional）
- 服务端骨架 + 拦截器链
- 客户端封装（重试 / 熔断 / 超时）
- JWT 认证
- 错误码映射（gRPC ↔ wg-skills）
- 健康检查

## 快速开始

```bash
# 1. 安装 protoc 和 Go 插件
brew install protobuf
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# 2. 生成代码
./scripts/proto-gen.sh

# 3. 启动服务
go run cmd/server/main.go
```

## 使用方式

```
帮我搭一个 Go gRPC 服务
用 Go 写微服务通信
Protocol Buffers 怎么定义
grpc 流式 RPC 怎么做
Go grpc 拦截器怎么加
```

## 核心能力

| 能力 | 说明 |
|------|------|
| .proto 定义 | 消息 + 服务 + 4 种 RPC 模式 |
| 服务端骨架 | 拦截器链 + 日志 + 错误处理 |
| 客户端封装 | 重试 / 熔断 / 超时 |
| JWT 认证 | 拦截器 + Token 校验 |
| 错误码映射 | gRPC status code ↔ wg-skills -1001~-2000 |
| 健康检查 | gRPC Health Check Protocol |

## 语言支持

| 语言 | 框架 | 说明 |
|------|------|------|
| Go | gRPC + Protobuf | 本技能 |
| Java | gRPC + Protobuf | 计划中 |
| Python | gRPC + Protobuf | 计划中 |
| Node.js | gRPC + Protobuf | 计划中 |

## 目录说明

```
go-grpc-init-skill/
├── SKILL.md
├── README.md
├── templates/
│   ├── proto/           # .proto 定义模板
│   ├── server/          # 服务端代码
│   ├── client/          # 客户端代码
│   └── scripts/        # 代码生成脚本
└── references/
    ├── proto-style.md   # .proto 命名规范
    ├── interceptor.md  # 拦截器详解
    ├── grpc-web.md    # 浏览器端方案
    └── error-codes.md # 错误码映射
```

## 与 wg-skills 对齐

- **错误码**：gRPC status code → wg-skills 负数错误码（-1001 ~ -2000）
- **JWT**：复用 go-auth-module-skill 的 Token 校验逻辑
- **响应格式**：camelCase
