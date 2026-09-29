package com.example.demo.auth.permission;

import com.example.demo.auth.common.AuthPerms;
import com.example.demo.auth.dto.DataScope;
import com.example.demo.auth.entity.SysUser;
import com.example.demo.auth.repository.SysUserRepository;
import com.example.demo.common.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 权限评估器：解析角色码、权限集合与**四级**数据权限档位。
 */
@Component
@RequiredArgsConstructor
public class PermissionEvaluator {

    private final SysUserRepository userRepository;
    private final AuthorityLoader authorityLoader;

    public SysUser loadUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.unauthorized("用户不存在"));
    }

    public List<String> roleCodes(Long userId) {
        return authorityLoader.roleCodes(userId);
    }

    public boolean hasPermission(Long userId, String required) {
        return authorityLoader.permissions(userId).contains(required);
    }

    public boolean isSuperAdmin(Long userId) {
        return authorityLoader.roleCodes(userId).contains(AuthPerms.ROLE_SUPER_ADMIN);
    }

    /**
     * 解析数据权限档位。超级管理员恒为 ALL；其余按多角色取**最宽**档。
     *
     * ponytail: 历史实现只返回 ALL / SELF_ONLY，其余档位被静默折叠 → 权限"看起来生效实则失效"。
     */
    public DataScope resolveDataScope(Long userId) {
        if (isSuperAdmin(userId)) return DataScope.ALL;
        return DataScope.widestOf(authorityLoader.dataScopes(userId));
    }
}
