---
name: vue-login-skill
description: Vue3 高端登录页技能。9 种结构级差异化风格 + 5 个 wrapper 组件（FlipLoginContainer/SplitLayout/SplitProLayout/ParticleBackground/PuzzleCaptcha），全部组件强制引用 vue-base-skill + vue-form-skill 现有组件（base-card/base-form/base-input/base-button/base-checkbox）。触发词："Vue 登录"、"login page"、"登录页"、"高大上登录"、"分屏"、"翻转"、"拼图"。
---

# Vue3 Login Skill (v2)

Vue3 高端 PC 端登录页技能，9 种**结构级差异化**视觉风格 + 5 个 wrapper 组件。

**v2 升级点**（相对 v1）：
- 5 个 variant CSS 重写为**结构级差异**（不只是换色）
- 新增 5 个 wrapper：FlipLoginContainer / SplitLayout / SplitProLayout / ParticleBackground / PuzzleCaptcha
- 新增 5 个 prop：centerTitle / cardWidth / terminalHeader / terminalPrompt / submitButtonBg
- 新增 4 个 slot：#terminal-header / #terminal-prompt / #brand / #page-background
- 清理冗余 `--login-card-*` 私有 token（全部映射 vue-theme-skill）

## 容器原则（铁律）

> **所有登录卡片必须基于 `base-card` 实现，无例外。**

```vue
<template>
  <base-card class="login-card login-card--frosted">
    <!-- 登录内容 -->
  </base-card>
</template>
```

## 组件依赖（全部走现有组件库）

| 用到 | 来源 | 文件 |
|------|------|------|
| 卡片容器 | vue-base-skill | [base-card.md](../base-card.md) |
| 表单 | vue-form-skill | [base-form.md](../vue-form-skill/base-form.md) |
| 表单项 | vue-form-skill | [base-form-item.md](../vue-form-skill/base-form-item.md) |
| 输入框 | vue-form-skill | [base-input.md](../vue-form-skill/base-input.md) |
| 复选框 | vue-form-skill | [base-checkbox.md](../vue-form-skill/base-checkbox.md) |
| 按钮 | vue-button-skill | [base-button.md](../vue-button-skill/base-button.md) |

**禁止**自定义 div 实现 input/button/checkbox。所有原子组件必须从上述技能引用。

## 9 种风格

| 风格 | 核心差异 | 触发词 | 是否需要 wrapper |
|------|----------|--------|------------------|
| **frosted 毛玻璃** | backdrop-filter 模糊 + 半透明白底 | 默认、"frosted" | 否 |
| **particles 粒子** | Canvas 粒子连线 + 鼠标交互 | "particles" | 是：ParticleBackground |
| **flip 3D 翻转** | 2 张卡 3D rotateY 翻转 | "3D"、"flip" | 是：FlipLoginContainer |
| **split 分屏** | 左品牌 50% + 右白卡 50% | "split" | 是：SplitLayout |
| **split-pro 品牌分屏** | 左品牌 55% + 右白卡 45% 全屏 | "品牌分屏"、"product login" | 是：SplitProLayout |
| **dark 暗黑科技** | 深色 + 扫描线 + 霓虹光效 + cyan 焦点 | "dark"、"科技" | 否 |
| **minimal 极简** | 大量留白 + input 底部下划线 + 黑底按钮 | "minimal" | 否 |
| **typewriter 打字机** | 等宽字体 + GitHub 配色 + 终端 3 色圆点 + `$` 提示 | "typewriter"、"终端" | 否 |
| **puzzle 滑块拼图** | 拖动滑块完成拼图验证 | "滑块"、"拼图"、"puzzle"、"captcha" | 是：PuzzleCaptcha |

## 标准 LoginForm（所有风格共用）

完整模板见 [templates/LoginForm.vue](./templates/LoginForm.vue)。所有风格的差异**在 CSS 变体 + 槽位**，模板结构不变。

### Props

