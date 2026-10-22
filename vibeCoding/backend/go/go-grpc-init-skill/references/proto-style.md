# .proto 命名规范

## 文件组织

### Package 命名

```protobuf
// 推荐：小写 + 下划线
package user_service;

// 不推荐
package UserService;
package user.service;
```

### Option 配置

```protobuf
option go_package = "github.com/your-org/user-service/proto/user";
option java_package = "com.example.user";
option java_multiple_files = true;
```

## 消息命名

### Message 命名

| 类型 | 规范 | 示例 |
|------|------|------|
| Request | `OperationRequest` | `CreateUserRequest`、`GetUserRequest` |
| Response | `OperationResponse` | `CreateUserResponse`、`GetUserResponse` |
| 列表 | `OperationListResponse` | `ListUsersResponse` |
| 流 | `OperationStreamRequest` | `UploadStreamRequest` |

### Field 命名

```protobuf
// 推荐：下划线
message User {
  string user_id = 1;
  string user_name = 2;
  int32 age = 3;
  bool is_active = 4;
}

// 不推荐：驼峰（虽然 proto3 允许，但 Go 生成代码会不一致）
message User {
  string userId = 1;
  string userName = 2;
}
```

### Field Number

| 范围 | 用途 |
|------|------|
| 1-15 | 常用字段（只用 1 字节编码） |
| 16-2047 | 次常用字段 |
| 19000-19999 | 保留（Protobuf 内部使用） |

```protobuf
message User {
  // 常用字段
  string user_id = 1;      // 1 字节
  string user_name = 2;    // 1 字节

  // 次常用
  string bio = 16;         // 2 字节
  repeated string tags = 17;
}
```

### Repeated / Optional

```protobuf
message User {
  // 列表
  repeated string phone_numbers = 1;

  // 可选（proto3 不需要 explicit optional 关键字）
  string nickname = 2;  // nil = 未设置
}
```

## 服务命名

### Service 命名

```protobuf
// 推荐：驼峰 + Service 尾缀
service UserService { }
service OrderService { }
service GreeterService { }

// 不推荐
service user_service { }
service UserAPI { }
```

### RPC 命名

```protobuf
service UserService {
  // CRUD 操作
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc GetUser(GetUserRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc DeleteUser(DeleteUserRequest) returns (Empty);

  // 列表操作
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);

  // 流操作
  rpc UploadUsers(stream UploadUsersRequest) returns (UploadUsersResponse);
  rpc WatchUsers(Empty) returns (stream User);
}
```

### 动词选择

| 操作 | 动词 | 示例 |
|------|------|------|
| 查询单个 | Get | GetUser、GetOrder |
| 查询列表 | List | ListUsers、ListOrders |
| 创建 | Create | CreateUser |
| 更新 | Update | UpdateUser |
| 删除 | Delete | DeleteUser |
| 流式上传 | Upload | UploadFile |
| 流式下载 | Download | DownloadFile |
| 订阅 | Watch / Subscribe | WatchUsers |

## 枚举命名

```protobuf
// 推荐：全大写 + 下划线
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;
  USER_ROLE_ADMIN = 1;
  USER_ROLE_USER = 2;
  USER_ROLE_GUEST = 3;
}

// 不推荐
enum UserRole {
  Admin = 1;
  User = 2;
}
```

## 导入

### 公共类型

```protobuf
import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";
import "google/protobuf/wrappers.proto";

// 使用
import "google/protobuf/timestamp.proto";

message User {
  google.protobuf.Timestamp created_at = 1;
  google.protobuf.Timestamp updated_at = 2;
}
```

### 导入路径

```protobuf
// 相对导入（推荐）
import "proto/user.proto";

// 绝对导入（需配置 proto_path）
import "github.com/your-org/proto/user.proto";
```

## 最佳实践

### 1. 保持向后兼容

```protobuf
// 永远不要复用 field number
message User {
  string name = 1;      // 不要改成其他类型
  // ...
}

// 添加新字段用新 number
message User {
  string name = 1;
  string nickname = 2;  // 新增
}
```

### 2. 使用 wrapper 类型

```protobuf
import "google/protobuf/wrappers.proto";

message CreateUserRequest {
  google.protobuf.StringValue nickname = 1;  // 可选字符串
  google.protobuf.Int32Value age = 2;      // 可选整型
}
```

### 3. 避免 oneof 滥用

```protobuf
// 不推荐
message Event {
  oneof event_type {
    UserCreated user_created = 1;
    OrderPlaced order_placed = 2;
    PaymentFailed payment_failed = 3;
  }
}

// 推荐：明确分离
message Event {
  EventType type = 1;
  oneof payload {
    UserCreated user_created = 2;
    OrderPlaced order_placed = 3;
  }
}
```

### 4. 文档注释

```protobuf
// 用户信息
message User {
  // 用户唯一标识
  string user_id = 1;

  // 显示名称
  string display_name = 2;
}

// 创建用户请求
message CreateUserRequest {
  string username = 1;  // 用户名（唯一）
  string password = 2;  // 密码
}
```

## 与 Go 生成代码对应

| .proto | Go 生成 | 说明 |
|--------|---------|------|
| `user_id` | `UserId` | 驼峰 |
| `user_name` | `UserName` | 驼峰 |
| `created_at` | `CreatedAt` | 驼峰 |
| `USER_ROLE_ADMIN` | `UserRoleAdmin` | 全大写 → 驼峰 |

## 验证工具

```bash
# 检查 proto 语法
protoc --proto_path=. --descriptor_set_out=proto.pb your.proto

# Go 生成后检查
protoc --go_out=. --go_opt=paths=source_relative your.proto
```
