---
name: go-grpc-init-skill
description: Go gRPC 服务初始化技能。面向需要构建高性能 RPC 服务的开发者，提供 .proto 定义、4 种流模式（Unary/Server/Client/Bidirectional）、服务端骨架、客户端封装、拦截器链、JWT 认证、错误码映射等。与 wg-skills 协议对齐（camelCase + 负数错误码 -1001~-2000）。触发词："Go gRPC"、"grpc 服务"、"Protocol Buffers"、"微服务通信"、"流式 RPC"、"双向流"、"Unary"、"grpc 拦截器"、"grpc 认证"。
---

# Go gRPC Init Skill

Go gRPC 服务初始化技能，面向需要构建**高性能 RPC 服务**或**微服务通信**的开发者。

> gRPC 是 Google 开源的高性能 RPC 框架，基于 HTTP/2 + Protocol Buffers，**国内中大厂 80% 在用**。

## 能力清单

| 能力 | 说明 | 难度 |
|------|------|------|
| **.proto 定义** | 消息 + 服务 + 4 种 RPC 模式 | ⭐ |
| **服务端骨架** | 拦截器链 + 日志 + 错误处理 + 启动脚本 | ⭐⭐ |
| **客户端封装** | 重试 / 熔断 / 超时 / 连接池 | ⭐⭐ |
| **JWT 认证** | 拦截器 + Token 校验 + 鉴权 | ⭐⭐ |
| **流模式** | Server Streaming / Client Streaming / Bidirectional | ⭐⭐⭐ |
| **错误码映射** | gRPC status code ↔ wg-skills 负数错误码 | ⭐⭐ |
| **健康检查** | gRPC Health Check Protocol | ⭐ |
| **拦截器链** | 日志 / 认证 / 错误转换 / 链路追踪 | ⭐⭐ |

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
| 性能 | 中 | **高 5-10 倍**（二进制序列化） |
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

### 1. 安装 protoc 和 Go 插件

```bash
# macOS
brew install protobuf
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# 验证
protoc --version
protoc-gen-go-grpc --version
```

### 2. 生成代码

```bash
# 在项目根目录运行
./scripts/proto-gen.sh

# 或手动
protoc --go_out=. --go_opt=paths=source_relative \
       --go-grpc_out=. --go-grpc_opt=paths=source_relative \
       proto/hello.proto
```

### 3. 启动服务

```bash
# 终端 1：启动 gRPC 服务
go run cmd/server/main.go

# 终端 2：启动 gRPC Gateway（可选，HTTP 兼容）
go run cmd/gateway/main.go
```

### 4. 测试

```bash
#Unary 调用
grpcurl -plaintext localhost:50051 helloworld.Greeter/SayHello \
  -d '{"name": "world"}'

# Server Streaming
grpcurl -plaintext localhost:50051 helloworld.Greeter/SayHelloStream \
  -d '{"name": "stream"}'
```

---

## .proto 文件定义

### 基础服务模板（hello.proto）

```protobuf
syntax = "proto3";

package helloworld;

option go_package = "github.com/your-org/hello-service/proto/helloworld";

import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";

// ============== 消息定义 ==============

message HelloRequest {
  string name = 1;           // 必填
  map<string, string> meta = 2; // 可选元数据
}

message HelloReply {
  string message = 1;
  int32 code = 2;            // 0=成功，非0=错误
  string error = 3;          // 错误信息
  google.protobuf.Timestamp timestamp = 4;
}

// ============== 流模式消息 ==============

message StreamRequest {
  string query = 1;
  int32 page_size = 2;
}

message StreamResponse {
  string data = 1;
  bool is_final = 2;
}

// ============== 服务定义 ==============

service Greeter {
  // Unary: 普通调用
  rpc SayHello(HelloRequest) returns (HelloReply);

  // Server Streaming: 服务端流
  rpc SayHelloStream(HelloRequest) returns (stream HelloReply);

  // Client Streaming: 客户端流
  rpc Upload stream (stream HelloRequest) returns (HelloReply);

  // Bidirectional Streaming: 双向流
  rpc Chat(stream HelloRequest) returns (stream HelloReply);

  // 健康检查（标准接口）
  rpc Check(google.protobuf.Empty) returns (HealthCheckResponse);
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
  }
  ServingStatus status = 1;
}
```

### 命名规范（重要）

