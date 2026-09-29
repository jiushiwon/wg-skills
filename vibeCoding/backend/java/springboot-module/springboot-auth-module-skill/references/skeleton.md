# Java Auth Module 代码骨架

> 本文件是 `springboot-auth-module-skill` 的**唯一代码来源**。
>
> 历史版本只有伪代码（`// 递归构建树`、`Specification.and(...)` 这种不存在的写法），
> 导致生成物永远缺方法级鉴权 —— 已补齐**可运行代码**。
>
> ⚠️ 本文件同时纠正两处历史错误：
> 1. `menu_type` 注释曾写 `M菜单 C目录 B按钮` —— **反了**，正确是 `M=目录 C=菜单 F=按钮`。
> 2. 曾用 `passwordHash` 作字段名 —— 与 `springboot-init-skill` 的 `password` 不一致，已统一为 `password`。

前置：`springboot-init-skill` 已提供 `ApiResponse` / `BusinessException` / `GlobalExceptionHandler` / `PageRequest` / `PageResponse` / `JwtUtil` / `CurrentUser` + `CurrentUserArgumentResolver`。

包名占位：`{{basePackage}}`（默认 `com.example.demo`）。表前缀占位：`{prefix}`（默认 `wg`）。

各层包路径（写代码时必须一致，禁止随手换）：

| 层 | 包 |
|----|----|
| 实体 | `{{basePackage}}.auth.entity` |
| 仓储 | `{{basePackage}}.auth.repository` |
| 服务 | `{{basePackage}}.auth.service` |
| 控制器 | `{{basePackage}}.auth.controller` |
| DTO | `{{basePackage}}.auth.dto` |
| 权限 | `{{basePackage}}.auth.permission` |
| 公共（宿主 `springboot-init-skill` 提供，**不要重复生成**） | `{{basePackage}}.common` / `{{basePackage}}.config` |

---

## 目录结构

```
src/main/java/{{basePackage}}/auth/
├── common/
│   └── AuthPerms.java              # 权限常量（唯一常量源）
├── controller/
│   ├── AuthController.java         # 登录 / 登出 / 当前用户 / 菜单树 / 改密
│   ├── UserController.java         # 用户 CRUD + 分配角色/岗位 + 回填
│   ├── RoleController.java         # 角色 CRUD + 分配菜单 + 回填
│   ├── MenuController.java         # 菜单树 CRUD
│   ├── OrgController.java          # 组织架构树 CRUD
│   ├── PostController.java         # 岗位 CRUD
│   └── TenantController.java       # 租户 CRUD
├── dto/
│   ├── DataScope.java              # 数据权限枚举（4 档）
│   ├── LoginRequest.java / LoginResponse.java
│   ├── UserInfoResponse.java
│   ├── MenuNode.java / OrgNode.java
│   ├── CreateUserRequest.java / UpdateUserRequest.java / UserVO.java
│   ├── CreateRoleRequest.java / UpdateRoleRequest.java / RoleVO.java
│   ├── CreateMenuRequest.java / UpdateMenuRequest.java
│   ├── CreateOrgRequest.java / CreatePostRequest.java / CreateTenantRequest.java
│   ├── AssignRolesRequest.java / AssignPostsRequest.java / AssignMenusRequest.java
│   └── ChangePasswordRequest.java / ResetPasswordRequest.java
├── entity/           SysTenant / SysOrg / SysPost / SysUser / SysRole / SysMenu
│                     SysUserRole / SysUserPost / SysRoleMenu
├── repository/       对应 JpaRepository
├── service/          AuthService / UserService / RoleService / MenuService
│                     OrgService / PostService / TenantService
└── permission/
    ├── AuthorityLoader.java        # 按 userId 装载权限标识 + 角色码
    ├── PermissionEvaluator.java    # 数据权限档位解析
    └── DataScopeFilter.java        # 数据权限过滤（4 档 + 通用业务表入口）
```

---

## 1. 核心实体

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

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = 1;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### SysOrg.java

> **单表树形**。`parent_id` 递归 + `parent_ids` 路径列（用于 `DEPT_AND_BELOW` 一条 SQL 命中）。
> 不建议再拆出 `Dept` 表 —— 两表会让"本部门及以下"的语义与查询双重复杂化。