> **设计原则**：技能**不渲染 label 行** —— 字段识别靠 prefix icon + placeholder，UI 更简洁。
> 消费者通过 props 覆盖 placeholder / 校验文案 / 按钮文字即可（i18n / 业务改名）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | 见上表 | 'frosted' | 视觉风格 |
| title | string | '登录' | 标题 |
| subtitle | string | '请输入您的账号信息' | 副标题 |
| submitText | string | '登 录' | 提交按钮文字 |
| showCaptcha | boolean | false | 显示验证码 |
| showRemember | boolean | true | 显示记住我 |
| showForgot | boolean | true | 显示忘记密码 |
| showRegister | boolean | true | 显示注册链接 |
| loading | boolean | false | 加载中 |
| usernamePlaceholder | string | '请输入用户名 / 邮箱' | 账号字段 placeholder |
| passwordPlaceholder | string | '请输入密码' | 密码字段 placeholder |
| captchaPlaceholder | string | '请输入验证码' | 验证码字段 placeholder |
| rememberLabel | string | '记住我' | 记住我复选框文字 |
| forgotLabel | string | '忘记密码？' | 忘记密码按钮文字 |
| registerPromptLabel | string | '还没有账号？' | 注册引导前缀 |
| registerLabel | string | '立即注册' | 注册按钮文字 |
| usernameRequiredMessage | string | '' | 账号必填校验文案（默认根据 placeholder 推断） |
| passwordRequiredMessage | string | '' | 密码必填校验文案 |
| captchaRequiredMessage | string | '' | 验证码必填校验文案 |
| **centerTitle** *(v2)* | boolean | false | 标题/副标题居中（dark / minimal / typewriter 用） |
| **cardWidth** *(v2)* | string \| number | '420px' | 卡片宽度（minimal 360px；split-pro 400px） |
| **terminalHeader** *(v2)* | string | '' | typewriter 终端头部文件名（如 "login.sh"） |
| **terminalPrompt** *(v2)* | string | '' | typewriter `$` 提示行文本 |
| **submitButtonBg** *(v2)* | string | '' | 覆盖提交按钮背景色 |

### Slots

| 名称 | 用途 | 适用 variant |
|------|------|------------|
| logo | 头部 logo 区（demo dark：齿轮 + NEXUS） | all |
| divider | 表单与社交登录之间的"或"分隔线 | all |
| social | 社交登录按钮组 | all |
| captcha-extra | 验证码右侧（如"获取验证码"按钮 / 数学题图块） | showCaptcha |
| captcha-puzzle | 滑块拼图（替换默认验证码行） | puzzle |
| extraLinks | 多链接 footer（demo dark："注册账户 \| 手机号登录"） | all |
| **terminal-header** *(v2)* | typewriter 终端头部（默认三色圆点 + terminalHeader） | typewriter |
| **terminal-prompt** *(v2)* | typewriter `$` 提示行（默认文本 + 闪烁光标） | typewriter |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| submit | `(values)` | 提交 |
| forgot | — | 点击忘记密码 |
| register | — | 点击注册 |

## Wrappers 组件（v2 新增）

> **设计原则**：容器级差异（分屏比例 / 3D 容器 / 粒子背景层 / 拼图）抽到 wrapper，LoginForm 只负责卡片本身。

### FlipLoginContainer

3D 翻转容器。两个 `<LoginForm>`（正面登录 / 反面注册）+ perspective + 翻转触发。

```vue
<template>
  <FlipLoginContainer :login-loading="loading" :register-loading="rLoading"
    @login="onLogin" @register="onRegister">
    <template #loginExtra>
      <div class="login-card__register">
        还没有账号？
        <base-button variant="link" @click="flipToRegister">立即注册</base-button>
      </div>
    </template>
    <template #registerExtra>
      <div class="login-card__register">
        已有账号？
        <base-button variant="link" @click="flipToLogin">立即登录</base-button>
      </div>
    </template>
  </FlipLoginContainer>
</template>
```

### ParticleBackground

粒子 canvas 背景层。封装 `particle-engine.js`（ES5 全局类）为 Vue 组件。

```vue
<template>
  <div class="login-page login-page--particles" style="position: relative;">
    <ParticleBackground color="#6366f1" />
    <LoginForm variant="particles" />
  </div>
</template>
```

### SplitLayout

半屏分屏布局（左 50% 品牌 / 右 50% 表单）。品牌区通过 `#brand` 槽自定义。

