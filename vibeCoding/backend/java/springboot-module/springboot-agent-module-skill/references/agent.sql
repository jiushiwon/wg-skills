-- Agent 模块建表 SQL

-- 会话表
CREATE TABLE `{prefix}_agent_session` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `title` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '会话标题',
    `model` VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-mini' COMMENT '使用模型',
    `status` INT NOT NULL DEFAULT 1 COMMENT '状态 0结束 1活跃',
    `created_at` DATETIME DEFAULT NULL COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB COMMENT='AI对话会话表';

-- 消息表
CREATE TABLE `{prefix}_agent_message` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `session_id` BIGINT NOT NULL COMMENT '会话ID',
    `role` VARCHAR(20) NOT NULL COMMENT '角色 user/assistant/system/tool',
    `content` TEXT NOT NULL COMMENT '消息内容',
    `tool_name` VARCHAR(50) DEFAULT NULL COMMENT '调用的工具名',
    `tool_result` TEXT DEFAULT NULL COMMENT '工具返回结果',
    `tokens` INT DEFAULT NULL COMMENT '消耗token数',
    `created_at` DATETIME DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_session_id` (`session_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB COMMENT='AI对话消息表';
