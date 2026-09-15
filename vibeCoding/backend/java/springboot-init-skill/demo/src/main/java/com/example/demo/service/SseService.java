package com.example.demo.service;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * SSE 流式服务。
 * <p>
 * 每个连接独立维护一个定时心跳任务，连接关闭/超时/异常时立即取消任务，
 * 避免高并发场景下线程与连接泄漏。
 */
@Slf4j
@Service
public class SseService {

    /**
     * 共享调度器，线程数随 CPU 核数扩展，最少 4 线程。
     * ponytail: 单个全局调度器足够演示；生产若万级连接可换为每连接独立 ScheduledExecutor
     * 或迁移到 Reactor/Netty。
     */
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(
        Math.max(4, Runtime.getRuntime().availableProcessors())
    );

    private final Map<SseEmitter, ScheduledFuture<?>> tasks = new ConcurrentHashMap<>();

    @Value("${sse.timeout-ms:30000}")
    private long timeoutMs;

    @Value("${sse.heartbeat-seconds:2}")
    private long heartbeatSeconds;

    public SseEmitter chat(Long userId) {
        // 默认 30 秒无活动自动超时，防止连接永久挂起
        SseEmitter emitter = new SseEmitter(timeoutMs);
        boolean isProtected = userId != null;
        AtomicInteger seq = new AtomicInteger(0);

        log.info("SSE 连接建立: userId={}, protected={}", userId, isProtected);

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                String content = isProtected ? "欢迎回来 #" + userId : "你好陌生人";
                emitter.send(SseEmitter.event()
                    .id(String.valueOf(seq.incrementAndGet()))
                    .name("message")
                    .data(Map.of("content", content, "ts", System.currentTimeMillis())));
            } catch (IOException e) {
                log.warn("SSE 推送失败，关闭连接: {}", e.getMessage());
                removeEmitter(emitter);
            }
        }, 0, heartbeatSeconds, TimeUnit.SECONDS);

        tasks.put(emitter, future);

        emitter.onCompletion(() -> {
            log.info("SSE 连接完成");
            removeEmitter(emitter);
        });
        emitter.onTimeout(() -> {
            log.info("SSE 连接超时");
            removeEmitter(emitter);
        });
        emitter.onError(e -> {
            log.warn("SSE 连接异常: {}", e.getMessage());
            removeEmitter(emitter);
        });

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
            // 连接可能已被客户端关闭，忽略重复 complete
        }
    }

    @PreDestroy
    public void shutdown() {
        tasks.forEach((emitter, future) -> {
            future.cancel(false);
            emitter.complete();
        });
        tasks.clear();
        scheduler.shutdownNow();
        log.info("SSE 调度器已关闭");
    }
}
