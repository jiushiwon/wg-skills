-- ============================================================
-- universal-login-api 初始化 SQL（Flyway V20）
--
-- 前置依赖：V10__init_auth_module.sql（springboot-auth-module-skill）
--   → 提供 wg_sys_user（宿主账户，本模块的绑定锚点）与 wg_sys_role/_sys_menu（宿主 RBAC）
--
-- 本迁移只建「应用 / 密钥 / 绑定 / 绑定码」四张表。
-- ★ 不建账户表（复用 wg_sys_user）
-- ★ 不建角色/权限表（复用宿主 RBAC）
-- ★ 不插入任何默认账户 / 默认密码 / 公共 BCrypt 哈希
-- ============================================================

-- 应用表：接入的第三方业务系统
-- ★ 本表只存「公开标识 app_key」，不存任何密钥。密钥全部收敛到 wg_sys_app_key。
CREATE TABLE IF NOT EXISTS wg_sys_app (
    id            BIGINT       PRIMARY KEY AUTO_INCREMENT              COMMENT '主键ID',
    app_name      VARCHAR(100) NOT NULL                               COMMENT '应用名称',
    app_key       VARCHAR(64)  NOT NULL                               COMMENT '应用公开标识（非密钥，可暴露）',
    description   VARCHAR(500)                                        COMMENT '应用描述',
    logo          VARCHAR(500)                                        COMMENT '应用Logo',
    callback_url  VARCHAR(500)                                        COMMENT '回调地址',
    status        TINYINT      NOT NULL DEFAULT 1                      COMMENT '状态 1启用 0禁用',
    owner_id      BIGINT       NOT NULL                               COMMENT '所有者（→ wg_sys_user.id）',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP      COMMENT '创建时间',
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at    DATETIME     NULL                                   COMMENT '软删除时间，NULL 表示未删除',
    UNIQUE KEY uk_app_key (app_key),
    KEY idx_owner (owner_id, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='接入应用表';

-- 应用密钥对表：应用级凭证的唯一存放处
-- ★ api_secret 必须持久化（HMAC 签名校验需要原文），但**出参永不返回**；
--   仅在 POST /api/apps/{id}/keys 的创建响应里返回一次。
CREATE TABLE IF NOT EXISTS wg_sys_app_key (
    id            BIGINT       PRIMARY KEY AUTO_INCREMENT              COMMENT '主键ID',
    app_id        BIGINT       NOT NULL                               COMMENT '应用ID（→ wg_sys_app.id）',
    key_name      VARCHAR(64)                                         COMMENT '密钥名称（便于轮换识别）',
    api_key       VARCHAR(64)  NOT NULL                               COMMENT 'API Key（公开标识）',
    api_secret    VARCHAR(128) NOT NULL                               COMMENT 'API Secret（仅创建时返回一次）',
    status        TINYINT      NOT NULL DEFAULT 1                      COMMENT '状态 1启用 0禁用',
    last_used_at  DATETIME     NULL                                   COMMENT '最后调用时间',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP      COMMENT '创建时间',
    deleted_at    DATETIME     NULL                                   COMMENT '软删除时间',
    UNIQUE KEY uk_api_key (api_key),
    KEY idx_app (app_id, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用密钥对表';

-- 绑定表：宿主账户 ↔ 第三方应用身份
-- ★ 绑定锚点是 sys_user_id（宿主账户），不是独立的 main_account_id。
CREATE TABLE IF NOT EXISTS wg_sys_app_binding (
    id             BIGINT       PRIMARY KEY AUTO_INCREMENT             COMMENT '主键ID',
    sys_user_id    BIGINT       NOT NULL                              COMMENT '宿主账户ID（→ wg_sys_user.id）',
    app_id         BIGINT       NOT NULL                              COMMENT '应用ID（→ wg_sys_app.id）',
    app_user_id    VARCHAR(128)                                       COMMENT '应用侧用户标识',
    app_user_name  VARCHAR(128)                                       COMMENT '应用侧用户名（展示用）',
    bind_type      VARCHAR(20)                                        COMMENT '绑定方式 app_initiated/user_initiated',
    is_default     TINYINT      NOT NULL DEFAULT 0                     COMMENT '是否默认应用 1是 0否',
    bind_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP     COMMENT '绑定时间',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP     COMMENT '创建时间',
    deleted_at     DATETIME     NULL                                  COMMENT '软删除时间',
    UNIQUE KEY uk_user_app (sys_user_id, app_id),
    KEY idx_app_user (app_id, app_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户-应用绑定表';

-- 绑定码表：一次性、带有效期的绑定凭证
-- ★ 必须落库（历史缺陷：只在内存/Redis 里造了个字符串就返回，从不校验）
-- ★ 一次消费：status 由 0 → 1，重复使用返回错误
CREATE TABLE IF NOT EXISTS wg_sys_bind_code (
    id             BIGINT       PRIMARY KEY AUTO_INCREMENT             COMMENT '主键ID',
    code           VARCHAR(64)  NOT NULL                              COMMENT '绑定码（一次性）',
    direction      VARCHAR(20)  NOT NULL                              COMMENT '方向 app_initiated=应用发起待宿主确认 / user_initiated=宿主发起待应用认领',
    app_id         BIGINT       NOT NULL                              COMMENT '应用ID',
    sys_user_id    BIGINT       NULL                                  COMMENT '宿主账户ID（user_initiated 发起时即确定；app_initiated 确认时回填）',
    app_user_id    VARCHAR(128)                                       COMMENT '应用侧用户标识（应用发起时携带）',
    app_user_name  VARCHAR(128)                                       COMMENT '应用侧用户名',
    status         TINYINT      NOT NULL DEFAULT 0                     COMMENT '状态 0待使用 1已使用 2已失效',
    expire_at      DATETIME     NOT NULL                              COMMENT '过期时间',
    used_at        DATETIME     NULL                                  COMMENT '使用时间',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP     COMMENT '创建时间',
    UNIQUE KEY uk_code (code),
    KEY idx_expire (status, expire_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绑定码表（一次性）';

-- ============================================================
-- 种子数据说明
--
-- 本迁移**不插入**任何账号、密码、默认应用、默认绑定。
-- 理由：
--   1. 账户由 wg_sys_user 承载，种子数据属 springboot-auth-module-skill 职责；
--   2. 历史版本在此处写死公共 BCrypt 哈希（admin/admin123）与明文 app_secret，
--      既泄露又不可轮换，属缺陷。
--
-- 首次部署请走应用层 bootstrap：
--   - 管理员账号：启动时若 wg_sys_user 为空，生成随机密码并**打印一次**到日志；
--   - 首个应用：在「系统管理 → 应用管理」页面创建，密钥创建时返回一次。
-- ============================================================
