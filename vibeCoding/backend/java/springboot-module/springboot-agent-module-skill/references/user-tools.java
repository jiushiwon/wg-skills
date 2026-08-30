// 用户相关 Tools

package com.{package}.agent.tool;

import com.{package}.auth.service.SysUserService;
import com.{package}.agent.tool.Tool;
import com.{package}.agent.tool.ToolParam;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Map;

/**
 * 用户相关 Tool
 */
@Component
@RequiredArgsConstructor
public class UserTools {

    private final SysUserService sysUserService;

    @Tool(name = "getUserInfo", description = "获取用户信息")
    public Map<String, Object> getUserInfo(
        @ToolParam(description = "用户ID，不传则查当前用户") Long userId,
        @ToolParam(description = "当前登录用户ID") Long currentUserId
    ) {
        // 如果未传 userId，则查当前用户
        Long queryUserId = userId != null ? userId : currentUserId;

        var user = sysUserService.getById(queryUserId);
        if (user == null) {
            return Map.of("error", "用户不存在");
        }

        return Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "nickname", user.getNickname() != null ? user.getNickname() : "",
            "email", user.getEmail() != null ? user.getEmail() : "",
            "phone", user.getPhone() != null ? user.getPhone() : "",
            "orgId", user.getOrgId() != null ? user.getOrgId() : 0,
            "status", user.getStatus()
        );
    }

    @Tool(name = "getUserRoles", description = "获取用户角色")
    public Map<String, Object> getUserRoles(
        @ToolParam(description = "用户ID") Long userId,
        @ToolParam(description = "当前登录用户ID") Long currentUserId
    ) {
        Long queryUserId = userId != null ? userId : currentUserId;
        var roles = sysUserService.getUserRoles(queryUserId);
        return Map.of("roles", roles);
    }

    @Tool(name = "getUserMenus", description = "获取用户菜单权限")
    public Map<String, Object> getUserMenus(
        @ToolParam(description = "用户ID") Long userId,
        @ToolParam(description = "当前登录用户ID") Long currentUserId
    ) {
        Long queryUserId = userId != null ? userId : currentUserId;
        // 需要调用 Auth 模块的服务
        var menus = sysUserService.getUserMenus(queryUserId);
        return Map.of("menus", menus);
    }

    @Tool(name = "searchUsers", description = "搜索用户")
    public Map<String, Object> searchUsers(
        @ToolParam(description = "搜索关键词") String keyword,
        @ToolParam(description = "返回数量限制") Integer limit
    ) {
        int queryLimit = limit != null && limit > 0 ? Math.min(limit, 50) : 10;
        var users = sysUserService.searchUsers(keyword, queryLimit);
        return Map.of(
            "total", users.size(),
            "users", users.stream().map(u -> Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "nickname", u.getNickname() != null ? u.getNickname() : ""
            )).toList()
        );
    }
}