| 元素 | 规范 | 示例 |
|------|------|------|
| Package | 小写 + 下划线 | `helloworld`、`user_service` |
| Message | 驼峰 | `HelloRequest`、`UserInfo` |
| Field | 下划线 | `user_name`、`created_at` |
| Service | 驼峰 + Service 尾缀 | `GreeterService`、`UserService` |
| RPC | 动词 + 名词 | `GetUser`、`CreateOrder`、`SayHello` |
| Enum | 全大写 + 下划线 | `STATUS_OK`、`USER_ROLE` |
| Option | 下划线 | `go_package`、`java_package` |

---

## 服务端实现

### main.go（入口）

```go
package main

import (
    "log"
    "net"

    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials"
    "google.golang.org/grpc/health"
    "google.golang.org/grpc/health/grpc_health_v1"
    "google.golang.org/grpc/reflection"

    "github.com/your-org/hello-service/internal/config"
    "github.com/your-org/hello-service/internal/interceptors"
    "github.com/your-org/hello-service/proto/helloworld"
)

func main() {
    // 1. 监听端口
    lis, err := net.Listen("tcp", ":"+config.Port)
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }

    // 2. 创建 gRPC Server（带拦截器）
    server := grpc.NewServer(
        grpc.ChainUnaryInterceptor(
            interceptors.Logger(),       // 日志拦截器
            interceptors.Recovery(),    // panic 恢复
            interceptors.Validation(),   // 请求校验
            interceptors.Auth(),         // JWT 认证（生产环境开启）
        ),
        grpc.ChainStreamInterceptor(
            interceptors.StreamLogger(),
            interceptors.StreamRecovery(),
        ),
        grpc.Credentials(credentials.NewServerTLSFromCert(config.Cert, config.Key)),
    )

    // 3. 注册服务
    helloworld.RegisterGreeterServer(server, &GreeterServer{})

    // 4. 注册健康检查
    healthServer := health.NewServer()
    grpc_health_v1.RegisterHealthServer(server, healthServer)
    healthServer.SetServingStatus("", grpc_health_v1.HealthCheckResponse_SERVING)

    // 5. 启用反射（开发用，可选）
    reflection.Register(server)

    // 6. 启动
    log.Printf("gRPC server listening on %s", config.Port)
    if err := server.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

### GreeterServer（业务逻辑）

```go
package main

import (
    "io"
    "log"
    "time"

    "google.golang.org/protobuf/types/known/emptypb"
    "google.golang.org/grpc"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"

    pb "github.com/your-org/hello-service/proto/helloworld"
)

type GreeterServer struct {
    pb.UnimplementedGreeterServer
}

// Unary: 普通调用
func (s *GreeterServer) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
    if req.Name == "" {
        return nil, status.Error(codes.InvalidArgument, "name is required")
    }

    return &pb.HelloReply{
        Message:   "Hello, " + req.Name + "!",
        Code:      0,
        Timestamp: timestampNow(),
    }, nil
}

// Server Streaming: 服务端流
func (s *GreeterServer) SayHelloStream(req *pb.HelloRequest, stream pb.Greeter_SayHelloStreamServer) error {
    for i := 0; i < 5; i++ {
        if err := stream.Send(&pb.HelloReply{
            Message:   "Hello, " + req.Name + " #" + string(rune('0'+i)),
            Code:      0,
            Timestamp: timestampNow(),
        }); err != nil {
            return err
        }
        time.Sleep(time.Second)
    }
    return nil
}

// Client Streaming: 客户端流
func (s *GreeterServer) Upload(stream pb.Greeter_UploadServer) error {
    var names []string
    for {
        req, err := stream.Recv()
        if err == io.EOF {
            // 客户端发送完毕
            return stream.SendAndClose(&pb.HelloReply{
                Message: "Received: " + join(names),
                Code:    0,
            })
        }
        if err != nil {
            return err
        }
        names = append(names, req.Name)
    }
}

// Bidirectional Streaming: 双向流
func (s *GreeterServer) Chat(stream pb.Greeter_ChatServer) error {
    for {
        req, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        if err != nil {
            return err
        }

        // 处理并响应
        resp := &pb.HelloReply{
            Message:   "Echo: " + req.Name,
            Code:      0,
            Timestamp: timestampNow(),
        }

        if err := stream.Send(resp); err != nil {
            return err
        }
    }
}

// 健康检查
func (s *GreeterServer) Check(ctx context.Context, req *emptypb.Empty) (*grpc_health_v1.HealthCheckResponse, error) {
    return &grpc_health_v1.HealthCheckResponse{
        Status: grpc_health_v1.HealthCheckResponse_SERVING,
    }, nil
}

