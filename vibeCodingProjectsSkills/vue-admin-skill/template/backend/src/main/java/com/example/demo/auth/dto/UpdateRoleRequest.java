package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "更新角色请求")
public class UpdateRoleRequest {
    private String name;
    private String description;
    private DataScope dataScope;
    private Integer sortOrder;
    private Integer status;
}