```java
@Entity
@Table(name = "{prefix}_sys_org")
@Data
public class SysOrg {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId = 1L;

    @Column(name = "parent_id")
    private Long parentId;

    /** 祖先路径，形如 "/1/4/9/"；根节点为 "/"。用于 DEPT_AND_BELOW 的前缀匹配 */
    @Column(name = "parent_ids", length = 500)
    private String parentIds;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "leader_user_id")
    private Long leaderUserId;

    @Column(length = 20)
    private String phone;

    @Column(length = 128)
    private String email;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.tenantId == null) this.tenantId = 1L;
        if (this.status == null) this.status = 1;
        if (this.sortOrder == null) this.sortOrder = 0;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

**维护 `parent_ids`**（`OrgService` 片段）：

```java
@Transactional
public SysOrg create(CreateOrgRequest req) {
    SysOrg o = orgMapper.toEntity(req);
    o.setParentIds(buildParentIds(o.getParentId()));
    return orgRepository.save(o);
}

private String buildParentIds(Long parentId) {
    if (parentId == null) return "/";
    SysOrg parent = get(parentId);
    return parent.getParentIds() + parent.getId() + "/";
}

/** 移动节点时必须级联更新子孙的 parent_ids */
@Transactional
public SysOrg move(Long id, Long newParentId) {
    SysOrg o = get(id);
    String oldPath = o.getParentIds() + o.getId() + "/";
    o.setParentId(newParentId);
    o.setParentIds(buildParentIds(newParentId));
    String newPath = o.getParentIds() + o.getId() + "/";
    orgRepository.save(o);
    for (SysOrg child : orgRepository.findAll()) {
        if (child.getParentIds() != null && child.getParentIds().startsWith(oldPath)) {
            child.setParentIds(newPath + child.getParentIds().substring(oldPath.length()));
            orgRepository.save(child);
        }
    }
    return o;
}
```

### SysPost.java

```java
@Entity
@Table(name = "{prefix}_sys_post")
@Data
public class SysPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId = 1L;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
```

### SysUser.java

> ⚠️ 表名必须是 `{prefix}_sys_user`。写成 `{prefix}_user` 会破坏前缀统一性（红线 R1）。

```java
@Entity
@Table(name = "{prefix}_sys_user")
@Data
public class SysUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId = 1L;

    @Column(name = "org_id")
    private Long orgId;

    @Column(unique = true, nullable = false, length = 64)
    private String username;

    @Column(nullable = false, length = 100)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(length = 64)
    private String nickname;

    @Column(length = 128)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String avatar;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.tenantId == null) this.tenantId = 1L;
        if (this.status == null) this.status = 1;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

> `@JsonProperty(WRITE_ONLY)` 只是**兜底**。正确做法是出参一律走 `UserVO`（红线 R5）。

### SysRole.java

```java
@Entity
@Table(name = "{prefix}_sys_role")
@Data
public class SysRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId = 1L;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(length = 255)
    private String description;

    /** ALL / DEPT_AND_BELOW / DEPT_ONLY / SELF_ONLY */
    @Column(name = "data_scope", nullable = false, length = 20)
    private String dataScope = "SELF_ONLY";

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Integer status = 1;

    /** 非持久化：列表展示用 */
    @Transient
    private Long menuCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
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

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId = 1L;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String path;

    @Column(length = 255)
    private String component;

    /** M=目录 C=菜单 F=按钮 */
    @Column(name = "menu_type", nullable = false, length = 1)
    private String menuType = "C";

    @Column(length = 50)
    private String icon;

    @Column(length = 100)
    private String permission;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Integer visible = 1;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
```

## 2. 关联表

```java
@Entity
@Table(name = "{prefix}_sys_user_role",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "role_id"}))
@Data
public class SysUserRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }
}
```

`SysUserPost` / `SysRoleMenu` 结构相同（列名 `post_id` / `menu_id`），同样带唯一约束与 `created_at`。

---

## 3. 数据权限枚举（4 档，必须全部可达）

### DataScope.java

