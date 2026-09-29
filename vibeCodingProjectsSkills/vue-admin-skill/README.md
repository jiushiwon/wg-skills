# Vue Admin Skill

> **项目级编排器**——一键生成 Java + Vue3 + MySQL 完整可运行管理后台。

## ⚠️ 前置条件（必读）

本技能通过 `file:` 协议软链接到**同级目录**的 vue-* 技能包，**必须满足以下目录布局**才能跑通：

```
你的工作根目录/
└── vibecoding-portal/skills/
    ├── vibecodingProjectsSkills/vue-admin-skill/   # 本技能
    └── vibeCoding/
        ├── frontend/vue/vue-base-skill/             # 14 个 vue-* 子技能
        └── backend/java/springboot-init-skill/
```

**跨项目使用**（如 clone 到 `D:/projects/java-vue-admin/`）：必须把 `template/frontend/package.json` 中的 `file:../../../../vibeCoding/...` 改为绝对路径（详见 `template/frontend/SYMLINKS.md`）。

## 触发词

**管理后台** / **admin 系统** / **后台管理** / **一键生成管理后台** / **RBAC 权限系统** / **Vue3 管理端**

## 30 秒看懂

本技能**不是单一组件库**，而是**整合模板**——基于 wg-skills 矩阵，组合出可直接跑起来的管理后台。

| 层级 | 技术 | 接入方式 |
|------|------|----------|
| 前端 | Vue3 + Vite + Vue Router + Pinia + Axios | 软链接 vue-* 技能包 |
| 后端 | Spring Boot 3 + Spring Security 6 + JPA + JWT | 单工程复用 springboot-init + auth-module |
| 数据库 | MySQL 8 | 自包含 SQL 脚本 |
| 默认账号 | `admin/admin123`、`user_admin/admin123`、`demo/admin123` | 已预置种子数据 |

## 6 大业务页面

1. **登录页**（9 种风格，默认毛玻璃）
2. **Dashboard**（4 KPI + 欢迎卡片）
3. **用户管理**（CRUD + 分配角色/重置密码）
4. **角色管理**（CRUD + 分配菜单树）
5. **菜单管理**（树形 + 详情编辑）
6. **组织管理**（树形 + 详情编辑）
7. **示例商品**（业务页 CRUD，演示非权限场景）

## 快速启动（3 步）

```bash
# 1. 数据库
cd template/database && docker compose up -d
docker exec -i vue-admin-mysql mysql -uroot -proot < init.sql

# 2. 后端
cd ../backend && ./restart.sh dev

# 3. 前端
cd ../frontend && pnpm install && pnpm dev
```

打开 `http://localhost:5173`，输入 `admin / admin123` 登录。

详细说明：[QUICKSTART.md](./QUICKSTART.md)

## 依赖矩阵

### 前端（14 个软链接 + 1 个规范参考 = 共 15 个）

vue-base-skill（目录索引，提供 14 个 vue-* 子技能统一浏览规范，本身无 `components/index.ts`）+ vue-login-skill + vue-layout-skill + vue-table-skill + vue-form-skill + vue-tree-skill + vue-dialog-skill + vue-card-skill + vue-button-skill + vue-tag-skill + vue-dropdown-skill + vue-input-skill + vue-select-skill + vue-checkbox-skill + vue-switch-skill + frontend-request-skill（**规范参考**，非可 import 包，封装由 vue-admin-skill 自带 `utils/request.ts`）

### 后端（3 个技能，文档型引用 + 衍生派生）

- **springboot-init-skill**：common/ + config/ 为 `demo/` 的**衍生派生**（每文件顶部标注派生来源，差异详见 `template/backend/README.md#provenance`）
- **springboot-auth-module-skill**：api-contract-auth.md 作为契约参考；auth/ 为 vue-admin 自带完整手写 RBAC
- **springboot-dict-module-skill**（可选）：本模板未集成

### 数据库（2 个技能，规范引用）

database-design-skill + mysql-guide-skill

## 文件结构

```
vue-admin-skill/
├── SKILL.md                          # 技能定义（AI 入口）
├── README.md                         # 本文件
├── QUICKSTART.md                     # 一键启动指南
├── references/
│   └── architecture.md               # 架构图 + 数据流
└── template/
    ├── frontend/                     # Vue3 前端（约 30 文件）
    ├── backend/                      # Spring Boot 后端（约 70 文件）
    └── database/                     # 数据库脚本（4 文件）
```

## 关键设计

- **前端不复制任何组件代码**——通过 `package.json` 的 `file:` 协议软链接到同级目录的 vue-* 技能包
- **后端复用单工程**——Java 无法拆包软链接，必须在 template 内复制 springboot-init demo 源码 + auth-module 叠加层
- **数据库自包含**——所有 SQL 在 vue-admin-skill/template/database/ 内

## 与现有技能的关系

```
vue-admin-skill（项目级编排器）
├── 前端技能（软链接）
│   ├── vue-base-skill
│   │   ├── vue-login-skill
│   │   ├── vue-layout-skill
│   │   ├── vue-table-skill
│   │   ├── vue-form-skill
│   │   ├── vue-tree-skill
│   │   ├── vue-dialog-skill
│   │   └── ...（14 个子技能）
│   └── frontend-request-skill
├── 后端技能（单工程复用）
│   ├── springboot-init-skill（基础设施层）
│   └── springboot-auth-module-skill（RBAC 叠加层）
└── 数据层
    ├── database-design-skill（规范）
    └── mysql-guide-skill（MySQL 8 配置）
```

## 不做的事

- 不复制 vue-* 技能源代码
- 不在 vue-admin-skill 内重写 JWT / Spring Security / 数据库规范
- 不集成 springboot-dict-module / Redis / WebSocket
- 不写业务页（仅商品列表作为示例）
- 不写部署 / 数据可视化

## 维护

修改本技能后同步更新：
- `SKILL.md`（如依赖变化）
- `QUICKSTART.md`（如启动步骤变化）
- `wg-skills/README.md` + `wg-skills/AGENTS.md`（如有目录变化）