# gRPC 错误码与 wg-skills 错误码映射

## 错误码体系

### gRPC Status Code

| Code | 说明 |
|------|------|
| OK | 成功 |
| CANCELLED | 客户端取消 |
| UNKNOWN | 未知错误 |
| INVALID_ARGUMENT | 参数错误 |
| DEADLINE_EXCEEDED | 超时 |
| NOT_FOUND | 资源不存在 |
| ALREADY_EXISTS | 资源已存在 |
| PERMISSION_DENIED | 权限不足 |
| RESOURCE_EXHAUSTED | 资源耗尽 |
| FAILED_PRECONDITION | 前置条件不满足 |
| ABORTED | 操作中止 |
| OUT_OF_RANGE | 范围越界 |
| UNIMPLEMENTED | 未实现 |
| INTERNAL | 内部错误 |
| UNAVAILABLE | 服务不可用 |
| DATA_LOSS | 数据丢失 |
| UNAUTHENTICATED | 未认证 |

### wg-skills 错误码（-1001 ~ -2000）

| Code | 说明 |
|------|------|
| -1001 | 参数错误 |
| -1002 | 未登录 / 认证失败 |
| -1003 | 无权限 |
| -1004 | 资源不存在 / 已存在 |
| -1005 | 数据权限越界 |
| -2000 | 系统异常 |
| -2001 | 服务不可用 |

## 映射表

### gRPC → wg-skills

| gRPC Code | wg-skills Code | 说明 |
|-----------|----------------|------|
| OK | 0 | 成功 |
| CANCELLED | -1 | 客户端取消 |
| UNKNOWN | -2000 | 未知错误 |
| INVALID_ARGUMENT | -1001 | 参数错误 |
| DEADLINE_EXCEEDED | -1002 | 超时 |
| NOT_FOUND | -1004 | 资源不存在 |
| ALREADY_EXISTS | -1004 | 资源已存在 |
| PERMISSION_DENIED | -1003 | 无权限 |
| RESOURCE_EXHAUSTED | -1005 | 资源耗尽 |
| FAILED_PRECONDITION | -1001 | 前置条件不满足 |
| ABORTED | -1005 | 操作中止 |
| OUT_OF_RANGE | -1001 | 范围越界 |
| UNIMPLEMENTED | -2000 | 未实现 |
| INTERNAL | -2000 | 内部错误 |
| UNAVAILABLE | -2001 | 服务不可用 |
| DATA_LOSS | -2000 | 数据丢失 |
| UNAUTHENTICATED | -1002 | 未认证 |

### wg-skills → gRPC

| wg-skills Code | gRPC Code | 说明 |
|----------------|-----------|------|
| 0 | OK | 成功 |
| -1001 | INVALID_ARGUMENT | 参数错误 |
| -1002 | UNAUTHENTICATED | 未登录 |
| -1003 | PERMISSION_DENIED | 无权限 |
| -1004 | NOT_FOUND | 资源不存在 |
| -1005 | RESOURCE_EXHAUSTED | 资源越界 |
| -2000 | UNKNOWN | 系统异常 |
| -2001 | UNAVAILABLE | 服务不可用 |

## Go 实现

### 错误包装

```go
package grpcer

import (
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

// CodeMapping gRPC → wg-skills
var CodeMapping = map[codes.Code]int32{
    codes.OK:                 0,
    codes.Canceled:          -1,
    codes.Unknown:           -2000,
    codes.InvalidArgument:   -1001,
    codes.DeadlineExceeded: -1002,
    codes.NotFound:         -1004,
    codes.AlreadyExists:     -1004,
    codes.PermissionDenied: -1003,
    codes.ResourceExhausted: -1005,
    codes.FailedPrecondition: -1001,
    codes.Aborted:          -1005,
    codes.OutOfRange:       -1001,
    codes.Unimplemented:    -2000,
    codes.Internal:          -2000,
    codes.Unavailable:      -2001,
    codes.DataLoss:         -2000,
    codes.Unauthenticated:  -1002,
}

// ToGRPCCode wg-skills → gRPC
func ToGRPCCode(code int32) codes.Code {
    switch code {
    case 0:
        return codes.OK
    case -1001:
        return codes.InvalidArgument
    case -1002:
        return codes.Unauthenticated
    case -1003:
        return codes.PermissionDenied
    case -1004:
        return codes.NotFound
    case -1005:
        return codes.ResourceExhausted
    case -2000:
        return codes.Unknown
    case -2001:
        return codes.Unavailable
    default:
        return codes.Unknown
    }
}

// Error 包装 wg-skills 错误码为 gRPC 错误
func Error(code int32, msg string) error {
    return status.Error(ToGRPCCode(code), msg)
}

// FromGRPCError 提取 gRPC 错误的 wg-skills 错误码
func FromGRPCError(err error) (int32, string) {
    st, ok := status.FromError(err)
    if !ok {
        return -2000, err.Error()
    }
    return CodeMapping[st.Code()], st.Message()
}
```

### 服务端使用

```go
import "grpcer"

func (s *UserService) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.db.GetUser(req.UserId)
    if err == sql.ErrNoRows {
        return nil, grpcer.Error(-1004, "user not found")
    }
    if err != nil {
        return nil, grpcer.Error(-2000, "internal error: "+err.Error())
    }
    return user, nil
}
```

### 客户端使用

```go
resp, err := client.GetUser(ctx, req)
if err != nil {
    code, msg := grpcer.FromGRPCError(err)
    switch code {
    case -1004:
        fmt.Println("用户不存在")
    case -1003:
        fmt.Println("无权限")
    case -2001:
        fmt.Println("服务不可用，请稍后重试")
    default:
        fmt.Printf("错误: %s (code: %d)\n", msg, code)
    }
}
```

## 错误码规范

1. **业务错误用 -1001 ~ -1999**：业务层面的可预期错误
2. **系统错误用 -2000 ~ -2999**：技术层面的不可预期错误
3. **gRPC 错误透传**：服务间调用直接透传原始错误码
4. **日志记录**：所有错误都需要记录日志（包含错误码）

## 与 HTTP 状态码对应

| HTTP | gRPC | wg-skills | 说明 |
|------|------|-----------|------|
| 200 | OK | 0 | 成功 |
| 400 | INVALID_ARGUMENT | -1001 | 参数错误 |
| 401 | UNAUTHENTICATED | -1002 | 未登录 |
| 403 | PERMISSION_DENIED | -1003 | 无权限 |
| 404 | NOT_FOUND | -1004 | 资源不存在 |
| 429 | RESOURCE_EXHAUSTED | -1005 | 请求过多 |
| 500 | INTERNAL | -2000 | 服务器错误 |
| 503 | UNAVAILABLE | -2001 | 服务不可用 |