func timestampNow() *timestamp.Timestamp {
    now := time.Now()
    return &timestamp.Timestamp{Seconds: now.Unix(), Nanos: int32(now.Nanosecond())}
}
```

---

## 客户端实现

### client.go（封装）

```go
package main

import (
    "context"
    "time"

    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials"
    "google.golang.org/grpc/credentials/insecure"
    "google.golang.org/grpc/resolver"
    "google.golang.org/grpc/resolver/manual"

    "github.com/your-org/hello-service/internal/config"
    pb "github.com/your-org/hello-service/proto/helloworld"
)

type GrpcClient struct {
    conn   *grpc.ClientConn
    client pb.GreeterClient
}

func NewGrpcClient() (*GrpcClient, error) {
    // 1. 创建连接（支持重试 / 负载均衡）
    var opts []grpc.DialOption

    // 认证
    if config.UseTLS {
        opts = append(opts, grpc.WithTransportCredentials(credentials.NewClientTLSFromCert(nil, config.ServerName)))
    } else {
        opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
    }

    // 重试策略
    opts = append(opts, grpc.WithDefaultServiceConfig(`{
        "methodConfig": [{
            "name": [{"service": "helloworld.Greeter"}],
            "retryPolicy": {
                "maxAttempts": 3,
                "initialBackoff": "0.1s",
                "maxBackoff": "1s",
                "backoffMultiplier": 2.0,
                "retryableStatusCodes": ["UNAVAILABLE", "RESOURCE_EXHAUSTED"]
            }
        }]
    }`))

    // 超时
    opts = append(opts, grpc.WithTimeout(5*time.Second))

    // 连接
    conn, err := grpc.Dial(config.Address, opts...)
    if err != nil {
        return nil, err
    }

    return &GrpcClient{
        conn:   conn,
        client: pb.NewGreeterClient(conn),
    }, nil
}

func (c *GrpcClient) SayHello(ctx context.Context, name string) (*pb.HelloReply, error) {
    return c.client.SayHello(ctx, &pb.HelloRequest{Name: name})
}

func (c *GrpcClient) SayHelloStream(ctx context.Context, name string) error {
    stream, err := c.client.SayHelloStream(ctx, &pb.HelloRequest{Name: name})
    if err != nil {
        return err
    }

    for {
        resp, err := stream.Recv()
        if err != nil {
            break
        }
        log.Println(resp.Message)
    }
    return nil
}

func (c *GrpcClient) Close() error {
    return c.conn.Close()
}
```

### 使用示例

```go
func main() {
    client, err := NewGrpcClient()
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Unary 调用
    resp, err := client.SayHello(context.Background(), "world")
    if err != nil {
        log.Fatal(err)
    }
    log.Println(resp.Message)

    // Server Streaming
    err = client.SayHelloStream(context.Background(), "stream")
    if err != nil {
        log.Fatal(err)
    }
}
```

---

## 拦截器链

### 拦截器分类

| 类型 | 作用 | 场景 |
|------|------|------|
| **Unary** | 普通调用的前后处理 | 日志 / 鉴权 / 错误转换 |
| **Stream** | 流式调用的前后处理 | 同上 |
| **Server** | 服务端拦截 | 所有请求 |
| **Client** | 客户端拦截 | 所有响应 |

### 核心拦截器实现

```go
package interceptors

import (
    "context"
    "log"
    "time"

    "google.golang.org/grpc"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

// Logger 日志拦截器
func Logger() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        start := time.Now()

        // 前置日志
        log.Printf("[gRPC] %s 请求: %v", info.FullMethod, req)

        // 调用业务
        resp, err := handler(ctx, req)

        // 后置日志
        duration := time.Since(start)
        if err != nil {
            log.Printf("[gRPC] %s 错误: %v 耗时: %v", info.FullMethod, err, duration)
        } else {
            log.Printf("[gRPC] %s 成功 耗时: %v", info.FullMethod, duration)
        }

        return resp, err
    }
}

// Recovery panic 恢复
func Recovery() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
        defer func() {
            if r := recover(); r != nil {
                err = status.Errorf(codes.Internal, "panic: %v", r)
            }
        }()
        return handler(ctx, req)
    }
}

// Validation 请求校验
func Validation() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        // 这里可以加业务校验逻辑
        // 例如：校验 req 实现了 validator interface
        return handler(ctx, req)
    }
}

