package com.example.demo.auth.repository;

import com.example.demo.auth.entity.SysRoleMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysRoleMenuRepository extends JpaRepository<SysRoleMenu, Long> {

    List<SysRoleMenu> findByRoleId(Long roleId);

    long countByRoleId(Long roleId);

    /**
     * 按 userId 装载权限标识。
     *
     * <p>⚠️ 必须过滤 {@code m.deletedAt IS NULL}，否则软删除菜单的权限仍会生效。</p>
     */
    @Query("SELECT m.permission FROM SysMenu m WHERE m.id IN " +
        "(SELECT rm.menuId FROM SysRoleMenu rm WHERE rm.roleId IN " +
        "(SELECT ur.roleId FROM SysUserRole ur WHERE ur.userId = :userId)) " +
        "AND m.permission IS NOT NULL AND m.deletedAt IS NULL")
    List<String> findPermissionsByUserId(@Param("userId") Long userId);

    @Query("SELECT rm.menuId FROM SysRoleMenu rm WHERE rm.roleId IN " +
        "(SELECT ur.roleId FROM SysUserRole ur WHERE ur.userId = :userId)")
    List<Long> findMenuIdsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM SysRoleMenu rm WHERE rm.roleId = :roleId")
    void deleteByRoleId(@Param("roleId") Long roleId);
}
