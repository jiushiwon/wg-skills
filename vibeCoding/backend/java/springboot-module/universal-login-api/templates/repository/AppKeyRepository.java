package {{basePackage}}.repository;

import {{basePackage}}.entity.AppKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 应用密钥 Repository。所有查询默认过滤软删除。
 */
@Repository
public interface AppKeyRepository extends JpaRepository<AppKey, Long> {

    List<AppKey> findByAppIdAndDeletedAtIsNullOrderByIdDesc(Long appId);

    Optional<AppKey> findByIdAndDeletedAtIsNull(Long id);

    /** 签名校验用：必须 status=1 且未删除。 */
    Optional<AppKey> findByApiKeyAndStatusAndDeletedAtIsNull(String apiKey, Integer status);

    boolean existsByApiKey(String apiKey);

    /** 删除应用时级联软删其全部密钥。 */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE AppKey k SET k.deletedAt = :now WHERE k.appId = :appId AND k.deletedAt IS NULL")
    int softDeleteByAppId(@Param("appId") Long appId, @Param("now") LocalDateTime now);
}
