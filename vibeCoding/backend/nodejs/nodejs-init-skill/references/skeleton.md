# Node.js + Express 项目骨架

> `nodejs-init-skill` 生成的项目文件清单与核心代码。

## 生成文件清单

| 文件 | 说明 |
|------|------|
| `package.json` | 项目配置、依赖、脚本 |
| `.env.development` | 开发环境变量 |
| `.env.production` | 生产环境变量 |
| `src/app.js` | Express 应用入口（中间件注册、路由挂载） |
| `src/server.js` | HTTP 服务器启动 |
| `src/config/database.js` | 数据库连接（Mongoose / Sequelize） |
| `src/config/jwt.js` | JWT 密钥与过期配置 |
| `src/middleware/auth.js` | passport.js JWT 策略 |
| `src/middleware/response.js` | 统一响应包装 `res.success()` / `res.fail()` |
| `src/middleware/errorHandler.js` | 全局错误处理（BusinessError / ValidationError / 兜底） |
| `src/middleware/upload.js` | multer 文件上传配置 |
| `src/routes/auth.js` | 认证路由（register / login / refresh / logout / me） |
| `src/routes/users.js` | 用户路由（列表 / 详情 / 修改资料 / 修改密码） |
| `src/routes/upload.js` | 上传路由（单文件 / 多文件） |
| `src/routes/sse.js` | SSE 流式路由 |
| `src/models/User.js` | 用户数据模型 |
| `src/services/authService.js` | 认证业务逻辑 |
| `src/services/userService.js` | 用户业务逻辑 |
| `src/utils/errors.js` | BusinessError 自定义错误类 |
| `src/utils/validator.js` | 参数校验工具 |

## 核心依赖

| 依赖 | 用途 |
|------|------|
| express | Web 框架 |
| jsonwebtoken | JWT 签发/验证 |
| passport + passport-jwt | JWT 鉴权策略 |
| bcryptjs | 密码哈希 |
| multer | 文件上传 |
| cors | 跨域 |
| helmet | 安全头 |
| morgan | HTTP 日志 |
| dotenv | 环境变量 |
| mongoose / sequelize | ORM（按数据库选择） |
| nodemon | 开发热重载（devDep） |

## npm scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "lint": "eslint src/"
  }
}
```
