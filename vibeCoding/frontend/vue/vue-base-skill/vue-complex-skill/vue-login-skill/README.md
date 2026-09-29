# vue-login-skill

> Vue3 高端 PC 端登录页技能，9 种**结构级差异化**视觉风格 + 5 个 wrapper 组件。

## 核心理念

- **容器原则**：所有登录卡片基于 `base-card`，无例外
- **组件复用**：input/button/checkbox 全部走 vue-form-skill + vue-button-skill
- **零第三方依赖**：纯 Vue3 + CSS3 实现所有动效
- **真正差异化**：9 种风格各有独特结构、输入框形态、按钮形态，不只是换背景
- **容器级抽离**（v2）：分屏 / 翻转 / 粒子 / 拼图等容器级差异抽到 wrapper 组件

## 9 种风格

| # | 风格 | 核心差异 | 触发词 | wrapper |
|---|------|----------|--------|---------|
| 01 | frosted 毛玻璃 | backdrop-filter 模糊 + 半透明白底 | "frosted" | — |
| 02 | particles 粒子 | Canvas 粒子连线 + 鼠标交互 | "particles" | ParticleBackground |
| 03 | flip 3D 翻转 | 登录/注册卡 3D 翻转切换 | "3D"、"flip" | FlipLoginContainer |
| 04 | split 分屏 | 左品牌 50% + 右表单 50% | "split" | SplitLayout |
| 05 | split-pro 品牌分屏 | 左品牌 55% + 右白卡 45% 全屏 | "品牌分屏"、"product login" | SplitProLayout |
| 06 | dark 暗黑科技 | 深色 + 扫描线 + cyan 焦点 | "dark"、"科技" | — |
| 07 | minimal 极简 | 大留白 + input 底部下划线 + 黑底按钮 | "minimal" | — |
| 08 | typewriter 打字机 | 等宽字体 + GitHub 配色 + 终端 3 色圆点 | "typewriter"、"终端" | — |
| 09 | puzzle 滑块拼图 | 拖动滑块完成拼图验证 | "滑块"、"拼图"、"puzzle" | PuzzleCaptcha |

## 快速上手

```vue
<script setup lang="ts">
import { LoginForm, ParticleBackground, FlipLoginContainer, SplitLayout, SplitProLayout, PuzzleCaptcha } from 'vue-login-skill'
</script>

<template>
  <!-- frosted（无需 wrapper） -->
  <LoginForm variant="frosted" @submit="onLogin" />

  <!-- particles（需要 ParticleBackground） -->
  <div style="position: relative;">
    <ParticleBackground color="#6366f1" />
    <LoginForm variant="particles" />
  </div>

  <!-- flip（需要 FlipLoginContainer） -->
  <FlipLoginContainer @login="onLogin" @register="onRegister">
    <template #loginExtra>...</template>
    <template #registerExtra>...</template>
  </FlipLoginContainer>

  <!-- puzzle -->
  <LoginForm variant="puzzle" :disabled="!verified">
    <template #captcha-puzzle>
      <PuzzleCaptcha v-model="verified" />
    </template>
  </LoginForm>
</template>
```

完整 API 见 [SKILL.md](./SKILL.md)。

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

## 文件结构

```
vue-login-skill/
├── SKILL.md                                       # 技能定义（含容器原则 + Wrappers 章节）
├── README.md                                      # 本文件
├── templates/
│   ├── LoginForm.vue                              # 标准登录表单组件（9 种风格共用）
│   └── wrappers/
│       ├── FlipLoginContainer.vue
│       ├── ParticleBackground.vue
│       ├── SplitLayout.vue
│       ├── SplitProLayout.vue
│       ├── PuzzleCaptcha.vue
│       └── shared/
│           └── particle-engine.js
├── components/
│   └── index.ts
└── demo-components/
    ├── shared/
    │   ├── tokens.css
    │   ├── demo.css
    │   └── particles.js
    └── login-page/
        └── html/
            ├── 00-showcase.html
            ├── 01-frosted.html
            ├── 02-particles.html
            ├── 03-flip.html
            ├── 04-split.html
            ├── 05-dark.html
            ├── 06-minimal.html
            ├── 07-typewriter.html
            ├── 08-split-pro.html
            └── 09-puzzle.html
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