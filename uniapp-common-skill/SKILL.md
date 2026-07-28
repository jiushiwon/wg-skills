---
name: uniapp-common-skill
description: uniapp 微信小程序开发通用规范 skill。覆盖红线规则、目录结构、接口封装、性能优化、状态管理、路由规范、组件通信、埋点等
trigger: /uniapp-common
---

# uniapp 开发通用规范 Skill

## Overview

本 skill 提供 uniapp 微信小程序项目的通用开发规范，不包含业务逻辑，只涵盖技术框架层面的最佳实践。

**技术栈**：uni-app + Vue3 + TypeScript + Pinia + SCSS

**配套技能**：
- [uniapp-auth-skill](../../uniapp-auth-skill/) — 登录鉴权与安全规范
- [uniapp-design-skill](../../uniapp-design-skill/) — 设计系统与组件规范

## When to Use

- "uniapp 开发规范"
- "小程序规范"
- "接口怎么写"
- "uniapp 项目结构怎么组织"
- "状态管理"
- "路由规范"
- "性能优化"

## 快速索引

| 规范主题 | 位置 | 说明 |
|----------|------|------|
| **红线规则** | #一-核心红线规则 | 20 条强制规范 |
| **目录结构** | #二-目录结构规范 | 通用项目结构 |
| **接口规范** | #三-接口规范 | 通用请求封装架构 |
| **性能规范** | #四-性能优化规范 | 渲染、加载、内存 |
| **常用命令** | #五-常用命令 | 开发、构建命令 |
| **项目模板** | #六-项目模板 | 配置模板文件 |

---

## 一、核心红线规则

> 违反以下任意规则即视为不符合规范