```java
package {{basePackage}}.auth.dto;

import lombok.Getter;

/**
 * 数据权限范围（四档）。
 *
 * <p>多角色时取「最宽」档位：ALL &gt; DEPT_AND_BELOW &gt; DEPT_ONLY &gt; SELF_ONLY。
 *
 * <p>⚠️ 只实现 ALL/SELF_ONLY 两档属**缺陷**：DEPT_* 会被静默折叠成 SELF_ONLY，
 * 权限看起来"生效"实则失效。
 */
@Getter
public enum DataScope {

    /** 全部数据 */
    ALL(0),
    /** 本部门及以下子部门 */
    DEPT_AND_BELOW(1),
    /** 本部门 */
    DEPT_ONLY(2),
    /** 仅本人 */
    SELF_ONLY(3);

    /** 越小越宽，用于多角色取最宽 */
    private final int width;

    DataScope(int width) {
        this.width = width;
    }

    public static DataScope widestOf(Iterable<String> scopes) {
        DataScope widest = null;
        for (String s : scopes) {
            if (s == null) continue;
            DataScope cur;
            try {
                cur = DataScope.valueOf(s.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                continue;
            }
            if (widest == null || cur.width < widest.width) widest = cur;
        }
        return widest == null ? DataScope.SELF_ONLY : widest;
    }
}
```

---

## 4. 权限常量（唯一常量源）

### AuthPerms.java

```java
package {{basePackage}}.auth.common;

/**
 * 权限标识常量 —— 三段式「模块:资源:动作」。
 *
 * <p>此处是唯一常量源：`@PreAuthorize`、菜单种子、`api-contract-auth.md` 权限码表
 * 都必须与此一致。前端 `router.meta.permission` 与 `v-permission` 也逐字引用同一份码。
 */
public final class AuthPerms {

    private AuthPerms() {}

    // ===== 系统管理 · 用户 =====
    public static final String SYSTEM_USER_LIST        = "system:user:list";
    public static final String SYSTEM_USER_CREATE      = "system:user:create";
    public static final String SYSTEM_USER_EDIT        = "system:user:edit";
    public static final String SYSTEM_USER_DELETE      = "system:user:delete";
    public static final String SYSTEM_USER_RESET_PWD   = "system:user:reset-pwd";
    public static final String SYSTEM_USER_ASSIGN_ROLE = "system:user:assign-role";
    public static final String SYSTEM_USER_ASSIGN_POST = "system:user:assign-post";

    // ===== 系统管理 · 角色 =====
    public static final String SYSTEM_ROLE_LIST        = "system:role:list";
    public static final String SYSTEM_ROLE_CREATE      = "system:role:create";
    public static final String SYSTEM_ROLE_EDIT        = "system:role:edit";
    public static final String SYSTEM_ROLE_DELETE      = "system:role:delete";
    public static final String SYSTEM_ROLE_ASSIGN_MENU = "system:role:assign-menu";

    // ===== 系统管理 · 菜单 =====
    public static final String SYSTEM_MENU_LIST   = "system:menu:list";
    public static final String SYSTEM_MENU_CREATE = "system:menu:create";
    public static final String SYSTEM_MENU_EDIT   = "system:menu:edit";
    public static final String SYSTEM_MENU_DELETE = "system:menu:delete";

    // ===== 系统管理 · 组织 =====
    public static final String SYSTEM_ORG_LIST   = "system:org:list";
    public static final String SYSTEM_ORG_CREATE = "system:org:create";
    public static final String SYSTEM_ORG_EDIT   = "system:org:edit";
    public static final String SYSTEM_ORG_DELETE = "system:org:delete";

    // ===== 系统管理 · 岗位 =====
    public static final String SYSTEM_POST_LIST   = "system:post:list";
    public static final String SYSTEM_POST_CREATE = "system:post:create";
    public static final String SYSTEM_POST_EDIT   = "system:post:edit";
    public static final String SYSTEM_POST_DELETE = "system:post:delete";

    // ===== 系统管理 · 租户 =====
    public static final String SYSTEM_TENANT_LIST   = "system:tenant:list";
    public static final String SYSTEM_TENANT_CREATE = "system:tenant:create";
    public static final String SYSTEM_TENANT_EDIT   = "system:tenant:edit";
    public static final String SYSTEM_TENANT_DELETE = "system:tenant:delete";

    /** 超级管理员角色码 —— 前端 hasPermission 会短路放行；后端仍走 DB 权限 */
    public static final String ROLE_SUPER_ADMIN = "super_admin";
}
```

---

## 5. 权限装载器

### AuthorityLoader.java

