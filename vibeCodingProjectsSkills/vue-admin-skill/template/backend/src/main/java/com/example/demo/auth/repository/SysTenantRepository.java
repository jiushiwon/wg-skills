package com.example.demo.auth.repository;

import com.example.demo.auth.entity.SysTenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SysTenantRepository extends JpaRepository<SysTenant, Long> {
    boolean existsByCode(String code);
}
