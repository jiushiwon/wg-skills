package {{basePackage}}.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 应用密钥对实体（应用级凭证的唯一存放处）。
 *
 * <p>★ 一个应用可以有多个密钥对，便于轮换。
 * ★ {@code apiSecret} 必须落库（HMAC 校验需要原文），但**出参永不返回**，
 * 只在创建响应里返回一次。</p>
 */
@Entity
@Table(name = "{prefix}_sys_app_key")
@Data
public class AppKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "app_id", nullable = false)
    private Long appId;

    @Column(name = "key_name", length = 64)
    private String keyName;

    @Column(name = "api_key", nullable = false, unique = true, length = 64)
    private String apiKey;

    /** 仅创建时返回一次；列表/详情出参必须为 null。 */
    @Column(name = "api_secret", nullable = false, length = 128)
    private String apiSecret;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
