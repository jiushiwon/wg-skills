package {basePackage}.agent.agent;

import {basePackage}.agent.config.AgentAutoConfiguration.AgentProperties;
import {basePackage}.agent.enums.ChatErrorCode;
import {basePackage}.agent.memory.MemoryManager;
import {basePackage}.agent.tool.ToolExecutor;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.*;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Agent 运行器
 * 基于 Spring AI ChatClient + Function Calling
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AgentRunner {

    private final ChatClient chatClient;
    private final ToolExecutor toolExecutor;
    private final MemoryManager memoryManager;
    private final PromptSanitizer promptSanitizer;
    private final AgentProperties properties;

    /** 最大响应字符数（防内存峰值） */
    private static final int MAX_RESPONSE_CHARS = 50000;

    /**
     * 流式对话（SSE）
     * 使用骨架的 SseEmitter（spring-boot-starter-web），不引入 WebFlux
     */
    public SseEmitter stream(Long sessionId, Long userId, String userMessage, List<Message> dbHistory) {
        SseEmitter emitter = new SseEmitter(120_000L); // 2 分钟超时

        // 1. 加载历史 + 添加用户消息
        Deque<Message> history = memoryManager.getHistory(sessionId, dbHistory);
        String sanitized = promptSanitizer.sanitize(userMessage);
        history.addLast(new UserMessage(sanitized));

        // 2. 构建 Prompt（含 Function Callbacks）
        Prompt prompt = buildPrompt(history);

        // 3. 异步流式调用
        CompletableFuture.runAsync(() -> {
            try {
                StringBuilder responseBuffer = new StringBuilder();

                chatClient.prompt(prompt)
                    .stream()
                    .chatResponse()
                    .subscribe(
                        chunk -> {
                            try {
                                String content = chunk.getResult().getOutput().getContent();
                                if (content != null) {
                                    // 硬截断检查
                                    if (responseBuffer.length() + content.length() > MAX_RESPONSE_CHARS) {
                                        emitter.send(SseEmitter.event()
                                            .name("warning")
                                            .data(Map.of("message", "响应已截断（超过50000字符）")));
                                        return;
                                    }
                                    responseBuffer.append(content);
                                    emitter.send(SseEmitter.event()
                                        .name("message")
                                        .data(Map.of("content", content, "role", "assistant")));
                                }
                            } catch (Exception e) {
                                log.error("SSE 发送失败", e);
                            }
                        },
                        error -> {
                            log.error("LLM 调用失败", error);
                            try {
                                emitter.send(SseEmitter.event()
                                    .name("error")
                                    .data(Map.of(
                                        "code", ChatErrorCode.LLM_CALL_FAILED.getCode(),
                                        "message", "对话处理失败，请稍后重试"
                                    )));
                            } catch (Exception e) {
                                log.error("SSE 错误事件发送失败", e);
                            }
                            emitter.completeWithError(error);
                        },
                        () -> {
                            try {
                                emitter.send(SseEmitter.event()
                                    .name("done")
                                    .data(Map.of("sessionId", sessionId)));
                                emitter.complete();
                            } catch (Exception e) {
                                log.error("SSE 完成事件发送失败", e);
                            }
                        }
                    );
            } catch (Exception e) {
                log.error("流式对话异常", e);
                try {
                    emitter.send(SseEmitter.event()
                        .name("error")
                        .data(Map.of(
                            "code", ChatErrorCode.INTERNAL_ERROR.getCode(),
                            "message", "对话处理失败，请稍后重试"
                        )));
                } catch (Exception ex) {
                    // 忽略
                }
                emitter.completeWithError(e);
            }
        });

        // 断连检测
        emitter.onCompletion(() -> log.debug("SSE 连接已关闭: sessionId={}", sessionId));
        emitter.onTimeout(() -> log.warn("SSE 连接超时: sessionId={}", sessionId));

        return emitter;
    }

    /**
     * 同步对话
     */
    @Retry(name = "llm-retry", fallbackMethod = "chatSyncFallback")
    public ChatResponse chatSync(Long sessionId, Long userId, String userMessage, List<Message> dbHistory) {
        // 1. 加载历史 + 添加用户消息
        Deque<Message> history = memoryManager.getHistory(sessionId, dbHistory);
        String sanitized = promptSanitizer.sanitize(userMessage);
        history.addLast(new UserMessage(sanitized));

        // 2. 构建 Prompt（含 Function Callbacks）
        Prompt prompt = buildPrompt(history);

        // 3. 同步调用
        ChatResponse response = chatClient.prompt(prompt).call().chatResponse();

        // 4. 处理 Function Calling 循环
        int iterations = 0;
        while (response != null && hasToolCalls(response) && iterations < properties.getMaxIterations()) {
            iterations++;
            // 执行 Tools
            List<ToolExecutionResult> results = toolExecutor.executeAll(response, userId);
            // 将 Tool 结果添加到历史
            for (ToolExecutionResult result : results) {
                history.addLast(new ToolResponseMessage(result.content()));
            }
            // 重新调用 LLM
            prompt = buildPrompt(history);
            response = chatClient.prompt(prompt).call().chatResponse();
        }

        return response;
    }

    /**
     * 同步对话降级方法
     */
    public ChatResponse chatSyncFallback(Long sessionId, Long userId, String userMessage,
                                          List<Message> dbHistory, Throwable t) {
        log.error("LLM 调用重试耗尽，降级处理", t);
        throw new RuntimeException("对话处理失败，请稍后重试");
    }

    /**
     * 构建 Prompt（含 Function Callbacks）
     */
    private Prompt buildPrompt(Deque<Message> history) {
        List<Message> messages = new java.util.ArrayList<>(history);
        return new Prompt(messages, properties.getDefaultModel());
    }

    /**
     * 检查响应是否包含 Tool Calls
     */
    private boolean hasToolCalls(ChatResponse response) {
        return response.getResult().getOutput().getToolCalls() != null
            && !response.getResult().getOutput().getToolCalls().isEmpty();
    }

    /**
     * Tool 执行结果
     */
    public record ToolExecutionResult(String toolName, String content) {}
}
