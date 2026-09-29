package com.example.demo.auth.universallogin.repository;

import com.example.demo.auth.universallogin.entity.AppBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 账户-应用绑定 Repository。
 *
 * <p>★ 所有查询以 {@code sysUserId}（宿主账户）为锚点，禁止出现无归属条件的查询。</p>
 */
@Repository
public interface AppBindingRepository extends JpaRepository<AppBinding, Long> {

    List<AppBinding> findBySysUserIdAndDeletedAtIsNullOrderByIdDesc(Long sysUserId);

    /** 按 id + 归属查询：用于取消绑定 / 设默认，防止越权操作他人绑定。 */
    Optional<AppBinding> findByIdAndSysUserIdAndDeletedAtIsNull(Long id, Long sysUserId);

    Optional<AppBinding> findBySysUserIdAndAppIdAndDeletedAtIsNull(Long sysUserId, Long appId);

    Optional<AppBinding> findByAppIdAndAppUserIdAndDeletedAtIsNull(Long appId, String appUserId);

    boolean existsBySysUserIdAndAppIdAndDeletedAtIsNull(Long sysUserId, Long appId);

    @Modifying
    @Query("UPDATE AppBinding b SET b.isDefault = 0 "
        + "WHERE b.sysUserId = :sysUserId AND b.isDefault = 1 AND b.deletedAt IS NULL")
    void clearDefault(@Param("sysUserId") Long sysUserId);

    /** 删除应用时级联软删其全部绑定。 */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE AppBinding b SET b.deletedAt = :now WHERE b.appId = :appId AND b.deletedAt IS NULL")
    int softDeleteByAppId(@Param("appId") Long appId, @Param("now") LocalDateTime now);
}