```java
package {{basePackage}}.auth.permission;

import {{basePackage}}.auth.repository.SysRoleMenuRepository;
import {{basePackage}}.auth.repository.SysUserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 按 userId 装载角色码与权限标识。
 *
 * ponytail: 未加缓存。权限变更稀疏，缓存收益有限；如需缓存请以 userId 为 key，
 * 并在 RoleService.assignMenus / UserService.assignRoles 之后精确失效。
 */
@Component
@RequiredArgsConstructor
public class AuthorityLoader {

    private final SysUserRoleRepository userRoleRepository;
    private final SysRoleMenuRepository roleMenuRepository;

    public List<String> roleCodes(Long userId) {
        return userRoleRepository.findRoleCodesByUserId(userId);
    }

    public Set<String> permissions(Long userId) {
        return new HashSet<>(roleMenuRepository.findPermissionsByUserId(userId));
    }

    public List<String> dataScopes(Long userId) {
        return userRoleRepository.findDataScopesByUserId(userId);
    }
}
```

---

## 6. ★ JWT 过滤器（必须装配真实权限）

### JwtAuthenticationFilter.java

```java
package {{basePackage}}.common;

import {{basePackage}}.auth.permission.AuthorityLoader;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT 鉴权拦截器。
 *
 * <p>★ 关键：必须把用户的**真实权限标识**与**角色码**一并装进 SecurityContext。
 * 只装 {@code ROLE_USER} 会导致所有 {@code hasAuthority('xxx')} 判断失败，
 * 表现为"补了 @PreAuthorize 反而全员 403"。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AuthorityLoader authorityLoader;

    @Value("${jwt.header:Authorization}")
    private String header;

    @Value("${jwt.prefix:Bearer }")
    private String prefix;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(header);
        if (authHeader != null && authHeader.startsWith(prefix)) {
            String token = authHeader.substring(prefix.length());
            try {
                Claims claims = jwtUtil.parse(token);
                if (!"access".equals(jwtUtil.getTokenType(claims))) {
                    log.warn("非 access token, type={}", jwtUtil.getTokenType(claims));
                } else {
                    Long userId = jwtUtil.getUserId(claims);

                    List<GrantedAuthority> authorities = new ArrayList<>();
                    authorityLoader.roleCodes(userId)
                        .forEach(c -> authorities.add(new SimpleGrantedAuthority("ROLE_" + c)));
                    authorityLoader.permissions(userId)
                        .forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));

                    var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                log.warn("JWT 解析失败: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

---

## 7. ★ 安全配置（必须开启方法级鉴权）

### SecurityConfig.java

```java
package {{basePackage}}.config;

import {{basePackage}}.common.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity              // ← 不开则 @PreAuthorize 静默失效
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 只放行必要的公共端点；管理类端点一律 authenticated()
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                // 注意：/api/apps/**、/api/bind/**、/api/users/** 等管理端点**不得** permitAll
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

---

## 8. ★ 数据权限过滤（四级可达 + 可作用于业务表）

### PermissionEvaluator.java

```java
package {{basePackage}}.auth.permission;

import {{basePackage}}.auth.common.AuthPerms;
import {{basePackage}}.auth.dto.DataScope;
import {{basePackage}}.auth.entity.SysUser;
import {{basePackage}}.auth.repository.SysUserRepository;
import {{basePackage}}.common.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 权限评估器：解析角色码、权限集合与**四级**数据权限档位。
 */
@Component
@RequiredArgsConstructor
public class PermissionEvaluator {

    private final SysUserRepository userRepository;
    private final AuthorityLoader authorityLoader;

    public SysUser loadUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.unauthorized("用户不存在"));
    }

    public List<String> roleCodes(Long userId) {
        return authorityLoader.roleCodes(userId);
    }

    public boolean hasPermission(Long userId, String required) {
        return authorityLoader.permissions(userId).contains(required);
    }

    public boolean isSuperAdmin(Long userId) {
        return authorityLoader.roleCodes(userId).contains(AuthPerms.ROLE_SUPER_ADMIN);
    }

    /**
     * 解析数据权限档位。超级管理员恒为 ALL；其余按多角色取**最宽**档。
     */
    public DataScope resolveDataScope(Long userId) {
        if (isSuperAdmin(userId)) return DataScope.ALL;
        return DataScope.widestOf(authorityLoader.dataScopes(userId));
    }
}
```

### DataScopeFilter.java

