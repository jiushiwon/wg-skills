package com.example.demo.auth.universallogin.repository;

import com.example.demo.auth.universallogin.entity.BindCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 绑定码 Repository。
 */
@Repository
public interface BindCodeRepository extends JpaRepository<BindCode, Long> {

    Optional<BindCode> findByCode(String code);

    /**
     * 一次性消费（应用发起 → 宿主确认）：把绑定码置为「已使用」并回填宿主账户。
     *
     * <p>返回受影响行数：{@code 0} 表示已被抢先使用 → 调用方必须报错，
     * 从而在并发下也保证「一码一用」。</p>
     */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE BindCode c SET c.status = 1, c.usedAt = :usedAt, c.sysUserId = :sysUserId "
        + "WHERE c.code = :code AND c.status = 0")
    int consumeByUser(@Param("code") String code,
                      @Param("sysUserId") Long sysUserId,
                      @Param("usedAt") LocalDateTime usedAt);

    /**
     * 一次性消费（宿主发起 → 应用认领）：保留发起时写入的 {@code sysUserId}。
     */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE BindCode c SET c.status = 1, c.usedAt = :usedAt "
        + "WHERE c.code = :code AND c.status = 0 AND c.sysUserId IS NOT NULL")
    int consumeByApp(@Param("code") String code, @Param("usedAt") LocalDateTime usedAt);

    /** 清理过期未使用的绑定码（可选定时任务调用）。 */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE BindCode c SET c.status = 2 WHERE c.status = 0 AND c.expireAt < :now")
    int expireOutdated(@Param("now") LocalDateTime now);
}
