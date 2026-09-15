# vue-login-skill

> Vue3 高端 PC 端登录页技能，9 种真正差异化的视觉风格。

## 核心理念

- **容器原则**：所有登录卡片基于 `base-card`，无例外
- **组件复用**：input/button/checkbox 全部走 vue-form-skill + vue-button-skill
- **零第三方依赖**：纯 Vue3 + CSS3 实现所有动效
- **真正差异化**：9 种风格各有独特交互和布局，不只是换背景

## 9 种风格

| # | 风格 | 核心差异 | 触发词 |
|---|------|----------|--------|
| 01 | 毛玻璃 | backdrop-filter 模糊 + 半透明 | 默认、"frosted" |
| 02 | 粒子背景 | Canvas 粒子连线 + 鼠标交互 | "particles" |
| 03 | 3D 翻转 | 登录/注册卡片翻转切换 | "3D"、"flip" |
| 04 | 分屏 | 左图右表单经典布局 | "split" |
| 05 | 暗黑科技 | 深色系 + 扫描线 + 霓虹光效 | "dark"、"科技" |
| 06 | 极简 | 超简洁 + 大量留白 | "minimal" |
| 07 | 打字机 | 终端风格 + 代码雨 + 打字动画 | "typewriter"、"终端" |
| 08 | 品牌分屏 | 左侧品牌宣传 + 右侧白色登录卡（全屏） | "品牌分屏"、"product login" |
| 09 | 滑块拼图 | 拖动滑块完成拼图验证（反爬虫） | "滑块"、"拼图"、"puzzle"、"captcha" |

## 容器原则（铁律）

> **所有登录卡片必须基于 `base-card` 实现，无例外。**

```vue
<base-card class="login-card login-card--frosted">
  <!-- 登录内容 -->
</base-card>
```

## 组件依赖（强制走现有组件库）

| 组件 | 来源 | 文件 |
|------|------|------|
| 卡片容器 | vue-base-skill | [base-card.md](../base-card.md) |
| 表单 | vue-form-skill | [base-form.md](../vue-form-skill/base-form.md) |
| 表单项 | vue-form-skill | [base-form-item.md](../vue-form-skill/base-form-item.md) |
| 输入框 | vue-form-skill | [base-input.md](../vue-form-skill/base-input.md) |
| 复选框 | vue-form-skill | [base-checkbox.md](../vue-form-skill/base-checkbox.md) |
| 按钮 | vue-button-skill | [base-button.md](../vue-button-skill/base-button.md) |

**禁止**：自定义 div 模拟 input/button/checkbox。

## 快速上手

```vue
<script setup lang="ts">
import LoginForm from './templates/LoginForm.vue'
import './demo-components/login-page/shared/login.css'
</script>

<template>
  <div class="login-page login-page--frosted">
    <LoginForm variant="frosted" @submit="onLogin" />
  </div>
</template>
```

> 完整模板：[templates/LoginForm.vue](./templates/LoginForm.vue)

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | 'frosted' \| 'particles' \| 'flip' \| 'split' \| 'split-pro' \| 'dark' \| 'minimal' \| 'typewriter' \| 'puzzle' | 'frosted' | 视觉风格 |
| title | string | '欢迎回来' | 标题 |
| subtitle | string | '登录以继续访问' | 副标题 |
| submitText | string | '登 录' | 按钮文字 |
| showCaptcha | boolean | false | 显示验证码 |
| showRemember | boolean | true | 显示记住我 |
| showForgot | boolean | true | 显示忘记密码 |
| showRegister | boolean | true | 显示注册链接 |
| loading | boolean | false | 加载中 |
| disabled | boolean | false | 禁用 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| submit | `(values)` | 提交 |
| forgot | — | 点击忘记密码 |
| register | — | 点击注册 |

### Slots

| 插槽 | 说明 |
|------|------|
| captcha-puzzle | 滑块拼图组件（puzzle 风格专用） |
| captcha-extra | 验证码右侧附加内容 |
| social | 底部社交登录 |

## 文件结构

```
vue-login-skill/
├── SKILL.md                          # 技能定义（含容器原则 + CSS 变体）
├── README.md                         # 本文件
├── templates/
│   └── LoginForm.vue                 # 标准登录表单组件（9 种风格共用）
└── demo-components/
    ├── shared/
    │   ├── tokens.css
    │   ├── demo.css
    │   └── particles.js
    └── login-page/
        └── html/
            ├── 00-showcase.html      # 9 种风格画廊
            ├── 01-frosted.html       # 毛玻璃
            ├── 02-particles.html     # 粒子背景
            ├── 03-flip.html          # 3D 翻转
            ├── 04-split.html         # 分屏
            ├── 05-dark.html          # 暗黑科技
            ├── 06-minimal.html       # 极简
            ├── 07-typewriter.html    # 打字机
            ├── 08-split-pro.html     # 品牌分屏
            └── 09-puzzle.html        # 滑块拼图
```

## 依赖关系

```
vue-login-skill
├── vue-base-skill
│   └── base-card (根容器)
├── vue-button-skill
│   └── base-button (登录/注册按钮)
└── vue-form-skill
    ├── base-form (表单)
    ├── base-form-item (表单项)
    ├── base-input (输入框)
    └── base-checkbox (记住我)
```

## 设计 Token

所有组件统一引用 [vue-theme-skill](../../vue-theme-skill/)。

## 相关技能

- [vue-base-skill](../SKILL.md) — 基础组件父技能
- [vue-form-skill](../vue-form-skill/SKILL.md) — 表单体系
- [vue-button-skill](../vue-button-skill/SKILL.md) — 按钮组件
- [vue-theme-skill](../../vue-theme-skill/SKILL.md) — 设计 Token