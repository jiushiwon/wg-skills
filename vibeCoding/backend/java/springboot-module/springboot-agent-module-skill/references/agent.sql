-- ============================================================
-- Flyway 迁移：Agent 模块建表 DDL
-- 文件名：V20__init_agent_module.sql
-- 表前缀：{prefix}（默认 wg，由骨架统一管理）
-- 数据库：MySQL 8.0+
-- 字符集：utf8mb4
-- ============================================================

-- 会话表
CREATE TABLE IF NOT EXISTS `{prefix}_agent_session` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id`     BIGINT       NOT NULL COMMENT '关联用户ID',
    `title`       VARCHAR(200) NOT NULL DEFAULT '新对话' COMMENT '会话标题',
    `model`       VARCHAR(50)  NOT NULL DEFAULT 'gpt-4o-mini' COMMENT '使用模型',
    `status`      TINYINT      NOT NULL DEFAULT 0 COMMENT '状态（0正常 1已结束）',
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at`  DATETIME     DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='AI Agent 会话表';

-- 消息表（含外键级联删除）
CREATE TABLE IF NOT EXISTS `{prefix}_agent_message` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `session_id`  BIGINT       NOT NULL COMMENT '关联会话ID',
    `role`        VARCHAR(20)  NOT NULL COMMENT '角色（user/assistant/system/tool）',
    `content`     MEDIUMTEXT   NOT NULL COMMENT '消息内容',
    `tool_name`   VARCHAR(100) DEFAULT NULL COMMENT 'Tool 名称（role=tool 时）',
    `tool_result` MEDIUMTEXT   DEFAULT NULL COMMENT 'Tool 执行结果（JSON）',
    `tool_args`   TEXT         DEFAULT NULL COMMENT 'Tool 调用参数（JSON）',
    `tokens`      INT          DEFAULT NULL COMMENT '消耗 token 数',
    `model`       VARCHAR(50)  DEFAULT NULL COMMENT '实际使用的模型',
    `error_code`  INT          DEFAULT NULL COMMENT '错误码（成功时为 NULL）',
    `duration_ms` INT          DEFAULT NULL COMMENT '处理耗时（毫秒）',
    `trace_id`    VARCHAR(64)  DEFAULT NULL COMMENT '链路追踪ID',
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_{prefix}_agent_message_session`
        FOREIGN KEY (`session_id`) REFERENCES `{prefix}_agent_session` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='AI Agent 消息表';

-- ============================================================
-- 性能索引（5 个关键索引）
-- ============================================================

-- 1. listSessions 排序：WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC
CREATE INDEX `ix_{prefix}_agent_session_user_updated`
    ON `{prefix}_agent_session` (`user_id`, `updated_at` DESC);

-- 2. 软删除过滤：WHERE user_id = ? AND deleted_at IS NULL
CREATE INDEX `ix_{prefix}_agent_session_user_deleted`
    ON `{prefix}_agent_session` (`user_id`, `deleted_at`);

-- 3. 归属校验：WHERE id = ? AND user_id = ?（单条查询加速）
CREATE INDEX `ix_{prefix}_agent_session_user_id`
    ON `{prefix}_agent_session` (`user_id`);

-- 4. 历史消息加载：WHERE session_id = ? ORDER BY created_at ASC
CREATE INDEX `ix_{prefix}_agent_message_session_created`
    ON `{prefix}_agent_message` (`session_id`, `created_at`);

-- 5. 按角色过滤：WHERE session_id = ? AND role = ?
CREATE INDEX `ix_{prefix}_agent_message_session_role`
    ON `{prefix}_agent_message` (`session_id`, `role`);

-- ============================================================
-- 说明：
-- - 此文件由 Flyway 自动执行（V20__init_agent_module.sql）
-- - 外键 fk_{prefix}_agent_message_session 使用 ON DELETE CASCADE
--   硬删除 session 时自动级联删除关联消息
-- - trace_id 字段用于跨服务链路追踪
-- - error_code 字段记录对话失败时的错误码
-- - duration_ms 字段用于性能监控和慢查询分析
-- ============================================================
