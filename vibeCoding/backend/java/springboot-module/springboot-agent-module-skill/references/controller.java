// Agent Controller 参考代码

package com.{package}.agent.controller;

import com.{package}.agent.dto.*;
import com.{package}.agent.service.IAgentChatService;
import com.{package}.agent.service.IAgentSessionService;
import com.{package}.common.core.domain.AjaxResult;
import com.{package}.common.core.domain.LoginHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * AI 对话控制器
 */
@RestController
@RequestMapping("/api/agent/chat")
@RequiredArgsConstructor
public class AgentChatController {

    private final IAgentChatService agentChatService;

    /**
     * 流式对话
     */
    @PostMapping
    public SseEmitter chat(@RequestBody ChatRequest request) {
        Long userId = LoginHelper.getUserId();
        return agentChatService.chat(request.getMessage(), request.getSessionId(), userId);
    }

    /**
     * 同步对话
     */
    @PostMapping("/sync")
    public AjaxResult chatSync(@RequestBody ChatRequest request) {
        Long userId = LoginHelper.getUserId();
        ChatResponse response = agentChatService.chatSync(request.getMessage(), request.getSessionId(), userId);
        return AjaxResult.success(response);
    }
}

/**
 * 会话管理控制器
 */
@RestController
@RequestMapping("/api/agent/sessions")
@RequiredArgsConstructor
public class AgentSessionController {

    private final IAgentSessionService sessionService;

    /**
     * 会话列表
     */
    @GetMapping
    public AjaxResult list(
        @RequestParam(defaultValue = "1") Integer page,
        @RequestParam(defaultValue = "10") Integer pageSize
    ) {
        Long userId = LoginHelper.getUserId();
        return AjaxResult.success(sessionService.listSessions(userId, page, pageSize));
    }

    /**
     * 创建会话
     */
    @PostMapping
    public AjaxResult create(@RequestBody SessionDTO sessionDTO) {
        Long userId = LoginHelper.getUserId();
        return AjaxResult.success(sessionService.createSession(userId, sessionDTO));
    }

    /**
     * 删除会话
     */
    @DeleteMapping("/{sessionId}")
    public AjaxResult delete(@PathVariable Long sessionId) {
        Long userId = LoginHelper.getUserId();
        sessionService.deleteSession(sessionId, userId);
        return AjaxResult.success();
    }

    /**
     * 获取会话消息
     */
    @GetMapping("/{sessionId}/messages")
    public AjaxResult messages(@PathVariable Long sessionId) {
        Long userId = LoginHelper.getUserId();
        return AjaxResult.success(sessionService.getMessages(sessionId, userId));
    }
}

/**
 * 工具管理控制器
 */
@RestController
@RequestMapping("/api/agent/tools")
@RequiredArgsConstructor
public class AgentToolController {

    /**
     * 获取可用工具列表
     */
    @GetMapping
    public AjaxResult listTools() {
        // 获取 Tool 注册表中的工具列表
        return AjaxResult.success(ToolRegistry.getToolDefinitions());
    }
}
