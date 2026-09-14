---
name: vue-login-skill
description: Vue3 高端登录页技能。9 种差异化风格，全部组件强制引用 vue-base-skill + vue-form-skill 现有组件（base-card/base-form/base-input/base-button/base-checkbox）。触发词："Vue 登录"、"login page"、"登录页"、"高大上登录"。
---

# Vue3 Login Skill

Vue3 高端 PC 端登录页技能，9 种真正差异化的视觉风格。

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

| 风格 | 核心差异 | 触发词 |
|------|----------|--------|
| **毛玻璃** | backdrop-filter 模糊 + 半透明 | 默认、"frosted" |
| **粒子背景** | Canvas 粒子连线 + 鼠标交互 | "particles" |
| **3D 翻转** | 登录/注册卡片翻转切换 | "3D"、"flip" |
| **分屏** | 左图右表单经典布局 | "split" |
| **品牌分屏** | 左侧品牌宣传 + 右侧白色登录卡（全屏） | "品牌分屏"、"product login" |
| **暗黑科技** | 深色系 + 扫描线 + 霓虹光效 | "dark"、"科技" |
| **极简** | 超简洁 + 大量留白 | "minimal" |
| **打字机** | 终端风格 + 代码雨 + 打字动画 | "typewriter"、"终端" |
| **滑块拼图** | 拖动滑块完成拼图验证 | "滑块"、"puzzle"、"captcha" |

## 标准 LoginForm（所有风格共用）

完整模板见 [templates/LoginForm.vue](./templates/LoginForm.vue)。所有风格的差异**仅在 CSS 变体**上，模板结构不变。

```vue
<template>
  <base-card class="login-card" :class="`login-card--${variant}`">
    <template #header>
      <div class="login-card__title">{{ title }}</div>
      <div class="login-card__subtitle">{{ subtitle }}</div>
    </template>

    <base-form :model="form" :rules="rules" @submit="handleSubmit">
      <base-form-item label="账号" prop="username">
        <base-input v-model="form.username" placeholder="用户名 / 邮箱" />
      </base-form-item>

      <base-form-item label="密码" prop="password">
        <base-input v-model="form.password" type="password" show-password />
      </base-form-item>

      <div class="login-card__options">
        <base-checkbox v-model="form.remember">记住我</base-checkbox>
        <base-button variant="link" size="sm">忘记密码？</base-button>
      </div>

      <base-button type="primary" block size="lg" native-type="submit">
        登 录
      </base-button>
    </base-form>

    <template #footer>
      还没有账号？<base-button variant="link" size="sm">立即注册</base-button>
    </template>
  </base-card>
</template>
```

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | 见上表 | 'frosted' | 视觉风格 |
| title | string | '欢迎回来' | 标题 |
| subtitle | string | '登录以继续访问' | 副标题 |
| submitText | string | '登 录' | 按钮文字 |
| showCaptcha | boolean | false | 显示验证码 |
| showRemember | boolean | true | 显示记住我 |
| showForgot | boolean | true | 显示忘记密码 |
| showRegister | boolean | true | 显示注册链接 |
| loading | boolean | false | 加载中 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| submit | `(values)` | 提交 |
| forgot | — | 点击忘记密码 |
| register | — | 点击注册 |

## 文件结构

```
vue-login-skill/
├── SKILL.md                       # 本文件
├── README.md
├── templates/
│   └── LoginForm.vue              # 标准登录表单组件（所有风格共用）
└── demo-components/
    ├── shared/
    │   ├── tokens.css
    │   ├── demo.css
    │   └── particles.js
    └── login-page/
        └── html/
            ├── 00-showcase.html   # 9 种风格画廊
            ├── 01-frosted.html    # 毛玻璃
            ├── 02-particles.html  # 粒子背景
            ├── 03-flip.html       # 3D 翻转
            ├── 04-split.html      # 分屏
            ├── 05-dark.html       # 暗黑科技
            ├── 06-minimal.html    # 极简
            ├── 07-typewriter.html # 打字机
            ├── 08-split-pro.html  # 品牌分屏
            └── 09-puzzle.html     # 滑块拼图
```

