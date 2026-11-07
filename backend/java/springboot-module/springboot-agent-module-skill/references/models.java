package {basePackage}.agent.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;

/**
 * Agent 会话实体（JPA）
 * 表前缀由骨架统一管理（默认 wg）
 */
@Data
@Entity
@Table(name = "{prefix}_agent_session")
@SQLDelete(sql = "UPDATE {prefix}_agent_session SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class AgentSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 关联用户ID */
    @Column(nullable = false)
    private Long userId;

    /** 会话标题 */
    @Column(nullable = false, length = 200)
    private String title = "新对话";

    /** 使用模型 */
    @Column(nullable = false, length = 50)
    private String model = "gpt-4o-mini";

    /** 状态（0正常 1已结束） */
    @Column(nullable = false)
    private Integer status = 0;

    /** 创建时间 */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 更新时间 */
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** 软删除时间 */
    private LocalDateTime deletedAt;
}

/**
 * Agent 消息实体（JPA）
 */
@Data
@Entity
@Table(name = "{prefix}_agent_message")
public class AgentMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 关联会话ID */
    @Column(nullable = false)
    private Long sessionId;

    /** 角色（user/assistant/system/tool） */
    @Column(nullable = false, length = 20)
    private String role;

    /** 消息内容 */
    @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
    private String content;

    /** Tool 名称（role=tool 时） */
    @Column(length = 100)
    private String toolName;

    /** Tool 执行结果（JSON） */
    @Column(columnDefinition = "MEDIUMTEXT")
    private String toolResult;

    /** Tool 调用参数（JSON） */
    @Column(columnDefinition = "TEXT")
    private String toolArgs;

    /** 消耗 token 数 */
    private Integer tokens;

    /** 实际使用的模型 */
    @Column(length = 50)
    private String model;

    /** 错误码（成功时为 NULL） */
    private Integer errorCode;

    /** 处理耗时（毫秒） */
    private Integer durationMs;

    /** 链路追踪ID */
    @Column(length = 64)
    private String traceId;

    /** 创建时间 */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 会话外键（JPA 关联，级联删除） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sessionId", insertable = false, updatable = false)
    private AgentSession session;
}
