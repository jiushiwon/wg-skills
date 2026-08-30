---
name: springboot-org-permission-module-skill
description: Spring Boot 组织权限模块技能。面向已有 Spring Boot 项目的开发者，提供组织架构、部门管理、角色权限、RBAC、菜单管理、数据权限等能力的快速集成。触发词："组织架构"、"部门管理"、"角色权限"、"RBAC"、"菜单管理"、"数据权限"、"org permission"、"role"、"menu"、"department"。
---

# Spring Org Permission Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成组织权限能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **组织架构** | 组织/部门管理 |
| **用户管理** | 用户-部门-岗位关联 |
| **角色管理** | 角色定义与权限分配 |
| **菜单管理** | 前后端菜单配置 |
| **权限控制** | 按钮/接口级权限 |
| **数据权限** | 行级数据隔离 |

## 触发场景

用户说"帮我加权限"或"集成 RBAC"时触发。

## 核心实现

### 实体类

```java
// 组织
@Entity
@Table(name = "wg_org")
public class Org {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private Long parentId;
    
    private String parentIds;
    
    private Integer sort;
    
    private String leader;
    
    private String phone;
    
    private Integer status;
    
    private LocalDateTime createdAt;
}

// 部门
@Entity
@Table(name = "wg_dept")
public class Dept {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long orgId;
    
    private Long parentId;
    
    private String name;
    
    private Integer sort;
    
    private String leader;
    
    private Integer status;
    
    private LocalDateTime createdAt;
}

// 用户
@Entity
@Table(name = "wg_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    
    private String password;
    
    private String nickname;
    
    private Long deptId;
    
    private Long postId;
    
    private String email;
    
    private String phone;
    
    private Integer status;
    
    private LocalDateTime createdAt;
}

// 角色
@Entity
@Table(name = "wg_role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private String code;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    private RoleType type;
    
    private Integer status;
    
    private LocalDateTime createdAt;
}

public enum RoleType { SYSTEM, CUSTOM }

// 菜单
@Entity
@Table(name = "wg_menu")
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private Long parentId;
    
    private String path;
    
    private String component;
    
    private String icon;
    
    private Integer sort;
    
    @Enumerated(EnumType.STRING)
    private MenuType type;
    
    private String permission;
    
    private Integer status;
    
    private LocalDateTime createdAt;
}

public enum MenuType { CATALOG, MENU, BUTTON }

// 用户-角色关联
@Entity
@Table(name = "wg_user_role")
public class UserRole {
    @Id
    private Long userId;
    
    @Id
    private Long roleId;
}

// 角色-菜单关联
@Entity
@Table(name = "wg_role_menu")
public class RoleMenu {
    @Id
    private Long roleId;
    
    @Id
    private Long menuId;
}
```

### 服务层

```java
@Service
public class OrgService {
    
    // 创建部门
    public Dept createDept(Dept dept) {
        // 处理 parentIds
        return deptRepository.save(dept);
    }
    
    // 获取部门树
    public List<DeptTree> getDeptTree() {
        List<Dept> all = deptRepository.findAll();
        return buildTree(all);
    }
    
    private List<DeptTree> buildTree(List<Dept> depts) {
        // 递归构建树
    }
}

@Service
public class PermissionService {
    
    // 获取用户权限
    public List<String> getUserPermissions(Long userId) {
        List<Menu> menus = getUserMenus(userId);
        return menus.stream()
            .filter(m -> m.getPermission() != null)
            .map(Menu::getPermission)
            .collect(Collectors.toList());
    }
    
    // 获取用户菜单
    public List<Menu> getUserMenus(Long userId) {
        // 1. 获取用户角色
        List<Long> roleIds = userRoleRepository.findRoleIdsByUserId(userId);
        
        // 2. 获取角色菜单
        List<Menu> menus = roleMenuRepository.findMenusByRoleIds(roleIds);
        
        // 3. 构建菜单树
        return buildMenuTree(menus);
    }
    
    // 检查权限
    public boolean hasPermission(Long userId, String permission) {
        return getUserPermissions(userId).contains(permission);
    }
    
    // 数据权限过滤
    public <T> Specification<T> getDataScopeSpec(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        // 根据用户的数据权限范围构建查询条件
    }
}
```

### 安全配置

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public PermissionEvaluator permissionEvaluator() {
        return new CustomPermissionEvaluator();
    }
}

@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {
    
    @Autowired
    private PermissionService permissionService;
    
    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null) return false;
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        return permissionService.hasPermission(user.getId(), (String) permission);
    }
    
    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return false;
    }
}

// 使用示例
@PreAuthorize("@permissionEvaluator.hasPermission(null, 'user:delete')")
public void deleteUser(Long id) {}

// 接口权限注解
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @GetMapping("/list")
    @PreAuthorize("hasAuthority('user:list')")
    public ApiResponse<List<User>> list() { }
    
    @PostMapping("/add")
    @PreAuthorize("hasAuthority('user:add')")
    public ApiResponse<Void> add(@RequestBody User user) { }
    
    @PostMapping("/delete")
    @PreAuthorize("hasAuthority('user:delete')")
    public ApiResponse<Void> delete(@RequestParam Long id) { }
}
```

### Controller

```java
@RestController
@RequestMapping("/api/org")
public class OrgController {
    
    @Autowired
    private OrgService orgService;
    
    @GetMapping("/dept/tree")
    public ApiResponse<List<DeptTree>> getDeptTree() {
        return ApiResponse.ok(orgService.getDeptTree());
    }
}

@RestController
@RequestMapping("/api/permission")
public class PermissionController {
    
    @Autowired
    private PermissionService permissionService;
    
    @GetMapping("/menus")
    public ApiResponse<List<Menu>> getUserMenus() {
        User user = CurrentUser.get();
        return ApiResponse.ok(permissionService.getUserMenus(user.getId()));
    }
    
    @GetMapping("/codes")
    public ApiResponse<List<String>> getUserPermissions() {
        User user = CurrentUser.get();
        return ApiResponse.ok(permissionService.getUserPermissions(user.getId()));
    }
}
```

## 不做

- 不负责CAS集成
- 不处理SSO
- 不提供 UI 相关代码