---

## 风格 CSS 变体

> 以下只展示**视觉差异部分**。Vue 模板统一引用 `templates/LoginForm.vue`。

### 形态一：毛玻璃（默认）

```css
.login-card--frosted {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  --login-card-title-color: #fff;
  --login-card-subtitle-color: rgba(255, 255, 255, 0.8);
  --login-card-input-bg: rgba(255, 255, 255, 0.1);
  --login-card-input-color: #fff;
  --login-card-input-border: rgba(255, 255, 255, 0.2);
  --login-card-button-bg: rgba(255, 255, 255, 0.25);
}

.login-page--frosted {
  background: url('/bg.jpg') center/cover;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
  }
}
```

### 形态二：粒子背景

```css
.login-page--particles {
  position: relative;
  background: #0f172a;
}

.particles-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.login-card--particles {
  position: relative;
  z-index: 10;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  --login-card-button-bg: linear-gradient(135deg, #6366f1, #8b5cf6);
}
```

粒子动画独立实现：参考 [demo-components/shared/particles.js](./demo-components/shared/particles.js)。

### 形态三：3D 翻转

```css
.login-page--flip {
  perspective: 1000px;
}

.flip-container {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s;
}

.flip-container.flipped {
  transform: rotateY(180deg);
}

.login-card--flip {
  position: absolute;
  backface-visibility: hidden;
}

.login-card--flip-back {
  transform: rotateY(180deg);
}
```

使用方式：两个 `<login-form>` 实例（正面登录 + 背面注册），外层用 `.flip-container` 包裹，通过 `flipped` class 切换。

### 形态四：分屏登录

```css
.login-page--split {
  display: flex;
  min-height: 100vh;
}

.login-page--split__brand {
  flex: 1;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.login-page--split__form {
  width: 480px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 形态五：暗黑科技

```css
.login-page--dark {
  background: #0a0a0f;
  position: relative;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0 2px,
    rgba(0, 255, 255, 0.03) 2px 4px
  );
  pointer-events: none;
}

.grid-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
}

