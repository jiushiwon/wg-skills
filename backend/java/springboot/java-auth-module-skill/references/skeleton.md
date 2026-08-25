# Java Auth Module 代码骨架

## 目录结构

```
src/main/java/{basePackage}/auth/
├── common/
│   ├── AuthConstants.java          # 权限常量
│   └── DataScope.java             # 数据权限枚举
├── controller/
│   ├── AuthController.java         # 登录 / 登出 / 当前用户 / 菜单树
│   ├── UserController.java        # 用户 CRUD + 绑定角色/岗位
│   ├── RoleController.java        # 角色 CRUD + 绑定菜单
│   ├── MenuController.java        # 菜单树 CRUD
│   ├── OrgController.java         # 组织架构树 CRUD
│   ├── PostController.java        # 岗位 CRUD
│   └── TenantController.java      # 租户 CRUD
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── CurrentUserVO.java
│   ├── MenuTreeVO.java
│   └── PasswordChangeRequest.java
├── entity/
│   ├── SysTenant.java
│   ├── SysOrg.java
│   ├── SysPost.java
│   ├── SysUser.java
│   ├── SysRole.java
│   ├── SysMenu.java
│   ├── SysUserRole.java
│   ├── SysRoleMenu.java
│   └── SysUserPost.java
├── repository/
│   ├── SysTenantRepository.java
│   ├── SysOrgRepository.java
│   ├── SysPostRepository.java
│   ├── SysUserRepository.java
│   ├── SysRoleRepository.java
│   ├── SysMenuRepository.java
│   └── SysUserRoleRepository.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── RoleService.java
│   ├── MenuService.java
│   ├── OrgService.java
│   ├── PostService.java
│   └── TenantService.java
└── permission/
    ├── PermissionEvaluator.java    # 接口/按钮鉴权
    └── DataScopeFilter.java       # 数据权限过滤辅助
```

## 核心实体

### SysTenant.java

```java
@Entity
@Table(name = "{prefix}_sys_tenant")
@Data
public class SysTenant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, length = 50)
    private String code;

    private Integer status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
```

### SysOrg.java

```java
@Entity
@Table(name = "{prefix}_sys_org")
@Data
public class SysOrg {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;

    private Long parentId;

    @Column(nullable = false, length = 100)
    private String name;

    private Integer sortOrder;

    private Long leaderUserId;

    private String phone;

    private String email;

    private Integer status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
```

### SysUser.java

```java
@Entity
@Table(name = "{prefix}_sys_user")
@Data
public class SysUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;

    private Long orgId;

    @Column(unique = true, length = 50)
    private String username;

    private String nickname;

    private String email;

    private String phone;

    private String avatar;

    @Column(name = "password_hash")
    private String passwordHash;

    private Integer status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
```

### SysRole.java

```java
@Entity
@Table(name = "{prefix}_sys_role")
@Data
public class SysRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, length = 50)
    private String code;

    @Column(name = "data_scope")
    private String dataScope = "SELF_ONLY"; // ALL, DEPT_ONLY, DEPT_AND_BELOW, SELF_ONLY

    private Integer sortOrder;

    private Integer status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
```

### SysMenu.java

```java
@Entity
@Table(name = "{prefix}_sys_menu")
@Data
public class SysMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;

    private Long parentId;

    @Column(nullable = false, length = 50)
    private String name;

    private String path;

    private String component;

    @Column(name = "menu_type")
    private String menuType = "M"; // M菜单 C目录 B按钮

    private String icon;

    private String permission;

    private Integer sortOrder;

    private Integer visible;

    private Integer status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
```

## 关联表

### SysUserRole.java

```java
@Entity
@Table(name = "{prefix}_sys_user_role")
@Data
public class SysUserRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "role_id")
    private Long roleId;
}
```

### SysRoleMenu.java

```java
@Entity
@Table(name = "{prefix}_sys_role_menu")
@Data
public class SysRoleMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "menu_id")
    private Long menuId;
}
```

## 枚举

### DataScope.java

```java
public enum DataScope {
    ALL,              // 全部数据
    DEPT_ONLY,        // 本部门
    DEPT_AND_BELOW,   // 本部门及以下
    SELF_ONLY         // 仅本人
}
```

## 认证控制器

### AuthController.java

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        return AuthService.login(request);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return AuthService.logout();
    }

    @GetMapping("/me")
    public ApiResponse<CurrentUserVO> getCurrentUser() {
        return AuthService.getCurrentUser();
    }

    @GetMapping("/menus")
    public ApiResponse<List<MenuTreeVO>> getMenus() {
        return AuthService.getUserMenus();
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@RequestBody PasswordChangeRequest request) {
        return AuthService.changePassword(request);
    }
}
```

## 数据权限过滤

### DataScopeFilter.java

```java
@Component
public class DataScopeFilter {

    public void applyDataScope(Specification<T> specification, SysUser currentUser) {
        String dataScope = currentUser.getDataScope();

        switch (dataScope) {
            case "ALL":
                // 无限制
                break;
            case "DEPT_ONLY":
                // 只看本部门
                specification.and(equal("orgId", currentUser.getOrgId()));
                break;
            case "DEPT_AND_BELOW":
                // 本部门及子部门（递归查询）
                List<Long> orgIds = orgService.getDeptAndBelowIds(currentUser.getOrgId());
                specification.and(in("orgId", orgIds));
                break;
            case "SELF_ONLY":
                // 只看自己
                specification.and(equal("userId", currentUser.getId()));
                break;
        }
    }
}
```
