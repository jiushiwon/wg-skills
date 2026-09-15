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
    private int size;

    public static <T> PageResponse<T> from(Page<T> p) {
        PageResponse<T> r = new PageResponse<>();
        r.setItems(p.getContent());
        r.setTotal(p.getTotalElements());
        r.setPage(p.getNumber() + 1);
        r.setSize(p.getSize());
        return r;
    }
}