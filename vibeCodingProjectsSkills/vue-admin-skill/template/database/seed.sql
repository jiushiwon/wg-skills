-- ============================================================
-- vue-admin-skill 仅种子数据
-- 前提：已执行 schema.sql（或等价 DDL）建表
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 租户
INSERT INTO wg_sys_tenant (id, name, code, status) VALUES
(1, '默认租户', 'default', 1);

-- 组织（树形：总公司 -> 研发部/市场部/财务部）
INSERT INTO wg_sys_org (id, tenant_id, parent_id, name, sort_order, status) VALUES
(1, 1, NULL, '总公司', 1, 1),
(2, 1, 1,    '研发部', 1, 1),
(3, 1, 1,    '市场部', 2, 1),
(4, 1, 1,    '财务部', 3, 1);

-- 岗位
INSERT INTO wg_sys_post (id, tenant_id, name, code, sort_order, status) VALUES
(1, 1, '技术总监',     'tech_leader',     1, 1),
(2, 1, '前端开发',     'frontend_dev',    2, 1),
(3, 1, '后端开发',     'backend_dev',     3, 1),
(4, 1, '产品经理',     'product_manager', 4, 1);

-- 角色（data_scope 四档：ALL / DEPT_AND_BELOW / DEPT_ONLY / SELF_ONLY）
INSERT INTO wg_sys_role (id, tenant_id, name, code, description, data_scope, sort_order, status) VALUES
(1, 1, '超级管理员', 'super_admin', '系统内置最高权限角色',  'ALL',       1, 1),
(2, 1, '用户管理员', 'user_admin',  '负责用户与权限管理',     'ALL',       2, 1),
(3, 1, '普通用户',   'common_user', '仅可访问仪表盘',         'SELF_ONLY', 3, 1);

-- 菜单
--   menu_type：M=目录（只分组，不对应页面组件）/ C=菜单（对应一个页面组件）/ F=按钮（只承载 permission，无 path）
--   permission：三段式「模块:资源:动作」；页面权限与 GET 列表接口**同码**（system:user:list 既是页面也是接口）
--   icon：图标名（kebab-case），由前端 BaseIcon 映射到具体图形
--   完整性：父节点全部存在，id 1..35 连续无断档，无孤儿节点
INSERT INTO wg_sys_menu (id, tenant_id, parent_id, name, path, component, menu_type, icon, permission, sort_order, visible, status) VALUES
(1,  1, NULL, '仪表盘',       '/dashboard',     'Dashboard',              'C', 'layout-dashboard', 'dashboard:home:view',      1, 1, 1),
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
-- menu:delete 必须挂在「菜单管理」下（父节点 = 15）
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
(31, 1, NULL, '示例',         '/example',       'Layout',                 'M', 'blocks',           NULL,                       3, 1, 1),
(32, 1, 31,   '商品列表',     '/example/product','example/product/index', 'C', 'blocks',           'example:product:list',     1, 1, 1),
(33, 1, 32,   '新增商品',     NULL,             NULL,                     'F', NULL,               'example:product:create',   1, 1, 1),
(34, 1, 32,   '编辑商品',     NULL,             NULL,                     'F', NULL,               'example:product:edit',     2, 1, 1),
(35, 1, 32,   '删除商品',     NULL,             NULL,                     'F', NULL,               'example:product:delete',   3, 1, 1),
-- ============================================================
-- 多账户体系菜单（universal-login-api）
--   /system/app     应用管理（系统级，super_admin）
--   /account/bind   账户绑定（任意登录用户可看自己的绑定）
-- ============================================================
(36, 1, 2,    '应用管理',     '/system/app',    'system/app/index',       'C', 'plug',             'system:app:list',          7, 1, 1),
(37, 1, 36,   '新增应用',     NULL,             NULL,                     'F', NULL,               'system:app:create',        1, 1, 1),
(38, 1, 36,   '编辑应用',     NULL,             NULL,                     'F', NULL,               'system:app:edit',          2, 1, 1),
(39, 1, 36,   '删除应用',     NULL,             NULL,                     'F', NULL,               'system:app:delete',        3, 1, 1),
(40, 1, 36,   '密钥管理',     NULL,             NULL,                     'F', NULL,               'system:app:key-manage',    4, 1, 1),
(41, 1, NULL, '账户中心',     '/account',       'Layout',                 'M', 'link-2',           NULL,                       4, 1, 1),
(42, 1, 41,   '应用绑定',     '/account/bind',  'account/bind/index',     'C', 'link-2',           'account:bind:list',        1, 1, 1),
(43, 1, 42,   '发起绑定',     NULL,             NULL,                     'F', NULL,               'account:bind:create',      1, 1, 1),
(44, 1, 42,   '删除绑定',     NULL,             NULL,                     'F', NULL,               'account:bind:delete',      2, 1, 1),
(45, 1, 42,   '设为默认',     NULL,             NULL,                     'F', NULL,               'account:bind:set-default', 3, 1, 1);

