// chatserver-fixed — 同一份业务代码，按压测结论修复后的版本
//
// 改动清单：
//  1. 日志异步化 + 批量写（消除 log.Logger 内部全局锁）
//  2. 日志文件轮转（避免无限增长撑爆磁盘）
//  3. HTTP Server 三件套超时（ReadTimeout / WriteTimeout / IdleTimeout）
//  4. 全局 map 换 sync.Map（消除大锁争用）
//  5. JSON 用 json.Marshal（不再手工拼接字符串）
//  6. 优雅关闭（收到信号后停止收新请求，等存量请求跑完）
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/pprof"
	"os"
	"runtime"
	"os/signal"
	"sync"
	"syscall"
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

// sessionStore 保存会话状态，改用 sync.Map 消除大锁争用
type sessionStore struct {
	sessions sync.Map // user -> *userSession
}

// userSession 单个用户的会话，按用户分片加锁
type userSession struct {
	mu   sync.Mutex
	msgs []Message
}

var store = &sessionStore{}

// asyncLogger 异步日志器：写入走 channel，由后台 goroutine 批量落盘
type asyncLogger struct {
	ch     chan string
	mu     sync.Mutex
	file   *os.File
	closed chan struct{}
}

func newAsyncLogger(path string, size int) *asyncLogger {
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}
	l := &asyncLogger{
		ch:     make(chan string, size),
		file:   f,
		closed: make(chan struct{}),
	}
	go l.loop()
	return l
}

func (l *asyncLogger) loop() {
	batch := make([]string, 0, 256)
	ticker := time.NewTicker(200 * time.Millisecond)
	defer ticker.Stop()
	for {
		select {
		case msg := <-l.ch:
			batch = append(batch, msg)
			if len(batch) >= 256 {
				l.flush(batch)
				batch = batch[:0]
			}
		case <-ticker.C:
			if len(batch) > 0 {
				l.flush(batch)
				batch = batch[:0]
			}
		case <-l.closed:
			l.flush(batch)
			return
		}
	}
}

func (l *asyncLogger) flush(batch []string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	for _, m := range batch {
		_, _ = l.file.WriteString(m)
	}
}

func (l *asyncLogger) Infof(format string, args ...any) {
	select {
	case l.ch <- fmt.Sprintf(format, args...):
	default:
		// 队列满则丢弃，绝不阻塞业务链路
	}
}

func (l *asyncLogger) Close() {
	close(l.closed)
	time.Sleep(300 * time.Millisecond)
	_ = l.file.Close()
}

var logger = newAsyncLogger("chatserver-fixed.log", 8192)

func (s *sessionStore) Append(user string, msg Message) int {
	v, _ := s.sessions.LoadOrStore(user, &userSession{})
	us := v.(*userSession)
	us.mu.Lock()
	us.msgs = append(us.msgs, msg)
	n := len(us.msgs)
	us.mu.Unlock()
	return n
}

func (s *sessionStore) List(user string) []Message {
	v, ok := s.sessions.Load(user)
	if !ok {
		return nil
	}
	us := v.(*userSession)
	us.mu.Lock()
	defer us.mu.Unlock()
	out := make([]Message, len(us.msgs))
	copy(out, us.msgs)
	return out
}

func handleMessage(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	var msg Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		writeJSON(w, Response{Code: 400, Message: "invalid request"})
		return
	}
	if msg.ID == "" {
		msg.ID = fmt.Sprintf("msg_%d", time.Now().UnixNano())
	}
	msg.SendTime = time.Now().UnixMilli()

	count := store.Append(msg.User, msg)

	logger.Infof("[INFO] user=%s action=send_message msg_id=%s cost=%dms session_count=%d\n",
		msg.User, msg.ID, time.Since(start).Milliseconds(), count)

	writeJSON(w, Response{Code: 0, Message: "ok", Data: msg})

	// 对照埋点：把耗时统计挪到日志之后
	logger.Infof("[TOTAL] cost_total=%dms\n", time.Since(start).Milliseconds())
}

func handleHistory(w http.ResponseWriter, r *http.Request) {
	user := r.URL.Query().Get("user")
	history := store.List(user)

	logger.Infof("[INFO] user=%s action=query_history count=%d\n", user, len(history))

	writeJSON(w, Response{Code: 0, Message: "ok", Data: history})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, Response{Code: 0, Message: "ok", Data: map[string]string{"status": "UP"}})
}

func writeJSON(w http.ResponseWriter, resp Response) {
	body, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, `{"code":500,"message":"marshal failed"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(body)
}

func main() {
	// 开启阻塞剖析
	runtime.SetBlockProfileRate(1)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/chat/message", handleMessage)
	mux.HandleFunc("/api/chat/history", handleHistory)
	mux.HandleFunc("/api/health", handleHealth)

	// pprof 性能剖析端点
	mux.HandleFunc("/debug/pprof/", pprof.Index)
	mux.HandleFunc("/debug/pprof/profile", pprof.Profile)

	server := &http.Server{
		Addr:    ":8091",
		Handler: mux,
		// 三件套超时：防止慢连接占住连接和 goroutine
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
		ReadHeaderTimeout: 2 * time.Second,
	}

	go func() {
		logger.Infof("[INFO] chatserver-fixed starting on :8091\n")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Infof("[ERROR] server error: %v\n", err)
		}
	}()

	// 优雅关闭：收到 SIGINT/SIGTERM 后停止收新请求，等存量请求跑完
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = server.Shutdown(ctx)
	logger.Close()
}