```java
package {{basePackage}}.auth.permission;

import {{basePackage}}.auth.dto.DataScope;
import {{basePackage}}.auth.entity.SysOrg;
import {{basePackage}}.auth.entity.SysUser;
import {{basePackage}}.auth.repository.SysOrgRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 数据权限过滤：把查询条件按当前用户数据权限档位自动收紧。
 *
 * <p>四级全部可达，**不做静默折叠**。多角色取最宽档（见 PermissionEvaluator）。
 *
 * <p>接入业务表：业务表需具备自身列（如 `creator_id`）与 `org_id`。
 * 若列名不同，用 {@link #scopeToColumn(Long, String, String)} 显式指定。
 */
@Component
@RequiredArgsConstructor
public class DataScopeFilter {

    private final PermissionEvaluator evaluator;
    private final SysOrgRepository orgRepository;

    /** 泛型版：作用于任意实体 */
    public <T> Specification<T> scopeToColumn(Long currentUserId, String selfColumn, String orgColumn) {
        DataScope scope = evaluator.resolveDataScope(currentUserId);
        List<Long> visibleOrgIds = List.of();

        if (scope == DataScope.DEPT_ONLY || scope == DataScope.DEPT_AND_BELOW) {
            SysUser me = evaluator.loadUser(currentUserId);
            Long myOrgId = me.getOrgId();
            if (myOrgId == null) {
                // 无部门归属 → 收紧为仅本人，而不是放行
                scope = DataScope.SELF_ONLY;
            } else if (scope == DataScope.DEPT_ONLY) {
                visibleOrgIds = List.of(myOrgId);
            } else {
                visibleOrgIds = selfAndDescendantIds(myOrgId);
            }
        }

        final DataScope s = scope;
        final List<Long> orgIds = visibleOrgIds;

        return (root, query, cb) -> switch (s) {
            case ALL -> cb.conjunction();
            case SELF_ONLY -> cb.equal(root.get(selfColumn), currentUserId);
            case DEPT_ONLY, DEPT_AND_BELOW ->
                root.get(orgColumn).in(orgIds.isEmpty() ? List.of(-1L) : orgIds);
        };
    }

    /** 便捷入口：作用于用户表（self=id，org=orgId） */
    public Specification<SysUser> scopeUser(Long currentUserId) {
        return scopeToColumn(currentUserId, "id", "orgId");
    }

    /** 叠加到已有 Specification（base 为 null 时等价于只做数据权限过滤） */
    public <T> Specification<T> combine(Specification<T> base, Long currentUserId,
                                        String selfColumn, String orgColumn) {
        Specification<T> scope = scopeToColumn(currentUserId, selfColumn, orgColumn);
        return base == null ? scope : base.and(scope);
    }

    /** 自身 + 全部子孙组织 id。优先用 parent_ids 前缀匹配（见 SysOrg），无该列时退回内存递归。 */
    public List<Long> selfAndDescendantIds(Long rootOrgId) {
        List<SysOrg> all = orgRepository.findAll();
        List<SysOrg> filtered = new ArrayList<>();
        for (SysOrg o : all) {
            if (o.getDeletedAt() != null) continue;
            filtered.add(o);
        }

        boolean hasPath = filtered.stream().anyMatch(o -> o.getParentIds() != null);
        if (hasPath) {
            SysOrg root = filtered.stream().filter(o -> o.getId().equals(rootOrgId))
                .findFirst().orElse(null);
            if (root != null) {
                String prefix = root.getParentIds() + root.getId() + "/";
                List<Long> ids = new ArrayList<>();
                ids.add(rootOrgId);
                for (SysOrg o : filtered) {
                    if (o.getParentIds() != null && o.getParentIds().startsWith(prefix)) {
                        ids.add(o.getId());
                    }
                }
                return ids;
            }
        }

        // 退化路径：内存递归
        List<Long> ids = new ArrayList<>();
        ids.add(rootOrgId);
        boolean grew = true;
        while (grew) {
            grew = false;
            for (SysOrg o : filtered) {
                if (o.getParentId() != null
                    && ids.contains(o.getParentId())
                    && !ids.contains(o.getId())) {
                    ids.add(o.getId());
                    grew = true;
                }
            }
        }
        return ids;
    }
}
```

**推荐 SQL 形态**（`parent_ids` 已维护时，`DEPT_AND_BELOW` 一条命中）：

```sql
SELECT * FROM {prefix}_sys_user
WHERE org_id IN (
  SELECT id FROM {prefix}_sys_org
  WHERE id = :rootOrgId OR parent_ids LIKE CONCAT(:prefix, '%')
)
```

