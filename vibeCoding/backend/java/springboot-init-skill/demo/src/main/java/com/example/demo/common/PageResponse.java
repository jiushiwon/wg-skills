package com.example.demo.common;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 分页响应。
 *
 * ponytail: 字段名必须与前端 `types/api.d.ts` 的 `PageResponse<T>` 对齐（lombok @Data 自动生成 getter/setter，
 *          序列化由 Jackson 控制 —— 字段名 = JSON key）。
 * 历史：2026-10-03 之前字段叫 `items`（jackson 默认）+ `size`（Spring Data 原生名），
 *          导致前端 `res.list=undefined` → 4 个分页表格空（users/roles/apps/products）。
 *          改为 `list` + `pageSize` 后两端对齐，PageResponse.from 同步改 setList()/setPageSize()。
 *
 * ⚠️ 修改本文件后必须同步：
 *   - springboot-init-skill/demo/src/main/java/com/example/demo/common/PageResponse.java（自身）
 *   - vue-admin-skill/template/backend/src/main/java/com/example/demo/common/PageResponse.java
 *   - vue-admin-skill/template/frontend/src/types/api.d.ts（确认 PageResponse.list 字段名一致）
 */
@Data
public class PageResponse<T> {
    private List<T> list;
    private long total;
    private int page;
    private int pageSize;

    public static <T> PageResponse<T> from(Page<T> p) {
        PageResponse<T> r = new PageResponse<>();
        r.setList(p.getContent());
        r.setTotal(p.getTotalElements());
        r.setPage(p.getNumber() + 1);
        r.setPageSize(p.getSize());
        return r;
    }
}