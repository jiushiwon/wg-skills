package main

import (
	"log"
	"net"
	"os"

	"github.com/your-org/hello-service/proto/helloworld"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/reflection"
)

func main() {
	address := os.Getenv("GRPC_ADDRESS")
	if address == "" {
		address = "127.0.0.1:50051"
	}
	host, _, err := net.SplitHostPort(address)
	if err != nil {
		log.Fatal(err)
	}
	ip := net.ParseIP(host)
	if ip == nil || !ip.IsLoopback() {
		log.Fatal("the development server requires a loopback IP address")
	}
	listener, err := net.Listen("tcp", address)
	if err != nil {
		log.Fatal(err)
	}

	server := grpc.NewServer()
	helloworld.RegisterGreeterServer(server, &GreeterServer{})
	healthServer := health.NewServer()
	grpc_health_v1.RegisterHealthServer(server, healthServer)
	healthServer.SetServingStatus(helloworld.Greeter_ServiceDesc.ServiceName, grpc_health_v1.HealthCheckResponse_SERVING)
	reflection.Register(server)
	log.Printf("gRPC server listening on %s", listener.Addr())
	if err := server.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
