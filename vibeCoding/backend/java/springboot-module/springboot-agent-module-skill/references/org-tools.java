package {basePackage}.agent.tool;

import {basePackage}.auth.entity.SysDept;
import {basePackage}.auth.entity.SysPost;
import {basePackage}.auth.entity.SysUser;
import {basePackage}.auth.service.SysDeptService;
import {basePackage}.auth.service.SysPostService;
import {basePackage}.auth.service.SysTenantService;
import {basePackage}.auth.service.SysUserService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 组织架构 Tool
 * 全部按 tenant 过滤，多租户安全
 */
@Slf4j
@Component
public class OrgTools extends BaseTool {

    @Autowired
    private SysDeptService deptService;

    @Autowired
    private SysPostService postService;

    @Autowired
    private SysTenantService tenantService;

    @Autowired
    private SysUserService userService;

    /**
     * 获取当前租户组织架构树
     * 通过 userId 查询 tenantId，按 tenant 过滤
     */
    @AgentTool(name = "getOrgTree", description = "获取当前租户组织架构树")
    public List<Map<String, Object>> getOrgTree(
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {
        Long tenantId = getTenantId(userId);
        List<SysDept> depts = deptService.selectDeptListByTenantId(tenantId);
        return buildDeptTree(depts, 0L);
    }

    /**
     * 获取当前租户部门详情
     */
    @AgentTool(name = "getOrgDetail", description = "获取当前租户部门详情")
    public Map<String, Object> getOrgDetail(
            @ToolParam(description = "部门ID") Long orgId,
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {
        Long tenantId = getTenantId(userId);
        SysDept dept = deptService.selectDeptById(orgId);
        if (dept == null || !tenantId.equals(dept.getTenantId())) {
            return Map.of("error", "部门不存在或无权访问");
        }
        return Map.of(
            "deptId", dept.getDeptId(),
            "deptName", dept.getDeptName(),
            "leader", dept.getLeader() != null ? dept.getLeader() : "",
            "parentId", dept.getParentId(),
            "status", dept.getStatus()
        );
    }

    /**
     * 获取当前租户岗位列表（分页）
     */
    @AgentTool(name = "getPostList", description = "获取当前租户岗位列表")
    public List<Map<String, Object>> getPostList(
            @ToolParam(description = "当前用户ID（系统注入）") Long userId,
            @ToolParam(description = "状态（0正常 1停用）") @Min(0) @Max(1) Integer status,
            @ToolParam(description = "页码") @Min(1) Integer page,
            @ToolParam(description = "每页数量") @Min(1) @Max(50) Integer pageSize) {
        Long tenantId = getTenantId(userId);
        List<SysPost> posts = postService.selectPostListByTenantId(tenantId, status, page, pageSize);
        return posts.stream()
            .map(p -> Map.<String, Object>of(
                "postId", p.getPostId(),
                "postName", p.getPostName(),
                "postCode", p.getPostCode(),
                "status", p.getStatus()
            ))
            .toList();
    }

    /**
     * 获取当前用户所属租户信息
     */
    @AgentTool(name = "getTenantInfo", description = "获取当前用户所属租户信息")
    public Map<String, Object> getTenantInfo(
            @ToolParam(description = "当前用户ID（系统注入）") Long userId) {
        SysUser user = userService.selectUserById(userId);
        if (user == null) {
            return Map.of("error", "用户不存在");
        }
        Long tenantId = user.getTenantId();
        if (tenantId == null) {
            return Map.of("error", "用户未分配租户");
        }
        var tenant = tenantService.selectTenantById(tenantId);
        if (tenant == null) {
            return Map.of("error", "租户不存在");
        }
        return Map.of(
            "tenantId", tenant.getTenantId(),
            "tenantName", tenant.getTenantName(),
            "contactName", tenant.getContactName() != null ? tenant.getContactName() : "",
            "status", tenant.getStatus()
        );
    }

    /**
     * 通过用户ID获取租户ID
     */
    private Long getTenantId(Long userId) {
        SysUser user = userService.selectUserById(userId);
        if (user == null || user.getTenantId() == null) {
            throw new RuntimeException("用户未分配租户");
        }
        return user.getTenantId();
    }

    /**
     * 构建部门树
     */
    private List<Map<String, Object>> buildDeptTree(List<SysDept> depts, Long parentId) {
        return depts.stream()
            .filter(d -> parentId.equals(d.getParentId()))
            .map(d -> {
                Map<String, Object> node = new java.util.HashMap<>();
                node.put("deptId", d.getDeptId());
                node.put("deptName", d.getDeptName());
                node.put("children", buildDeptTree(depts, d.getDeptId()));
                return node;
            })
            .toList();
    }
}
