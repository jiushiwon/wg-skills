package com.example.demo.auth.common;

/**
 * 权限常量（唯一常量源）。
 *
 * <p>★ 三段式 `模块:资源:动作`。前端路由 `meta.permission`、`v-permission`、
 * 后端 `@PreAuthorize`、DB `wg_sys_menu.permission` 必须**逐字一致**。</p>
 */
public final class AuthPerms {

    private AuthPerms() {
    }

    /** 超级管理员角色码。 */
    public static final String ROLE_SUPER_ADMIN = "super_admin";

    // ==================== 用户 ====================
    public static final String USER_LIST = "system:user:list";
    public static final String USER_CREATE = "system:user:create";
    public static final String USER_EDIT = "system:user:edit";
    public static final String USER_DELETE = "system:user:delete";
    public static final String USER_RESET_PWD = "system:user:reset-pwd";
    public static final String USER_ASSIGN_ROLE = "system:user:assign-role";
    public static final String USER_ASSIGN_POST = "system:user:assign-post";

    // ==================== 角色 ====================
    public static final String ROLE_LIST = "system:role:list";
    public static final String ROLE_CREATE = "system:role:create";
    public static final String ROLE_EDIT = "system:role:edit";
    public static final String ROLE_DELETE = "system:role:delete";
    public static final String ROLE_ASSIGN_MENU = "system:role:assign-menu";

    // ==================== 菜单 ====================
    public static final String MENU_LIST = "system:menu:list";
    public static final String MENU_CREATE = "system:menu:create";
    public static final String MENU_EDIT = "system:menu:edit";
    public static final String MENU_DELETE = "system:menu:delete";

    // ==================== 组织 ====================
    public static final String ORG_LIST = "system:org:list";
    public static final String ORG_CREATE = "system:org:create";
    public static final String ORG_EDIT = "system:org:edit";
    public static final String ORG_DELETE = "system:org:delete";

    // ==================== 岗位 ====================
    public static final String POST_LIST = "system:post:list";
    public static final String POST_CREATE = "system:post:create";
    public static final String POST_EDIT = "system:post:edit";
    public static final String POST_DELETE = "system:post:delete";

    // ==================== 租户 ====================
    public static final String TENANT_LIST = "system:tenant:list";
    public static final String TENANT_CREATE = "system:tenant:create";
    public static final String TENANT_EDIT = "system:tenant:edit";
    public static final String TENANT_DELETE = "system:tenant:delete";

    // ==================== 接入应用（universal-login-api） ====================
    public static final String APP_LIST = "system:app:list";
    public static final String APP_CREATE = "system:app:create";
    public static final String APP_EDIT = "system:app:edit";
    public static final String APP_DELETE = "system:app:delete";
    public static final String APP_KEY_MANAGE = "system:app:key-manage";

    // ==================== 账户绑定（universal-login-api） ====================
    public static final String BIND_LIST = "account:bind:list";
    public static final String BIND_CREATE = "account:bind:create";
    public static final String BIND_DELETE = "account:bind:delete";
    public static final String BIND_SET_DEFAULT = "account:bind:set-default";

    // ==================== 示例业务 ====================
    public static final String PRODUCT_LIST = "example:product:list";
    public static final String PRODUCT_CREATE = "example:product:create";
    public static final String PRODUCT_EDIT = "example:product:edit";
    public static final String PRODUCT_DELETE = "example:product:delete";

    // ==================== 仪表盘 ====================
    public static final String DASHBOARD_VIEW = "dashboard:home:view";
}
