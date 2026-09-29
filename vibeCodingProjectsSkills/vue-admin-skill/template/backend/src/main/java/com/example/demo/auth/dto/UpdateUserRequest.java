package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "更新用户请求")
public class UpdateUserRequest {
    private String nickname;
    private String email;
    private String phone;
    private String avatar;
    private Long orgId;
    private Integer status;
    private String password;
}