-- 用户（密码统一为 admin123）
INSERT INTO wg_sys_user (id, username, password, nickname, email, phone, tenant_id, org_id, status) VALUES
(1, 'admin',      '$2a$10$.V0kaoepW9PcemuyGXjv2ul81jPcG2Q0Oytr/WmvgHu.cd2Y642Vi', '超级管理员', 'admin@vue-admin.local',      '13800000001', 1, 1, 1),
(2, 'user_admin', '$2a$10$.V0kaoepW9PcemuyGXjv2ul81jPcG2Q0Oytr/WmvgHu.cd2Y642Vi', '用户管理员', 'user_admin@vue-admin.local', '13800000002', 1, 1, 1),
(3, 'demo',       '$2a$10$.V0kaoepW9PcemuyGXjv2ul81jPcG2Q0Oytr/WmvgHu.cd2Y642Vi', '演示账号',   'demo@vue-admin.local',       '13800000003', 1, 2, 1);

-- 用户-角色绑定
INSERT INTO wg_sys_user_role (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3);

-- 用户-岗位绑定
INSERT INTO wg_sys_user_post (user_id, post_id) VALUES
(1, 1),
(2, 4),
(3, 2);

-- 角色-菜单绑定：super_admin 拿全部 45 条
INSERT INTO wg_sys_role_menu (role_id, menu_id) VALUES
(1, 1),(1, 2),(1, 3),(1, 4),(1, 5),(1, 6),(1, 7),(1, 8),(1, 9),(1, 10),
(1, 11),(1, 12),(1, 13),(1, 14),(1, 15),(1, 16),(1, 17),(1, 18),(1, 19),(1, 20),
(1, 21),(1, 22),(1, 23),(1, 24),(1, 25),(1, 26),(1, 27),(1, 28),(1, 29),(1, 30),
(1, 31),(1, 32),(1, 33),(1, 34),(1, 35),
(1, 36),(1, 37),(1, 38),(1, 39),(1, 40),(1, 41),(1, 42),(1, 43),(1, 44),(1, 45);

-- 角色-菜单绑定：user_admin = 仪表盘 + 系统管理（不含菜单管理 15..18）+ 示例 + 账户绑定
INSERT INTO wg_sys_role_menu (role_id, menu_id) VALUES
(2, 1),(2, 2),(2, 3),(2, 4),(2, 5),(2, 6),(2, 7),(2, 8),(2, 9),(2, 10),
(2, 11),(2, 12),(2, 13),(2, 14),(2, 19),(2, 20),(2, 21),(2, 22),(2, 23),(2, 24),
(2, 25),(2, 26),(2, 27),(2, 28),(2, 29),(2, 30),(2, 31),(2, 32),(2, 33),(2, 34),
(2, 35),
(2, 41),(2, 42),(2, 43),(2, 44),(2, 45);

-- 角色-菜单绑定：common_user 仪表盘 + 自己的绑定
INSERT INTO wg_sys_role_menu (role_id, menu_id) VALUES
(3, 1),(3, 41),(3, 42),(3, 43),(3, 44),(3, 45);

-- 商品示例数据
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
