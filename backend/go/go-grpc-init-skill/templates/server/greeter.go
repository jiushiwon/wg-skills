package main

import (
	"context"
	"io"
	"strings"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

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
		Timestamp: timestamppb.Now(),
	}, nil
}

// Server Streaming: 服务端流
func (s *GreeterServer) SayHelloStream(req *pb.HelloRequest, stream pb.Greeter_SayHelloStreamServer) error {
	for i := 0; i < 5; i++ {
		if err := stream.Send(&pb.HelloReply{
			Message:   "Hello, " + req.Name + " #" + string(rune('0'+i)),
			Code:      0,
			Timestamp: timestamppb.Now(),
		}); err != nil {
			return err
		}
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
				Message: "Received: " + strings.Join(names, ", "),
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
			Timestamp: timestamppb.Now(),
		}

		if err := stream.Send(resp); err != nil {
			return err
		}
	}
}
