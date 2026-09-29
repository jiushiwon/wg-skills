// Derived from springboot-init-skill/demo/src/main/java/com/example/demo/common/PageResponse.java
// See vue-admin-skill/template/backend/README.md#provenance
package com.example.demo.common;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 分页响应。
 */
@Data
public class PageResponse<T> {
    private List<T> items;
    private long total;
    private int page;
    private int pageSize;

    public static <T> PageResponse<T> from(Page<T> p) {
        PageResponse<T> r = new PageResponse<>();
        r.setItems(p.getContent());
        r.setTotal(p.getTotalElements());
        r.setPage(p.getNumber() + 1);
        r.setPageSize(p.getSize());
        return r;
    }
}