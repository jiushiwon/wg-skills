package com.example.demo.auth.universallogin.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 绑定码实体（一次性、带有效期的绑定凭证）。
 *
 * <p>★ 必须落库。历史缺陷：绑定码只在内存里造了个字符串就返回，
 * 从不保存、从不校验有效性/过期/一次性，导致 confirm 可以被无限重放。</p>
 *
 * <p>方向（{@link #direction}）：</p>
 * <ul>
 *   <li>{@code app_initiated} —— 第三方应用发起，等宿主用户确认（POST /api/bind/confirm）</li>
 *   <li>{@code user_initiated} —— 宿主用户发起，等第三方应用认领（POST /api/open/bind/claim）</li>
 * </ul>
 */
@Entity
@Table(name = "wg_sys_bind_code")
@Data
public class BindCode {

    /** 方向：应用发起，待宿主确认。 */
    public static final String DIRECTION_APP_INITIATED = "app_initiated";
    /** 方向：宿主发起，待应用认领。 */
    public static final String DIRECTION_USER_INITIATED = "user_initiated";

    /** 状态：待使用。 */
    public static final int STATUS_PENDING = 0;
    /** 状态：已使用（一次性消费完成）。 */
    public static final int STATUS_USED = 1;
    /** 状态：已失效（超时/主动作废）。 */
    public static final int STATUS_EXPIRED = 2;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false, length = 20)
    private String direction;

    @Column(name = "app_id", nullable = false)
    private Long appId;

    /** user_initiated 发起时即确定；app_initiated 在确认时回填。 */
    @Column(name = "sys_user_id")
    private Long sysUserId;

    @Column(name = "app_user_id", length = 128)
    private String appUserId;

    @Column(name = "app_user_name", length = 128)
    private String appUserName;

    @Column(nullable = false)
    private Integer status = STATUS_PENDING;

    @Column(name = "expire_at", nullable = false)
    private LocalDateTime expireAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** 是否仍可用（待使用 且 未过期）。 */
    public boolean usable() {
        return status != null && status == STATUS_PENDING
            && expireAt != null && expireAt.isAfter(LocalDateTime.now());
    }
}
