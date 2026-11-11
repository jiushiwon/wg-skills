# Go gRPC Init Skill

Go gRPC 服务初始化技能，面向需要构建**高性能 RPC 服务**或**微服务通信**的开发者。

## 功能

- 4 种 RPC 模式（Unary / Server Streaming / Client Streaming / Bidirectional）
- 可运行服务端骨架 + 拦截器参考
- 客户端封装与调用超时
- JWT 认证接入参考
- 错误码映射（gRPC ↔ wg-skills）
- 健康检查

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
| 服务端骨架 | 四种 RPC 与健康检查 |
| 客户端封装 | 调用超时与连接关闭 |
| JWT 认证 | 拦截器接入参考，复用项目 Token 校验 |
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
│   ├── go.mod           # Go 模块与依赖
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
