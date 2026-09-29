package com.example.demo.auth.permission;

import com.example.demo.auth.repository.SysRoleMenuRepository;
import com.example.demo.auth.repository.SysUserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 按 userId 装载角色码与权限标识。
 *
 * ponytail: 未加缓存。权限变更稀疏，缓存收益有限；如需缓存请以 userId 为 key，
 * 并在 RoleService.assignMenus / UserService.assignRoles 之后精确失效。
 */
@Component
@RequiredArgsConstructor
public class AuthorityLoader {

    private final SysUserRoleRepository userRoleRepository;
    private final SysRoleMenuRepository roleMenuRepository;

    public List<String> roleCodes(Long userId) {
        return userRoleRepository.findRoleCodesByUserId(userId);
    }

    public Set<String> permissions(Long userId) {
        return new HashSet<>(roleMenuRepository.findPermissionsByUserId(userId));
    }

    public List<String> dataScopes(Long userId) {
        return userRoleRepository.findDataScopesByUserId(userId);
    }
}
