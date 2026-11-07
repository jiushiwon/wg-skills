# 项目指南模板

## 技术栈

- **语言**: Go 1.21+
- **框架**: {{FRAMEWORK}} (Gin / Hertz / Fiber / Chi)
- **ORM**: GORM
- **数据库**: MySQL / PostgreSQL
- **认证**: JWT

## 目录结构

```
{{PROJECT_NAME}}/
├── cmd/server/        # 程序入口
├── internal/          # 内部包
│   ├── config/        # 配置
│   ├── database/      # 数据库
│   ├── response/     # 响应封装
│   ├── middleware/    # 中间件
│   ├── handlers/      # 处理器
│   └── utils/        # 工具
└── docs/             # 文档
```

## 启动方式

### 开发模式

```bash
./restart.sh dev
# 或
air
```

### 生产模式

```bash
./restart.sh prod
```

## 接口文档

- Swagger: `http://localhost:8080/swagger/index.html`

## 配置

修改 `.env` 文件：

```bash
APP_PORT=8080
DB_HOST=localhost
JWT_SECRET=change-me
```

## 拓展指南

### 添加新模块

1. 在 `internal/models/` 添加模型
2. 在 `internal/handlers/` 添加处理器
3. 在 `internal/services/` 添加业务逻辑
4. 在 `main.go` 注册路由

### 添加中间件

在 `internal/middleware/middleware.go` 中添加
