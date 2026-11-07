# gRPC-Web：浏览器端方案

## 为什么需要 gRPC-Web

gRPC 基于 HTTP/2，浏览器不支持直接调用。需要通过 **gRPC-Web** 转成 HTTP/1.1 或 HTTP/2。

## 架构

```
浏览器 (gRPC-Web)
        ↓ HTTP/1.1
Proxy (Envoy / nginx)
        ↓ HTTP/2
gRPC 服务
```

## 两种模式

### 1. Envoy 代理（推荐）

```yaml
# envoy.yaml
static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address:
          address: 0.0.0.0
          port_value: 8080
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                codec_type: AUTO
                stat_prefix: grpc_web
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: local_service
                      domains: ["*"]
                      routes:
                        - match: { prefix: "/helloworld.Greeter" }
                          route:
                            cluster: grpc_service
                            timeout: 0s
                http_filters:
                  - name: envoy.filters.http.grpc_web
                  - name: envoy.filters.http.router

  clusters:
    - name: grpc_service
      type: STATIC
      lb_policy: ROUND_ROBIN
      hosts:
        - socket_address:
            address: 127.0.0.1
            port_value: 50051
```

### 2. nginx（需额外模块）

```nginx
location /helloworld.Greeter {
    # grpc-Web 需要特殊 header
    grpc_set_header Content-Type application/grpc-web+proto;
    grpc_pass grpc://localhost:50051;
}
```

## 客户端生成

```bash
# 安装 protoc-gen-grpc-web
go install github.com/grpc/grpc-web/cmd/protoc-gen-grpc-web@latest

# 生成 JavaScript 客户端
protoc --proto_path=. \
    --js_out=import_style=commonjs:. \
    --grpc-web_out=module=commonjs:. \
    proto/hello.proto
```

## 前端调用

```javascript
import { GreeterClient } from './proto/helloworld_grpc_web_pb';
import { HelloRequest } from './proto/hello_pb';

const client = new GreeterClient('http://localhost:8080');

const request = new HelloRequest();
request.setName('world');

client.sayHello(request, {}, (err, response) => {
    console.log(response.getMessage());
});
```

## 支持情况

| 特性 | Envoy | nginx | 直接浏览器 |
|------|-------|--------|----------|
| Unary | ✅ | ✅ | ✅ (限制) |
| Server Streaming | ✅ | ❌ | ❌ |
| Client Streaming | ❌ | ❌ | ❌ |
| Bidirectional | ❌ | ❌ | ❌ |

## 替代方案：gRPC-JSON Gateway

如果不需要流式，可以用 **gRPC-JSON Gateway** 转成 REST：

```bash
# 安装
go install github.com/grpc-ecosystem/grpc-gateway/v2/cmd/grpc-gateway@latest

# 生成
protoc --proto_path=. \
    --grpc-gateway_out=logtostderr=true:. \
    proto/hello.proto

# 生成 REST OpenAPI
protoc --proto_path=. \
    --openapiv2_out=:. \
    proto/hello.proto
```

## 使用建议

| 场景 | 推荐方案 |
|------|---------|
| 纯浏览器 | gRPC-Web + Envoy |
| 需要 REST 兼容性 | gRPC-JSON Gateway |
| 微服务内部 | 直接 gRPC |
| 移动端 | 直接 gRPC（HTTP/2） |
