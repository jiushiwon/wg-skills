# Node.js Init Skill

面向**零基础小白**的 Node.js + Express Web 服务一键初始化助手。

## 功能

一键生成标准化、开箱即用的 Express.js Web 服务骨架。

## 使用方式

直接说"帮我搭一个 Node.js 项目"或"初始化 Express 项目"即可触发。

## 核心能力

| 能力 | 说明 |
|------|------|
| 环境探测 | 自动检测 Node.js >=18、npm |
| 一键启动 | `npm run dev` 开发 / `npm start` 生产 |
| JWT 鉴权 | 注册/登录/刷新令牌 |
| 文件上传 | multer 单文件/多文件上传 |
| 统一响应 | `{ code, message, data }` 自动封装 |
| 文档 | Swagger UI |

## 目录说明

```
nodejs-init-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
├── demo/                       # 示例项目
└── references/                 # 参考资料
    ├── skeleton.md            # 项目结构
    ├── env-setup.md           # 环境探测
    ├── db-guide.md           # 数据库选型
    ├── auth-guide.md         # JWT 鉴权
    ├── upload-guide.md       # 文件上传
    └── middleware-guide.md   # 中间件
```