// Auth JWT 认证（生产环境开启）
func Auth() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        // 从 metadata 取 token
        md, ok := metadata.FromIncomingContext(ctx)
        if !ok {
            return nil, status.Error(codes.Unauthenticated, "missing metadata")
        }

        token := md.Get("authorization")
        if len(token) == 0 {
            return nil, status.Error(codes.Unauthenticated, "missing token")
        }

        // 校验 JWT（复用 wg-skills auth 模块的 JWT 逻辑）
        claims, err := validateJWT(token[0])
        if err != nil {
            return nil, status.Error(codes.Unauthenticated, "invalid token")
        }

        // 注入 user_id 到 context
        ctx = context.WithValue(ctx, "user_id", claims.UserID)
        return handler(ctx, req)
    }
}
```

---

## 错误码映射

gRPC status code 与 wg-skills 负数错误码的映射：

```go
package errors

import (
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

// gRPC status code → wg-skills 负数错误码
var CodeMapping = map[codes.Code]int32{
    codes.OK:                 0,
    codes.Canceled:          -1,
    codes.Unknown:           -2000,   // 系统异常
    codes.InvalidArgument:   -1001,   // 参数错误
    codes.DeadlineExceeded: -1002,   // 超时
    codes.NotFound:         -1004,    // 资源不存在
    codes.AlreadyExists:    -1004,   // 资源已存在
    codes.PermissionDenied: -1003,    // 无权限
    codes.ResourceExhausted: -1005,   // 资源耗尽
    codes.FailedPrecondition: -1001,  // 前置条件不满足
    codes.Aborted:          -1005,    // 操作中止
    codes.OutOfRange:       -1001,    // 范围越界
    codes.Unimplemented:    -2000,   // 未实现
    codes.Internal:          -2000,   // 内部错误
    codes.Unavailable:      -2001,    // 服务不可用
    codes.DataLoss:         -2000,   // 数据丢失
    codes.Unauthenticated:  -1002,   // 未登录
}

// ToGRPCCode wg-skills 错误码 → gRPC status code
func ToGRPCCode(code int32) codes.Code {
    for grpcCode, wgCode := range CodeMapping {
        if wgCode == code {
            return grpcCode
        }
    }
    return codes.Unknown
}

// Error 包装错误
func Error(code int32, msg string) error {
    return status.Error(ToGRPCCode(code), msg)
}

// FromGRPCError 转换 gRPC 错误为 wg-skills 错误码
func FromGRPCError(err error) (int32, string) {
    st, ok := status.FromError(err)
    if !ok {
        return -2000, err.Error()
    }
    return CodeMapping[st.Code()], st.Message()
}
```

**调用方使用**：

```go
resp, err := client.SayHello(ctx, req)
if err != nil {
    code, msg := errors.FromGRPCError(err)
    log.Printf("错误码: %d, 消息: %s", code, msg)
}
```

---

## 与 wg-skills 协议对齐

### 响应格式

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int32 | 0=成功，负数=错误（-1001~-2000） |
| message | string | 描述信息 |
| data | 任意 | 业务数据 |

### 字段命名

- .proto 定义：**下划线**（`user_name`）
- Go 生成代码：**驼峰**（`UserName`）—— `go_package` 带 `M` 前缀
- JSON 响应：**驼峰**——gRPC-JSON 转码自动处理

### JWT 复用

```protobuf
// auth.proto
message LoginRequest {
  string username = 1;
  string password = 2;
}

message LoginResponse {
  string token = 1;      // JWT
  int64 expires_at = 2; // 过期时间戳
}
```

---

## 目录结构

```
go-grpc-init-skill/
├── SKILL.md
├── README.md
├── templates/
│   ├── proto/
│   │   ├── hello.proto          # 基础示例
│   │   ├── auth.proto           # 认证服务
│   │   └── streaming.proto       # 4 种流模式
│   ├── server/
│   │   ├── main.go              # 服务端入口
│   │   ├── greeter.go           # 业务实现
│   │   └── interceptors.go      # 拦截器
│   ├── client/
│   │   ├── main.go              # 客户端入口
│   │   └── client.go            # 封装
│   └── scripts/
│       └── proto-gen.sh          # 代码生成脚本
├── references/
│   ├── proto-style.md           # .proto 命名规范
│   ├── interceptor.md           # 拦截器详解
│   ├── grpc-web.md              # 浏览器端方案
│   └── error-codes.md           # 错误码映射
└── api-contract-grpc.md        # API 契约文档
```

---

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
