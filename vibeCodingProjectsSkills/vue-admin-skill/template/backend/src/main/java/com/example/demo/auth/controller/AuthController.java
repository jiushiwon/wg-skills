package com.example.demo.auth.controller;

import com.example.demo.auth.dto.ChangePasswordRequest;
import com.example.demo.auth.dto.LoginRequest;
import com.example.demo.auth.dto.LoginResponse;
import com.example.demo.auth.dto.MenuNode;
import com.example.demo.auth.dto.RefreshTokenRequest;
import com.example.demo.auth.dto.UserInfoResponse;
import com.example.demo.auth.service.AuthService;
import com.example.demo.common.ApiResponse;
import com.example.demo.common.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 认证控制器。
 *
 * <p>`login` / `refresh` 放行（`SecurityConfig` 中 permitAll）；`logout` / `me` / `password` / `menus`
 * 只要求 `authenticated()`，**不加** `@PreAuthorize` —— 人人可用自己的信息。</p>
 */
@Tag(name = "认证")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "登录")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.success(authService.login(req));
    }

    @Operation(summary = "刷新令牌")
    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ApiResponse.success(authService.refresh(req));
    }

    @Operation(summary = "登出")
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // JWT 无状态，客户端清除 token 即可
        return ApiResponse.success(null);
    }

    @Operation(summary = "当前用户信息")
    @GetMapping("/me")
    public ApiResponse<UserInfoResponse> me(@CurrentUser Long userId) {
        return ApiResponse.success(authService.me(userId));
    }

    @Operation(summary = "修改密码")
    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@CurrentUser Long userId,
                                            @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(userId, req);
        return ApiResponse.success(null);
    }

    @Operation(summary = "当前用户菜单树")
    @GetMapping("/menus")
    public ApiResponse<List<MenuNode>> menus(@CurrentUser Long userId) {
        return ApiResponse.success(authService.getMenus(userId));
    }
}
