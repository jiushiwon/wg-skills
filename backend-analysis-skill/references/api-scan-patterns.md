# 接口扫描模式（Step 1）

通用策略：**先 Glob 定位路由文件 → 再 Grep 提取端点 → 拼接完整路径 → 提取入参/出参/鉴权**。

> ⚠️ **两条血泪规则**（dogfooding 实测教训）：
> 1. **鉴权扫描禁用 head_limit 限量**：Grep 限量截断会漏掉整个文件的 Depends/鉴权注解，导致把"需登录接口"误判为"无鉴权接口"。鉴权相关 Grep 必须 `head_limit: 0`（不限量）或按文件逐个扫。
> 2. **无鉴权结论必须逐端点确认**：每个"无鉴权"接口都要读到函数签名确认（无 Depends/无装饰器/无中间件），函数体内可能手动鉴权。宁可标"疑似"不可漏标。

## 1. Java — Spring Boot / Spring MVC

### 定位控制器
```
Glob: **/*Controller.java
Grep: @(RestController|Controller)\b
```

### 提取端点
```
Grep: @(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping)\s*(\(|$)
```

### 路径拼接规则
1. 类级 `@RequestMapping("/user")` 或 `@RestController` 类上的 `@RequestMapping` → 前缀
2. 方法级 `@GetMapping("/{id}")` → 路径片段
3. 完整路径 = 全局 context-path + 类前缀 + 方法路径
4. 全局前缀来源：`server.servlet.context-path`（application.yml）或 `@RequestMapping` 在网关层

### 入参/出参/鉴权提取
| 信息 | 模式 |
|------|------|
| 入参 | `@RequestBody XxxDTO` / `@RequestParam` / `@PathVariable` / `@ModelAttribute` |
| 出参 | 方法返回类型（`R<XxxVO>` / `ResponseEntity<Xxx>` / `XxxVO`） |
| 鉴权 | 方法/类上的 `@PreAuthorize` / `@RolesAllowed` / `@RequiresPermissions`(Shiro) / 自定义 `@Auth` 注解 |
| 免鉴权 | SecurityConfig 中 `permitAll()` / `antMatchers(...)` / `excludePathPatterns` |

### 微服务额外扫描
```
Grep: @FeignClient   → 内部 RPC 接口（被调方）
Grep: @DubboService / @DubboReference → Dubbo 接口
```

## 2. Go — Gin / Echo

### 定位路由
```
Grep: \.(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\(\s*"
Grep: \.Group\(\s*"
Glob: **/router*.go / **/routes*.go / **/*handler*.go
```

### 路径拼接规则
1. `r := gin.Default()` / `e := echo.New()` 为根
2. `api := r.Group("/api")` → 前缀 `/api`
3. `api.GET("/users", handler.ListUsers)` → `GET /api/users`，handler 即处理函数
4. 嵌套 Group 逐级累加前缀

### 补充
- 中间件链：`r.Use(authMiddleware)` → 该组路由需要鉴权
- gRPC 项目另扫：`Glob **/*.proto` + `Grep: rpc \w+\(` 提取服务方法

## 3. Python — FastAPI / Django / Flask

### FastAPI
```
Grep: @(app|router)\.(get|post|put|delete|patch)\(\s*"
Grep: APIRouter\(([^)]*prefix[^)]*)\)   → 路由前缀
Grep: include_router\(                 → 路由注册
```
- 入参：函数签名中的 Pydantic 模型 / `Query()` / `Path()`
- 出参：`response_model=XxxSchema`
- 鉴权：`Depends(get_current_user)` / `Security(...)` / 自定义 Depends

### Django / DRF
```
Glob: **/urls.py
Grep: (path|re_path|url)\(\s*['"]
Grep: class \w+\((APIView|ViewSet|ModelViewSet|generics\.\w+)
```
- 项目级 urls.py 的 `include('app.urls')` → 应用前缀
- DRF：`router.register(r'users', UserViewSet)` → RESTful 全套接口

### Flask
```
Grep: @(app|bp|\w+_bp)\.(route|get|post|put|delete)\(\s*['"]
Grep: Blueprint\(\s*['"]\w+['"].*url_prefix   → 蓝图前缀
```

## 4. Node.js — Express / NestJS / Koa

### Express / Koa
```
Grep: (app|router)\.(get|post|put|delete|patch|all|use)\(\s*['"`]
Grep: app\.use\(\s*['"`]/[^'"`]*['"`]   → 路由挂载前缀
```
- `app.use('/api/users', userRouter)` + router 内 `router.get('/:id')` → `GET /api/users/:id`
- 中间件：`app.use(authMiddleware)` 位置决定鉴权范围

### Egg.js（阿里，Express/Koa 模式可兼容扫描）
```
Glob: app/router.js / app/router/*.js
Grep: router\.(get|post|put|delete|patch)\(\s*[`'"]   → 兼容（实测可扫出全部路由）
Grep: const\s+\w*PREFIX\w*\s*=\s*['"`]   → 模板字符串常量前缀，如 const API_PREFIX = "/wgnweb"
Grep: app\.ws\.route\(                    → WebSocket 端点（egg-websocket-plugin）
```
- Egg 常用模板字符串拼前缀：`router.post(`${API_PREFIX}/login`, controller.user.login)` → 先提取常量值再拼接
- 中间件注册不在代码里，在 `config/config.default.js` 的 `config.middleware` 数组 + `app/middleware/` 目录
- Controller 约定：`controller.user.login` → `app/controller/user.js` 的 `login` 方法

### NestJS（与 Spring 类似，装饰器驱动）
```
Grep: @Controller\(\s*['"`][^'"`]*['"`]?\s*\)   → 控制器前缀
Grep: @(Get|Post|Put|Delete|Patch)\(            → 端点
Grep: @UseGuards\(                              → 鉴权
Grep: @Body\(\)|@Query\(\)|@Param\(\)           → 入参
```

## 5. 无框架/边缘情况

| 情况 | 处理 |
|------|------|
| Go 标准库 `net/http` | `Grep: http\.(HandleFunc|Handle)\("` |
| Java 裸 Servlet | `Grep: extends HttpServlet` + web.xml `url-pattern` |
| Serverless 函数 | `Glob **/handler.*` / `template.yaml`(SAM) / `serverless.yml` 的 events.http |
| GraphQL | `Glob **/*.graphql` + `Grep: type (Query|Mutation)` |

## 6. 统计与异常标注

扫描完成后输出：
- 接口总数、按 HTTP 方法分布、按模块分布
- **无鉴权接口清单**（逐端点确认后，排除明确的公开接口如 login/health 后仍有嫌疑的）
- 被注释掉的接口（`// @GetMapping` 或 `/* */` 包裹）
- 路径冲突/重复注册（**含同名函数重复定义**：Python 中后定义覆盖前定义，但 FastAPI 两个路由都已注册，先注册者生效，后者为死代码——且两份实现响应结构可能不一致，是契约隐患）
- 🔴 **动态路由吞噬静态路由**（FastAPI/Express/Egg 按注册顺序匹配的框架通病）：静态路径（如 `/conferences/search`）注册在动态路径（`/{conference_id}`）**之后**时永远不可达。检查法：列出同前缀下所有路由，凡静态段排在 `{param}`/`:param` 之后的，标注"疑似不可达"
- 全局路由配置：context-path、统一前缀、API 版本策略（URL 版本 `/v1` / Header 版本）；**若前端配置（.env 的 API_BASE）与后端前缀不一致，标注"前后端路径约定待确认"**
- WebSocket 端点单独一节（如有）
