package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 租户视图对象。
 */
@Data
@Schema(description = "租户视图对象")
public class TenantVO {

    private Long id;
    private String name;
    private String code;
    private Integer status;

    @Schema(description = "创建时间，yyyy-MM-dd HH:mm:ss")
    private String createdAt;
    @Schema(description = "更新时间，yyyy-MM-dd HH:mm:ss")
    private String updatedAt;
}