| 编号 | 规则 | 说明 |
|------|------|------|
| R01 | **禁止嵌套 v-for** | 单个页面 v-for 层数 ≤ 1 |
| R02 | **data 只存视图数据** | 过滤接口原始数据 |
| R03 | **优先使用 uni.xxx** | 禁止私有 API |
| R04 | **DOM 节点数限制** | 详见性能规范 |
| R05 | **长列表必须分页** | 懒加载 + 分页 |
| R06 | **setData 数据量限制** | 详见性能规范 |
| R07 | **禁止 eval/new Function** | 危险方法 |
| R08 | **禁止硬编码** | 配置项放 config 目录 |
| R09 | **请求防抖节流** | 同一接口 1 秒内禁止重复 |
| R10 | **失败必须弹提示** | 所有失败场景必须向用户暴露错误 |
| R11 | **AI 生成后必须 lint** | `npm run lint` |
| R12 | **提交前必须 lint** | 通过后才能提交 |
| R13 | **commit 必须用中文** | 禁止纯英文 |
| R14 | **commit 长度限制** | subject ≤ 50 字 |
| R15 | **SCSS 必须用 Token** | 详见 [uniapp-design-skill](../../uniapp-design-skill/) |
| R16 | **Mock 放 _mocks_/** | 禁止写在 API 文件或页面中 |
| R17 | **请求只传业务路径** | 传 `/user/info` 不传 `/api/v1/user/info`，prefix 从 @/config 导入 |
| R18 | **屏幕适配走规范** | 详见 [uniapp-design-skill](../../uniapp-design-skill/) |
| R19 | **鸿蒙降级规范** | 详见 [uniapp-design-skill](../../uniapp-design-skill/) |
| R20 | **认证服务收口** | 详见 [uniapp-auth-skill](../../uniapp-auth-skill/) |

---

## 二、目录结构规范

### 2.1 通用项目结构

```
uniapp-project/
├── src/
│   ├── api/                      # 接口封装（不含具体业务模块）
│   │   ├── _mocks_/             # Mock 数据字典
│   │   ├── request.ts            # 统一请求封装
│   │   └── index.ts             # 导出入口
│   ├── components/               # 公共组件
│   │   ├── common/              # 通用组件
│   │   │   ├── Button/          # 按钮组件
│   │   │   ├── Card/           # 卡片组件
│   │   │   └── Loading/         # 加载组件
│   │   └── index.ts             # 组件导出（easycom 模式下可选）
│   ├── pages/                   # 业务页面
│   ├── stores/                  # Pinia 状态管理
│   │   ├── index.ts            # store 入口
│   │   └── user.ts             # 示例用户状态（需替换）
│   ├── services/                 # 业务服务层
│   │   ├── auth.service.ts     # 认证服务（详见 uniapp-auth-skill）
│   │   └── index.ts           # 服务导出
│   ├── utils/                   # 工具函数
│   │   ├── auth.ts             # 鉴权工具（详见 uniapp-auth-skill）
│   │   ├── toast.ts           # 提示工具
│   │   ├── storage.ts          # 存储工具
│   │   ├── platform.ts         # 平台判断
│   │   └── index.ts           # 工具导出
│   ├── config/                  # 应用配置
│   │   ├── env.config.ts       # 环境配置
│   │   ├── api.config.ts       # API 配置
│   │   └── index.ts           # 配置导出
│   ├── constants/              # 常量
│   │   ├── storage.ts         # 存储 Key
│   │   ├── enums.ts          # 枚举
│   │   └── index.ts          # 常量导出
│   ├── types/                  # TypeScript 类型
│   │   └── index.d.ts        # 全局类型
│   ├── styles/                 # SCSS 样式系统（详见 uniapp-design-skill）
│   │   ├── config/           # 主题配置
│   │   │   └── _theme-config.scss  # 唯一人工配置
│   │   ├── tokens/           # Token 定义
│   │   │   ├── _primitive.scss     # 基础色板
│   │   │   └── _semantic.scss     # 语义变量
│   │   ├── _functions.scss   # SCSS 函数
│   │   ├── _mixins.scss     # 混入
│   │   └── variables.scss   # 统一出口
│   ├── composables/           # 组合式函数
│   ├── App.vue               # 根组件
│   ├── main.ts               # 入口
│   └── pages.json           # 页面路由
├── static/                   # 静态资源
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 2.2 命名规范

- **目录**：全部小写，多单词用连字符 `-`
- **禁止**：大写、下划线 `_`、中文、模糊命名
- **组件目录**：目录即命名空间，如 `Button/index.vue`
- **类型文件**：以 `.d.ts` 结尾或放在 `types/` 目录

---

## 三、接口规范

### 3.1 请求封装架构

```typescript
// src/api/request.ts

/** 请求方法类型 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

/** 请求配置选项 */
interface RequestOptions {
  /** 接口相对路径 */
  url: string;
  /** 请求方法，默认 GET */
  method?: HttpMethod;
  /** 请求参数 */
  data?: Record<string, any>;
  /** 请求头 */
  header?: Record<string, string>;
  /** 超时时间(ms)，默认 30000 */
  timeout?: number;
  /** 是否自动处理错误提示，默认 true */
  showErrorToast?: boolean;
  /** 是否需要 Token，默认 true */
  needAuth?: boolean;
  /** 鉴权头格式 */
  authMode?: 'customer-token' | 'bearer';
  /** 响应数据类型，默认 json */
  dataType?: string;
  /** 成功状态码，默认 200 */
  successCode?: number;
  /** 是否在响应结果中携带 _headers */
  withHeaders?: boolean;
  /** 接口路径前缀 */
  prefix?: string;
  /** 是否跳过防抖检查，默认 false */
  skipDebounce?: boolean;
  /** 是否跳过 401 统一处理 */
  skipAuthHandler?: boolean;
  /** 接口级 Mock 开关 */
  mock?: boolean;
}

/** 统一响应结构 */
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  _headers?: Record<string, string | string[]>;
}

/** 发送请求 */
export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>>;

