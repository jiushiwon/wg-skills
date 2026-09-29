package com.example.demo.auth.repository;

import com.example.demo.auth.entity.SysUserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysUserRoleRepository extends JpaRepository<SysUserRole, Long> {

    List<SysUserRole> findByUserId(Long userId);

    long countByRoleId(Long roleId);

    @Query("SELECT r.code FROM SysRole r WHERE r.id IN " +
        "(SELECT ur.roleId FROM SysUserRole ur WHERE ur.userId = :userId)")
    List<String> findRoleCodesByUserId(@Param("userId") Long userId);

    @Query("SELECT r.dataScope FROM SysRole r WHERE r.id IN " +
        "(SELECT ur.roleId FROM SysUserRole ur WHERE ur.userId = :userId)")
    List<String> findDataScopesByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM SysUserRole ur WHERE ur.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
