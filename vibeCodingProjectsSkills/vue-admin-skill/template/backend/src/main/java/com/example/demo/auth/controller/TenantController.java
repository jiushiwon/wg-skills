package com.example.demo.auth.controller;

import com.example.demo.auth.dto.CreateTenantRequest;
import com.example.demo.auth.dto.TenantVO;
import com.example.demo.auth.service.TenantService;
import com.example.demo.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "租户管理")
@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @Operation(summary = "租户列表")
    @PreAuthorize("hasAuthority('system:tenant:list')")
    @GetMapping
    public ApiResponse<List<TenantVO>> list() {
        return ApiResponse.success(tenantService.list());
    }

    @Operation(summary = "创建租户")
    @PreAuthorize("hasAuthority('system:tenant:create')")
    @PostMapping
    public ApiResponse<TenantVO> create(@Valid @RequestBody CreateTenantRequest req) {
        return ApiResponse.success(tenantService.create(req));
    }

    @Operation(summary = "更新租户")
    @PreAuthorize("hasAuthority('system:tenant:edit')")
    @PutMapping("/{id}")
    public ApiResponse<TenantVO> update(@PathVariable Long id, @RequestBody CreateTenantRequest req) {
        return ApiResponse.success(tenantService.update(id, req));
    }

    @Operation(summary = "删除租户（软删除）")
    @PreAuthorize("hasAuthority('system:tenant:delete')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tenantService.delete(id);
        return ApiResponse.success(null);
    }
}