---

## 9. 认证控制器

### AuthController.java

```java
@Tag(name = "认证")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "登录")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.success(authService.login(req));
    }

    @Operation(summary = "登出（无状态 JWT，前端清 token 即可）")
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.success(null);
    }

    @Operation(summary = "当前用户（含角色/部门/岗位/权限）")
    @GetMapping("/me")
    public ApiResponse<UserInfoResponse> me(@CurrentUser Long userId) {
        return ApiResponse.success(authService.me(userId));
    }

    @Operation(summary = "当前用户菜单树")
    @GetMapping("/menus")
    public ApiResponse<List<MenuNode>> menus(@CurrentUser Long userId) {
        return ApiResponse.success(authService.getMenus(userId));
    }

    @Operation(summary = "修改密码")
    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@CurrentUser Long userId,
                                            @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(userId, req);
        return ApiResponse.success(null);
    }
}
```

> `/api/auth/**` 内**只有 login / refresh 放行**，`/me`、`/menus`、`/password` 需要 `authenticated()`。
> 若采用 `requestMatchers("/api/auth/**").permitAll()`，等于把 `/me` 也对外开放 —— 禁止。

---

## 10. Controller 鉴权样板（含回填接口）

### UserController.java（完整）

```java
@Tag(name = "用户管理")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "用户列表（分页）")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_LIST)")
    @GetMapping
    public ApiResponse<PageResponse<UserVO>> page(
        PageRequest pageReq,
        @RequestParam(required = false) String username,
        @RequestParam(required = false) Integer status,
        @CurrentUser Long currentUserId
    ) {
        return ApiResponse.success(userService.page(pageReq, username, status, currentUserId));
    }

    @Operation(summary = "用户详情")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_LIST)")
    @GetMapping("/{id}")
    public ApiResponse<UserVO> get(@PathVariable Long id) {
        return ApiResponse.success(userService.getVO(id));
    }

    @Operation(summary = "创建用户")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_CREATE)")
    @PostMapping
    public ApiResponse<UserVO> create(@Valid @RequestBody CreateUserRequest req) {
        return ApiResponse.success(userService.create(req));
    }

    @Operation(summary = "更新用户")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_EDIT)")
    @PutMapping("/{id}")
    public ApiResponse<UserVO> update(@PathVariable Long id,
                                      @Valid @RequestBody UpdateUserRequest req) {
        return ApiResponse.success(userService.update(id, req));
    }

    @Operation(summary = "删除用户（软删除）")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_DELETE)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @CurrentUser Long currentUserId) {
        userService.delete(id, currentUserId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "分配角色")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_ASSIGN_ROLE)")
    @PutMapping("/{id}/roles")
    public ApiResponse<Void> assignRoles(@PathVariable Long id, @RequestBody AssignRolesRequest req) {
        userService.assignRoles(id, req);
        return ApiResponse.success(null);
    }

    @Operation(summary = "分配岗位")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_ASSIGN_POST)")
    @PutMapping("/{id}/posts")
    public ApiResponse<Void> assignPosts(@PathVariable Long id, @RequestBody AssignPostsRequest req) {
        userService.assignPosts(id, req);
        return ApiResponse.success(null);
    }

    @Operation(summary = "重置用户密码（管理员）")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_RESET_PWD)")
    @PutMapping("/{id}/password")
    public ApiResponse<Void> resetPassword(@PathVariable Long id,
                                           @Valid @RequestBody ResetPasswordRequest req) {
        userService.resetPassword(id, req.getNewPassword());
        return ApiResponse.success(null);
    }

    // ===== 回填接口（红线 R10，缺一个对应的分配功能就会覆盖清空）=====

    @Operation(summary = "查询用户已分配角色 ID（回填）")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_LIST)")
    @GetMapping("/{id}/roles")
    public ApiResponse<List<Long>> roleIds(@PathVariable Long id) {
        return ApiResponse.success(userService.getRoleIds(id));
    }

    @Operation(summary = "查询用户已分配岗位 ID（回填）")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_USER_LIST)")
    @GetMapping("/{id}/posts")
    public ApiResponse<List<Long>> postIds(@PathVariable Long id) {
        return ApiResponse.success(userService.getPostIds(id));
    }
}
```

