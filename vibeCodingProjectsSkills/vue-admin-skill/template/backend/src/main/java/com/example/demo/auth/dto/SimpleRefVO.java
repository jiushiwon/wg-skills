package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 轻量引用对象（id / name / code）。
 *
 * <p>用于用户详情里的 `roles` / `posts`，形如 `[{ "id": 1, "name": "超级管理员", "code": "super_admin" }]`。
 */
@Data
@Schema(description = "轻量引用（id/name/code）")
public class SimpleRefVO {
    private Long id;
    private String name;
    private String code;
}