/** GET 请求 */
export function get<T = any>(url: string, data?: Record<string, any>, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>>;

/** POST 请求 */
export function post<T = any>(url: string, data?: Record<string, any>, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>>;

/** PUT 请求 */
export function put<T = any>(url: string, data?: Record<string, any>, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>>;

/** DELETE 请求 */
export function del<T = any>(url: string, data?: Record<string, any>, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>>;
```

### 3.2 请求拦截器

```typescript
// src/api/request.ts - 请求拦截器

function requestInterceptor(options: RequestOptions): RequestOptions {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': 'default',
    ...options.header,
  };

  // Token 注入（详见 uniapp-auth-skill）
  if (options.needAuth !== false) {
    const token = getToken();
    if (token) {
      if (options.authMode === 'bearer') {
        headers.Authorization = `Bearer ${token}`;
      } else {
        headers['Customer-Token'] = token;
      }
    }

    const customerContext = getCustomerContext();
    if (customerContext) {
      headers['X-Customer-Context'] = customerContext;
    }
  }

  return { ...options, header: headers };
}
```

### 3.3 响应拦截器

```typescript
// src/api/request.ts - 响应拦截器
import { handleUnauthorized, handleForbidden } from '@/services/auth.service';
import { AUTH_FAILURE_CODES } from '@/config/api.config';

function responseInterceptor<T>(res: any, options: RequestOptions): ApiResponse<T> {
  const { statusCode, data } = res;

  // 401/403 处理（详见 uniapp-auth-skill）
  if (statusCode === 401 || AUTH_FAILURE_CODES.includes(data?.code)) {
    if (!options.skipAuthHandler) {
      handleUnauthorized();
    }
    throw new Error('登录已过期');
  }

  if (statusCode === 403) {
    handleForbidden();
    throw new Error('权限不足');
  }

  // HTTP 状态码异常
  if (statusCode !== (options.successCode ?? 200)) {
    throw new Error(`请求失败: ${statusCode}`);
  }

  // 业务码异常
  if (data && typeof data.code === 'number' && data.code !== 0 && data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }

  return data as ApiResponse<T>;
}
```

### 3.4 Mock 数据规范

```typescript
// src/api/_mocks_/index.ts

export interface MockEntry<T = any> {
  code: number;
  message: string;
  data: T;
}

export const MOCK_MAP: Record<string, MockEntry> = {};
```

**key 格式**：`METHOD:相对路径`（不含 prefix）

### 3.5 API 配置

```typescript
// src/config/api.config.ts

/** 多环境域名 */
const BASE_URL_MAP: Record<string, string> = {
  development: 'https://dev-api.example.com',
  test: 'https://test-api.example.com',
  production: 'https://api.example.com',
};

/** API 前缀 */
export const API_PREFIX = {
  DEFAULT: '/api/v1',
  // 业务前缀按需添加
} as const;

/** Mock 模式 */
export type MockMode = 'none' | 'auto' | 'force';
export const MOCK_MODE: MockMode = 'auto';

/** 防抖时间(ms) */
export const REQUEST_DEBOUNCE_MS = 1000;

/** 认证失败业务码（与 401 同等处理） */
export const AUTH_FAILURE_CODES = [2001, 2002] as const;
```

### 3.6 错误处理规范

- **开发/体验版**：Modal 展示完整错误详情
- **正式版**：按消息长度选择 Toast 或精简 Modal
- **401**：自动跳转登录页（详见 uniapp-auth-skill）
- **403**：弹权限不足（详见 uniapp-auth-skill）

---

## 四、性能优化规范

### 4.1 DOM 节点限制

| 场景 | 最大节点数 |
|------|------------|
| 页面总节点 | 1000 |
| 列表项节点 | 100 |
| 列表项数 | 50 |

### 4.2 setData 限制

- **数据量**：单次不超过 100KB
- **调用频率**：每秒不超过 20 次
- **优化**：使用 diff 算法只更新变化部分

### 4.3 长列表规范

- 必须使用懒加载
- 必须分页（每页 ≤ 20 条）
- 数量 > 1000 时考虑虚拟列表

### 4.4 图片优化

- 使用懒加载组件
- 合理设置尺寸（避免原图）
- 考虑 CDN 缩略图

---

## 五、常用命令

| 命令 | 用途 |
|------|------|
| `npm install` | 安装依赖（先删除 node_modules） |
| `npm run dev:mp-weixin` | 微信小程序开发调试 |
| `npm run build:mp-weixin` | 微信小程序打包 |
| `npm run lint` | ESLint 代码检查 |

---

## 六、项目模板

### 6.1 模板文件

```
templates/
├── vite.config.ts        # Vite 配置模板
├── tsconfig.json         # TypeScript 配置模板
├── main.ts              # 应用入口模板（Pinia + SSR）
├── pages.json            # 页面路由配置模板（tabBar 需配套 static/tabbar/*.png 图标文件）
├── pages-sub.json       # 分包配置模板
├── package.json         # 依赖配置模板
├── .env.example         # 环境变量示例（复制为 .env 后修改）
└── env.d.ts             # 类型声明模板（放到 src/ 下使用）
```

### 6.2 使用方式

```bash
# 复制模板到新项目
cp -r templates/* /path/to/new-project/
```

---

## References

### 本技能参考
- `references/api-architecture.md` — 请求封装架构详解
- `references/performance.md` — 性能优化详解
- `references/store-guide.md` — 状态管理最佳实践
- `references/router-guide.md` — 路由配置与跳转规范
- `references/analytics.md` — 埋点规范
- `references/component-communication.md` — 组件通信规范

### 配套技能
- [uniapp-auth-skill](../../uniapp-auth-skill/) — 登录鉴权与安全规范
- [uniapp-design-skill](../../uniapp-design-skill/) — 设计系统与组件规范