> 也可直接写字符串（`@PreAuthorize("hasAuthority('system:user:list')")`）。
> 用 `T(...)` 引用常量的好处是**编译期就发现拼写错误**，推荐。

### RoleController.java（重点看回填）

```java
    @Operation(summary = "分配菜单")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_ROLE_ASSIGN_MENU)")
    @PutMapping("/{id}/menus")
    public ApiResponse<Void> assignMenus(@PathVariable Long id, @RequestBody AssignMenusRequest req) {
        roleService.assignMenus(id, req);
        return ApiResponse.success(null);
    }

    @Operation(summary = "查询角色已分配菜单 ID（回填）")
    @PreAuthorize("hasAuthority(T({{basePackage}}.auth.common.AuthPerms).SYSTEM_ROLE_LIST)")
    @GetMapping("/{id}/menus")
    public ApiResponse<List<Long>> menuIds(@PathVariable Long id) {
        return ApiResponse.success(roleService.getMenuIds(id));
    }
```

### 全部控制器权限码对照表

| 端点前缀 | list（含详情/回填） | create | edit | delete | 专属动作 |
|----------|--------------------|--------|------|--------|----------|
| `/api/auth/*` | `authenticated()` | — | — | — | `login` / `refresh` 放行 |
| `/api/users` | `system:user:list` | `system:user:create` | `system:user:edit` | `system:user:delete` | `reset-pwd` / `assign-role` / `assign-post` |
| `/api/roles` | `system:role:list` | `system:role:create` | `system:role:edit` | `system:role:delete` | `assign-menu` |
| `/api/menus` | `system:menu:list` | `system:menu:create` | `system:menu:edit` | `system:menu:delete` | — |
| `/api/orgs` | `system:org:list` | `system:org:create` | `system:org:edit` | `system:org:delete` | — |
| `/api/posts` | `system:post:list` | `system:post:create` | `system:post:edit` | `system:post:delete` | — |
| `/api/tenants` | `system:tenant:list` | `system:tenant:create` | `system:tenant:edit` | `system:tenant:delete` | — |
| `/api/apps` | `system:app:list` | `system:app:create` | `system:app:edit` | `system:app:delete` | 密钥：`system:app:key-manage` |
| `/api/bind` | `account:bind:list` | `account:bind:create` | — | `account:bind:delete` | 设默认：`account:bind:set-default` |

---

## 11. Service 关键实现片段

```java
// ===== 回填（红线 R10）=====
public List<Long> getMenuIds(Long roleId) {
    return roleMenuRepository.findByRoleId(roleId).stream()
        .map(SysRoleMenu::getMenuId).toList();
}

public List<Long> getRoleIds(Long userId) {
    return userRoleRepository.findByUserId(userId).stream()
        .map(SysUserRole::getRoleId).toList();
}

public List<Long> getPostIds(Long userId) {
    return userPostRepository.findByUserId(userId).stream()
        .map(SysUserPost::getPostId).toList();
}

// ===== 删除必须禁止自删 / 内置账号 / 有依赖的角色 =====
@Transactional
public void delete(Long id, Long currentUserId) {
    if (id.equals(currentUserId)) {
        throw BusinessException.badRequest("不能删除当前登录用户");
    }
    SysUser u = get(id);
    if ("admin".equals(u.getUsername())) {
        throw BusinessException.badRequest("内置管理员不可删除");
    }
    u.setDeletedAt(LocalDateTime.now());
    userRepository.save(u);
    userRoleRepository.deleteByUserId(id);
    userPostRepository.deleteByUserId(id);
}

@Transactional
public void delete(Long roleId) {
    SysRole r = get(roleId);
    if (AuthPerms.ROLE_SUPER_ADMIN.equals(r.getCode())) {
        throw BusinessException.badRequest("超级管理员角色不可删除");
    }
    long bound = userRoleRepository.countByRoleId(roleId);
    if (bound > 0) {
        throw BusinessException.conflict("该角色已分配给 " + bound + " 个用户，不可删除");
    }
    roleMenuRepository.deleteByRoleId(roleId);
    roleRepository.delete(r);
}

// ===== 角色列表填充 menuCount（非持久化字段）=====
public PageResponse<RoleVO> page(PageRequest pageReq) {
    var page = roleRepository.findAll(pageReq.toPageable(Sort.by(Sort.Direction.ASC, "sortOrder", "id")));
    return PageResponse.from(page.map(r -> {
        RoleVO vo = roleMapper.toVO(r);
        vo.setMenuCount(roleMenuRepository.countByRoleId(r.getId()));
        return vo;
    }));
}
```

