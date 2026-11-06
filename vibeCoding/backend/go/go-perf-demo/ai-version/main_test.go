package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestHandleMessage 测试发送消息接口
func TestHandleMessage(t *testing.T) {
	body := bytes.NewBufferString(`{"user":"tester","content":"hello"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/chat/message", body)
	w := httptest.NewRecorder()

	handleMessage(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("期望 200，实际 %d", w.Code)
	}

	var resp Response
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("响应不是合法 JSON: %v", err)
	}
	if resp.Code != 0 {
		t.Fatalf("期望 code=0，实际 %d", resp.Code)
	}
}

// TestHandleHealth 测试健康检查
func TestHandleHealth(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	w := httptest.NewRecorder()

	handleHealth(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("期望 200，实际 %d", w.Code)
	}
}

// TestHandleHistory 测试历史查询
func TestHandleHistory(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/chat/history?user=tester", nil)
	w := httptest.NewRecorder()

	handleHistory(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("期望 200，实际 %d", w.Code)
	}
}
