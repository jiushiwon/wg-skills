package main

import (
	"context"
	"io"
	"log"
	"os"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "github.com/your-org/hello-service/proto/helloworld"
)

// GrpcClient gRPC 客户端封装
type GrpcClient struct {
	conn   *grpc.ClientConn
	client pb.GreeterClient
}

// NewGrpcClient 创建 gRPC 客户端
func NewGrpcClient() (*GrpcClient, error) {
	address := os.Getenv("GRPC_ADDRESS")
	if address == "" {
		address = "127.0.0.1:50051"
	}
	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		log.Println(resp.Message)
	}
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
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	stream, err := c.client.Chat(ctx)
	if err != nil {
		return err
	}

	// 并发收发
	done := make(chan error, 1)

	// 接收
	go func() {
		for {
			resp, err := stream.Recv()
			if err == io.EOF {
				done <- nil
				return
			}
			if err != nil {
				done <- err
				return
			}
			log.Println("收到:", resp.Message)
		}
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Unary
	resp, err := client.SayHello(ctx, "world")
	if err != nil {
		log.Fatal(err)
	}
	log.Println(resp.Message)
}
