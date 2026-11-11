---
name: go-grpc-init-skill
description: Go gRPC 服务初始化技能。面向需要构建高性能 RPC 服务的开发者，提供 .proto 定义、4 种流模式（Unary/Server/Client/Bidirectional）、服务端骨架、客户端封装、拦截器链、JWT 认证、错误码映射等。与 wg-skills 协议对齐（camelCase + 负数错误码 -1001~-2000）。触发词："Go gRPC"、"grpc 服务"、"Protocol Buffers"、"微服务通信"、"流式 RPC"、"双向流"、"Unary"、"grpc 拦截器"、"grpc 认证"。
---

# Go gRPC Init Skill

Go gRPC 服务初始化技能，面向需要构建**高性能 RPC 服务**或**微服务通信**的开发者。

> gRPC 是 Google 开源的高性能 RPC 框架，基于 HTTP/2 + Protocol Buffers。

## 能力清单

| 能力 | 说明 | 难度 |
|------|------|------|
| **.proto 定义** | 消息 + 服务 + 4 种 RPC 模式 | ⭐ |
| **服务端骨架** | 四种 RPC 实现、健康检查与生成脚本 | ⭐⭐ |
| **客户端封装** | 复用连接，调用设置超时 | ⭐⭐ |
| **JWT 认证** | 接入参考，复用项目的 Token 校验 | ⭐⭐ |
| **流模式** | Server Streaming / Client Streaming / Bidirectional | ⭐⭐⭐ |
| **错误码映射** | gRPC status code ↔ wg-skills 负数错误码 | ⭐⭐ |
| **健康检查** | gRPC Health Check Protocol | ⭐ |
| **拦截器链** | 日志、认证与错误转换接入参考 | ⭐⭐ |

## 触发场景

用户说以下任一句即触发本 skill：
- 「帮我搭一个 Go gRPC 服务」
- 「用 Go 写微服务通信」
- 「Protocol Buffers 怎么定义」
- 「grpc 流式 RPC 怎么做」
- 「Go grpc 拦截器怎么加」
- 「grpc JWT 认证怎么做」

## 核心概念

### 什么是 gRPC

gRPC = **g**oogle **R**emote **P**rocedure **C**all

| 维度 | 传统 HTTP REST | gRPC |
|------|---------------|------|
| 协议 | HTTP/1.1 + JSON | HTTP/2 + Protocol Buffers |
| 性能 | 中 | 取决于负载与实现（使用二进制序列化） |
| 通信模式 | Request-Response | 4 种（Unary/Server/Client/Bidi） |
| 代码生成 | OpenAPI / Swagger | **原生自动生成**（.proto → 多语言） |
| 流控 | 无 | HTTP/2 原生多路复用 |
| 强类型 | 弱（JSON 弱类型） | **强（.proto 定义）** |

### 4 种 RPC 模式

```
1. Unary（普通调用）
   Client ──────► Server
                 一问一答

2. Server Streaming（服务端流）
   Client ──────► Server
   ◄─────── Stream
                 服务端持续推送

3. Client Streaming（客户端流）
   Client ────►
   ────►       Server
   (Stream)    客户端持续发送

4. Bidirectional Streaming（双向流）
   Client ◄────► Server
                 实时双向通信
```

### 适合场景

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| 简单查询 | Unary | 一问一答 |
| 列表查询 | Server Streaming | 服务端分页推送 |
| 文件上传 | Client Streaming | 客户端分段发送 |
| 实时聊天 | Bidirectional | 双方实时收发 |
| 实时行情 | Server Streaming | 服务端持续推送 |
| IoT 设备通信 | Bidirectional | 设备与服务双向 |

---

## 快速开始

将 [templates](templates/) 目录整体复制到一个新项目目录，进入复制后的目录。需要 Go 1.23+、带标准 proto 定义的 protoc，以及 Bash（Windows 可用 Git Bash）。

```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.6
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1
export PATH="$(go env GOPATH)/bin:$PATH"  # 若设置了 GOBIN，改为加入该目录
bash scripts/proto-gen.sh
go mod tidy
go test ./...
go run ./server
```

另开终端，在同一目录执行 `go run ./client`，预期输出 `Hello, world!`。服务端默认绑定回环地址 `127.0.0.1:50051`，可用 `GRPC_ADDRESS` 更换回环端口。模板注册标准 gRPC 健康检查和开发反射。生产接入时按项目配置 TLS、鉴权和拦截器。

`auth.proto` 与 `streaming.proto` 是额外的协议参考。示例服务注册的是 `helloworld.Greeter`，实现四种 RPC 模式。接入自己的项目时，一并调整 Go 模块名、proto 的 `go_package` 和 Go 导入路径。

## 模板与扩展

- [服务定义](templates/proto/hello.proto)、[服务端入口](templates/server/main.go)、[四种 RPC 实现](templates/server/greeter.go)与[客户端](templates/client/main.go)以可运行模板为准。
- 项目需要鉴权或日志时，参考 [拦截器接入](references/interceptor.md)，为一元和流式方法分别配置并验证。

## 接入既有项目

1. 从仓库 Go 项目的模块名、部署地址和鉴权契约出发，调整模板路径。
2. 给客户端调用设置 deadline。重试只用于已确认幂等的 RPC，并记录状态码和退避配置。
3. 使用 [拦截器参考](references/interceptor.md) 接入认证与日志，分别验证一元和流式调用。生产环境使用 TLS，并按部署要求配置健康检查和反射。
4. 使用 [错误码参考](references/error-codes.md) 对齐 gRPC status 与项目业务码。协议字段和服务演进见 [Proto 规范](references/proto-style.md)。浏览器接入见 [gRPC-Web](references/grpc-web.md)。

## 目录结构

见 [README](README.md) 的目录说明。

## 不做

- ❌ gRPC Gateway 配置（可选，参考 references/grpc-web.md）
- ❌ 服务注册与发现（consul / etcd，可扩展）
- ❌ 链路追踪（opentelemetry，可扩展）
- ❌ 负载均衡策略（client-side / server-side）
- ❌ 生产级 TLS 证书管理

---

## 相关 Skill

| Skill | 关系 |
|-------|------|
| `go-gin-init-skill` | HTTP 服务初始化 |
| `go-auth-module-skill` | JWT 认证（复用本技能的 Token 校验逻辑）|
| `database-design-skill` | gRPC 服务的数据层设计 |
| `backend-convention-skill` | 响应格式 / 错误码规范 |