**Repository 补充方法**

```java
// SysUserRoleRepository
long countByRoleId(Long roleId);

@Query("SELECT r.dataScope FROM SysRole r WHERE r.id IN " +
       "(SELECT ur.roleId FROM SysUserRole ur WHERE ur.userId = :userId)")
List<String> findDataScopesByUserId(@Param("userId") Long userId);

// SysRoleMenuRepository
long countByRoleId(Long roleId);

@Query("SELECT m.permission FROM SysMenu m WHERE m.id IN " +
       "(SELECT rm.menuId FROM SysRoleMenu rm WHERE rm.roleId IN " +
       "(SELECT ur.roleId FROM SysUserRole ur WHERE ur.userId = :userId)) " +
       "AND m.permission IS NOT NULL AND m.deletedAt IS NULL")
List<String> findPermissionsByUserId(@Param("userId") Long userId);
```

> ⚠️ 权限查询**必须过滤 `deletedAt IS NULL`**，否则软删除菜单的权限仍会生效。

---

## 12. 菜单种子（必须与权限码表逐字一致）

```java
// 目录（M）
SysMenu sysDir = saveMenu(null, "系统管理", "/system", "Layout", "M", "settings", null, 1);

// 菜单（C）—— permission 与页面 + 列表接口同码
SysMenu userPage = saveMenu(sysDir.getId(), "用户管理", "/system/user", "system/user/index",
        "C", "users", AuthPerms.SYSTEM_USER_LIST, 1);

// 按钮（F）—— permission 与 @PreAuthorize 同码
saveMenu(userPage.getId(), "新增用户", null, null, "F", null, AuthPerms.SYSTEM_USER_CREATE, 1);
```

### 菜单树完整性断言（必须调用）

```java
private void assertMenuTreeIntegrity(List<SysMenu> all) {
    Set<Long> ids = all.stream().map(SysMenu::getId).collect(Collectors.toSet());
    for (SysMenu m : all) {
        if (m.getParentId() != null && !ids.contains(m.getParentId())) {
            throw new IllegalStateException("菜单树存在孤儿节点: id=" + m.getId()
                + " name=" + m.getName() + " parentId=" + m.getParentId() + " 不存在");
        }
        if (!Set.of("M", "C", "F").contains(m.getMenuType())) {
            throw new IllegalStateException("非法 menu_type: " + m.getMenuType()
                + "（只允许 M=目录 / C=菜单 / F=按钮）");
        }
    }
}
```

---

## 13. 交付前自检

```bash
# 1) 方法级鉴权覆盖率
echo "@PreAuthorize: $(grep -rc '@PreAuthorize' src/main/java --include=*.java | awk -F: '{s+=$2} END {print s}')"
echo "受控端点:     $(grep -rE '@(Get|Post|Put|Delete|Patch)Mapping' src/main/java --include=*Controller.java | wc -l)"

# 2) 是否开启方法级鉴权
grep -rn "@EnableMethodSecurity" src/main/java || echo "❌ 未开启 @EnableMethodSecurity"

# 3) JWT 过滤器是否只装 ROLE_USER
grep -n 'ROLE_USER' src/main/java/**/JwtAuthenticationFilter.java && echo "❌ 只装 ROLE_USER，权限判断会全量 403"

# 4) 表名是否统一
grep -rhoE '@Table\(name = "[a-z_]+"' src/main/java | sort -u
#   期望：全部 {prefix}_sys_*（示例业务表除外）

# 5) 权限码三方 diff
grep -rhoE '"[a-z]+:[a-z-]+:[a-z-]+"' src/main/java | tr -d '"' | sort -u > /tmp/be.txt
grep -rhoE '\b[a-z]+:[a-z-]+:[a-z-]+\b' api-contract-auth.md | sort -u > /tmp/ct.txt
diff /tmp/be.txt /tmp/ct.txt && echo "✅ 后端 ⟷ 契约 一致"

# 6) 有无实体直出
grep -rnE 'ApiResponse<(SysUser|SysRole|SysMenu|SysOrg|SysPost|SysTenant|App|AppKey|AppBinding)>' src/main/java \
  && echo "❌ 存在实体直出，违反 R5"
```
