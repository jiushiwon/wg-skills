package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "创建组织请求")
public class CreateOrgRequest {
    private Long parentId;

    @NotBlank
    private String name;

    private Integer sortOrder;
    private Long leaderUserId;
    private String phone;
    private String email;
    private Integer status;
    private Long tenantId;
}
