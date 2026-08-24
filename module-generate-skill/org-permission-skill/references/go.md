# org-permission-skill — Go (Gin) 实现要点

骨架已有的（auth-skill / go-backend-skill 生成，**不要重写**）：JWT 中间件注入当前用户、`OK()/Fail()` 信封、`BizError`、Redis 客户端。本模块只补权限业务。

## 新增依赖

无（复用骨架的 Redis 与 GORM）。

## 关键文件

| 文件 | 职责 |
|------|------|
| `internal/model/perm.go` | `Dept` / `Role` / `Permission` / 三个关联 GORM 模型 |
| `internal/middleware/require_perm.go` | 中间件工厂 `RequirePerm("user:add")`，校验当前用户 perms |
| `internal/service/perm_cache_service.go` | 计算并缓存 `perm:user:{userId}`，变更时失效 |
| `internal/service/data_scope.go` | 数据权限唯一拼接点：按 scope 生成 GORM 查询条件 |
| `internal/handler/dept_handler.go` 等 4 个 handler | 参数绑定校验 + 调 service，返回裸数据 |

## 关键片段

### 权限校验中间件

```go
func RequirePerm(perm string) gin.HandlerFunc {
	return func(c *gin.Context) {
		u := CurrentUser(c) // 骨架注入
		if u == nil {
			c.Error(&BizError{Code: -1002, Msg: "未登录"})
			c.Abort()
			return
		}
		if permCache.IsAdmin(u.ID) { // 超管唯一判断点
			c.Next()
			return
		}
		if !permCache.GetPerms(u.ID).Contains(perm) {
			c.Error(&BizError{Code: -1003, Msg: "无权限"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// 路由注册：
r.POST("/api/user", middleware.RequirePerm("user:add"), userHandler.Create)
```

### 数据权限过滤拼接（唯一拼接点）

```go
// ApplyDataScope 按当前用户数据范围给 GORM 查询加 dept 过滤，返回原 db 表示不过滤
func ApplyDataScope(db *gorm.DB, userID int64) *gorm.DB {
	ds := permCache.GetDataScope(userID) // { Scope, DeptIDs, UserDeptID, UserDeptAncestors }
	switch ds.Scope {
	case 1: // 全部
		return db
	case 2: // 自定义部门
		return db.Where("dept_id IN ?", ds.DeptIDs)
	case 3: // 本部门
		return db.Where("dept_id = ?", ds.UserDeptID)
	case 4: // 本部门及子部门
		like := ds.UserDeptAncestors + "," + strconv.FormatInt(ds.UserDeptID, 10) + ",%"
		return db.Where("dept_id = ? OR dept_id IN (SELECT id FROM wg_dept WHERE ancestors LIKE ?)", ds.UserDeptID, like)
	case 5: // 仅本人
		return db.Where("created_by = ?", userID)
	}
	return db
}
```

### 权限树构建（递归）

```go
func BuildTree(all []model.Permission, parentID int64) []PermNode {
	var nodes []PermNode
	for _, p := range all {
		if p.ParentID != parentID {
			continue
		}
		nodes = append(nodes, PermNode{Permission: p, Children: BuildTree(all, p.ID)})
	}
	sort.Slice(nodes, func(i, j int) bool { return nodes[i].Sort < nodes[j].Sort })
	return nodes
}
```

## 坑位

- `ancestors` 的 `LIKE` 匹配务必带尾部 `,%`（拼成 `path + ",%"`），否则 `0,1` 会误中 `0,12`。
- 移动部门必须在 `db.Transaction` 内级联刷新所有子孙 `ancestors`，漏一条子树查询就错。
- 权限缓存失效按影响面批量删（`SCAN perm:user:*` 或维护反向索引），改角色权限别只删一个用户的 key。
- `BuildTree` 递归前先按 `ParentID` 分组成 `map[int64][]Permission` 再建树，避免 O(n²)；切片 `sort.Slice` 只排当前层。
- 中间件里 `c.Error()` 后要 `c.Abort()`，否则 handler 仍会继续执行。
