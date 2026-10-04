# 种子数据与端到端冒烟清单

## 种子数据（`Seed(db)`，仅在无用户时注入一次）

| 类型 | 内容 |
|------|------|
| 租户 | 1 个：`默认租户 / default` |
| 组织 | 4 个：总公司（根）+ 研发部 / 市场部 / 财务部 |
| 岗位 | 4 个：技术总监 / 前端开发 / 后端开发 / 产品经理 |
| 角色 | 3 个：`super_admin`(ALL) / `user_admin`(ALL) / `common_user`(SELF_ONLY) |
| 菜单 | 37 个：3 目录 + 8 页面 + 26 按钮 |
| 用户 | `admin`(超级管理员) / `user_admin`(用户管理员) / `demo`(演示账号) |
| 密码 | **三者统一 `admin123`** |

角色-菜单绑定：

- `super_admin`：**全绑**（37 个菜单）→ `menuCount = 37`
- `user_admin`：仪表盘 + 系统管理（不含菜单管理、应用管理）+ 账户绑定，及其按钮
- `common_user`：仪表盘 + 自己的绑定，及其按钮

> ★ 改了 `seed.go` 的权限字符串后，旧的 `.db` **不会重播**（`Seed` 只在无用户时执行）。
> 要验证必须删掉 `data/*.db` 让首跑重新播种——否则会看到旧数据（例如权限数 37 而非 34）。

## 冒烟清单（21 项，实测全绿）

起服务后按顺序断言（`base = http://localhost:8080`）：

1. `GET /api/health` → `{code:0,message:"success",data:{status:"ok"}}`
2. `POST /api/auth/login` `{admin, admin123}` → `accessToken` + `refreshToken`
3. `GET /api/auth/me` → `username=admin`、`roles` 含 `super_admin`、
   `permissions.length == 34` 且**不含空串**、`keys` 里**没有** `orgName`（Java 不返回）
4. `GET /api/auth/menus` → 树形数组，顶层 3 个且带 `children`
5. `GET /api/users?page=1&pageSize=10` → `data.list` 数组 + `total>=3` + `page=1` + `pageSize=10`
6. 用户 VO 含 `username` / `orgName` / `status`
7. `GET /api/roles?page=1&pageSize=10` → 分页；角色项含 `menuCount`（super_admin 为 37）
8. `GET /api/menus` → 树形数组
9. `GET /api/orgs` → 树形数组，带 `children`
10. `GET /api/posts` → **裸数组**（非分页）
11. `GET /api/tenants` → 信封
12. `GET /api/apps?page=1&pageSize=10` → 分页
13. `GET /api/bind` → **裸数组**（非分页）
14. `demo` 登录 → `GET /api/users` → **403**（`code=-1003`，权限拦截生效）
15. `POST /api/auth/refresh` → 新 `accessToken`
16. `POST /api/apps` → 拿到 `appKey`
17. `POST /api/apps/{id}/keys` → 拿到 `apiKey` 与**一次性的** `apiSecret`
18. 用 `apiKey` + `apiSecret` 算 Hmac 签名 → `GET /api/open/userinfo?appUserId=demo`
    → 200 + `bound:false`
19. 错误签名 → 401（签名校验失败被拒）
20. 清理测试应用
21. 汇总：全部 `code==0`

## Go 落地要点

- DB 用 `github.com/glebarez/sqlite`（纯 Go，`CGO_ENABLED=0`，零环境安装）
- ★ import 必须写全 `github.com/glebarez/sqlite`；写成 `glebarez/sqlite` 会让
  `go mod tidy` 误判未使用而删掉依赖，随后报 `package glebarez/sqlite is not in std`
- 默认端口 **8080**，与前端 vite proxy `/api → localhost:8080` 一致，**前端无需改动**
- 冒烟要在**同一条命令生命周期内**起服务、断言、杀服务；后台进程跨 shell 会被回收，
  导致后续请求 `connection refused`

## 前端桥接自检

| 检查项 | 期望 |
|--------|------|
| vite proxy `target` | `http://localhost:8080` |
| 后端端口 | 8080 |
| 响应信封 | `{code,message,data}` |
| 分页字段 | `list`（不是 items） |
| `/api/posts`、`/api/bind` | 裸数组（前端直接赋值，不取 `.list`） |
