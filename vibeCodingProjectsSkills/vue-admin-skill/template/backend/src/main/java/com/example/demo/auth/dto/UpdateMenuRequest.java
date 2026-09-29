package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "更新菜单请求")
public class UpdateMenuRequest {
    private Long parentId;
    private String name;
    private String path;
    private String component;
    private String menuType;
    private String icon;
    private String permission;
    private Integer sortOrder;
    private Integer visible;
    private Integer status;
}
