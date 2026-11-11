#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
for tool in go protoc protoc-gen-go protoc-gen-go-grpc; do
  command -v "$tool" >/dev/null || { echo "Missing required tool: $tool" >&2; exit 1; }
done

module=$(go list -m)
protoc -I proto --go_out=. --go_opt="module=$module" \
  --go-grpc_out=. --go-grpc_opt="module=$module" proto/*.proto
