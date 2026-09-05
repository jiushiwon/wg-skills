package {basePackage}.agent.tool;

import {basePackage}.auth.entity.SysRole;
import {basePackage}.auth.entity.SysUser;
import {basePackage}.auth.service.SysMenuService;
import {basePackage}.auth.service.SysRoleService;
import {basePackage}.auth.service.SysUserService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 用户相关 Tool
 * userId 为 @CurrentUser 系统注入参数，LLM 无法篡改
 */
@Slf4j
@Component
public class UserTools extends BaseTool {

    @Autowired
    private SysUserService userService;

    @Autowired
    private SysRoleService roleService;

    @Autowired
    private SysMenuService menuService;

    /**
     * 获取当前用户基本信息（脱敏）
     * 不返回手机号、邮箱等 PII 字段
     */
    @AgentTool(name = "getUserInfo", description = "获取当前用户基本信息（不含手机号/邮箱）")
    public Map<String, Object> getUserInfo(
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {
        SysUser user = userService.selectUserById(userId);
        if (user == null) {
            return Map.of("error", "用户不存在");
        }
        return Map.of(
            "id", user.getUserId(),
            "username", user.getUserName(),
            "nickname", user.getNickName(),
            "dept", user.getDept() != null ? user.getDept().getDeptName() : "未分配"
        );
    }

    /**
     * 获取当前用户角色列表
     */
    @AgentTool(name = "getUserRoles", description = "获取当前用户角色列表")
    public List<Map<String, Object>> getUserRoles(
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {
        List<SysRole> roles = roleService.selectRolesByUserId(userId);
        return roles.stream()
            .map(r -> Map.<String, Object>of(
                "roleId", r.getRoleId(),
                "roleName", r.getRoleName(),
                "roleKey", r.getRoleKey()
            ))
            .toList();
    }

    /**
     * 获取当前用户菜单权限
     */
    @AgentTool(name = "getUserMenus", description = "获取当前用户菜单权限列表")
    public List<String> getUserMenus(
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {
        return menuService.selectMenuPermsByUserId(userId);
    }

    /**
     * 搜索用户（脱敏：ID/用户名/昵称，不含敏感信息）
     */
    @AgentTool(name = "searchUsers", description = "搜索用户（返回ID/用户名/昵称，不含敏感信息）")
    public List<Map<String, Object>> searchUsers(
            @ToolParam(description = "搜索关键词") @Size(min = 1, max = 50) String keyword,
            @ToolParam(description = "返回数量上限") @Min(1) @Max(50) Integer limit,
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {
        return userService.searchUsers(keyword, limit).stream()
            .map(u -> Map.<String, Object>of(
                "id", u.getUserId(),
                "username", u.getUserName(),
                "nickname", u.getNickName()
            ))
            .toList();
    }
}