```vue
<template>
  <SplitLayout>
    <template #brand>
      <div class="split-brand__logo">M</div>
      <h2>管理系统</h2>
    </template>
    <template #form>
      <LoginForm variant="split" />
    </template>
  </SplitLayout>
</template>
```

### SplitProLayout

全屏品牌分屏布局（左 55% / 右 45%）。带双 radial-gradient 光晕装饰。

```vue
<template>
  <SplitProLayout>
    <template #brand>
      <h1>欢迎使用考拉写作</h1>
    </template>
    <template #form>
      <LoginForm variant="split-pro" :show-captcha="true">
        <template #captcha-extra>
          <CaptchaBox />
        </template>
      </LoginForm>
    </template>
  </SplitProLayout>
</template>
```

### PuzzleCaptcha

滑块拼图验证组件（v-model 双向绑定 verified 状态）。

```vue
<template>
  <LoginForm variant="puzzle" :disabled="!verified">
    <template #captcha-puzzle>
      <PuzzleCaptcha v-model="verified" />
    </template>
  </LoginForm>
</template>
```

## 快速上手

```vue
<script setup lang="ts">
import { LoginForm, ParticleBackground } from 'vue-login-skill'
</script>

<template>
  <!-- 风格 1：frosted（无需 wrapper） -->
  <div class="login-page login-page--frosted">
    <LoginForm variant="frosted" @submit="onLogin" />
  </div>

  <!-- 风格 2：particles（需要 ParticleBackground wrapper） -->
  <div class="login-page login-page--particles" style="position: relative;">
    <ParticleBackground color="#6366f1" />
    <LoginForm variant="particles" />
  </div>

  <!-- 风格 3：flip（需要 FlipLoginContainer wrapper） -->
  <FlipLoginContainer @login="onLogin" @register="onRegister">
    <template #loginExtra>...</template>
    <template #registerExtra>...</template>
  </FlipLoginContainer>
</template>
```

## 文件结构

```
vue-login-skill/
├── SKILL.md                                       # 本文件
├── README.md
├── templates/
│   ├── LoginForm.vue                              # 标准登录表单组件（9 种风格共用）
│   └── wrappers/
│       ├── FlipLoginContainer.vue                 # 3D 翻转容器
│       ├── ParticleBackground.vue                 # 粒子背景层
│       ├── SplitLayout.vue                        # 半屏分屏布局
│       ├── SplitProLayout.vue                     # 全屏品牌分屏布局
│       ├── PuzzleCaptcha.vue                      # 滑块拼图组件
│       └── shared/
│           └── particle-engine.js                 # 粒子引擎（ES5 全局类）
├── components/
│   └── index.ts                                   # 命名导出
└── demo-components/
    ├── shared/
    │   ├── tokens.css
    │   ├── demo.css
    │   └── particles.js                           # （旧）保留供 demo 参考
    └── login-page/
        ├── README.md
        ├── html/
        │   ├── 00-showcase.html                   # 9 种风格画廊
        │   ├── 01-frosted.html                    # 毛玻璃
        │   ├── 02-particles.html                  # 粒子背景
        │   ├── 03-flip.html                       # 3D 翻转
        │   ├── 04-split.html                      # 分屏
        │   ├── 05-dark.html                       # 暗黑科技
        │   ├── 06-minimal.html                    # 极简
        │   ├── 07-typewriter.html                 # 打字机
        │   ├── 08-split-pro.html                  # 品牌分屏
        │   └── 09-puzzle.html                     # 滑块拼图
        └── screenshots/
            └── *.png
```

## 设计 Token

所有组件统一引用 [vue-theme-skill](../../vue-theme-skill/)。

变体装饰色（rgba 硬编码，token 缺失）：
- dark 边框/焦点：`#0ff`（cyan）
- typewriter GitHub 配色：`#161b22` / `#238636` / `#3fb950`
- particles / split-pro / puzzle 渐变：`#6366f1` / `#8b5cf6` / `#c08766`

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

## 相关技能

- [vue-base-skill](../SKILL.md) — 基础组件父技能
- [vue-form-skill](../vue-form-skill/SKILL.md) — 表单体系
- [vue-button-skill](../vue-button-skill/SKILL.md) — 按钮组件
- [vue-theme-skill](../../vue-theme-skill/SKILL.md) — 设计 Token