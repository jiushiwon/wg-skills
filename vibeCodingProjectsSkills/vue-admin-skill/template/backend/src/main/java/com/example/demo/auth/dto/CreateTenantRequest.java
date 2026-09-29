package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "创建租户请求")
public class CreateTenantRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private Integer status;
}
