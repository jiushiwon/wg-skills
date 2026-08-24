# org-permission-skill — Java (Spring Boot) 实现要点

骨架已有的（auth-skill / java-backend-skill 生成，**不要重写**）：`JwtFilter` 注入当前用户、`CurrentUserArgumentResolver`、`BusinessException`、统一信封与全局异常、Redis 客户端。本模块只补权限业务。

## 新增依赖

无（复用骨架的 Redis 与 AOP：`spring-boot-starter-aop` 若骨架未带则补上）。

## 关键文件

| 文件 | 职责 |
|------|------|
| `entity/Dept.java` / `Role.java` / `Permission.java` + 三个关联实体 | 对应 domain-model.md 各表 |
| `annotation/RequirePerm.java` | 自定义注解，标在 controller 方法上声明所需 `perms` |
| `aspect/PermAspect.java` | AOP 切面：取当前用户 → 超管放行 → 校验 `perms` 集合 |
| `service/PermissionCacheService.java` | 计算并缓存 `perm:user:{userId}`（perms 并集 + 数据范围），变更时失效 |
| `service/DataScopeHelper.java` | 数据权限唯一拼接点：按 dataScope 生成 dept 过滤条件 |
| `controller/DeptController.java` 等 4 个 controller | 参数校验 + 调 service，返回裸数据 |

## 关键片段

### 权限校验注解 + AOP

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePerm { String value(); }   // perms 标识，如 "user:add"

@Aspect
@Component
public class PermAspect {
  private final PermissionCacheService cache;

  @Before("@annotation(perm)")
  public void check(RequirePerm perm) {
    UserContext u = UserContext.current();               // 骨架注入的当前用户
    if (u == null) throw new BusinessException(-1002, "未登录");
    if (cache.isAdmin(u.getId())) return;                // 超管唯一判断点
    if (!cache.getPerms(u.getId()).contains(perm.value())) {
      throw new BusinessException(-1003, "无权限");
    }
  }
}

// 用法：
@RequirePerm("user:add")
@PostMapping("/api/user")
public Object createUser(...) { ... }
```

### 数据权限过滤拼接（唯一拼接点）

```java
public class DataScopeHelper {
  /** 把当前用户的数据范围拼成 MyBatis-Plus 的 dept 过滤条件，返回 null 表示不过滤 */
  public static LambdaQueryWrapper<?> apply(LambdaQueryWrapper<?> w, Long userId) {
    DataScope ds = cache.getDataScope(userId);            // { scope, deptIds, userDeptId, userDeptAncestors }
    switch (ds.scope()) {
      case 1: return w;                                   // 全部，不加条件
      case 2: return w.in("dept_id", ds.deptIds());       // 自定义部门
      case 3: return w.eq("dept_id", ds.userDeptId());    // 本部门
      case 4: return w.and(q -> q.eq("dept_id", ds.userDeptId())
                  .or().apply("dept_id IN (SELECT id FROM wg_dept WHERE ancestors LIKE ?)",
                              ds.userDeptAncestors() + "," + ds.userDeptId() + ",%"));
      case 5: return w.eq("created_by", userId);          // 仅本人
      default: return w;
    }
  }
}
```

### 权限树构建（递归）

```java
public List<PermNode> buildTree(List<Permission> all, Long parentId) {
  return all.stream()
    .filter(p -> Objects.equals(p.getParentId(), parentId))
    .sorted(Comparator.comparingInt(Permission::getSort))
    .map(p -> new PermNode(p, buildTree(all, p.getId())))   // 递归子节点
    .toList();
}
```

## 坑位

- `ancestors` 用 `LIKE` 匹配严格子树时务必带上尾部 `,%`，避免前缀误命中（如 `0,1` 误中 `0,12`）。
- 移动部门（改 parentId）必须在 `@Transactional` 内级联刷新所有子孙的 `ancestors`，漏一条子树查询就错。
- 权限缓存失效别只删单个 key：改角色权限会影响所有持有该角色的用户，按影响面批量删 `perm:user:*`，宁可多失效不可漏。
- 权限/菜单树若数据量大，递归前先按 `parent_id` 分组（`groupingBy`）再建树，避免 O(n²)。
- `RequirePerm` 切面对同类内部方法调用不生效（AOP 代理限制），需跨 bean 调用或注入自身代理。
