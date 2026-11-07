package com.{package}.agent.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Agent 对话错误码
 * 与 fastapi-agent-module-skill ChatErrorCode 完全对齐
 */
@Getter
@AllArgsConstructor
public enum ChatErrorCode {

    SUCCESS(0, "成功"),
    GENERAL_ERROR(-1, "通用错误"),
    SESSION_OWNERSHIP(-1001, "会话归属校验失败"),
    SESSION_NOT_FOUND(-1002, "会话不存在"),
    RATE_LIMIT(-429, "请求频率超限"),
    LLM_CALL_FAILED(-5001, "LLM 调用失败"),
    TOOL_EXECUTION_FAILED(-5002, "Tool 执行失败"),
    TIMEOUT(-5003, "对话处理超时"),
    INTERNAL_ERROR(-5000, "Agent 内部错误");

    private final int code;
    private final String message;

    /**
     * 根据 code 获取枚举
     */
    public static ChatErrorCode fromCode(int code) {
        for (ChatErrorCode e : values()) {
            if (e.code == code) return e;
        }
        return GENERAL_ERROR;
    }
}
