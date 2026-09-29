package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "创建菜单请求")
public class CreateMenuRequest {
    private Long parentId;

    @NotBlank
    private String name;

    private String path;
    private String component;

    @Schema(description = "M=目录 C=菜单 F=按钮（只允许这三个值）")
    private String menuType;

    private String icon;
    private String permission;
    private Integer sortOrder;
    private Integer visible;
    private Integer status;
    private Long tenantId;
}
