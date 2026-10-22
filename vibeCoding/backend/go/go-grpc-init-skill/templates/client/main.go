package main

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/your-org/hello-service/internal/config"
	pb "github.com/your-org/hello-service/proto/helloworld"
)

// GrpcClient gRPC 客户端封装
type GrpcClient struct {
	conn   *grpc.ClientConn
	client pb.GreeterClient
}

// NewGrpcClient 创建 gRPC 客户端
func NewGrpcClient() (*GrpcClient, error) {
	var opts []grpc.DialOption

	// 1. 传输认证
	if config.UseTLS {
		opts = append(opts, grpc.WithTransportCredentials(
			credentials.NewClientTLSFromCert(nil, config.ServerName),
		))
	} else {
		opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	}

	// 2. 重试策略
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

	// 3. 超时
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	conn, err := grpc.DialContext(ctx, config.Address, opts...)
	if err != nil {
		return nil, err
	}

	return &GrpcClient{
		conn:   conn,
		client: pb.NewGreeterClient(conn),
	}, nil
}

// SayHello Unary 调用
func (c *GrpcClient) SayHello(ctx context.Context, name string) (*pb.HelloReply, error) {
	return c.client.SayHello(ctx, &pb.HelloRequest{Name: name})
}

// SayHelloStream Server Streaming 调用
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

// Upload Client Streaming 调用
func (c *GrpcClient) Upload(ctx context.Context, names []string) (*pb.HelloReply, error) {
	stream, err := c.client.Upload(ctx)
	if err != nil {
		return nil, err
	}

	for _, name := range names {
		if err := stream.Send(&pb.HelloRequest{Name: name}); err != nil {
			return nil, err
		}
	}

	return stream.CloseAndRecv()
}

// Chat Bidirectional Streaming 调用
func (c *GrpcClient) Chat(ctx context.Context, messages []string) error {
	stream, err := c.client.Chat(ctx)
	if err != nil {
		return err
	}

	// 并发收发
	done := make(chan struct{})

	// 接收
	go func() {
		for {
			resp, err := stream.Recv()
			if err != nil {
				break
			}
			log.Println("收到:", resp.Message)
		}
		close(done)
	}()

	// 发送
	for _, msg := range messages {
		if err := stream.Send(&pb.HelloRequest{Name: msg}); err != nil {
			return err
		}
	}
	stream.CloseSend()

	<-done
	return nil
}

// Close 关闭连接
func (c *GrpcClient) Close() error {
	return c.conn.Close()
}

func main() {
	client, err := NewGrpcClient()
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	ctx := context.Background()

	// Unary
	resp, err := client.SayHello(ctx, "world")
	if err != nil {
		log.Fatal(err)
	}
	log.Println(resp.Message)
}
