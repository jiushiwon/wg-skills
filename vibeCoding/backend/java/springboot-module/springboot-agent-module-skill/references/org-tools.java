// 组织架构 Tools

package com.{package}.agent.tool;

import com.{package}.auth.service.SysOrgService;
import com.{package}.auth.service.SysPostService;
import com.{package}.auth.service.SysTenantService;
import com.{package}.agent.tool.Tool;
import com.{package}.agent.tool.ToolParam;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Map;

/**
 * 组织架构 Tool
 */
@Component
@RequiredArgsConstructor
public class OrgTools {

    private final SysOrgService sysOrgService;
    private final SysPostService sysPostService;
    private final SysTenantService sysTenantService;

    @Tool(name = "getOrgTree", description = "获取组织架构树")
    public Map<String, Object> getOrgTree(
        @ToolParam(description = "当前登录用户ID") Long currentUserId
    ) {
        var orgTree = sysOrgService.getOrgTree();
        return Map.of("orgTree", orgTree);
    }

    @Tool(name = "getOrgDetail", description = "获取部门详情")
    public Map<String, Object> getOrgDetail(
        @ToolParam(description = "部门ID") Long orgId,
        @ToolParam(description = "当前登录用户ID") Long currentUserId
    ) {
        var org = sysOrgService.getById(orgId);
        if (org == null) {
            return Map.of("error", "部门不存在");
        }
        return Map.of(
            "id", org.getId(),
            "name", org.getName(),
            "parentId", org.getParentId() != null ? org.getParentId() : 0,
            "sortOrder", org.getSortOrder(),
            "status", org.getStatus()
        );
    }

    @Tool(name = "getPostList", description = "获取岗位列表")
    public Map<String, Object> getPostList(
        @ToolParam(description = "岗位状态") Integer status,
        @ToolParam(description = "当前登录用户ID") Long currentUserId
    ) {
        var posts = sysPostService.list(status);
        return Map.of("posts", posts.stream().map(p -> Map.of(
            "id", p.getId(),
            "name", p.getName(),
            "code", p.getCode()
        )).toList());
    }

    @Tool(name = "getTenantInfo", description = "获取租户信息")
    public Map<String, Object> getTenantInfo(
        @ToolParam(description = "当前登录用户ID") Long currentUserId
    ) {
        var user = sysOrgService.getUserTenantId(currentUserId);
        if (user == null || user.getTenantId() == null) {
            return Map.of("error", "租户信息不存在");
        }
        var tenant = sysTenantService.getById(user.getTenantId());
        return Map.of(
            "id", tenant.getId(),
            "name", tenant.getName(),
            "code", tenant.getCode()
        );
    }
}
