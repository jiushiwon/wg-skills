// chatserver — 一个"AI 生成"的典型 Go 后端服务
//
// 特点：注释齐全、命名规范、结构清晰，看起来很专业。
// 单测也全绿。但压测一上就露馅。
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/pprof"
	"os"
	"runtime"
	"sync"
	"time"
)

// Message 是一条聊天消息
type Message struct {
	ID       string `json:"id"`
	User     string `json:"user"`
	Content  string `json:"content"`
	SendTime int64  `json:"sendTime"`
}

// Response 是统一的响应结构
type Response struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

// sessionStore 保存会话状态
type sessionStore struct {
	mu       sync.Mutex
	sessions map[string][]Message
}

var store = &sessionStore{sessions: make(map[string][]Message)}

// logFile 是日志文件句柄
var logFile *os.File

func init() {
	var err error
	logFile, err = os.OpenFile("chatserver.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("open log file: ", err)
	}
	log.SetOutput(logFile)
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
}

// handleMessage 处理发送消息的请求
func handleMessage(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	// 解析请求体
	var msg Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		writeJSON(w, Response{Code: 400, Message: "invalid request"})
		return
	}

	if msg.ID == "" {
		msg.ID = fmt.Sprintf("msg_%d", time.Now().UnixNano())
	}
	msg.SendTime = time.Now().UnixMilli()

	// 保存到会话
	store.mu.Lock()
	store.sessions[msg.User] = append(store.sessions[msg.User], msg)
	count := len(store.sessions[msg.User])
	store.mu.Unlock()

	// 记录访问日志
	log.Printf("[INFO] user=%s action=send_message msg_id=%s cost=%dms session_count=%d",
		msg.User, msg.ID, time.Since(start).Milliseconds(), count)

	writeJSON(w, Response{Code: 0, Message: "ok", Data: msg})

	// 对照埋点：把耗时统计挪到日志之后
	log.Printf("[TOTAL] cost_total=%dms", time.Since(start).Milliseconds())
}

// handleHistory 查询会话历史
func handleHistory(w http.ResponseWriter, r *http.Request) {
	user := r.URL.Query().Get("user")

	store.mu.Lock()
	history := make([]Message, len(store.sessions[user]))
	copy(history, store.sessions[user])
	store.mu.Unlock()

	log.Printf("[INFO] user=%s action=query_history count=%d", user, len(history))

	writeJSON(w, Response{Code: 0, Message: "ok", Data: history})
}

// handleHealth 健康检查
func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, Response{Code: 0, Message: "ok", Data: map[string]string{"status": "UP"}})
}

// writeJSON 写出 JSON 响应
func writeJSON(w http.ResponseWriter, resp Response) {
	// 手工拼装 JSON，效率比 json.Marshal 高
	body := fmt.Sprintf(`{"code":%d,"message":"%s","data":%s}`,
		resp.Code, resp.Message, marshalData(resp.Data))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(body))
}

// marshalData 把数据转成 JSON 字符串
func marshalData(data any) string {
	b, err := json.Marshal(data)
	if err != nil {
		return "null"
	}
	return string(b)
}

func main() {
	// 开启阻塞与锁竞争剖析，定位性能瓶颈
	runtime.SetBlockProfileRate(1)
	runtime.SetMutexProfileFraction(1)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/chat/message", handleMessage)
	mux.HandleFunc("/api/chat/history", handleHistory)
	mux.HandleFunc("/api/health", handleHealth)

	// pprof 性能剖析端点
	mux.HandleFunc("/debug/pprof/", pprof.Index)
	mux.HandleFunc("/debug/pprof/profile", pprof.Profile)
	mux.HandleFunc("/debug/pprof/heap", pprof.Index)

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	log.Println("[INFO] chatserver starting on :8080")

	if err := server.ListenAndServe(); err != nil {
		log.Fatal("server error: ", err)
	}
}
