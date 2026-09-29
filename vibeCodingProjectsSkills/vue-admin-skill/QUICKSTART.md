# 一键启动指南（3 步）

本指南帮助你 **5 分钟内** 启动 vue-admin-skill 模板项目。

## 环境要求

| 工具 | 版本 | 检查命令 |
|------|------|----------|
| **JDK** | 17+ | `java -version` |
| **Maven** | 3.8+ | `mvn -version`（可选，模板自带 Maven Wrapper） |
| **Node.js** | 18+ | `node -v` |
| **pnpm** | 8+ | `pnpm -v`（如未安装：`npm install -g pnpm`） |
| **MySQL** | 8.0+ | `mysql --version` |
| **Docker** | 20+（可选） | `docker --version` |

## 前置准备

### 重要：同级目录约定

vue-admin-skill 的前端模板通过 `file:` 协议软链接到 **同级根目录** 的依赖技能包。**请确认以下目录与 vue-admin-skill 平级存在**：

```
你的工作根目录/
├── vibecoding-portal/                    # 必须存在
│   └── skills/
│       ├── vibecodingProjectsSkills/
│       │   └── vue-admin-skill/         # 本技能
│       └── vibeCoding/
│           ├── frontend/
│           │   ├── vue/vue-base-skill/         # 必须存在
│           │   └── frontend-request-skill/     # 必须存在
│           └── backend/
│               └── java/
│                   ├── springboot-init-skill/    # 必须存在
│                   └── springboot-module/
│                       └── springboot-auth-module-skill/  # 必须存在
```

如果不在这个目录结构，**先调整目录结构**，再启动。

---

## Step 1：启动 MySQL + 导入数据库（2 分钟）

### 方式 A：使用 Docker（推荐）

```bash
cd vue-admin-skill/template/database
docker compose up -d
# 等待 MySQL 启动（约 10 秒）
sleep 10
docker exec -i vue-admin-mysql mysql -uroot -proot < init.sql
```

验证：
```bash
docker exec -i vue-admin-mysql mysql -uroot -proot -e "SHOW TABLES FROM vue_admin;"
```
应看到：9 张权限表 + 1 张商品表 + 默认配置项（共 11+ 张表）

### 方式 B：本地 MySQL

```bash
# 1. 创建数据库
mysql -uroot -p -e "CREATE DATABASE vue_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 导入
cd vue-admin-skill/template/database
mysql -uroot -p vue_admin < init.sql
```

---

## Step 2：启动后端（1 分钟）

```bash
cd vue-admin-skill/template/backend

# Linux/macOS
./restart.sh dev

# Windows
restart.bat dev
```

**预期输出**：
- 启动日志显示 `Flyway: Successfully applied 1 migration to schema "vue_admin"`
- 监听 `8080` 端口
- 看到 `Started Application in X.XXX seconds`

**验证后端**：
```bash
# 健康检查
curl http://localhost:8080/api/health

# Swagger UI
open http://localhost:8080/swagger-ui.html

# 登录测试
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

应返回：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

---

## Step 3：启动前端（1 分钟）

```bash
cd vue-admin-skill/template/frontend
pnpm install
pnpm dev
```

**预期输出**：
- `pnpm install` 通过 `file:` 协议软链接所有 vue-* 技能
- 监听 `5173` 端口
- 看到 `Local: http://localhost:5173/`

**打开浏览器**：`http://localhost:5173`

应自动跳转到 `/login`，看到毛玻璃风格登录页。

**测试账号**：
| 账号 | 密码 | 看到什么 |
|------|------|----------|
| `admin` | `admin123` | 全部菜单（仪表盘 + 系统管理 + 示例） |
| `user_admin` | `admin123` | 仪表盘 + 系统管理（不含菜单管理） |
| `demo` | `admin123` | 仅仪表盘 |

---

## 端到端验证清单

启动后，按以下顺序验证：

- [ ] 登录页正常显示（毛玻璃风格）
- [ ] 输入 `admin/admin123` 跳转 `/dashboard`
- [ ] Dashboard 显示 4 个 KPI + 1 个卡片
- [ ] 侧边栏显示 3 个一级菜单（仪表盘 / 系统管理 / 示例）
- [ ] 系统管理 → 用户管理：列表显示 3 个用户（admin/user_admin/demo）
- [ ] 系统管理 → 角色管理：列表显示 3 个角色，可点开分配菜单树
- [ ] 系统管理 → 菜单管理：树形显示所有菜单
- [ ] 系统管理 → 组织管理：树形显示 4 个部门
- [ ] 示例 → 商品列表：列表显示 5 条商品，可增删改查
- [ ] 右上角用户菜单可退出登录

