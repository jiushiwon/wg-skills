# SSE 流式框架集成

> Spring Boot 使用 Spring MVC 的 `SseEmitter` 实现 SSE（Server-Sent Events）。本 skill 的 `references/skeleton.md` 已落地完整示例端点，本文档解释原理与拓展。

## 为什么用 SSE 而非 WebSocket？

| 维度 | SSE | WebSocket |
|------|-----|-----------|
| 协议 | HTTP | 独立协议 |
| 方向 | 服务端 → 客户端 | 双向 |
| 鉴权 | 标准 HTTP Header | 需手动实现 |
| 浏览器兼容 | EventSource 原生 | 需 `new WebSocket()` |
| 微信小程序 | `enableChunked` 兼容 | 需 `wx.connectSocket` |
| 适用场景 | 单向推送（AI 流式、通知） | 双向交互（IM、游戏） |

**结论**：AI 流式输出、通知推送、进度条 → SSE；聊天、协同编辑 → WebSocket。

## 核心依赖

仅需 `spring-boot-starter-web`（已内置于 skeleton 模板）。`SseEmitter` 由 Spring MVC 在 Servlet 栈（Tomcat）下直接提供，无需额外引入 WebFlux。

## 示例代码

`service/SseService.java`（已在 skeleton 落地）：

```java
@Slf4j
@Service
public class SseService {

    @Value("${sse.timeout-ms:30000}")
    private long timeoutMs;

    @Value("${sse.heartbeat-seconds:2}")
    private long heartbeatSeconds;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(
        Math.max(4, Runtime.getRuntime().availableProcessors())
    );
    private final Map<SseEmitter, ScheduledFuture<?>> tasks = new ConcurrentHashMap<>();

    public SseEmitter chat(Long userId) {
        SseEmitter emitter = new SseEmitter(timeoutMs);

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                emitter.send(SseEmitter.event()
                    .name("message")
                    .data(Map.of(
                        "content", userId == null
                            ? "你好陌生人"
                            : "欢迎回来 #" + userId,
                        "ts", System.currentTimeMillis()
                    )));
            } catch (IOException e) {
                removeEmitter(emitter);
            }
        }, 0, heartbeatSeconds, TimeUnit.SECONDS);

        tasks.put(emitter, future);
        emitter.onCompletion(() -> removeEmitter(emitter));
        emitter.onTimeout(() -> removeEmitter(emitter));
        emitter.onError(e -> removeEmitter(emitter));
        return emitter;
    }

    private void removeEmitter(SseEmitter emitter) {
        ScheduledFuture<?> future = tasks.remove(emitter);
        if (future != null) {
            future.cancel(false);
        }
        try {
            emitter.complete();
        } catch (Exception ignored) {
            // 可能已经完成或关闭
        }
    }
}
```

`controller/SseController.java`（已在 skeleton 落地）：

```java
@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    @GetMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat() {
        return sseService.chat(null);
    }

    @GetMapping(value = "/chat/protected", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatProtected(@CurrentUser Long userId) {
        return sseService.chat(userId);
    }
}
```

## 与 AI 流式对接（拓展模式）

实际场景需要把 SSE 端点挂到 LLM 流式输出（OpenAI、DeepSeek、Ollama）：

```java
public SseEmitter aiChat(Long userId, String prompt) {
    SseEmitter emitter = new SseEmitter(60_000L);

    // 调用 OpenAI 流式接口（WebClient）
    WebClient client = WebClient.builder()
        .baseUrl("https://api.openai.com/v1")
        .defaultHeader("Authorization", "Bearer " + openAiKey)
        .build();

    Flux<String> tokenStream = client.post()
        .uri("/chat/completions")
        .bodyValue(Map.of(
            "model", "gpt-4",
            "stream", true,
            "messages", List.of(Map.of("role", "user", "content", prompt))
        ))
        .retrieve()
        .bodyToFlux(String.class);

    tokenStream.subscribe(
        token -> {
            try {
                emitter.send(SseEmitter.event().data(Map.of("delta", token)));
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        },
        emitter::completeWithError,
        emitter::complete
    );

    return emitter;
}
```

## 客户端对接

### H5 浏览器

```javascript
const es = new EventSource('http://localhost:8080/api/sse/chat');

es.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('收到:', data.content);
});

es.onerror = (e) => {
  console.error('SSE 异常', e);
  es.close();
};
```

### 微信小程序

```javascript
const requestTask = wx.request({
  url: 'http://localhost:8080/api/sse/chat',
  enableChunked: true,  // 关键：开启 chunked 流式接收
  success: () => {},
  fail: (err) => console.error(err),
});

requestTask.onChunkReceived((res) => {
  const text = new TextDecoder().decode(res.data);
  // 解析 SSE 格式（data: {...}\n\n）
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const json = JSON.parse(line.slice(6));
      console.log('收到:', json.content);
    }
  }
});
```

### uniapp（通用）

参见 `frontend-request-skill/references/sse-guide.md` 的 `createSseClient` 工具函数，封装 H5 / 小程序 / App 三端。

## 安全注意

- SSE 端点默认在 `SecurityConfig` 中 `permitAll`（示例端点）。生产环境必须改为 `authenticated()`。
- 每个长连接占用一个 Servlet 请求线程直到返回，必须设置 `sse.timeout-ms` 与心跳，避免连接泄漏。
- 每次 `chat()` 独立创建调度任务，连接关闭时取消任务，防止线程泄漏。
- 高并发场景可考虑为 SSE 单独暴露一个端口 / 独立实例，避免阻塞普通短连接。