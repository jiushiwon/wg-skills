package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "创建角色请求")
public class CreateRoleRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private String description;
    private DataScope dataScope;
    private Integer sortOrder;
    private Integer status;
    private List<Long> menuIds;
}
