package com.example.demo.common;

import lombok.Data;

/**
 * 分页请求参数。
 */
@Data
public class PageRequest {
    private int page = 1;
    private int size = 10;

    public int getOffset() {
        return (page - 1) * size;
    }

    public org.springframework.data.domain.PageRequest toJpaPageRequest() {
        return org.springframework.data.domain.PageRequest.of(
            Math.max(0, page - 1), size
        );
    }
}