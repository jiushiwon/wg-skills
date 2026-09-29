package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "创建用户请求")
public class CreateUserRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    private String nickname;
    private String email;
    private String phone;
    private String avatar;
    private Long tenantId;
    private Long orgId;
    private Integer status;
    private List<Long> roleIds;
    private List<Long> postIds;
}
