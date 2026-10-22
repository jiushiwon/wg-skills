#!/bin/bash
# protoc 代码生成脚本

set -e

# 配置
PROTO_DIR="./proto"
OUT_DIR="./proto"
PROTO_FILES=$(find $PROTO_DIR -name "*.proto")

# 检查 protoc
if ! command -v protoc &> /dev/null; then
    echo "Error: protoc not found. Install: brew install protobuf"
    exit 1
fi

# 检查 Go 插件
if ! command -v protoc-gen-go &> /dev/null; then
    echo "Error: protoc-gen-go not found. Install: go install google.golang.org/protobuf/cmd/protoc-gen-go@latest"
    exit 1
fi

if ! command -v protoc-gen-go-grpc &> /dev/null; then
    echo "Error: protoc-gen-go-grpc not found. Install: go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest"
    exit 1
fi

# 添加 proto 路径
PROTO_PATH="-I$PROTO_DIR -I$(go list -m -f '{{.Dir}}' github.com/golang/protobuf)/protobuf/src"

# 生成 Go 代码
echo "Generating Go code from .proto files..."

for proto_file in $PROTO_FILES; do
    echo "Processing: $proto_file"

    protoc $PROTO_PATH \
        --go_out=$OUT_DIR --go_opt=paths=source_relative \
        --go-grpc_out=$OUT_DIR --go-grpc_opt=paths=source_relative \
        "$proto_file"
done

echo "Done! Generated files in $OUT_DIR"
