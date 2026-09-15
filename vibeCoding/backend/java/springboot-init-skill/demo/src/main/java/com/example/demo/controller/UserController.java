package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.CurrentUser;
import com.example.demo.common.PageResponse;
import com.example.demo.dto.user.*;
import com.example.demo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "用户列表")
    @GetMapping
    public ApiResponse<PageResponse<UserResponse>> list(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(PageResponse.from(userService.list(page, size).map(u -> u)));
    }

    @Operation(summary = "用户详情")
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(userService.getById(id));
    }

    @Operation(summary = "创建用户")
    @PostMapping
    public ApiResponse<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        return ApiResponse.success(userService.create(req));
    }

    @Operation(summary = "修改个人资料")
    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateProfile(
        @CurrentUser Long userId,
        @Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.success(userService.updateProfile(userId, req));
    }

    @Operation(summary = "修改密码")
    @PutMapping("/password")
    public ApiResponse<Void> changePassword(
        @CurrentUser Long userId,
        @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(userId, req);
        return ApiResponse.success(null);
    }
}