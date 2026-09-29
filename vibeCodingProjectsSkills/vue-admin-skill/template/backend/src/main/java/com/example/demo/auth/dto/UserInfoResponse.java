package com.example.demo.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@Schema(description = "当前登录用户信息")
public class UserInfoResponse {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private String avatar;
    private Long tenantId;
    private Long orgId;
    private Integer status;
    private List<String> roles;
    private List<String> permissions;
}
