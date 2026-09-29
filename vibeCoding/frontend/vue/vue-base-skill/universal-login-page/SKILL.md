---
name: universal-login-page
description: 第三方授权鉴权体系。账户互通、绑定、解绑、多系统账户统一管理。服务于广大 VibeCoder，让多个系统的账户可以绑定互通。触发词："第三方授权"、"账户互通"、"多系统登录"、"绑定账户"、"解绑账户"、"统一登录"、"VibeCode 鉴权"。
trigger: |
  第三方授权 | 账户互通 | 多系统登录 | 绑定账户 | 解绑账户
  统一登录 | 统一鉴权 | 第三方登录 | 账户绑定 | 登录绑定
  万能登录系统 | 第三方鉴权体系 | 多应用鉴权
---

# universal-login-page

> 第三方授权鉴权体系技能。实现多系统账户绑定互通，服务于 VibeCoder。

## 定位

- **用途**：多系统账户统一鉴权 + 绑定互通
- **目标用户**：VibeCoder（个人开发者、小团队）
- **核心价值**：一个账户可以绑定多个系统的账户，实现单点登录

## 核心概念

| 概念 | 说明 |
|------|------|
| 主账户 | 鉴权体系中的唯一身份（手机/邮箱/用户名） |
| 第三方账户 | 各业务系统的账户（通过 AppID 区分） |
| 绑定 | 主账户与第三方账户的关联关系 |
| 应用 | 接入鉴权体系的业务系统 |

## 功能清单

| # | 功能 | 说明 |
|---|------|------|
| 1 | **主账户注册/登录** | 手机/邮箱/用户名密码 |
| 2 | **第三方账户绑定** | 绑定已有账户或创建新账户 |
| 3 | **第三方账户解绑** | 解除绑定关系 |
| 4 | **绑定列表** | 查看所有已绑定的账户 |
| 5 | **应用管理** | 注册/管理接入的应用 |
| 6 | **API 密钥** | 应用调用 API 的凭证 |
| 7 | **权限管理** | 角色/权限 CRUD |

## 组件结构

```
universal-login-page/
├── SKILL.md                    # 本文件
├── README.md                   # 使用文档
├── templates/
│   ├── UniversalLogin.vue       # 统一登录入口（支持多模式）
│   ├── LoginPage.vue           # 主账户登录页
│   ├── RegisterPage.vue       # 主账户注册页
│   ├── BindAccountPage.vue     # 账户绑定页
│   ├── BindListPage.vue       # 绑定列表页
│   ├── AppManagePage.vue      # 应用管理页
│   └── AccountSettings.vue     # 账户设置页
└── references/
    └── login-contract.md       # 登录契约
```

## 使用场景

### 场景 1：账户绑定
```
VibCoder 开发了 3 个系统：
- 系统 A：博客系统
- 系统 B：电商系统
- 系统 C：后台管理系统

用户可以用不同账户登录不同系统，然后通过"账户绑定"功能将它们关联起来。
```

### 场景 2：统一登录
```
用户首次登录系统 A，创建主账户。
后续登录系统 B 时，可以选择"使用已绑定的账户登录"或"绑定到现有主账户"。
```

### 场景 3：应用接入
```
其他 VibCoder 开发了新系统，可以：
1. 在鉴权体系注册应用，获取 AppID + AppSecret
2. 接入登录 API，实现第三方登录
3. 用户可以在任意已绑定的应用间切换
```

## 统一入口组件

```vue
<template>
  <UniversalAuth
    mode="login"                    <!-- login/register/bind/list/settings -->
    :api-base="'/api/auth'"
    :app-id="'system-a'"           <!-- 当前应用 ID -->
    @success="handleSuccess"
    @error="handleError"
  />
</template>
```

### Props

| prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | string | 'login' | 模式：login/register/bind/list/settings |
| `apiBase` | string | '/api/auth' | API 基础路径 |
| `appId` | string | - | 当前应用 ID |
| `showApps` | boolean | true | 是否显示应用选择 |
| `title` | string | '统一登录' | 标题 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `success` | `{ token, user, appId }` | 登录成功 |
| `error` | `{ code, message }` | 登录失败 |
| `bind-success` | `{ provider, account }` | 绑定成功 |
| `unbind-success` | `{ provider }` | 解绑成功 |

## 页面组件

### 1. 账户绑定页 (BindAccountPage)
```vue
<!-- 绑定流程：选择绑定方式 → 验证身份 → 确认绑定 -->
<template>
  <BindAccountPage
    :main-account="currentUser"
    @bind="handleBind"
    @cancel="handleCancel"
  />
</template>

<!-- 支持的绑定方式 -->
<!-- 1. 扫码绑定：主账户生成二维码，第三方应用扫码确认 -->
<!-- 2. 验证码绑定：输入手机/邮箱验证码 -->
<!-- 3. 密码绑定：输入主账户密码确认 -->
```

### 2. 绑定列表页 (BindListPage)
```vue
<template>
  <BindListPage
    :bindings="bindingList"
    @unbind="handleUnbind"
    @set-default="handleSetDefault"
  />
</template>

<!-- 显示：应用图标 + 账户名 + 绑定时间 + 操作 -->
```

### 3. 应用管理页 (AppManagePage)
```vue
<template>
  <AppManagePage
    :apps="myApps"
    @create="handleCreateApp"
    @edit="handleEditApp"
    @delete="handleDeleteApp"
  />
</template>

<!-- 应用列表：AppName + AppID + Status + CreatedAt -->
<!-- 操作：编辑 / 删除 / 查看密钥 -->
```

## 契约权威源

> 表单字段类型 → 组件映射规范见 [vue-form-skill/references/form-contract.md](../vue-form-skill/references/form-contract.md)
>
> 接口契约见 [frontend-request-skill/references/api-contract.md](../frontend-request-skill/references/api-contract.md)

## 验证技能清单

本技能用于验证以下技能协同：

| 验证项 | 技能 |
|--------|------|
| 表单契约驱动 | vue-form-skill |
| 字段类型映射 (subType) | vue-form-skill |
| 图片上传 | vue-upload-skill |
| 表格展示 | vue-table-skill |
| 列表页 | vue-list-page-skill |
| API 调用 | frontend-request-skill |
