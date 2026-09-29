package {basePackage}.agent.controller;

import {basePackage}.agent.config.AgentAutoConfiguration.AgentProperties;
import {basePackage}.agent.dto.*;
import {basePackage}.agent.enums.ChatErrorCode;
import {basePackage}.agent.rate.Bucket4jRateLimiter;
import {basePackage}.agent.service.IAgentChatService;
import {basePackage}.agent.service.IAgentSessionService;
import {basePackage}.agent.tool.ToolRegistry;
import {basePackage}.common.ApiResponse;
import {basePackage}.common.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * Agent 对话接口
 * SSE 流式 + 同步 + Rate Limit + 断连检测
 */
@Slf4j
@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentChatController {

    private final IAgentChatService chatService;
    private final Bucket4jRateLimiter rateLimiter;

    /**
     * 流式对话（SSE）
     * 支持 Function Calling，Tool 结果在下一轮 token 中返回
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@Valid @RequestBody ChatRequest request, @CurrentUser Long userId) {
        // Rate Limit 检查
        if (!rateLimiter.tryAcquire("chat:" + userId)) {
            SseEmitter emitter = new SseEmitter();
            try {
                emitter.send(SseEmitter.event()
                    .name("error")
                    .data(Map.of(
                        "code", ChatErrorCode.RATE_LIMIT.getCode(),
                        "message", "请求频率超限，请稍后重试"
                    )));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }

        return chatService.chatStream(request, userId);
    }

    /**
     * 同步对话（非流式）
     * 适用于需要 Tool 调用结果的场景
     */
    @PostMapping("/chat/sync")
    public ApiResponse<ChatResponse> chatSync(@Valid @RequestBody ChatRequest request, @CurrentUser Long userId) {
        // Rate Limit 检查
        if (!rateLimiter.tryAcquire("chat:" + userId)) {
            return ApiResponse.error(ChatErrorCode.RATE_LIMIT.getCode(), "请求频率超限，请稍后重试");
        }

        ChatResponse response = chatService.chatSync(request, userId);
        return ApiResponse.ok(response);
    }
}

/**
 * 会话管理接口
 */
@Slf4j
@RestController
@RequestMapping("/api/agent/sessions")
@RequiredArgsConstructor
public class AgentSessionController {

    private final IAgentSessionService sessionService;
    private final Bucket4jRateLimiter rateLimiter;

    /**
     * 会话列表（分页）
     */
    @GetMapping
    public ApiResponse<List<SessionDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @CurrentUser Long userId) {
        if (!rateLimiter.tryAcquire("session:" + userId)) {
            return ApiResponse.error(ChatErrorCode.RATE_LIMIT.getCode(), "请求频率超限，请稍后重试");
        }

        List<SessionDTO> list = sessionService.listSessions(userId, page, pageSize);
        return ApiResponse.ok(list);
    }

    /**
     * 创建会话
     */
    @PostMapping
    public ApiResponse<SessionDTO> create(@Valid @RequestBody CreateSessionRequest request, @CurrentUser Long userId) {
        SessionDTO session = sessionService.createSession(userId, request);
        return ApiResponse.ok(session);
    }

    /**
     * 获取会话详情
     */
    @GetMapping("/{id}")
    public ApiResponse<SessionDTO> get(@PathVariable Long id, @CurrentUser Long userId) {
        SessionDTO session = sessionService.getSession(id, userId);
        return ApiResponse.ok(session);
    }

    /**
     * 删除会话
     * ?hard=true 硬删除（级联删除消息），默认软删除
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean hard,
            @CurrentUser Long userId) {
        sessionService.deleteSession(id, userId, hard);
        return ApiResponse.ok(null);
    }

    /**
     * 获取会话消息（分页）
     */
    @GetMapping("/{id}/messages")
    public ApiResponse<List<MessageDTO>> messages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int pageSize,
            @CurrentUser Long userId) {
        List<MessageDTO> list = sessionService.getMessages(id, userId, page, pageSize);
        return ApiResponse.ok(list);
    }

    /**
     * 清除会话内存记忆（不清除数据库历史）
     */
    @PostMapping("/{id}/clear-memory")
    public ApiResponse<Void> clearMemory(@PathVariable Long id, @CurrentUser Long userId) {
        sessionService.clearMemory(id, userId);
        return ApiResponse.ok(null);
    }
}

/**
 * Tool 管理接口
 */
@RestController
@RequestMapping("/api/agent/tools")
@RequiredArgsConstructor
public class AgentToolController {

    private final ToolRegistry toolRegistry;

    /**
     * 获取可用工具列表
     */
    @GetMapping
    public ApiResponse<List<ToolDefinition>> list() {
        List<ToolDefinition> tools = toolRegistry.getAll().values().stream()
            .map(reg -> new ToolDefinition(reg.name(), reg.description()))
            .toList();
        return ApiResponse.ok(tools);
    }
}
