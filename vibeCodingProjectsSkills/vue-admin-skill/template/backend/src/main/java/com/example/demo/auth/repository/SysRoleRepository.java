package com.example.demo.auth.repository;

import com.example.demo.auth.entity.SysRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SysRoleRepository extends JpaRepository<SysRole, Long>, JpaSpecificationExecutor<SysRole> {
    boolean existsByCode(String code);

    Optional<SysRole> findByCode(String code);
}
