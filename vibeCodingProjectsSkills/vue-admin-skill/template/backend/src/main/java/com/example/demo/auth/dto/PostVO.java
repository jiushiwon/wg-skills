package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 岗位视图对象。
 */
@Data
@Schema(description = "岗位视图对象")
public class PostVO {

    private Long id;
    private String name;
    private String code;
    private Long tenantId;
    private Integer sortOrder;
    private Integer status;

    @Schema(description = "创建时间，yyyy-MM-dd HH:mm:ss")
    private String createdAt;
}
