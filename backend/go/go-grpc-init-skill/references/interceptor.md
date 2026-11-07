# gRPC 拦截器详解

## 拦截器分类

| 类型 | 作用 | 适用场景 |
|------|------|---------|
| **Unary** | 普通 RPC 调用前后处理 | 日志、认证、校验 |
| **Stream** | 流式调用前后处理 | 同上 |
| **Server** | 服务端所有请求 | 全局处理 |
| **Client** | 客户端所有请求 | 全局处理 |

## 服务端拦截器链

```go
server := grpc.NewServer(
    grpc.ChainUnaryInterceptor(
        interceptors.Logger(),      // 1. 日志
        interceptors.Recovery(),   // 2. panic 恢复
        interceptors.Validation(),// 3. 参数校验
        interceptors.Auth(),     // 4. JWT 认证
    ),
    grpc.ChainStreamInterceptor(
        interceptors.StreamLogger(),
        interceptors.StreamRecovery(),
    ),
)
```

**执行顺序**：1 → 2 → 3 → 4 → 业务逻辑 → 4 → 3 → 2 → 1

## 核心拦截器实现

### 1. 日志拦截器

```go
func Logger() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        start := time.Now()

        // 前置：记录请求
        log.Printf("[REQ] %s %v", info.FullMethod, req)

        // 调用业务
        resp, err := handler(ctx, req)

        // 后置：记录响应
        duration := time.Since(start)
        if err != nil {
            log.Printf("[ERR] %s %v duration=%v", info.FullMethod, err, duration)
        } else {
            log.Printf("[OK] %s duration=%v", info.FullMethod, duration)
        }

        return resp, err
    }
}
```

### 2. Panic 恢复拦截器

```go
func Recovery() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
        defer func() {
            if r := recover(); r != nil {
                err = status.Errorf(codes.Internal, "panic: %v", r)
                // 上报监控系统
                sentry.CaptureException(fmt.Errorf("panic: %v", r))
            }
        }()
        return handler(ctx, req)
    }
}
```

### 3. 参数校验拦截器

```go
func Validation() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        // 方式 1：使用 protovalidate
        if validator, ok := req.(protovalidate.Validator); ok {
            if err := validator.Validate(); err != nil {
                return nil, status.Error(codes.InvalidArgument, err.Error())
            }
        }

        // 方式 2：自定义校验
        if req, ok := req.(interface{ Validate() error }); ok {
            if err := req.Validate(); err != nil {
                return nil, status.Error(codes.InvalidArgument, err.Error())
            }
        }

        return handler(ctx, req)
    }
}
```

### 4. JWT 认证拦截器

```go
func Auth() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        // 白名单
        if !requiresAuth(info.FullMethod) {
            return handler(ctx, req)
        }

        // 从 metadata 取 token
        md, ok := metadata.FromIncomingContext(ctx)
        if !ok {
            return nil, status.Error(codes.Unauthenticated, "missing metadata")
        }

        token := md.Get("authorization")
        if len(token) == 0 {
            return nil, status.Error(codes.Unauthenticated, "missing token")
        }

        // 解析 JWT（复用 go-auth-module-skill）
        claims, err := auth.ValidateJWT(token[0])
        if err != nil {
            return nil, status.Error(codes.Unauthenticated, "invalid token")
        }

        // 注入 context
        ctx = context.WithValue(ctx, "user_id", claims.UserID)
        ctx = context.WithValue(ctx, "user_role", claims.Role)

        return handler(ctx, req)
    }
}

func requiresAuth(method string) bool {
    whitelist := map[string]bool{
        "/grpc.health.v1.Health/Check": true,
        "/auth.Auth/Login":             true,
    }
    return !whitelist[method]
}
```

### 5. 错误转换拦截器

```go
func ErrorConverter() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        resp, err := handler(ctx, req)

        // 业务错误 → gRPC status
        if err != nil {
            if bizErr, ok := err.(BusinessError); ok {
                return nil, status.Error(ToGRPCCode(bizErr.Code), bizErr.Message)
            }
        }

        return resp, err
    }
}
```

## 客户端拦截器

### 1. 客户端日志拦截器

```go
// ClientLogger 客户端日志拦截器
func ClientLogger() grpc.UnaryClientInterceptor {
    return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
        start := time.Now()
        err := invoker(ctx, method, req, reply, cc, opts...)
        log.Printf("[CLIENT] %s duration=%v err=%v", method, time.Since(start), err)
        return err
    }
}

// 使用
conn, err := grpc.Dial(
    "localhost:50051",
    grpc.WithChainUnaryInterceptor(
        interceptors.ClientLogger(),
        interceptors.ClientAuth(),
    ),
)
```

### 2. 客户端重试拦截器

```go
// RetryInterceptor 客户端重试拦截器
func RetryInterceptor(maxAttempts int, backoff time.Duration) grpc.UnaryClientInterceptor {
    return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
        var lastErr error
        for i := 0; i < maxAttempts; i++ {
            if i > 0 {
                time.Sleep(backoff * time.Duration(i))
            }
            lastErr = invoker(ctx, method, req, reply, cc, opts...)
            if lastErr == nil {
                return nil
            }
            // 判断是否可重试
            if !isRetryable(lastErr) {
                return lastErr
            }
        }
        return lastErr
    }
}

func isRetryable(err error) bool {
    st, ok := status.FromError(err)
    if !ok {
        return false
    }
    return st.Code() == codes.Unavailable || st.Code() == codes.ResourceExhausted
}
```

## 流式拦截器

```go
// StreamLogger 流式日志拦截器
func StreamLogger() grpc.StreamServerInterceptor {
    return func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
        log.Printf("[STREAM] %s started", info.FullMethod)
        err := handler(srv, ss)
        log.Printf("[STREAM] %s finished err=%v", info.FullMethod, err)
        return err
    }
}
```

## 拦截器顺序建议

### 开发环境

```
Logger → Recovery → Validation
```

### 生产环境

```
Logger → Recovery → Validation → Auth → RateLimit → Tracing
```

## 常见问题

### Q1: 拦截器如何获取请求 ID？

```go
func Logger() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        // 从 header 取或生成
        requestID := uid.New().String()
        ctx = context.WithValue(ctx, "request_id", requestID)

        // 透传给后续拦截器和业务
        log.Printf("[%s] %s", requestID, info.FullMethod)
        return handler(ctx, req)
    }
}
```

### Q2: 如何跳过某些接口的拦截？

```go
func Auth() grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
        // 白名单
        skip := map[string]bool{
            "/health.Health/Check": true,
            "/auth.Auth/Login":    true,
        }
        if skip[info.FullMethod] {
            return handler(ctx, req)
        }
        // ... 认证逻辑
    }
}
```

### Q3: 拦截器如何传递数据？

```go
// 业务层获取拦截器设置的值
func (s *GreeterServer) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
    userID := ctx.Value("user_id")
    requestID := ctx.Value("request_id")
    log.Printf("user=%v request=%v", userID, requestID)
    // ...
}
```
