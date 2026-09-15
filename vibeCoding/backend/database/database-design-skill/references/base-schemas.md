# 基础表设计（base schemas）

按项目类型给出**标准基础表清单 + 通用字段约定**，供选型与实体设计参考。生成项目时由对应后端 skill 按确认后的实体清单**现场写 DDL / 模型代码**（本文件不内置双版本 DDL，避免与选型漂移），表前缀默认 `wg_`。

| 项目类型 | 标准基础表 |
|----------|-----------|
| 通用 | `users`、`roles`、`permissions`、`operation_logs` |
| 博客 / 内容站 | `posts`、`comments`、`tags`、`post_tags`、`categories` |
| 电商 | `addresses`、`categories`、`products`、`carts`、`orders`、`order_items`、`payments` |
| SaaS / 多租户 | `tenants`、`users`、`roles`、`permissions`、`user_roles`、`role_permissions` |
| IoT / 设备管理 | `devices`、`device_data`、`alerts`、`device_groups` |
| 社交 | `follows`、`posts`、`likes`、`comments`、`messages` |

## 通用字段约定

- 主键：`id`（自增整数或 UUID，见 init-skill 内置契约规范）。
- 时间：`created_at`、`updated_at`（UTC，ISO 8601）。
- 软删除：`deleted_at`，未删除为 `null`。
- 密码：`password_hash`（bcrypt，禁存明文）。

---

## 1. 通用用户系统

### 1.1 wg_user（用户表）

