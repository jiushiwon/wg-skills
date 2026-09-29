package com.example.demo.auth.controller;

import com.example.demo.auth.dto.AssignPostsRequest;
import com.example.demo.auth.dto.AssignRolesRequest;
import com.example.demo.auth.dto.CreateUserRequest;
import com.example.demo.auth.dto.ResetPasswordRequest;
import com.example.demo.auth.dto.UpdateUserRequest;
import com.example.demo.auth.dto.UserVO;
import com.example.demo.auth.service.UserService;
import com.example.demo.common.ApiResponse;
import com.example.demo.common.CurrentUser;
import com.example.demo.common.PageRequest;
import com.example.demo.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户管理。
 *
 * <p>权限码与 `AuthPerms` 逐字一致（注解只接受编译期常量，故此处写字面量）。</p>
 */
@Tag(name = "用户管理")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "用户列表（分页）")
    @PreAuthorize("hasAuthority('system:user:list')")
    @GetMapping
    public ApiResponse<PageResponse<UserVO>> page(
        PageRequest pageReq,
        @RequestParam(required = false) String username,
        @RequestParam(required = false) Integer status,
        @CurrentUser Long currentUserId
    ) {
        return ApiResponse.success(userService.page(pageReq, username, status, currentUserId));
    }

    @Operation(summary = "用户详情")
    @PreAuthorize("hasAuthority('system:user:list')")
    @GetMapping("/{id}")
    public ApiResponse<UserVO> get(@PathVariable Long id) {
        return ApiResponse.success(userService.getVO(id));
    }

    @Operation(summary = "创建用户")
    @PreAuthorize("hasAuthority('system:user:create')")
    @PostMapping
    public ApiResponse<UserVO> create(@Valid @RequestBody CreateUserRequest req) {
        return ApiResponse.success(userService.create(req));
    }

    @Operation(summary = "更新用户")
    @PreAuthorize("hasAuthority('system:user:edit')")
    @PutMapping("/{id}")
    public ApiResponse<UserVO> update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) {
        return ApiResponse.success(userService.update(id, req));
    }

    @Operation(summary = "删除用户（软删除，不能删自己 / 内置 admin）")
    @PreAuthorize("hasAuthority('system:user:delete')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @CurrentUser Long currentUserId) {
        userService.delete(id, currentUserId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "分配角色（全量覆盖）")
    @PreAuthorize("hasAuthority('system:user:assign-role')")
    @PutMapping("/{id}/roles")
    public ApiResponse<Void> assignRoles(@PathVariable Long id, @RequestBody AssignRolesRequest req) {
        userService.assignRoles(id, req);
        return ApiResponse.success(null);
    }

    @Operation(summary = "分配岗位（全量覆盖）")
    @PreAuthorize("hasAuthority('system:user:assign-post')")
    @PutMapping("/{id}/posts")
    public ApiResponse<Void> assignPosts(@PathVariable Long id, @RequestBody AssignPostsRequest req) {
        userService.assignPosts(id, req);
        return ApiResponse.success(null);
    }

    @Operation(summary = "重置用户密码（管理员）")
    @PreAuthorize("hasAuthority('system:user:reset-pwd')")
    @PutMapping("/{id}/password")
    public ApiResponse<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest req) {
        userService.resetPassword(id, req.getNewPassword());
        return ApiResponse.success(null);
    }

    // ==================== 回填接口（红线 R10） ====================
    // 缺这两个接口，前端「分配角色 / 分配岗位」弹窗每次空选，点确定即清空已有分配。

    @Operation(summary = "查询用户已分配角色 ID（回填）")
    @PreAuthorize("hasAuthority('system:user:list')")
    @GetMapping("/{id}/roles")
    public ApiResponse<List<Long>> roleIds(@PathVariable Long id) {
        return ApiResponse.success(userService.getRoleIds(id));
    }

    @Operation(summary = "查询用户已分配岗位 ID（回填）")
    @PreAuthorize("hasAuthority('system:user:list')")
    @GetMapping("/{id}/posts")
    public ApiResponse<List<Long>> postIds(@PathVariable Long id) {
        return ApiResponse.success(userService.getPostIds(id));
    }
}
