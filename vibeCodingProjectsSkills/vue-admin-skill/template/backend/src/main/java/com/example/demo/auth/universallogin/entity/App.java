package com.example.demo.auth.universallogin.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 应用实体（接入的第三方业务系统）。
 *
 * <p>★ 只存「公开标识 appKey」，<b>不存任何密钥</b>。
 * 应用级密钥全部收敛到 {@link AppKey}（apiKey + apiSecret），职责不重叠。</p>
 */
@Entity
@Table(name = "wg_sys_app")
@Data
public class App {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "app_name", nullable = false, length = 100)
    private String appName;

    /** 公开标识，可暴露给前端；密钥不在这里。 */
    @Column(name = "app_key", nullable = false, unique = true, length = 64)
    private String appKey;

    @Column(length = 500)
    private String description;

    @Column(length = 500)
    private String logo;

    @Column(name = "callback_url", length = 500)
    private String callbackUrl;

    /** 1启用 0禁用（与全项目语义一致）。 */
    @Column(nullable = false)
    private Integer status = 1;

    /** 所有者 → wg_sys_user.id，服务端注入，禁止前端传入。 */
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
