# {{PROJECT_NAME}} 项目指南

> 本文件由 nodejs-init-skill 生成，配套 `api-contract.md`。

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式（nodemon 热重载）
npm run dev

# 生产模式（pm2 后台运行）
npm start
```

访问：
- `http://localhost:{{APP_PORT}}/api/health` — 健康检查
- `http://localhost:{{APP_PORT}}/api-docs` — Swagger UI（如启用）

## 项目结构

```
{{PROJECT_NAME}}/
├── package.json
├── .env.development          # 开发环境变量
├── .env.production           # 生产环境变量
├── src/
│   ├── app.js                # Express 应用入口
│   ├── server.js             # 服务器启动
│   ├── config/
│   │   ├── database.js       # 数据库配置
│   │   └── jwt.js            # JWT 配置
│   ├── middleware/
│   │   ├── auth.js           # JWT 鉴权中间件
│   │   ├── response.js       # 统一响应包装中间件
│   │   ├── errorHandler.js   # 全局错误处理
│   │   └── upload.js         # multer 文件上传
│   ├── routes/
│   │   ├── auth.js           # 认证路由
│   │   ├── users.js          # 用户路由
│   │   ├── upload.js         # 上传路由
│   │   └── sse.js            # SSE 路由
│   ├── models/               # 数据模型（Mongoose/Sequelize）
│   ├── services/             # 业务逻辑
│   └── utils/
│       ├── errors.js         # 自定义错误类
│       └── validator.js      # 参数校验
├── uploads/                  # 上传文件存储
├── logs/                     # 日志目录
└── restart.sh                # 启动脚本（可选）
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | 3000 |
| `NODE_ENV` | 运行环境 | development |
| `DB_URI` | 数据库连接串 | mongodb://localhost:27017/{{PROJECT_NAME}} |
| `JWT_SECRET` | JWT 密钥 | （必须设置） |
| `JWT_EXPIRES_IN` | access_token 有效期 | 3600s |
| `JWT_REFRESH_EXPIRES_IN` | refresh_token 有效期 | 604800s |
| `UPLOAD_MAX_SIZE` | 上传大小限制 | 10MB |
| `UPLOAD_ALLOWED_TYPES` | 允许的 MIME 类型 | jpg,jpeg,png,gif,pdf |
| `CORS_ORIGIN` | 允许的跨域来源 | * |

## 与前端联动

详见 `api-contract.md` 的"与前端联动"章节。前端请求层规范参考 `frontend-request-skill`。