```sql
CREATE TABLE wg_user (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    password_hash CHAR(60) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用 1=启用',
    last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_phone (phone),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

**字段说明：**
- `password_hash`：使用 bcrypt 算法，固定 60 字符
- `status`：0=禁用，1=启用，2=待审核
- `deleted_at`：软删除，非 NULL 表示已删除

### 1.2 wg_role（角色表）

```sql
CREATE TABLE wg_role (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL COMMENT '角色编码',
    description VARCHAR(255) DEFAULT NULL COMMENT '描述',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    UNIQUE KEY uk_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';
```

### 1.3 wg_permission（权限表）

```sql
CREATE TABLE wg_permission (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '权限名称',
    code VARCHAR(100) NOT NULL COMMENT '权限编码',
    type TINYINT NOT NULL DEFAULT 1 COMMENT '类型: 1=菜单 2=按钮 3=API',
    parent_id BIGINT UNSIGNED DEFAULT 0 COMMENT '父权限ID',
    path VARCHAR(255) DEFAULT NULL COMMENT '路由路径',
    icon VARCHAR(50) DEFAULT NULL COMMENT '图标',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_code (code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';
```

### 1.4 wg_user_role（用户角色关联表）

```sql
CREATE TABLE wg_user_role (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';
```

### 1.5 wg_role_permission（角色权限关联表）

```sql
CREATE TABLE wg_role_permission (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    permission_id BIGINT UNSIGNED NOT NULL COMMENT '权限ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';
```

### 1.6 wg_operation_log（操作日志表）

```sql
CREATE TABLE wg_operation_log (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '操作用户ID',
    module VARCHAR(50) NOT NULL COMMENT '模块',
    action VARCHAR(50) NOT NULL COMMENT '操作',
    target_id VARCHAR(50) DEFAULT NULL COMMENT '目标ID',
    target_type VARCHAR(50) DEFAULT NULL COMMENT '目标类型',
    content TEXT DEFAULT NULL COMMENT '操作内容',
    ip VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    user_agent VARCHAR(500) DEFAULT NULL COMMENT 'UserAgent',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_module_action (module, action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
```

### 常见查询

```sql
-- 用户权限查询
SELECT DISTINCT p.code
FROM wg_user u
JOIN wg_user_role ur ON u.id = ur.user_id
JOIN wg_role_permission rp ON ur.role_id = rp.role_id
JOIN wg_permission p ON rp.permission_id = p.id
WHERE u.id = ? AND u.status = 1 AND p.status = 1;

-- 用户列表（分页）
SELECT id, username, email, phone, nickname, status, created_at
FROM wg_user
WHERE deleted_at IS NULL
ORDER BY id DESC
LIMIT 20 OFFSET 0;

-- 操作日志查询
SELECT ol.*, u.username
FROM wg_operation_log ol
LEFT JOIN wg_user u ON ol.user_id = u.id
WHERE ol.module = 'user' AND ol.created_at >= '2024-01-01'
ORDER BY ol.created_at DESC
LIMIT 50;
```

---

## 2. 博客 / 内容站

### 2.1 wg_post（文章表）

```sql
CREATE TABLE wg_post (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '作者ID',
    category_id BIGINT UNSIGNED DEFAULT NULL COMMENT '分类ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    slug VARCHAR(200) DEFAULT NULL COMMENT 'URL别名',
    summary VARCHAR(500) DEFAULT NULL COMMENT '摘要',
    content LONGTEXT NOT NULL COMMENT '内容',
    cover_image VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=草稿 1=已发布 2=下架',
    is_top TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶',
    view_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
    like_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
    comment_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '评论数',
    published_at DATETIME DEFAULT NULL COMMENT '发布时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    UNIQUE KEY uk_slug (slug),
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status_published (status, published_at),
    INDEX idx_is_top_published (is_top, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';
```

### 2.2 wg_category（分类表）

```sql
CREATE TABLE wg_category (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    slug VARCHAR(50) NOT NULL COMMENT 'URL别名',
    description VARCHAR(255) DEFAULT NULL COMMENT '描述',
    parent_id BIGINT UNSIGNED DEFAULT 0 COMMENT '父分类ID',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_slug (slug),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';
```

### 2.3 wg_tag（标签表）

```sql
CREATE TABLE wg_tag (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    slug VARCHAR(50) NOT NULL COMMENT 'URL别名',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_name (name),
    UNIQUE KEY uk_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';
```

### 2.4 wg_post_tag（文章标签关联表）

```sql
CREATE TABLE wg_post_tag (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
    tag_id BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_post_tag (post_id, tag_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签关联表';
```

### 2.5 wg_comment（评论表）

```sql
CREATE TABLE wg_comment (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '评论用户ID',
    parent_id BIGINT UNSIGNED DEFAULT 0 COMMENT '父评论ID',
    content TEXT NOT NULL COMMENT '评论内容',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=待审 1=已审 2=拒绝',
    like_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';
```

### 常见查询

```sql
-- 文章列表（带标签）
SELECT p.*, GROUP_CONCAT(t.name) AS tags
FROM wg_post p
LEFT JOIN wg_post_tag pt ON p.id = pt.post_id
LEFT JOIN wg_tag t ON pt.tag_id = t.id
WHERE p.status = 1
GROUP BY p.id
ORDER BY p.is_top DESC, p.published_at DESC
LIMIT 20;

-- 按分类查询文章
SELECT p.id, p.title, p.summary, p.cover_image, p.view_count, p.published_at
FROM wg_post p
WHERE p.category_id = ? AND p.status = 1
ORDER BY p.published_at DESC
LIMIT 20;

-- 文章评论列表
SELECT c.*, u.username, u.avatar
FROM wg_comment c
JOIN wg_user u ON c.user_id = u.id
WHERE c.post_id = ? AND c.status = 1 AND c.deleted_at IS NULL
ORDER BY c.created_at ASC;
```

---

## 3. 电商系统

### 3.1 wg_product（商品表）

```sql
CREATE TABLE wg_product (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    slug VARCHAR(200) DEFAULT NULL COMMENT 'URL别名',
    description TEXT DEFAULT NULL COMMENT '商品描述',
    cover_image VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    images JSON DEFAULT NULL COMMENT '图片列表',
    price DECIMAL(10,2) NOT NULL COMMENT '售价',
    original_price DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
    stock INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '库存',
    sales INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '销量',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=下架 1=上架',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    INDEX idx_category_id (category_id),
    INDEX idx_status_sort (status, sort_order),
    INDEX idx_price (price),
    FULLTEXT INDEX ft_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

### 3.2 wg_order（订单表）

```sql
CREATE TABLE wg_order (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL COMMENT '订单号',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    pay_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    freight_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '运费',
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '优惠金额',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待付款 1=已付款 2=已发货 3=已完成 4=已取消',
    pay_type TINYINT DEFAULT NULL COMMENT '支付方式: 1=支付宝 2=微信',
    pay_time DATETIME DEFAULT NULL COMMENT '支付时间',
    ship_time DATETIME DEFAULT NULL COMMENT '发货时间',
    receive_time DATETIME DEFAULT NULL COMMENT '收货时间',
    receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
    receiver_address VARCHAR(500) NOT NULL COMMENT '收货地址',
    remark VARCHAR(500) DEFAULT NULL COMMENT '订单备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

### 3.3 wg_order_item（订单项表）

```sql
CREATE TABLE wg_order_item (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    product_id BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
    product_image VARCHAR(255) DEFAULT NULL COMMENT '商品图片',
    price DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    quantity INT UNSIGNED NOT NULL COMMENT '购买数量',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '小计金额',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单项表';
```

### 3.4 wg_cart（购物车表）

```sql
CREATE TABLE wg_cart (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    product_id BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
    quantity INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '数量',
    checked TINYINT NOT NULL DEFAULT 1 COMMENT '是否选中',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';
```

### 3.5 wg_payment（支付记录表）

```sql
CREATE TABLE wg_payment (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '订单号',
    trade_no VARCHAR(64) DEFAULT NULL COMMENT '第三方交易号',
    pay_type TINYINT NOT NULL COMMENT '支付方式: 1=支付宝 2=微信',
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=待支付 1=已支付 2=已退款',
    pay_time DATETIME DEFAULT NULL COMMENT '支付时间',
    refund_time DATETIME DEFAULT NULL COMMENT '退款时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no),
    INDEX idx_trade_no (trade_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';
```

### 常见查询

```sql
-- 用户订单列表
SELECT o.id, o.order_no, o.total_amount, o.status, o.created_at,
       GROUP_CONCAT(oi.product_name) AS products
FROM wg_order o
JOIN wg_order_item oi ON o.id = oi.order_id
WHERE o.user_id = ? AND o.deleted_at IS NULL
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 20;

-- 商品销量排行
SELECT p.id, p.name, p.price, p.sales, p.cover_image
FROM wg_product p
WHERE p.status = 1
ORDER BY p.sales DESC
LIMIT 20;

-- 待发货订单
SELECT o.*, u.username, u.phone
FROM wg_order o
JOIN wg_user u ON o.user_id = u.id
WHERE o.status = 1 AND o.deleted_at IS NULL
ORDER BY o.pay_time ASC
LIMIT 50;
```

---

## 4. SaaS 多租户系统

### 4.1 wg_tenant（租户表）

```sql
CREATE TABLE wg_tenant (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '租户名称',
    code VARCHAR(50) NOT NULL COMMENT '租户编码',
    domain VARCHAR(100) DEFAULT NULL COMMENT '自定义域名',
    logo VARCHAR(255) DEFAULT NULL COMMENT 'Logo',
    contact_name VARCHAR(50) DEFAULT NULL COMMENT '联系人',
    contact_phone VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    contact_email VARCHAR(100) DEFAULT NULL COMMENT '联系邮箱',
    plan_type TINYINT NOT NULL DEFAULT 1 COMMENT '套餐: 1=免费 2=基础 3=专业',
    expire_at DATETIME DEFAULT NULL COMMENT '到期时间',
    max_users INT NOT NULL DEFAULT 10 COMMENT '最大用户数',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用 1=启用',
    settings JSON DEFAULT NULL COMMENT '租户配置',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    UNIQUE KEY uk_code (code),
    UNIQUE KEY uk_domain (domain),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租户表';
```

### 4.2 租户隔离方案

```sql
-- 方案 1：共享表，tenant_id 字段隔离
-- 所有业务表都添加 tenant_id 字段
CREATE TABLE wg_order (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT UNSIGNED NOT NULL COMMENT '租户ID',
    user_id BIGINT UNSIGNED NOT NULL,
    -- ...
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_tenant_user (tenant_id, user_id)
);

-- 方案 2：独立数据库
-- 每个租户一个数据库
-- wg_tenant_001.wg_order
-- wg_tenant_002.wg_order
```

### 常见查询

```sql
-- 租户用户统计
SELECT t.name, t.code, COUNT(u.id) AS user_count
FROM wg_tenant t
LEFT JOIN wg_user u ON t.id = u.tenant_id AND u.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY t.id;

-- 租户套餐到期提醒
SELECT name, contact_name, contact_phone, expire_at
FROM wg_tenant
WHERE status = 1
    AND expire_at IS NOT NULL
    AND expire_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY);
```

---

## 5. IoT 设备管理系统

### 5.1 wg_device（设备表）

```sql
CREATE TABLE wg_device (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    device_no VARCHAR(50) NOT NULL COMMENT '设备编号',
    name VARCHAR(100) NOT NULL COMMENT '设备名称',
    type VARCHAR(50) NOT NULL COMMENT '设备类型',
    group_id BIGINT UNSIGNED DEFAULT NULL COMMENT '设备分组ID',
    location VARCHAR(255) DEFAULT NULL COMMENT '位置',
    longitude DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
    latitude DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
    firmware_version VARCHAR(20) DEFAULT NULL COMMENT '固件版本',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=离线 1=在线 2=故障',
    last_online_at DATETIME DEFAULT NULL COMMENT '最后上线时间',
    metadata JSON DEFAULT NULL COMMENT '设备元数据',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    UNIQUE KEY uk_device_no (device_no),
    INDEX idx_type (type),
    INDEX idx_group_id (group_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';
```

### 5.2 wg_device_data（设备数据表）

```sql
CREATE TABLE wg_device_data (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    device_id BIGINT UNSIGNED NOT NULL COMMENT '设备ID',
    metric VARCHAR(50) NOT NULL COMMENT '指标名称',
    value DECIMAL(20,4) NOT NULL COMMENT '指标值',
    unit VARCHAR(20) DEFAULT NULL COMMENT '单位',
    collected_at DATETIME NOT NULL COMMENT '采集时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_device_metric (device_id, metric, collected_at),
    INDEX idx_collected_at (collected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备数据表'
PARTITION BY RANGE (TO_DAYS(collected_at)) (
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### 5.3 wg_alert（告警表）

```sql
CREATE TABLE wg_alert (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    device_id BIGINT UNSIGNED NOT NULL COMMENT '设备ID',
    rule_id BIGINT UNSIGNED DEFAULT NULL COMMENT '告警规则ID',
    level TINYINT NOT NULL DEFAULT 1 COMMENT '级别: 1=提示 2=警告 3=严重',
    title VARCHAR(200) NOT NULL COMMENT '告警标题',
    content TEXT DEFAULT NULL COMMENT '告警内容',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0=未处理 1=已确认 2=已解决',
    handled_by BIGINT UNSIGNED DEFAULT NULL COMMENT '处理人ID',
    handled_at DATETIME DEFAULT NULL COMMENT '处理时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_device_id (device_id),
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警表';
```

### 常见查询

```sql
-- 设备最新数据
SELECT d.device_no, d.name, dd.metric, dd.value, dd.unit, dd.collected_at
FROM wg_device d
JOIN wg_device_data dd ON d.id = dd.device_id
WHERE d.id = ?
    AND dd.collected_at = (
        SELECT MAX(collected_at) FROM wg_device_data
        WHERE device_id = d.id AND metric = dd.metric
    );

-- 未处理告警
SELECT a.*, d.device_no, d.name AS device_name
FROM wg_alert a
JOIN wg_device d ON a.device_id = d.id
WHERE a.status = 0
ORDER BY a.level DESC, a.created_at DESC;

-- 设备在线率统计
SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS online,
    ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS online_rate
FROM wg_device
WHERE deleted_at IS NULL;
```

---

## 6. 社交系统

### 6.1 wg_follow（关注表）

```sql
CREATE TABLE wg_follow (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '关注者ID',
    follow_id BIGINT UNSIGNED NOT NULL COMMENT '被关注者ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_user_follow (user_id, follow_id),
    INDEX idx_follow_id (follow_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注表';
```

### 6.2 wg_like（点赞表）

```sql
CREATE TABLE wg_like (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    target_id BIGINT UNSIGNED NOT NULL COMMENT '目标ID',
    target_type VARCHAR(20) NOT NULL COMMENT '目标类型: post/comment',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_user_target (user_id, target_id, target_type),
    INDEX idx_target (target_id, target_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';
```

### 6.3 wg_message（私信表）

```sql
CREATE TABLE wg_message (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT UNSIGNED NOT NULL COMMENT '发送者ID',
    receiver_id BIGINT UNSIGNED NOT NULL COMMENT '接收者ID',
    content TEXT NOT NULL COMMENT '消息内容',
    type TINYINT NOT NULL DEFAULT 1 COMMENT '类型: 1=文本 2=图片 3=系统',
    is_read TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_sender (sender_id, created_at),
    INDEX idx_receiver (receiver_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='私信表';
```

### 常见查询

```sql
-- 用户关注列表
SELECT u.id, u.username, u.nickname, u.avatar, f.created_at AS follow_time
FROM wg_follow f
JOIN wg_user u ON f.follow_id = u.id
WHERE f.user_id = ? AND u.deleted_at IS NULL
ORDER BY f.created_at DESC
LIMIT 20;

-- 用户粉丝列表
SELECT u.id, u.username, u.nickname, u.avatar, f.created_at AS follow_time
FROM wg_follow f
JOIN wg_user u ON f.user_id = u.id
WHERE f.follow_id = ? AND u.deleted_at IS NULL
ORDER BY f.created_at DESC
LIMIT 20;

-- 未读私信数
SELECT COUNT(*) FROM wg_message
WHERE receiver_id = ? AND is_read = 0;

-- 对话列表（最近联系人）
SELECT
    CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id,
    MAX(content) AS last_message,
    MAX(created_at) AS last_time
FROM wg_message
WHERE sender_id = ? OR receiver_id = ?
GROUP BY other_id
ORDER BY last_time DESC
LIMIT 20;
```
