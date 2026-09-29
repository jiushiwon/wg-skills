package com.example.demo.auth.universallogin.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 账户-应用绑定实体。
 *
 * <p>★ 绑定锚点是宿主账户 {@code sysUserId}（→ wg_sys_user.id），
 * <b>不是</b>独立的 main_account_id。这样才真正做到「多个系统公用一套账户」。</p>
 */
@Entity
@Table(name = "wg_sys_app_binding")
@Data
public class AppBinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 宿主账户 ID，绑定的唯一锚点。 */
    @Column(name = "sys_user_id", nullable = false)
    private Long sysUserId;

    @Column(name = "app_id", nullable = false)
    private Long appId;

    /** 应用侧用户标识（由第三方应用提供）。 */
    @Column(name = "app_user_id", length = 128)
    private String appUserId;

    @Column(name = "app_user_name", length = 128)
    private String appUserName;

    /** app_initiated / user_initiated。 */
    @Column(name = "bind_type", length = 20)
    private String bindType;

    @Column(name = "is_default", nullable = false)
    private Integer isDefault = 0;

    @Column(name = "bind_at")
    private LocalDateTime bindAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
