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

	// 2. 创建 gRPC Server（带拦截器链）
	var serverOptions []grpc.ServerOption

	// TLS 认证（生产环境开启）
	if config.UseTLS {
		creds, err := credentials.NewServerTLSFromFile(config.Cert, config.Key)
		if err != nil {
			log.Fatalf("failed to load TLS cert: %v", err)
		}
		serverOptions = append(serverOptions, grpc.Credentials(creds))
	}

	// 拦截器链
	serverOptions = append(serverOptions,
		grpc.ChainUnaryInterceptor(
			interceptors.Logger(),       // 日志
			interceptors.Recovery(),    // panic 恢复
			interceptors.Validation(),   // 请求校验
			interceptors.Auth(),        // JWT 认证（生产环境开启）
		),
		grpc.ChainStreamInterceptor(
			interceptors.StreamLogger(),
			interceptors.StreamRecovery(),
		),
	)

	server := grpc.NewServer(serverOptions...)

	// 3. 注册服务
	helloworld.RegisterGreeterServer(server, &GreeterServer{})

	// 4. 注册健康检查
	healthServer := health.NewServer()
	grpc_health_v1.RegisterHealthServer(server, healthServer)
	healthServer.SetServingStatus("", grpc_health_v1.HealthCheckResponse_SERVING)

	// 5. 启用反射（开发环境）
	reflection.Register(server)

	// 6. 启动
	log.Printf("gRPC server listening on %s (TLS: %v)", config.Port, config.UseTLS)
	if err := server.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
