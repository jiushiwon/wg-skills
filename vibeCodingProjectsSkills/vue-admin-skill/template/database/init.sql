-- ============================================================
-- vue-admin-skill 完整版初始化脚本（结构 + 种子数据）
-- 用户最常用的入口文件
-- 数据库：MySQL 8.0+
-- 字符集：utf8mb4 / utf8mb4_unicode_ci
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 第一部分：表结构
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

-- ★ 表名必须是 wg_sys_user（不允许把系统表前缀写成 wg_ 的旧特例）
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

-- menu_type：M=目录 / C=菜单 / F=按钮（注意 M 是目录、C 是菜单，历史文档曾把两者写反）
CREATE TABLE IF NOT EXISTS wg_sys_menu (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
  parent_id BIGINT UNSIGNED DEFAULT NULL COMMENT '父菜单 ID（顶级为 NULL，必须指向存在的 id）',
  name VARCHAR(50) NOT NULL COMMENT '菜单名称',
  path VARCHAR(255) DEFAULT NULL COMMENT '路由路径（仅 M/C 有，F 为 NULL）',
  component VARCHAR(255) DEFAULT NULL COMMENT '组件路径（仅 C 有，F 为 NULL）',
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

-- ============================================================
-- 第二部分：种子数据
-- ============================================================

INSERT INTO wg_sys_tenant (id, name, code, status) VALUES
(1, '默认租户', 'default', 1);

INSERT INTO wg_sys_org (id, tenant_id, parent_id, name, sort_order, status) VALUES
(1, 1, NULL, '总公司', 1, 1),
(2, 1, 1,    '研发部', 1, 1),
(3, 1, 1,    '市场部', 2, 1),
(4, 1, 1,    '财务部', 3, 1);

INSERT INTO wg_sys_post (id, tenant_id, name, code, sort_order, status) VALUES
(1, 1, '技术总监',     'tech_leader',     1, 1),
(2, 1, '前端开发',     'frontend_dev',    2, 1),
(3, 1, '后端开发',     'backend_dev',     3, 1),
(4, 1, '产品经理',     'product_manager', 4, 1);

-- data_scope 四档：ALL / DEPT_AND_BELOW / DEPT_ONLY / SELF_ONLY
INSERT INTO wg_sys_role (id, tenant_id, name, code, description, data_scope, sort_order, status) VALUES
(1, 1, '超级管理员', 'super_admin', '系统内置最高权限角色',  'ALL',       1, 1),
(2, 1, '用户管理员', 'user_admin',  '负责用户与权限管理',     'ALL',       2, 1),
(3, 1, '普通用户',   'common_user', '仅可访问仪表盘',         'SELF_ONLY', 3, 1);

-- 菜单种子
-- menu_type：M=目录（只分组）/ C=菜单（对应页面）/ F=按钮（只承载 permission，无 path）
-- permission：三段式「模块:资源:动作」；页面与 GET 列表接口同码
-- icon：图标名（kebab-case），由前端 BaseIcon 渲染
-- 完整性：父节点全部存在，id 1..35 连续无断档，无孤儿节点
INSERT INTO wg_sys_menu (id, tenant_id, parent_id, name, path, component, menu_type, icon, permission, sort_order, visible, status) VALUES
-- 仪表盘（顶级菜单）
(1,  1, NULL, '仪表盘',       '/dashboard',     'Dashboard',              'C', 'layout-dashboard', 'dashboard:home:view',      1, 1, 1),
-- 系统管理（目录）
(2,  1, NULL, '系统管理',     '/system',        'Layout',                 'M', 'settings',         NULL,                       2, 1, 1),
(3,  1, 2,    '用户管理',     '/system/user',   'system/user/index',      'C', 'users',            'system:user:list',         1, 1, 1),
(4,  1, 3,    '新增用户',     NULL,             NULL,                     'F', NULL,               'system:user:create',       1, 1, 1),
(5,  1, 3,    '编辑用户',     NULL,             NULL,                     'F', NULL,               'system:user:edit',         2, 1, 1),
(6,  1, 3,    '删除用户',     NULL,             NULL,                     'F', NULL,               'system:user:delete',       3, 1, 1),
(7,  1, 3,    '重置用户密码', NULL,             NULL,                     'F', NULL,               'system:user:reset-pwd',    4, 1, 1),
(8,  1, 3,    '分配角色',     NULL,             NULL,                     'F', NULL,               'system:user:assign-role',  5, 1, 1),
(9,  1, 3,    '分配岗位',     NULL,             NULL,                     'F', NULL,               'system:user:assign-post',  6, 1, 1),
(10, 1, 2,    '角色管理',     '/system/role',   'system/role/index',      'C', 'shield-check',     'system:role:list',         2, 1, 1),
(11, 1, 10,   '新增角色',     NULL,             NULL,                     'F', NULL,               'system:role:create',       1, 1, 1),
(12, 1, 10,   '编辑角色',     NULL,             NULL,                     'F', NULL,               'system:role:edit',         2, 1, 1),
(13, 1, 10,   '删除角色',     NULL,             NULL,                     'F', NULL,               'system:role:delete',       3, 1, 1),
(14, 1, 10,   '分配菜单',     NULL,             NULL,                     'F', NULL,               'system:role:assign-menu',  4, 1, 1),
(15, 1, 2,    '菜单管理',     '/system/menu',   'system/menu/index',      'C', 'blocks',           'system:menu:list',         3, 1, 1),
(16, 1, 15,   '新增菜单',     NULL,             NULL,                     'F', NULL,               'system:menu:create',       1, 1, 1),
(17, 1, 15,   '编辑菜单',     NULL,             NULL,                     'F', NULL,               'system:menu:edit',         2, 1, 1),
-- menu:delete 必须挂在「菜单管理」下（父节点 = 15），否则会变成无人可授的孤儿按钮
(18, 1, 15,   '删除菜单',     NULL,             NULL,                     'F', NULL,               'system:menu:delete',       3, 1, 1),
(19, 1, 2,    '组织架构',     '/system/org',    'system/org/index',       'C', 'building-2',       'system:org:list',          4, 1, 1),
(20, 1, 19,   '新增组织',     NULL,             NULL,                     'F', NULL,               'system:org:create',        1, 1, 1),
(21, 1, 19,   '编辑组织',     NULL,             NULL,                     'F', NULL,               'system:org:edit',          2, 1, 1),
(22, 1, 19,   '删除组织',     NULL,             NULL,                     'F', NULL,               'system:org:delete',        3, 1, 1),
(23, 1, 2,    '岗位管理',     '/system/post',   'system/post/index',      'C', 'briefcase',        'system:post:list',         5, 1, 1),
(24, 1, 23,   '新增岗位',     NULL,             NULL,                     'F', NULL,               'system:post:create',       1, 1, 1),
(25, 1, 23,   '编辑岗位',     NULL,             NULL,                     'F', NULL,               'system:post:edit',         2, 1, 1),
(26, 1, 23,   '删除岗位',     NULL,             NULL,                     'F', NULL,               'system:post:delete',       3, 1, 1),
(27, 1, 2,    '租户管理',     '/system/tenant', 'system/tenant/index',    'C', 'link-2',           'system:tenant:list',       6, 1, 1),
(28, 1, 27,   '新增租户',     NULL,             NULL,                     'F', NULL,               'system:tenant:create',     1, 1, 1),
(29, 1, 27,   '编辑租户',     NULL,             NULL,                     'F', NULL,               'system:tenant:edit',       2, 1, 1),
(30, 1, 27,   '删除租户',     NULL,             NULL,                     'F', NULL,               'system:tenant:delete',     3, 1, 1),
-- 示例业务（目录）
(31, 1, NULL, '示例',         '/example',       'Layout',                 'M', 'blocks',           NULL,                       3, 1, 1),
(32, 1, 31,   '商品列表',     '/example/product','example/product/index', 'C', 'blocks',           'example:product:list',     1, 1, 1),
(33, 1, 32,   '新增商品',     NULL,             NULL,                     'F', NULL,               'example:product:create',   1, 1, 1),
(34, 1, 32,   '编辑商品',     NULL,             NULL,                     'F', NULL,               'example:product:edit',     2, 1, 1),
(35, 1, 32,   '删除商品',     NULL,             NULL,                     'F', NULL,               'example:product:delete',   3, 1, 1);

-- 用户（密码统一为 admin123）
INSERT INTO wg_sys_user (id, username, password, nickname, email, phone, tenant_id, org_id, status) VALUES
(1, 'admin',      '$2a$10$.V0kaoepW9PcemuyGXjv2ul81jPcG2Q0Oytr/WmvgHu.cd2Y642Vi', '超级管理员', 'admin@vue-admin.local',      '13800000001', 1, 1, 1),
(2, 'user_admin', '$2a$10$.V0kaoepW9PcemuyGXjv2ul81jPcG2Q0Oytr/WmvgHu.cd2Y642Vi', '用户管理员', 'user_admin@vue-admin.local', '13800000002', 1, 1, 1),
(3, 'demo',       '$2a$10$.V0kaoepW9PcemuyGXjv2ul81jPcG2Q0Oytr/WmvgHu.cd2Y642Vi', '演示账号',   'demo@vue-admin.local',       '13800000003', 1, 2, 1);

INSERT INTO wg_sys_user_role (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO wg_sys_user_post (user_id, post_id) VALUES
(1, 1),
(2, 4),
(3, 2);

-- super_admin：全部菜单（1..35）
INSERT INTO wg_sys_role_menu (role_id, menu_id) VALUES
(1, 1),(1, 2),(1, 3),(1, 4),(1, 5),(1, 6),(1, 7),(1, 8),(1, 9),(1, 10),
(1, 11),(1, 12),(1, 13),(1, 14),(1, 15),(1, 16),(1, 17),(1, 18),(1, 19),(1, 20),
(1, 21),(1, 22),(1, 23),(1, 24),(1, 25),(1, 26),(1, 27),(1, 28),(1, 29),(1, 30),
(1, 31),(1, 32),(1, 33),(1, 34),(1, 35);

-- user_admin：仪表盘 + 系统管理（不含菜单管理 15..18）+ 示例
INSERT INTO wg_sys_role_menu (role_id, menu_id) VALUES
(2, 1),(2, 2),(2, 3),(2, 4),(2, 5),(2, 6),(2, 7),(2, 8),(2, 9),(2, 10),
(2, 11),(2, 12),(2, 13),(2, 14),(2, 19),(2, 20),(2, 21),(2, 22),(2, 23),(2, 24),
(2, 25),(2, 26),(2, 27),(2, 28),(2, 29),(2, 30),(2, 31),(2, 32),(2, 33),(2, 34),
(2, 35);

-- common_user：仅仪表盘
INSERT INTO wg_sys_role_menu (role_id, menu_id) VALUES
(3, 1);

INSERT INTO wg_product (name, code, category, price, stock, description, status) VALUES
('iPhone 15 Pro',           'IP15P-256',  '手机',  8999.00,  50, 'Apple 旗舰手机',         1),
('MacBook Pro 14',          'MBP14-M3',   '电脑', 14999.00,  30, 'M3 Pro 芯片',            1),
('AirPods Pro 2',           'APP2-USBC',  '耳机',  1899.00, 200, '主动降噪耳机',           1),
('iPad Air',                'IPADAIR-11', '平板',  4799.00,  80, '11 寸 iPad Air',         1),
('Apple Watch Series 9',    'AW9-45',     '手表',  3199.00, 100, '健康监测智能手表',        1);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 菜单树完整性校验（期望全部返回 0 行；规则说明见 schema.sql 末尾）
-- ============================================================
-- 规则 1：父节点必须存在（禁止 parent_id 指向不存在的 id）
-- SELECT m.id, m.name, m.parent_id FROM wg_sys_menu m
-- WHERE m.parent_id IS NOT NULL
--   AND NOT EXISTS (SELECT 1 FROM wg_sys_menu p WHERE p.id = m.parent_id);
-- 规则 2：menu_type 只允许 M / C / F
-- SELECT id, name, menu_type FROM wg_sys_menu WHERE menu_type NOT IN ('M','C','F');
-- 规则 3：F 不带 path；C 必须带 component
-- SELECT id, name FROM wg_sys_menu WHERE menu_type = 'F' AND path IS NOT NULL;
-- SELECT id, name FROM wg_sys_menu WHERE menu_type = 'C' AND component IS NULL;
