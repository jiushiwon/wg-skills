# uniapp 登录鉴权与安全规范 Skill

> uniapp 微信小程序项目的登录鉴权与安全规范

## 功能

- **认证服务**：Bootstrap 启动、登录态判断、requireLogin
- **Token 管理**：获取 Token、用户上下文、存储 Key
- **401/403 处理**：并发去重、统一跳转
- **登出流程**：状态清理、回跳机制
- **安全规范**：接口安全、数据安全、代码安全

## 使用方式

### 触发词

- "登录鉴权怎么做"
- "uniapp 登录"
- "token 管理"
- "401 处理"、"403 处理"
- "安全规范"
- "接口安全"

### 前置依赖

建议配合 [uniapp-common-skill](../uniapp-common-skill/) 使用（红线规则、目录结构、接口规范）

## 文档结构

```
uniapp-components-skill/
├── SKILL.md           # 主文件
├── README.md          # 说明文档
└── references/
    ├── auth-framework.md  # 鉴权框架详解
    └── security.md        # 安全规范详解
```