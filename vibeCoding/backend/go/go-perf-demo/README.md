# go-perf-demo — AI 写的 Go 后端，性能差在哪？

这个 demo 是公众号文章《AI 写的 Go 后端编译通过、单测全绿，压测 3.9 万 QPS 却 p99 延迟 11 秒》的全部实验代码。

**零第三方依赖**，全部标准库，`go run` 就能跑。

## 目录结构

```
go-perf-demo/
├── ai-version/      # AI 生成的版本（编译通过、单测全绿，但压测 p99 11 秒）
├── fixed-version/   # 按压测结论修复后的版本（QPS 翻倍，阻塞降 99.1%）
└── bench/           # 压测器（纯标准库）
```

## 怎么跑

### 1. 起被测服务

```bash
cd ai-version
go build -o chatserver.exe .
./chatserver.exe          # 监听 :8080
```

```bash
cd fixed-version
go build -o chatserver-fixed.exe .
./chatserver-fixed.exe    # 监听 :8091
```

### 2. 跑压测

```bash
cd bench
go build -o bench.exe .

# AI 版本
./bench.exe -c 200 -n 150000 -url http://127.0.0.1:8080/api/chat/message

# 修复版本
./bench.exe -c 200 -n 150000 -url http://127.0.0.1:8091/api/chat/message
```

### 3. 抓剖析数据

两个版本都开了 `/debug/pprof/`。

```bash
# CPU 火焰图（AI 版本会抓到 0 samples，因为瓶颈不在 CPU）
go tool pprof -top http://127.0.0.1:8080/debug/pprof/profile?seconds=12

# 阻塞剖析（真凶在这里：99.35% 堵在 log.(*Logger).output 的内部锁）
go tool pprof -top http://127.0.0.1:8080/debug/pprof/block

# 互斥剖析
go tool pprof -top http://127.0.0.1:8080/debug/pprof/mutex
```

## 实测结果（16 逻辑核 / Windows 11 / Go 1.26.3）

3 轮交替压测取中位数，200 并发 / 15 万请求：

| 指标 | ai-version | fixed-version | 变化 |
|------|-----------|---------------|------|
| 吞吐量 QPS | 38,837 | 76,667 | +97.4% |
| 客户端 p50 | 5.48 s | 2.00 s | -63.5% |
| 服务端自测耗时（埋点在日志之后） | 2.20 ms | 0.04 ms | -98.2% |
| 阻塞剖析总时长 | 3754.71 s | 33.01 s | -99.1% |
| CPU 10 秒采样 | 0 samples | 30 ms (0.3%) | — |

> 压测器与服务端同机，客户端 p99 受同机资源竞争污染，不可信；吞吐与服务端自测耗时可信。

## 三个关键结论

1. **CPU 火焰图是空的**（0 samples）。瓶颈不在计算，在阻塞。换 `block` / `mutex` 剖析才看得见。
2. **99.35% 的阻塞来自标准库 `log` 包内部的全局锁**，调用链 `handleMessage → log.Printf → log.(*Logger).output → sync.Mutex.Lock`。自己代码里的 `store.mu` 只占 0.35%。
3. **耗时埋点写在 `log.Printf` 之前 = 监控永远显示正常**。挪到日志之后，平均耗时从 0.01ms 变成 2.20ms（220 倍）。

## 附：慢连接实验

50 个只发一半 body 的连接：

| 时刻 | ai-version | fixed-version |
|------|-----------|---------------|
| t = 0 | 3 | 6 |
| t + 3s | 53 | 56 |
| t + 7s | **53（不回收）** | **6（自动回收）** |
