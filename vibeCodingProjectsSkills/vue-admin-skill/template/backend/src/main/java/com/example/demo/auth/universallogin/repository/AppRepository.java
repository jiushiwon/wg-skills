package com.example.demo.auth.universallogin.repository;

import com.example.demo.auth.universallogin.entity.App;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 应用 Repository。所有查询默认过滤软删除。
 */
@Repository
public interface AppRepository extends JpaRepository<App, Long> {

    Optional<App> findByIdAndDeletedAtIsNull(Long id);

    Optional<App> findByAppKeyAndDeletedAtIsNull(String appKey);

    Page<App> findByOwnerIdAndDeletedAtIsNull(Long ownerId, Pageable pageable);

    boolean existsByAppKey(String appKey);
}