.login-card--dark {
  background: rgba(10, 10, 15, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  --login-card-title-color: #0ff;
  --login-card-subtitle-color: rgba(0, 255, 255, 0.6);
  --login-card-input-bg: rgba(0, 255, 255, 0.05);
  --login-card-input-color: #0ff;
  --login-card-input-border: rgba(0, 255, 255, 0.3);
  --login-card-button-bg: transparent;
  --login-card-button-color: #0ff;
}
```

### 形态六：极简

```css
.login-page--minimal {
  background: #fff;
}

.login-card--minimal {
  --login-card-shadow: none;
  border: none;
}

.login-card--minimal :deep(.base-input) {
  border: none;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0;
  background: transparent;
}
```

### 形态七：打字机

```css
.login-page--typewriter {
  background: #0d1117;
  font-family: 'JetBrains Mono', monospace;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #21262d;
  border-bottom: 1px solid #30363d;
}

.terminal-dots {
  display: flex;
  gap: 6px;
}

.terminal-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.terminal-dots span:nth-child(1) { background: #f85149; }
.terminal-dots span:nth-child(2) { background: #d29922; }
.terminal-dots span:nth-child(3) { background: #3fb950; }

.login-card--typewriter {
  background: #161b22;
  border: 1px solid #30363d;
  font-family: inherit;
  --login-card-title-color: #3fb950;
  --login-card-input-bg: #0d1117;
  --login-card-input-color: #c9d1d9;
  --login-card-input-border: #30363d;
  --login-card-button-bg: #238636;
}
```

### 形态八：品牌分屏（产品落地页，全屏）

```css
.login-page--split-pro {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-page--split-pro__brand {
  width: 55%;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a3e, #2d1f5f, #3d2e6e);
  padding: 56px 72px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.login-page--split-pro__form {
  width: 45%;
  height: 100vh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.login-card--split-pro {
  --login-card-shadow: none;
  max-width: 400px;
}
```

### 形态九：滑块拼图

```css
.login-page--puzzle {
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
}

.puzzle-captcha {
  margin-bottom: 20px;
}
```

拼图组件独立实现：[PuzzleCaptcha.vue](#puzzlecaptcha-组件)（clip-path 凸字形 + 拖拽逻辑）。

---

## PuzzleCaptcha 组件

> 独立组件，结合 vue-base-skill 现有能力实现。

```vue
<template>
  <div class="puzzle-captcha">
    <div class="puzzle-box" ref="puzzleBox">
      <div class="puzzle-bg" />
      <div class="puzzle-hole" :style="{ left: targetX + 'px' }" />
      <div
        class="puzzle-piece"
        :class="{ dragging: isDragging, success: isSuccess }"
        :style="{ left: pieceX + 'px' }"
        @mousedown="dragStart"
        @touchstart="dragStart"
      />
    </div>
    <div class="puzzle-slider" @mousedown="dragStart" @touchstart="dragStart">
      <div class="puzzle-slider__track" :style="{ width: sliderPercent + '%' }" />
      <div class="puzzle-slider__text">{{ isSuccess ? '验证成功' : '拖动滑块完成拼图 →' }}</div>
      <div
        class="puzzle-slider__handle"
        :class="{ dragging: isDragging }"
        :style="{ left: sliderPercent + '%' }"
      >
        <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const pieceX = ref(10)
const targetX = ref(0)
const isDragging = ref(false)
const isSuccess = ref(false)
const startX = ref(0)
const sliderPercent = ref(0)

onMounted(reset)

function reset() {
  isSuccess.value = false
  pieceX.value = 10
  targetX.value = 200 + Math.random() * 100
  sliderPercent.value = 0
  emit('update:modelValue', false)
}

function dragStart(e: MouseEvent | TouchEvent) {
  if (isSuccess.value) return
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  startX.value = clientX - pieceX.value
}

function dragMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  pieceX.value = Math.max(10, Math.min(320, clientX - startX.value))
  sliderPercent.value = ((pieceX.value - 10) / 310) * 100
}

function dragEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  if (Math.abs(pieceX.value - targetX.value) <= 5) {
    isSuccess.value = true
    pieceX.value = targetX.value
    sliderPercent.value = 100
    emit('update:modelValue', true)
  } else {
    setTimeout(reset, 400)
  }
}

document.addEventListener('mousemove', dragMove)
document.addEventListener('mouseup', dragEnd)
document.addEventListener('touchmove', dragMove)
document.addEventListener('touchend', dragEnd)
</script>

<style scoped>
.puzzle-box {
  position: relative;
  height: 160px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
}

.puzzle-hole,
.puzzle-piece {
  position: absolute;
  width: 50px;
  height: 50px;
  top: 55px;
  clip-path: polygon(
    0% 25%, 25% 25%, 25% 0%, 75% 0%, 75% 25%,
    100% 25%, 100% 75%, 75% 75%, 75% 100%,
    25% 100%, 25% 75%, 0% 75%
  );
}

/* 缺口形状互补：顶平底凸 */
.puzzle-hole {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 25%, 75% 25%, 75% 75%, 100% 75%,
    100% 100%, 0% 100%, 0% 75%, 25% 75%, 25% 25%, 0% 25%
  );
  box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.puzzle-piece {
  cursor: grab;
  z-index: 5;
  transition: left 0.2s;
}

.puzzle-piece-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.puzzle-slider {
  position: relative;
  height: 44px;
  background: #f3f4f6;
  border-radius: 22px;
  margin-top: 16px;
  cursor: pointer;
}

.puzzle-slider__track {
  position: absolute;
  inset: 0;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 22px;
  width: 0;
  transition: width 0.2s;
}

.puzzle-slider__handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: grab;
}
</style>
```

---

## 不做

- 不处理后端登录接口（业务层实现）
- 不处理权限路由（使用 vue-router-skill）
- 不内置验证码生成（业务层实现）
- 不处理密码加密（后端负责）
- 不自定义 div 模拟 input/button/checkbox（必须用现有组件）

## 依赖关系

```markdown
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