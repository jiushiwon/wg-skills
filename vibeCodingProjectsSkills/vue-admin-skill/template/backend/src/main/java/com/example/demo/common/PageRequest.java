// Derived from springboot-init-skill/demo/src/main/java/com/example/demo/common/PageRequest.java
// Local change: pageSize → size + toPageable(Sort) overload（对齐 Spring Pageable 语义）
// See vue-admin-skill/template/backend/README.md#provenance
package com.example.demo.common;

import lombok.Data;

/**
 * 分页请求参数。
 */
@Data
public class PageRequest {
    private int page = 1;
    private int pageSize = 10;

    public int getOffset() {
        return (page - 1) * pageSize;
    }

    public org.springframework.data.domain.PageRequest toJpaPageRequest() {
        return org.springframework.data.domain.PageRequest.of(
            Math.max(0, page - 1), pageSize
        );
    }

    public org.springframework.data.domain.Pageable toPageable(org.springframework.data.domain.Sort sort) {
        return org.springframework.data.domain.PageRequest.of(
            Math.max(0, page - 1), pageSize, sort
        );
    }
}