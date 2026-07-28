# uniapp 开发通用规范 Skill

> uniapp 微信小程序项目的通用开发规范，不含业务逻辑

## 功能

| 模块 | 说明 |
|------|------|
| **红线规则** | 20 条强制规范，违反即不合规 |
| **目录结构** | 标准化的项目目录组织方式 |
| **接口规范** | 统一请求封装、Mock 数据、错误处理 |
| **性能优化** | DOM 限制、setData、长列表、图片懒加载 |
| **状态管理** | Pinia Store 最佳实践 |
| **路由规范** | 页面跳转、路由守卫、分包配置 |
| **埋点规范** | 曝光、点击、停留时长上报 |
| **组件通信** | props/emit、provide/inject、EventBus |

## 技术栈

- **框架**：uni-app + Vue3
- **语言**：TypeScript
- **状态管理**：Pinia
- **样式**：SCSS（需配合 uniapp-design-skill）
- **构建工具**：Vite

## 快速开始

### 1. 触发技能

```
/uniapp-common
```

或描述以下场景：

- "uniapp 开发规范"
- "小程序规范"
- "接口怎么写"
- "uniapp 项目结构怎么组织"

### 2. 使用模板快速创建项目

```bash
# 复制模板文件到新项目目录
cp -r uniapp-common-skill/templates/* /your-project/src/

# 或手动复制需要的文件
```

### 3. 安装依赖

```bash
npm install
```

## 红线规则（20 条）

> 违反以下任意规则即视为不符合规范

| 编号 | 规则 | 说明 |
|------|------|------|
| R01 | **禁止嵌套 v-for** | 单个页面 v-for 层数 ≤ 1 |
| R02 | **data 只存视图数据** | 过滤接口原始数据 |
| R03 | **优先使用 uni.xxx** | 禁止私有 API |
| R04 | **DOM 节点数限制** | 页面总节点 ≤ 1000 |
| R05 | **长列表必须分页** | 懒加载 + 分页，每页 ≤ 20 条 |
| R06 | **setData 数据量限制** | 单次 ≤ 100KB，频率 ≤ 20次/秒 |
| R07 | **禁止 eval/new Function** | 危险方法 |
| R08 | **禁止硬编码** | 配置项放 config 目录 |
| R09 | **请求防抖节流** | 同一接口 1 秒内禁止重复请求 |
| R10 | **失败必须弹提示** | 所有失败场景必须向用户暴露错误 |
| R11 | **AI 生成后必须 lint** | `npm run lint` |
| R12 | **提交前必须 lint** | 通过后才能提交 |
| R13 | **commit 必须用中文** | 禁止纯英文 commit |
| R14 | **commit 长度限制** | subject ≤ 50 字 |
| R15 | **SCSS 必须用 Token** | 详见 uniapp-design-skill |
| R16 | **Mock 放 _mocks_/** | 禁止写在 API 文件或页面中 |
| R17 | **请求只传业务路径** | 传 `/user/info` 不传 `/api/v1/user/info` |
| R18 | **屏幕适配走规范** | 详见 uniapp-design-skill |
| R19 | **鸿蒙降级规范** | 详见 uniapp-design-skill |
| R20 | **认证服务收口** | 详见 uniapp-auth-skill |

## 目录结构

```
src/
├── api/                      # 接口封装
│   ├── _mocks_/             # Mock 数据字典
│   ├── request.ts            # 统一请求封装
│   └── index.ts             # 导出入口
├── components/               # 公共组件
│   └── common/              # 通用组件
├── pages/                   # 业务页面
├── pages-sub/               # 分包页面
├── stores/                  # Pinia 状态管理
├── services/                 # 业务服务层
├── utils/                   # 工具函数
│   ├── router.ts            # 路由封装
│   ├── router-guard.ts      # 路由守卫
│   ├── toast.ts             # 提示工具
│   ├── storage.ts           # 存储工具
│   └── analytics.ts         # 埋点工具
├── config/                  # 应用配置
│   ├── env.config.ts        # 环境配置
│   ├── api.config.ts        # API 配置
│   └── index.ts             # 配置导出
├── constants/               # 常量
├── types/                   # TypeScript 类型
├── styles/                  # SCSS 样式系统
├── composables/             # 组合式函数
├── App.vue                  # 根组件
├── main.ts                  # 入口
└── pages.json               # 页面路由
```

## 常用命令

| 命令 | 用途 |
|------|------|
| `npm install` | 安装依赖（建议先删除 node_modules） |
| `npm run dev:mp-weixin` | 微信小程序开发调试 |
| `npm run build:mp-weixin` | 微信小程序打包 |
| `npm run lint` | ESLint 代码检查 |

## 文档结构

```
uniapp-common-skill/
├── SKILL.md                    # 技能定义
├── README.md                   # 本文件
├── templates/                  # 项目模板
│   ├── vite.config.ts         # Vite 配置
│   ├── tsconfig.json          # TypeScript 配置
│   ├── main.ts                # 应用入口
│   ├── pages.json             # 页面路由
│   ├── pages-sub.json         # 分包配置
│   ├── package.json           # 依赖配置
│   ├── .env.example          # 环境变量示例
│   └── env.d.ts               # 类型声明
└── references/                # 详细文档
    ├── api-architecture.md    # 请求封装详解
    ├── performance.md          # 性能优化详解
    ├── store-guide.md          # 状态管理详解
    ├── router-guide.md         # 路由规范详解
    ├── analytics.md            # 埋点规范详解
    └── component-communication.md  # 组件通信详解
```

## 配套技能

| 技能 | 用途 |
|------|------|
| [uniapp-auth-skill](../../uniapp-auth-skill/) | 登录鉴权与安全规范 |
| [uniapp-design-skill](../../uniapp-design-skill/) | 设计系统与组件规范 |

## 常见问题

### Q: 如何使用模板创建新项目？

A: 复制 `templates/` 目录下的文件到新项目的对应位置，然后修改配置。

### Q: 红线规则必须全部遵守吗？

A: 是的，这是团队开发的基础规范，违反会影响代码质量和维护性。

### Q: 如何快速查看接口封装的使用方式？

A: 参考 `references/api-architecture.md`，或直接在项目中导入：

```typescript
import { get, post } from '@/api/request';

// GET 请求
const userInfo = await get<UserInfo>('/user/info');

// POST 请求
await post<void>('/user/update', { nickname: '张三' });
```

### Q: 路由守卫在哪里配置？

A: `src/utils/router-guard.ts`，已在 `main.ts` 中初始化。

### Q: 如何添加埋点？

A: 使用 `analytics` 对象：

```typescript
import { analytics } from '@/utils/analytics';

// 页面曝光
analytics.pageView('首页');

// 点击事件
analytics.click('首页_按钮_点击', { button_id: 'login' });
```