---

## 常见问题

### Q1：MySQL 连不上
**报错**：`Communications link failure` 或 `Access denied`

**解决**：
1. 检查 MySQL 是否启动：`docker ps | grep mysql`
2. 检查端口：`netstat -an | grep 3306`
3. 检查 `backend/.env` 中 `DB_PASSWORD` 与 MySQL 一致

### Q2：后端启动报 Flyway 错误
**报错**：`Migration checksum mismatch`

**解决**：删除数据库重新导入：
```bash
docker exec -i vue-admin-mysql mysql -uroot -proot -e "DROP DATABASE vue_admin; CREATE DATABASE vue_admin DEFAULT CHARACTER SET utf8mb4;"
docker exec -i vue-admin-mysql mysql -uroot -proot < init.sql
```

### Q3：前端 pnpm install 失败
**报错**：`ENOENT: no such file or directory` 或 `file: 协议失败`

**解决**：
1. 确认同级目录结构（见上文「前置准备」）
2. 如果某个依赖技能不存在，从仓库克隆：
   ```bash
   # 在 vibecoding-portal/skills/ 根目录
   git pull  # 同步最新技能
   ```
3. **跨项目使用**（如 clone 到 `D:/projects/java-vue-admin`）：file: 相对路径失效，需改为绝对路径：
   ```bash
   # 把 package.json 中所有
   #   "file:../../../../vibeCoding/frontend/..."
   # 改为
   #   "file:D:/projects/vibecoding-portal/skills/vibeCoding/frontend/..."
   # 详细说明 + 脚本化方案见 template/frontend/SYMLINKS.md
   ```

### Q4：前端打开空白页
**报错**：控制台报 `Failed to fetch` 或 404

**解决**：
1. 检查后端是否启动（`curl http://localhost:8080/api/health`）
2. 检查 `frontend/.env.development` 中 `VITE_API_BASE_URL` 指向 `http://localhost:8080`
3. 检查浏览器控制台 Network 选项卡，确认请求 URL 正确

### Q5：登录提示用户名或密码错误
**报错**：登录返回 `code != 0`

**解决**：
1. 确认数据库 `wg_user` 表有 admin 账号：
   ```bash
   docker exec -i vue-admin-mysql mysql -uroot -proot -e \
     "SELECT id, username, status FROM vue_admin.wg_user;"
   ```
2. 确认 admin 密码 hash 正确（V1__init.sql 中已使用 BCrypt 加密 `admin123`）

### Q6：菜单不显示
**报错**：登录后侧边栏为空

**解决**：
1. 检查 `/api/auth/menus` 返回：
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}' | jq -r .data.accessToken)
   curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/auth/menus
   ```
2. 应返回菜单树；如为空，确认 admin 用户的角色绑定（`wg_user_role` 表）和角色的菜单绑定（`wg_role_menu` 表）

### Q7：端口冲突
**报错**：`Port 8080 is already in use` 或 `Port 5173 is already in use`

**解决**：
- 后端：修改 `backend/.env` 中 `SERVER_PORT=8081`
- 前端：修改 `frontend/vite.config.ts` 中 `server.port: 5174`

---

## 下一步

启动成功后，你可以：

1. **改样式**：修改 `frontend/src/styles/tokens.css` 调整全局配色
2. **加菜单**：在 `wg_sys_menu` 表新增菜单项 → 重启后端即可看到
3. **加业务页**：在 `frontend/src/views/` 新增页面 + 在 `backend/src/main/java/com/example/demo/` 新增对应 Controller
4. **换技术栈**：本模板支持换其他前端（React/UniApp）或后端（FastAPI/Go）——分别用 vue-react-admin-skill/python-fastapi-admin 替代

---

## 技术支持

- 文档：[SKILL.md](./SKILL.md) / [references/architecture.md](./references/architecture.md)
- 问题反馈：在 wg-skills 仓库提 Issue