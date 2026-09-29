-- ============================================================
-- vue-admin-skill 仅表结构（无种子数据）
-- 适用于生产部署
-- 数据库：MySQL 8.0+
-- 字符集：utf8mb4 / utf8mb4_unicode_ci
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. 租户表
-- ============================================================
CREATE TABLE IF NOT EXISTS wg_sys_tenant (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '租户名称',
  code VARCHAR(50) NOT NULL COMMENT '租户编码',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0=禁用 1=启用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL COMMENT '软删除时间',
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租户表';

-- ============================================================
-- 2. 组织架构表（树形）
-- ============================================================
CREATE TABLE IF NOT EXISTS wg_sys_org (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '租户 ID',
  parent_id BIGINT UNSIGNED DEFAULT NULL COMMENT '父部门 ID（顶级为 NULL）',
  name VARCHAR(100) NOT NULL COMMENT '部门名称',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  leader_user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '负责人用户 ID',
  phone VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  email VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0=禁用 1=启用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL COMMENT '软删除时间',
  INDEX idx_parent_id (parent_id),
  INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织架构表';

-- ============================================================
-- 3. 岗位表
-- ============================================================
CREATE TABLE IF NOT EXISTS wg_sys_post (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
  name VARCHAR(50) NOT NULL COMMENT '岗位名称',
  code VARCHAR(50) NOT NULL COMMENT '岗位编码',
  sort_order INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- ============================================================
-- 4. 用户表（★ 表名必须是 wg_sys_user，不允许把前缀写成 wg_ 的旧特例）
-- ============================================================
CREATE TABLE IF NOT EXISTS wg_sys_user (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL COMMENT '用户名',
  password VARCHAR(100) NOT NULL COMMENT 'BCrypt 加密密码',
  nickname VARCHAR(64) DEFAULT NULL COMMENT '昵称',
  email VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
  tenant_id BIGINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '租户 ID',
  org_id BIGINT UNSIGNED DEFAULT NULL COMMENT '部门 ID',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0=禁用 1=启用',
  last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL COMMENT '软删除时间',
  UNIQUE KEY uk_username (username),
  INDEX idx_status (status),
  INDEX idx_org_id (org_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================================
-- 5. 角色表（含 data_scope，四档）
-- ============================================================
CREATE TABLE IF NOT EXISTS wg_sys_role (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
  name VARCHAR(50) NOT NULL COMMENT '角色名称',
  code VARCHAR(50) NOT NULL COMMENT '角色编码',
  description VARCHAR(255) DEFAULT NULL COMMENT '描述',
  data_scope VARCHAR(20) NOT NULL DEFAULT 'ALL'
    COMMENT '数据权限：ALL / DEPT_AND_BELOW / DEPT_ONLY / SELF_ONLY（四档）',
  sort_order INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY uk_code (code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- ============================================================
-- 6. 菜单权限表
--    menu_type：M=目录（仅分组，无组件）/ C=菜单（对应页面组件）/ F=按钮（只承载 permission）
--    ★ M 是目录、C 是菜单，不要写反（历史文档曾把两者写反）
--    icon 列存图标名（kebab-case，如 layout-dashboard / users / settings / shield-check），
--      由前端 BaseIcon 映射到具体图形；禁止存字符画图标。
-- ============================================================
CREATE TABLE IF NOT EXISTS wg_sys_menu (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
  parent_id BIGINT UNSIGNED DEFAULT NULL COMMENT '父菜单 ID（顶级为 NULL，必须指向存在的 id）',
  name VARCHAR(50) NOT NULL COMMENT '菜单名称',
  path VARCHAR(255) DEFAULT NULL COMMENT '路由路径（仅 M/C 有，F 为 NULL）',
  component VARCHAR(255) DEFAULT NULL COMMENT '组件路径（仅 C 有，M 一般为 Layout，F 为 NULL）',
  menu_type VARCHAR(1) NOT NULL DEFAULT 'C' COMMENT 'M=目录 C=菜单 F=按钮',
  icon VARCHAR(50) DEFAULT NULL COMMENT '图标名（kebab-case）',
  permission VARCHAR(100) DEFAULT NULL COMMENT '权限标识（三段式 模块:资源:动作）',
  sort_order INT NOT NULL DEFAULT 0,
  visible TINYINT NOT NULL DEFAULT 1 COMMENT '是否显示：0=隐藏 1=显示',
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_parent_id (parent_id),
  INDEX idx_permission (permission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单权限表';

-- ============================================================
-- 7. 关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS wg_sys_user_role (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_role (user_id, role_id),
  INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联';

CREATE TABLE IF NOT EXISTS wg_sys_user_post (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  post_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_post (user_id, post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户岗位关联';

CREATE TABLE IF NOT EXISTS wg_sys_role_menu (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  menu_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_role_menu (role_id, menu_id),
  INDEX idx_menu_id (menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联';

-- ============================================================
-- 8. 示例业务表：商品
-- ============================================================
CREATE TABLE IF NOT EXISTS wg_product (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '商品名称',
  code VARCHAR(50) NOT NULL COMMENT '商品编码',
  category VARCHAR(50) DEFAULT NULL COMMENT '分类',
  price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '价格',
  stock INT NOT NULL DEFAULT 0 COMMENT '库存',
  description TEXT DEFAULT NULL COMMENT '描述',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '0=下架 1=上架',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY uk_code (code),
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表（示例业务）';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 菜单树完整性校验（建表后、导入种子后各跑一次，都要返回 0 行）
-- ============================================================
-- 规则 1：父节点必须存在 —— parent_id 非空时，必须能在同表查到该 id（禁止孤儿节点）
-- 规则 2：menu_type 只允许 M / C / F
-- 规则 3：只有 C 才有 path / component；F 的 path 必须为 NULL
--
-- 校验 SQL：
-- SELECT m.id, m.name, m.parent_id
-- FROM wg_sys_menu m
-- WHERE m.parent_id IS NOT NULL
--   AND NOT EXISTS (SELECT 1 FROM wg_sys_menu p WHERE p.id = m.parent_id);
-- -- 期望：0 行
--
-- SELECT id, name, menu_type FROM wg_sys_menu WHERE menu_type NOT IN ('M','C','F');
-- -- 期望：0 行
--
-- SELECT id, name, menu_type FROM wg_sys_menu WHERE menu_type = 'F' AND path IS NOT NULL;
-- -- 期望：0 行
--
-- SELECT id, name, menu_type FROM wg_sys_menu
-- WHERE menu_type = 'C' AND component IS NULL;
-- -- 期望：0 行（C 必须带组件）
--
-- 后端侧同一规则由 auth/service/MenuService#assertMenuTreeIntegrity() 兜底：
-- 每次创建 / 更新菜单都会重新校验，出现孤儿节点直接抛 BusinessException(-1005) 并回滚事务。
