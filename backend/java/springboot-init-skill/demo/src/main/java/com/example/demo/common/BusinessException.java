package com.example.demo.common;

import lombok.Getter;

/**
 * 业务异常，携带错误码。
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String message) {
        super(message);
        this.code = -2000;
    }

    public static BusinessException badRequest(String message) {
        return new BusinessException(-1001, message);
    }

    public static BusinessException unauthorized(String message) {
        return new BusinessException(-1002, message);
    }

    public static BusinessException forbidden(String message) {
        return new BusinessException(-1003, message);
    }

    public static BusinessException notFound(String message) {
        return new BusinessException(-1004, message);
    }

    public static BusinessException conflict(String message) {
        return new BusinessException(-1005, message);
    }
}