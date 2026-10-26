// bench — 压测器（纯标准库）
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"sort"
	"sync"
	"sync/atomic"
	"time"
)

type result struct {
	Concurrency int           `json:"concurrency"`
	Total       int           `json:"total"`
	Duration    time.Duration `json:"durationMs"`
	RPS         float64       `json:"rps"`
	P50         time.Duration `json:"p50Ms"`
	P95         time.Duration `json:"p95Ms"`
	P99         time.Duration `json:"p99Ms"`
	ErrCount    int           `json:"errCount"`
}

func main() {
	url := flag.String("url", "http://127.0.0.1:8080/api/chat/message", "target url")
	concurrency := flag.Int("c", 200, "concurrency")
	total := flag.Int("n", 20000, "total requests")
	mode := flag.String("mode", "chat", "chat|health")
	flag.Parse()

	body := []byte(`{"user":"u1","content":"hello"}`)
	if *mode != "chat" {
		body = nil
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        *concurrency,
			MaxIdleConnsPerHost: *concurrency,
			IdleConnTimeout:     90 * time.Second,
		},
	}

	var wg sync.WaitGroup
	var ok, errCount int64
	lat := make([]time.Duration, *total)
	var idx int64

	start := time.Now()
	for i := 0; i < *concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				n := atomic.AddInt64(&idx, 1) - 1
				if n >= int64(*total) {
					return
				}
				t0 := time.Now()
				req, _ := http.NewRequest("POST", *url, bytes.NewReader(body))
				req.Header.Set("Content-Type", "application/json")
				resp, err := client.Do(req)
				if err != nil {
					atomic.AddInt64(&errCount, 1)
					continue
				}
				io.Copy(io.Discard, resp.Body)
				resp.Body.Close()
				lat[n] = time.Since(t0)
				atomic.AddInt64(&ok, 1)
			}
		}()
	}
	wg.Wait()
	dur := time.Since(start)

	sort.Slice(lat, func(i, j int) bool { return lat[i] < lat[j] })
	pct := func(p float64) time.Duration {
		i := int(float64(len(lat)) * p)
		if i >= len(lat) {
			i = len(lat) - 1
		}
		return lat[i]
	}
	res := result{
		Concurrency: *concurrency,
		Total:       int(ok),
		Duration:    dur,
		RPS:         float64(ok) / dur.Seconds(),
		P50:         pct(0.50),
		P95:         pct(0.95),
		P99:         pct(0.99),
		ErrCount:    int(errCount),
	}
	out, _ := json.MarshalIndent(res, "", "  ")
	fmt.Println(string(out))
	os.WriteFile("bench-result.json", out, 0644)
}
