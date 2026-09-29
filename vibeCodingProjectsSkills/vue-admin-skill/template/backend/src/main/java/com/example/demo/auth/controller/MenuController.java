package com.example.demo.auth.controller;

import com.example.demo.auth.dto.CreateMenuRequest;
import com.example.demo.auth.dto.MenuNode;
import com.example.demo.auth.dto.UpdateMenuRequest;
import com.example.demo.auth.service.MenuService;
import com.example.demo.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "菜单管理")
@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @Operation(summary = "菜单树（全量，不受当前用户角色限制）")
    @PreAuthorize("hasAuthority('system:menu:list')")
    @GetMapping
    public ApiResponse<List<MenuNode>> tree() {
        return ApiResponse.success(menuService.tree());
    }

    @Operation(summary = "创建菜单")
    @PreAuthorize("hasAuthority('system:menu:create')")
    @PostMapping
    public ApiResponse<MenuNode> create(@Valid @RequestBody CreateMenuRequest req) {
        return ApiResponse.success(menuService.create(req));
    }

    @Operation(summary = "更新菜单")
    @PreAuthorize("hasAuthority('system:menu:edit')")
    @PutMapping("/{id}")
    public ApiResponse<MenuNode> update(@PathVariable Long id, @RequestBody UpdateMenuRequest req) {
        return ApiResponse.success(menuService.update(id, req));
    }

    @Operation(summary = "删除菜单（软删除，有子菜单时不可删）")
    @PreAuthorize("hasAuthority('system:menu:delete')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        menuService.delete(id);
        return ApiResponse.success(null);
    }
}
