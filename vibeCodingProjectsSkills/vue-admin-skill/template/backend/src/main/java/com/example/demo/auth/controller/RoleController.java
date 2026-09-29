package com.example.demo.auth.controller;

import com.example.demo.auth.dto.AssignMenusRequest;
import com.example.demo.auth.dto.CreateRoleRequest;
import com.example.demo.auth.dto.RoleVO;
import com.example.demo.auth.dto.UpdateRoleRequest;
import com.example.demo.auth.service.RoleService;
import com.example.demo.common.ApiResponse;
import com.example.demo.common.PageRequest;
import com.example.demo.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "角色管理")
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @Operation(summary = "角色列表（分页）")
    @PreAuthorize("hasAuthority('system:role:list')")
    @GetMapping
    public ApiResponse<PageResponse<RoleVO>> page(
        PageRequest pageReq,
        @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(roleService.page(pageReq, keyword));
    }

    @Operation(summary = "角色详情")
    @PreAuthorize("hasAuthority('system:role:list')")
    @GetMapping("/{id}")
    public ApiResponse<RoleVO> get(@PathVariable Long id) {
        return ApiResponse.success(roleService.getVO(id));
    }

    @Operation(summary = "创建角色")
    @PreAuthorize("hasAuthority('system:role:create')")
    @PostMapping
    public ApiResponse<RoleVO> create(@Valid @RequestBody CreateRoleRequest req) {
        return ApiResponse.success(roleService.create(req));
    }

    @Operation(summary = "更新角色")
    @PreAuthorize("hasAuthority('system:role:edit')")
    @PutMapping("/{id}")
    public ApiResponse<RoleVO> update(@PathVariable Long id, @RequestBody UpdateRoleRequest req) {
        return ApiResponse.success(roleService.update(id, req));
    }

    @Operation(summary = "删除角色")
    @PreAuthorize("hasAuthority('system:role:delete')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ApiResponse.success(null);
    }

    @Operation(summary = "分配菜单（全量覆盖）")
    @PreAuthorize("hasAuthority('system:role:assign-menu')")
    @PutMapping("/{id}/menus")
    public ApiResponse<Void> assignMenus(@PathVariable Long id, @RequestBody AssignMenusRequest req) {
        roleService.assignMenus(id, req);
        return ApiResponse.success(null);
    }

    // ==================== 回填接口（红线 R10） ====================
    // 缺这个接口，前端「分配菜单」弹窗每次都是空树全不选，点确定即清空该角色全部权限。

    @Operation(summary = "查询角色已分配菜单 ID（回填）")
    @PreAuthorize("hasAuthority('system:role:list')")
    @GetMapping("/{id}/menus")
    public ApiResponse<List<Long>> menuIds(@PathVariable Long id) {
        return ApiResponse.success(roleService.getMenuIds(id));
    }
}
