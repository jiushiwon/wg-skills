package {basePackage}.agent.agent;

import {basePackage}.agent.tool.BaseTool;
import {basePackage}.agent.tool.ToolRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.ToolCall;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Tool 执行器
 * 并发执行 + 权限注入（@CurrentUser userId） + 审计日志
 */
@Slf4j
@Component
public class ToolExecutor {

    private final ToolRegistry registry = new ToolRegistry();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 注册 Tool
     */
    public void register(BaseTool tool) {
        for (Method method : tool.getClass().getDeclaredMethods()) {
            var annotation = method.getAnnotation({basePackage}.agent.tool.AgentTool.class);
            if (annotation != null) {
                registry.register(annotation.name(), new ToolRegistry.ToolRegistration(
                    annotation.name(),
                    annotation.description(),
                    method,
                    tool,
                    annotation.timeout(),
                    annotation.audit()
                ));
                log.info("注册 Tool: {} - {}", annotation.name(), annotation.description());
            }
        }
    }

    /**
     * 执行所有 Tool Calls（并发）
     */
    public List<AgentRunner.ToolExecutionResult> executeAll(ChatResponse response, Long userId) {
        List<ToolCall> toolCalls = response.getResult().getOutput().getToolCalls();
        if (toolCalls == null || toolCalls.isEmpty()) {
            return List.of();
        }

        // 并发执行所有 Tool Calls
        List<CompletableFuture<AgentRunner.ToolExecutionResult>> futures = toolCalls.stream()
            .map(toolCall -> CompletableFuture.supplyAsync(() -> execute(toolCall, userId)))
            .toList();

        // 等待所有完成
        return futures.stream()
            .map(CompletableFuture::join)
            .toList();
    }

    /**
     * 执行单个 Tool Call
     */
    private AgentRunner.ToolExecutionResult execute(ToolCall toolCall, Long userId) {
        String toolName = toolCall.getName();
        String argsJson = toolCall.getArguments();

        ToolRegistry.ToolRegistration registration = registry.get(toolName);
        if (registration == null) {
            log.warn("Tool 不存在: {}", toolName);
            return new AgentRunner.ToolExecutionResult(toolName, "{\"error\": \"工具不存在\"}");
        }

        try {
            // 1. 解析参数
            @SuppressWarnings("unchecked")
            Map<String, Object> args = objectMapper.readValue(argsJson, Map.class);

            // 2. 注入 userId（@CurrentUser，LLM 无法篡改）
            args.put("userId", userId);

            // 3. 执行（带审计 + 异常脱敏）
            Object result = registration.target() instanceof BaseTool baseTool
                ? baseTool.executeWithAudit(toolName, userId, args, registration.method(), registration.target())
                : registration.method().invoke(registration.target(), buildArgs(registration.method(), args));

            // 4. 结果用 XML 标签包裹（防 Prompt Injection）
            String resultJson = objectMapper.writeValueAsString(result);
            String wrapped = "<tool_result name=\"" + toolName + "\">" + resultJson + "</tool_result>";

            return new AgentRunner.ToolExecutionResult(toolName, wrapped);

        } catch (Exception e) {
            log.error("Tool 执行异常: {}", toolName, e);
            return new AgentRunner.ToolExecutionResult(toolName,
                "{\"error\": \"工具执行失败，请重试\"}");
        }
    }

    /**
     * 构建方法参数数组
     */
    private Object[] buildArgs(Method method, Map<String, Object> args) {
        java.lang.reflect.Parameter[] params = method.getParameters();
        Object[] values = new Object[params.length];
        for (int i = 0; i < params.length; i++) {
            values[i] = args.get(params[i].getName());
        }
        return values;
    }

    /**
     * 获取所有已注册 Tool 的定义（用于 Function Callback 注册）
     */
    public Map<String, ToolRegistry.ToolRegistration> getRegisteredTools() {
        return registry.getAll();
    }
}
