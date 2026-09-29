package com.example.demo.auth.controller;

import com.example.demo.auth.dto.CreateOrgRequest;
import com.example.demo.auth.dto.OrgNode;
import com.example.demo.auth.service.OrgService;
import com.example.demo.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "组织架构")
@RestController
@RequestMapping("/api/orgs")
@RequiredArgsConstructor
public class OrgController {

    private final OrgService orgService;

    @Operation(summary = "组织树")
    @PreAuthorize("hasAuthority('system:org:list')")
    @GetMapping
    public ApiResponse<List<OrgNode>> tree() {
        return ApiResponse.success(orgService.tree());
    }

    @Operation(summary = "创建组织")
    @PreAuthorize("hasAuthority('system:org:create')")
    @PostMapping
    public ApiResponse<OrgNode> create(@Valid @RequestBody CreateOrgRequest req) {
        return ApiResponse.success(orgService.create(req));
    }

    @Operation(summary = "更新组织")
    @PreAuthorize("hasAuthority('system:org:edit')")
    @PutMapping("/{id}")
    public ApiResponse<OrgNode> update(@PathVariable Long id, @RequestBody CreateOrgRequest req) {
        return ApiResponse.success(orgService.update(id, req));
    }

    @Operation(summary = "删除组织（软删除，有子部门时不可删）")
    @PreAuthorize("hasAuthority('system:org:delete')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        orgService.delete(id);
        return ApiResponse.success(null);
    }
}
