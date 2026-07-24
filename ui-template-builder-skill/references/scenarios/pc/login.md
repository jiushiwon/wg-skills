# 登录页模板

## 页面概述

用户登录/注册入口页面，是大多数Web应用的第一入口。

## 适用场景

- 管理系统登录
- 电商平台登录
- 社区/论坛登录
- 企业内部系统

## 模板结构

```
login/
├── index.vue           # 主页面
├── login-form.vue      # 登录表单
├── register-form.vue   # 注册表单
├── background.vue      # 背景组件
└── mock.json
```

## 布局变体

### 变体1：极简登录

**布局**：表单居中，背景纯净

```
┌─────────────────────┐
│                     │
│                     │
│    ┌───────────┐    │
│    │   Logo    │    │
│    │           │    │
│    │  [账号]   │    │
│    │  [密码]   │    │
│    │  [登录]   │    │
│    │  [忘记?]  │    │
│    └───────────┘    │
│                     │
│                     │
└─────────────────────┘
```

**适用**：企业内部系统、工具类应用

### 变体2：左侧表单

**布局**：左侧表单 + 右侧大图

```
┌────────────────────────────┐
│  Logo                      │
│                            │
│  ┌────────┐  ┌─────────┐  │
│  │        │  │         │  │
│  │  登录  │  │   图    │  │
│  │  表单  │  │   片    │  │
│  │        │  │   区    │  │
│  └────────┘  └─────────┘  │
│                            │
│  © 2024 Company            │
└────────────────────────────┘
```

**适用**：电商平台、企业官网

### 变体3：卡片浮层

**布局**：浮层卡片，背景虚化

```
┌────────────────────────────┐
│        Background          │
│        (blur)              │
│                            │
│    ┌──────────────────┐    │
│    │                  │    │
│    │      Logo        │    │
│    │                  │    │
│    │   [账号]         │    │
│    │   [密码]         │    │
│    │   [登录]         │    │
│    │                  │    │
│    │  [注册] [忘记?]  │    │
│    └──────────────────┘    │
│                            │
└────────────────────────────┘
```

**适用**：SAAS应用、现代化Web

### 变体4：深色科技

**布局**：深色背景，霓虹边框

```
┌────────────────────────────┐
│                            │
│    ┌──────────────────┐    │
│    │ ═══════════════ │    │
│    │   LOGO          │    │
│    │ ═══════════════ │    │
│    │                  │    │
│    │   [账号]         │    │
│    │   [密码]         │    │
│    │   [验证码]       │    │
│    │                  │    │
│    │   [登录]         │    │
│    │                  │    │
│    └──────────────────┘    │
│                            │
└────────────────────────────┘
```

**适用**：游戏平台、科技产品

## 风格变体

### 风格1：极简纯净

```scss
--bg-page: #FFFFFF;
--bg-card: #FFFFFF;
--text-primary: #333333;
--text-secondary: #999999;
--primary: #2563EB;
--border: #E5E5E5;
--radius: 8px;
```

**特点**：白色背景，蓝色主按钮，简洁

### 风格2：温暖橙色

```scss
--bg-page: #FFFBF5;
--bg-card: #FFFFFF;
--primary: #F97316;
--text-primary: #1A1A1A;
--accent: #FDBA74;
```

**特点**：暖色调，橙色按钮，温馨感

### 风格3：深蓝商务

```scss
--bg-page: #0F172A;
--bg-card: #1E293B;
--primary: #3B82F6;
--text-primary: #F8FAFC;
--text-secondary: #94A3B8;
--border: #334155;
```

**特点**：深色背景，科技感

### 风格4：绿色清新

```scss
--bg-page: #F0FDF4;
--bg-card: #FFFFFF;
--primary: #22C55E;
--text-primary: #166534;
--radius: 12px;
```

**特点**：绿色主调，环保/健康类

## 功能模块

### 1. 登录方式

- 账号密码登录
- 手机号验证码登录
- 第三方登录（微信/Google/GitHub）

### 2. 表单验证

- 用户名/手机号格式
- 密码强度
- 验证码倒计时
- 错误提示

### 3. 记住功能

- 记住密码
- 自动登录

### 4. 附加功能

- 注册入口
- 忘记密码
- 用户协议/隐私政策

## 代码实现

### Vue3 + Composition API

```vue
<template>
  <div class="login-page" :class="[variant]">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="/logo.png" alt="logo" class="logo" />
          <h1 class="title">{{ isLogin ? '登录' : '注册' }}</h1>
        </div>

        <a-form
          :model="form"
          :rules="rules"
          @finish="handleSubmit"
          class="login-form"
        >
          <a-form-item name="username">
            <a-input
              v-model:value="form.username"
              placeholder="请输入手机号/邮箱"
              size="large"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="password">
            <a-input-password
              v-model:value="form.password"
              placeholder="请输入密码"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <div class="form-extra">
              <a-checkbox v-model:checked="form.remember">
                记住密码
              </a-checkbox>
              <a-link>忘记密码？</a-link>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
            >
              {{ isLogin ? '登 录' : '注 册' }}
            </a-button>
          </a-form-item>
        </a-form>

        <div class="login-footer">
          <span class="toggle-text">
            {{ isLogin ? '没有账号？' : '已有账号？' }}
            <a @click="toggleMode">{{ isLogin ? '立即注册' : '立即登录' }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const isLogin = ref(true)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入手机号/邮箱' }],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6位' }
  ]
}

function handleSubmit(values) {
  loading.value = true
  // 模拟登录
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

function toggleMode() {
  isLogin.value = !isLogin.value
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: var(--bg-card);
  border-radius: var(--radius, 12px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.form-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
}
</style>
```

## Mock数据

```json
{
  "loginConfig": {
    "methods": ["password", "sms", "social"],
    "socials": ["wechat", "google", "github"],
    "captcha": {
      "enabled": true,
      "length": 4,
      "expire": 60
    }
  },
  "agreement": {
    "userAgreement": "https://example.com/agreement",
    "privacyPolicy": "https://example.com/privacy"
  }
}
```

## 响应式适配

```scss
// 移动端适配
@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
    margin: 16px;
    padding: 24px;
  }
}
```

## 验证清单

- [ ] 登录/注册切换正常
- [ ] 表单验证提示准确
- [ ] 第三方登录按钮显示
- [ ] 记住密码功能正常
- [ ] 移动端布局适配
- [ ] 键盘弹出不遮挡表单
