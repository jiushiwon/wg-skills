package com.{package}.agent.audit;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Agent 结构化审计日志
 * 独立 logger "agent.audit"，按天滚动，与业务日志分离
 */
@Slf4j
public class AgentAuditLogger {

    /** 独立审计 logger（logback 中配置独立 appender） */
    private static final Logger AUDIT = LoggerFactory.getLogger("agent.audit");

    /**
     * Tool 调用审计
     */
    public void logToolCall(Long userId, Long sessionId, String toolName,
                            String argsHash, boolean success, String error, long durationMs) {
        AUDIT.info("event=tool_call userId={} sessionId={} tool={} argsHash={} success={} error={} durationMs={}",
            userId, sessionId, toolName, argsHash, success, error, durationMs);
    }

    /**
     * 对话失败审计
     */
    public void logChatFailure(Long userId, Long sessionId, int errorCode, String error) {
        AUDIT.warn("event=chat_failure userId={} sessionId={} errorCode={} error={}",
            userId, sessionId, errorCode, error);
    }

    /**
     * Token 消耗审计
     */
    public void logTokenUsage(Long userId, Long sessionId, String model,
                              int promptTokens, int completionTokens, int totalTokens) {
        AUDIT.info("event=token_usage userId={} sessionId={} model={} prompt={} completion={} total={}",
            userId, sessionId, model, promptTokens, completionTokens, totalTokens);
    }

    /**
     * 限流命中审计
     */
    public void logRateLimitHit(Long userId, String endpoint) {
        AUDIT.warn("event=rate_limit_hit userId={} endpoint={}", userId, endpoint);
    }

    /**
     * 会话删除审计
     */
    public void logSessionDelete(Long userId, Long sessionId, boolean hard) {
        AUDIT.info("event=session_delete userId={} sessionId={} hard={}", userId, sessionId, hard);
    }

    /**
     * 文件操作审计
     */
    public void logFileOperation(Long userId, String operation, String path, long size, boolean success) {
        AUDIT.info("event=file_operation userId={} operation={} path={} size={} success={}",
            userId, operation, path, size, success);
    }
}
