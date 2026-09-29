# SSE 流式响应指南

Server-Sent Events (SSE) 是一种服务器向浏览器推送数据的技术，适合实时通知、聊天、进度更新等场景。

## 依赖

```bash
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/sse
```

## 核心实现

### SSE 处理器

```go
// internal/handlers/sse.go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// SSEChat SSE 聊天示例
func SSEChat(c *gin.Context) {
	// 设置响应头
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	// 获取用户输入（如果有）
	message := c.Query("message")

	// 创建 SSE 客户端
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "SSE not supported"})
		return
	}

	// 发送初始消息
	sendSSE(c, "message", "欢迎使用 SSE 聊天！")

	// 模拟流式响应
	messages := []string{
		"正在思考...",
		"分析中...",
		"生成回复...",
		"完成！",
	}

	for i, msg := range messages {
		// 模拟处理时间
		time.Sleep(500 * time.Millisecond)

		// 如果用户发送了消息，echo 回显
		if message != "" && i == 0 {
			sendSSE(c, "user", message)
		}

		// 发送流式消息
		sendSSE(c, "message", msg)
		flusher.Flush()
	}

	// 发送完成信号
	sendSSE(c, "done", "true")
}

// sendSSE 发送 SSE 事件
func sendSSE(c *gin.Context, event string, data interface{}) {
	var dataStr string
	switch v := data.(type) {
	case string:
		dataStr = v
	default:
		b, _ := json.Marshal(data)
		dataStr = string(b)
	}

	fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", event, dataStr)
}
```

### 路由注册

```go
// 在 main.go 或 middleware.go 中
protected.GET("/sse/chat", SSEChat)
```

## 客户端示例

### 原生 JavaScript

```javascript
// 创建 EventSource
const eventSource = new EventSource('http://localhost:8080/api/sse/chat?message=Hello');

// 监听消息
eventSource.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
});

// 监听自定义事件
eventSource.addEventListener('user', (event) => {
  console.log('用户消息:', event.data);
});

// 监听完成
eventSource.addEventListener('done', (event) => {
  console.log('完成:', event.data);
  eventSource.close();
});

// 错误处理
eventSource.onerror = (error) => {
  console.error('SSE 错误:', error);
  eventSource.close();
};
```

### 带消息的示例

```javascript
const eventSource = new EventSource('http://localhost:8080/api/sse/chat?message=帮我写一首诗');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到:', data);

  if (data.done === 'true') {
    eventSource.close();
  }
};
```

## SSE vs WebSocket

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 方向 | 单向（服务端→客户端） | 双向 |
| 协议 | HTTP | ws:// |
| 自动重连 | 支持 | 需手动 |
| 二进制数据 | 不支持 | 支持 |
| 防火墙/代理 | 友好 | 可能有阻碍 |
| 实现复杂度 | 简单 | 中等 |

## 适用场景

- **实时通知**：系统消息、订单状态更新
- **聊天机器人**：AI 对话流式响应
- **进度报告**：文件上传、大任务执行进度
- **实时数据**：股票行情、监控系统

## 注意事项

1. **连接超时**：Nginx 默认 60 秒超时，需配置 `proxy_read_timeout`
2. **并发连接**：浏览器限制每个域名 6 个 SSE 连接
3. **消息格式**：`data:` 字段必填，多行用 `\n` 分隔
4. **关闭连接**：发送 `event: close` 或直接断开连接

## Nginx 配置（生产环境）

```nginx
location /api/sse/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_cache off;
    # 重要：延长超时时间
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```
