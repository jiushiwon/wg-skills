<!--
  LoginForm.vue - 标准登录表单组件（v2 重构：结构级差异化）

  9 种风格共用此组件，通过 variant + class 切换视觉风格：
    login-card--frosted    毛玻璃
    login-card--particles  粒子背景（容器级由 ParticleBackground 提供）
    login-card--flip       3D 翻转（容器级由 FlipLoginContainer 提供）
    login-card--split      分屏（容器级由 SplitLayout 提供）
    login-card--split-pro  品牌分屏（容器级由 SplitProLayout 提供）
    login-card--dark       暗黑科技
    login-card--minimal    极简
    login-card--typewriter 打字机
    login-card--puzzle     滑块拼图（拼图组件由 PuzzleCaptcha 提供）

  容器：base-card
  表单：base-form + base-form-item
  输入：base-input
  按钮：base-button
  复选：base-checkbox

  零 HTML5 标签铁律：模板内只用 div + role，禁止 input/button/label/form。
-->
<template>
  <!--
    外层 .login-card 包装器承担所有变体样式（背景/边框/阴影），
    内层 <base-card> 只负责 header/body/footer 结构。
    为什么需要包装器？
      base-card（vue-card-skill）自带 scoped .base-card { background: var(--color-surface, #fff) }，
      特异性 0,1,1 > 我们的 .login-card--dark (0,1,0)，dark 背景会被覆盖。
      把样式挪到外层 .login-card 后，外层本身就是渲染面，样式生效。

    v2 升级：新增 #terminal-header / #terminal-prompt 槽（typewriter 专用），
    #brand / #page-background / #page-decoration / #preface 槽由 wrapper 组件填充。
  -->
  <div class="login-card" :class="cardClass" :style="cardStyle">
    <base-card padding="none">
      <!-- 头部 -->
      <template #header>
        <!-- typewriter 终端头部：3 色圆点 + 文件名（默认三色圆点；消费者可通过 #terminal-header 覆盖） -->
        <slot name="terminal-header">
          <div v-if="variant === 'typewriter'" class="login-card__terminal-header">
            <span class="login-card__terminal-dot login-card__terminal-dot--red" />
            <span class="login-card__terminal-dot login-card__terminal-dot--yellow" />
            <span class="login-card__terminal-dot login-card__terminal-dot--green" />
            <span v-if="terminalHeader" class="login-card__terminal-title">{{ terminalHeader }}</span>
          </div>
        </slot>

        <!-- ponytail: logo 槽（demo dark 有齿轮 + NEXUS；其他变体留空即可） -->
        <slot name="logo" />
        <div v-if="title" class="login-card__title">{{ title }}</div>
        <div v-if="subtitle" class="login-card__subtitle">{{ subtitle }}</div>

        <!-- typewriter 提示行：$ Welcome...（默认 typewriter 文本；消费者可通过 #terminal-prompt 覆盖） -->
        <slot name="terminal-prompt">
          <div v-if="variant === 'typewriter' && terminalPrompt" class="login-card__prompt">
            <span class="login-card__prompt-prefix">$</span>
            <span class="login-card__prompt-text">{{ terminalPrompt }}</span>
            <span class="login-card__prompt-caret" />
          </div>
        </slot>

        <!-- 分屏变体可在标题前插入额外内容（如账号切换 Tab） -->
        <slot name="preface" />
      </template>

      <!-- 表单主体 -->
      <!-- ponytail: layout="vertical" 让 label 落在 input 上方（默认 horizontal 是左对齐），9 种风格统一 -->
      <base-form :model="form" :rules="rules" layout="vertical" @submit="handleSubmit">
        <!-- 账号：ponytail 决策 — 技能不渲染 label 行，字段识别靠 prefix icon + placeholder。
             prop 仍保留供校验用。-->
        <base-form-item prop="username">
          <base-input
            v-model="form.username"
            :placeholder="usernamePlaceholder"
            clearable
          >
            <template #prefix>
              <svg class="login-card__icon" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
              </svg>
            </template>
          </base-input>
        </base-form-item>

        <!-- 密码：同上 -->
        <base-form-item prop="password">
          <base-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="passwordPlaceholder"
          >
            <template #prefix>
              <svg class="login-card__icon" viewBox="0 0 24 24">
                <rect x="4" y="11" width="16" height="10" rx="2"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
            </template>
          </base-input>
        </base-form-item>

        <!-- 验证码（可选插槽）：文案同上由消费者传 -->
        <base-form-item v-if="showCaptcha" prop="captcha">
          <div class="login-card__captcha-row">
            <base-input v-model="form.captcha" :placeholder="captchaPlaceholder">
              <template #prefix>
                <svg class="login-card__icon" viewBox="0 0 24 24">
                  <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/>
                </svg>
              </template>
            </base-input>
            <slot name="captcha-extra" />
          </div>
        </base-form-item>

        <!-- 滑块拼图（可选插槽）-->
        <slot name="captcha-puzzle" />

        <!-- 选项行：文案同样由消费者传 -->
        <div v-if="showRemember || showForgot" class="login-card__options">
          <base-checkbox v-if="showRemember" v-model="form.remember">
            {{ rememberLabel }}
          </base-checkbox>
          <base-button v-if="showForgot" variant="link" size="sm" @click="$emit('forgot')">
            {{ forgotLabel }}
          </base-button>
        </div>

        <!-- 登录按钮 -->
        <base-button
          type="primary"
          block
          size="lg"
          :loading="loading"
          :disabled="disabled"
          :style="submitButtonStyle"
          native-type="submit"
        >
          {{ submitText || '登 录' }}
        </base-button>
      </base-form>

      <!-- 底部 -->
      <template #footer>
        <!-- ponytail: divider 槽（demo dark 有"或"分隔线；其他变体留空即可） -->
        <slot name="divider" />

        <!-- ponytail: social 槽（demo dark 有微信/GitHub/Google） -->
        <slot name="social" />

        <!-- ponytail: 默认"立即注册"链接（文案由消费者传） -->
        <div v-if="showRegister" class="login-card__register">
          {{ registerPromptLabel }}
          <base-button variant="link" size="sm" @click="$emit('register')">
            {{ registerLabel }}
          </base-button>
        </div>

        <!-- ponytail: 多链接 footer 槽（demo dark 有"注册账户 | 手机号登录"），
             与 showRegister 是 OR 关系：填了 extraLinks 就不显示默认注册链接 -->
        <slot name="extraLinks" />
      </template>
    </base-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

interface LoginFormProps {
  /** 视觉风格 */
  variant?:
    | 'frosted' | 'particles' | 'flip' | 'split'
    | 'split-pro' | 'dark' | 'minimal' | 'typewriter' | 'puzzle'
  /** 标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 提交按钮文字 */
  submitText?: string
  /** 是否显示验证码 */
  showCaptcha?: boolean
  /** 是否显示记住我 */
  showRemember?: boolean
  /** 是否显示忘记密码 */
  showForgot?: boolean
  /** 是否显示注册链接 */
  showRegister?: boolean
  /** 加载中 */
  loading?: boolean
  /** 禁用 */
  disabled?: boolean
  /* ponytail: 技能不渲染 label —— 字段识别靠 prefix icon + placeholder。
     消费者通过 placeholder 覆盖即可（i18n / 业务改名）。*/
  /** 账号字段 placeholder */
  usernamePlaceholder?: string
  /** 密码字段 placeholder */
  passwordPlaceholder?: string
  /** 验证码字段 placeholder */
  captchaPlaceholder?: string
  /** 记住我复选框文字 */
  rememberLabel?: string
  /** 忘记密码按钮文字 */
  forgotLabel?: string
  /** 注册引导前缀（如"还没有账号？"） */
  registerPromptLabel?: string
  /** 注册按钮文字 */
  registerLabel?: string
  /** 账号必填校验文案（不传时根据 placeholder 推断） */
  usernameRequiredMessage?: string
  /** 密码必填校验文案 */
  passwordRequiredMessage?: string
  /** 验证码必填校验文案 */
  captchaRequiredMessage?: string
  /* === v2 新增 prop === */
  /** 标题/副标题居中（dark / minimal / typewriter 用） */
  centerTitle?: boolean
  /** 卡片宽度（默认 420px；minimal 360px；split-pro 400px） */
  cardWidth?: string | number
  /** 终端头部文件名（typewriter 用，如 "login.sh"） */
  terminalHeader?: string
  /** 终端提示行文本（typewriter 用，如 "Welcome to the Matrix..."） */
  terminalPrompt?: string
  /** 覆盖提交按钮背景色（typewriter / dark / minimal 用） */
  submitButtonBg?: string
}

const props = withDefaults(defineProps<LoginFormProps>(), {
  variant: 'frosted',
  /* ponytail: title/subtitle 给中性默认 —— 不传时仍能看到"这是一个登录页"。
     消费者通过 props 覆盖（i18n / 业务改名）即可。*/
  title: '登录',
  subtitle: '请输入您的账号信息',
  submitText: '登 录',
  showCaptcha: false,
  showRemember: true,
  showForgot: true,
  showRegister: true,
  loading: false,
  disabled: false,
  /* ponytail: 技能不渲染 label 行 —— placeholder + prefix icon 已能识别字段。
     消费者通过 props 覆盖 placeholder 即可（i18n / 业务改名）。
     校验文案默认 "请输入{placeholder 前缀}"，消费者可覆盖。*/
  usernamePlaceholder: '请输入用户名 / 邮箱',
  passwordPlaceholder: '请输入密码',
  captchaPlaceholder: '请输入验证码',
  rememberLabel: '记住我',
  forgotLabel: '忘记密码？',
  registerPromptLabel: '还没有账号？',
  registerLabel: '立即注册',
  usernameRequiredMessage: '',
  passwordRequiredMessage: '',
  captchaRequiredMessage: '',
  /* === v2 新增默认值 === */
  centerTitle: false,
  cardWidth: '420px',
  terminalHeader: '',
  terminalPrompt: '',
  submitButtonBg: '',
})

const emit = defineEmits<{
  submit: [values: LoginValues]
  forgot: []
  register: []
}>()

interface LoginValues {
  username: string
  password: string
  captcha?: string
  remember: boolean
}

const form = reactive<LoginValues>({
  username: '',
  password: '',
  captcha: '',
  remember: false,
})

/* ponytail: 校验文案优先级 = 消费者传入 > "请输入{placeholder 截取}"。
     没 label 后用 placeholder 兜底 —— placeholder 默认 "请输入用户名 / 邮箱"，
     取其去掉 "请输入" 前缀即 "用户名 / 邮箱"，得到 "请输入用户名 / 邮箱" 友好提示。*/
function requiredMessage(placeholder: string, fallback: string): string {
  return placeholder.startsWith('请输入') ? placeholder : `请输入${fallback}`
}

const rules = computed(() => ({
  username: [{ required: true, message: props.usernameRequiredMessage || requiredMessage(props.usernamePlaceholder, '用户名 / 邮箱') }],
  password: [{ required: true, message: props.passwordRequiredMessage || requiredMessage(props.passwordPlaceholder, '密码') }],
  captcha: [{ required: props.showCaptcha, message: props.captchaRequiredMessage || requiredMessage(props.captchaPlaceholder, '验证码') }],
}))

const cardClass = computed(() => [
  `login-card--${props.variant}`,
  { 'login-card--center-title': props.centerTitle },
])

/* v2: cardWidth 直接走 inline style（消费者传 '360px' / '400px' / '24rem' 都接受）*/
const cardStyle = computed(() => ({
  width: typeof props.cardWidth === 'number' ? `${props.cardWidth}px` : props.cardWidth,
}))

/* v2: submitButtonBg 通过 inline style 覆盖（typewriter 绿 / minimal 黑 / dark 项目主题色）*/
const submitButtonStyle = computed(() => {
  if (!props.submitButtonBg) return {}
  return { background: props.submitButtonBg, borderColor: props.submitButtonBg }
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<style>
/* === 通用 .login-card 变量（v2 清理：删除冗余私有 token）===
   ponytail: --login-card-title-color / subtitle-color / padding / radius / input-* / button-*
   全部映射到 vue-theme-skill token 或被各 variant 覆写，删掉无意义中转。
   保留 --login-card-width 和 --login-card-shadow（无对应 token；不同 variant 覆写宽度）。*/
.login-card {
  --login-card-shadow: 0 8px 32px color-mix(in srgb, var(--color-text) 10%, transparent);   /* token 化阴影透明度 */
  --login-card-padding: var(--space-12);      /* token 化（48px → --space-12），各 variant 可覆写 */

  /* ponytail: 让内层 base-card 的 --color-surface 取透明，外层 .login-card 的 background 才是真正的渲染面
     （否则 base-card 自带白色覆盖掉变体的 dark 背景）*/
  --color-surface: transparent;

  /* v2: width 改用 inline style（cardWidth prop），不再用 --login-card-width */
  padding: var(--login-card-padding);
  box-sizing: border-box;
  position: relative;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--login-card-shadow);
}

/* ponytail: base-form-item 是 display: flex; flex-direction: column; align-items: flex-start
     （不沿 cross axis 拉伸子项）。所以 .base-form-item__content 默认宽度 = min-content，
     而 min-content = max(.base-input 的最小内容宽) ~151px（icon + 文字 placeholder），
     形成 鸡生蛋 循环：input width:100% 但 content 不知道父宽度，content 又按 input 收缩。
     解决方法：强制 .base-form-item__content 占满整个 cross axis（item 的宽度 318）。*/
.login-card .base-form-item__content {
  width: 100% !important;
  flex-basis: 100% !important;
  align-self: stretch !important;
}

/* ponytail: 同样 base-input 是 display: inline-flex + width: auto，会按内容收缩，
     导致 input 和 按钮（display: block 撑满）宽度不一致。
     base-input 自带 <style scoped>，特异性 (0,2,1) > 全局 (0,2,0)，纯提高特异性无效。
     用 !important 强制覆盖。 */
.login-card .base-input {
  display: flex !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* ponytail: base-card__header 是 display:flex + justify-content:space-between，
     会让 title/subtitle 在一行。强制垂直堆叠。*/
.login-card .base-card__header {
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: var(--space-2) !important;
}

/* v2: 居中标题（dark / minimal / typewriter 用） */
.login-card--center-title .login-card__title,
.login-card--center-title .login-card__subtitle,
.login-card--center-title .login-card__logo {
  text-align: center;
  width: 100%;
  align-items: center !important;
}

.login-card__title {
  font-size: var(--font-3xl);          /* token 化（24px → --font-3xl = 28px） */
  font-weight: var(--weight-semibold); /* token 化（600 → --weight-semibold） */
  color: var(--color-text);
  margin-bottom: var(--space-2);       /* token 化（8px → --space-2） */
}

.login-card__subtitle {
  font-size: var(--font-base);          /* token 化（14px → --font-base） */
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);       /* token 化（24px → --space-6） */
}

.login-card__icon {
  width: 18px;                         /* icon 尺寸无对应 token，保留 */
  height: 18px;
  stroke: var(--color-text-tertiary);  /* token 化（#9ca3af → --color-text-tertiary） */
  fill: none;
  stroke-width: 1.8;
}

.login-card__options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);       /* token 化 */
}

.login-card__register {
  text-align: center;
  font-size: var(--font-base);          /* token 化 */
  color: var(--color-text-secondary);  /* token 化 */
}

.login-card__captcha-row {
  display: flex;
  gap: var(--space-3);                 /* token 化（12px → --space-3） */
}

/* ponytail: divider 辅助样式（消费者填 #divider 时可以直接套这个 class） */
.login-card__divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);                 /* token 化 */
  margin: var(--space-6) 0 var(--space-4);  /* token 化（24px 0 16px） */
  color: var(--color-text-secondary);  /* token 化 */
  font-size: var(--font-sm);           /* token 化（13px → --font-sm） */
}
.login-card__divider::before,
.login-card__divider::after {
  content: '';
  flex: 1;
  height: 1px;                         /* border-width 无 token，保留 */
  background: currentColor;
  opacity: 0.3;
}

/* ponytail: extraLinks 槽默认辅助样式 */
.login-card__extra-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-3);                 /* token 化 */
  margin-top: var(--space-2);          /* token 化 */
  font-size: var(--font-sm);           /* token 化 */
  color: var(--color-text-secondary);  /* token 化 */
}
.login-card__extra-links a {
  color: var(--color-primary);
  text-decoration: none;
}
.login-card__extra-links a:hover {
  color: var(--color-primary-light);
}

/* ponytail: logo 槽默认辅助样式（demo dark 的齿轮 + NEXUS 居中布局） */
.login-card__logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);                 /* token 化 */
  margin-bottom: var(--space-4);       /* token 化 */
  color: var(--color-text);
}
.login-card__logo svg {
  width: var(--height-button-lg);      /* token 化（48px → --height-button-lg） */
  height: var(--height-button-lg);
}

/* === v2: typewriter 终端头部 === */
/* ponytail: typewriter 终端头部三色圆点 = GitHub Dark 调色板（macOS 终端经典配色），
     这套色 token 系统没有对应语义，保留硬编码；如未来 vue-theme-skill 增加
     --color-terminal-* 系列 token 再迁移。 */
.login-card__terminal-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid #30363d;
  width: 100%;
}
.login-card__terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.login-card__terminal-dot--red { background: #f85149; }
.login-card__terminal-dot--yellow { background: #d29922; }
.login-card__terminal-dot--green { background: #3fb950; }
.login-card__terminal-title {
  margin-left: auto;
  font-size: var(--font-sm);
  color: #8b949e;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

/* === v2: typewriter 提示行 === */
.login-card__prompt {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: var(--font-sm);
}
.login-card__prompt-prefix {
  color: #3fb950;
  font-weight: var(--weight-semibold);
}
.login-card__prompt-text {
  color: #c9d1d9;
}
/* 闪烁光标（typewriter 标志） */
.login-card__prompt-caret {
  display: inline-block;
  width: 8px;
  height: 14px;
  background: #3fb950;
  animation: login-card-caret-blink 1s steps(2) infinite;
}
@keyframes login-card-caret-blink {
  50% { opacity: 0; }
}

/* ===================== 9 种风格覆写（v2 升级：结构级差异） ===================== */

/* 1. 毛玻璃
   ponytail: frosted 依赖 backdrop-filter 看到背后内容，必须配套半透明卡片背景；
     输入/按钮也要同步半透明才能看到模糊效果。
     base-input / base-button 用 --color-bg / --color-border / --color-text。*/
/* ponytail: frosted 半透明白用 --color-text-inverse（token 化），alpha 用 color-mix 实现 */
.login-card--frosted {
  background: color-mix(in srgb, var(--color-text-inverse) 15%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid color-mix(in srgb, var(--color-text-inverse) 25%, transparent);
  --color-bg: color-mix(in srgb, var(--color-text-inverse) 10%, transparent);
  --color-border: color-mix(in srgb, var(--color-text-inverse) 30%, transparent);
  --color-border-strong: color-mix(in srgb, var(--color-text-inverse) 50%, transparent);
  --color-text: var(--color-text-inverse);
  --color-text-placeholder: color-mix(in srgb, var(--color-text-inverse) 60%, transparent);
}
.login-card--frosted .base-button--type-primary {
  background: color-mix(in srgb, var(--color-text-inverse) 25%, transparent);
  color: var(--color-text-inverse);
  border: 1px solid color-mix(in srgb, var(--color-text-inverse) 30%, transparent);
}
.login-card--frosted .base-button--type-primary:hover {
  background: color-mix(in srgb, var(--color-text-inverse) 35%, transparent);
}

/* 2. 暗黑科技
   ponytail: dark 风格文字必须是白色 + 焦点态 cyan（深色风经典装饰色）。
     - input text: --color-text-inverse 白色
     - 焦点态: cyan 边框 + cyan 阴影（cyan 是设计意图，token 系统无对应，保留）
     - 按钮: --color-primary 项目主题色贯穿
     - 必填星号: var(--color-danger)
     v2 升级：centerTitle prop 即可让标题/副标题居中（替代 v1 硬编码） */
.login-card--dark {
  background: color-mix(in srgb, var(--color-text) 92%, transparent);   /* token 化（#0a0a0f + 0.92 alpha） */
  border: 1px solid rgba(0, 255, 255, 0.3);   /* ponytail: cyan = 装饰色，保留 */
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);

  --color-bg: color-mix(in srgb, var(--color-text-inverse) 4%, transparent);
  --color-border: rgba(0, 255, 255, 0.3);   /* cyan 装饰色 */
  --color-border-strong: rgba(0, 255, 255, 0.5);
  --color-text: var(--color-text-inverse);
  /* ponytail: 暗背景弱化文本 —— 用 --color-text-inverse 做 alpha 锚点（token 化） */
  --color-text-placeholder: color-mix(in srgb, var(--color-text-inverse) 40%, transparent);
  --color-text-tertiary: color-mix(in srgb, var(--color-text-inverse) 40%, transparent);
  --color-text-secondary: color-mix(in srgb, var(--color-text-inverse) 60%, transparent);
  /* ponytail: 不覆盖 --color-primary —— 项目主题色（铜橙）贯穿 dark 变体的按钮 / 链接 / 必填星号 / 标题 / 副标题。
     cyan 只留给边框 / 扫描线 / 焦点态这类"装饰"元素。*/
}
/* dark 焦点态：cyan 边框 + cyan 阴影（深色风必备） */
.login-card--dark .base-input:focus-within,
.login-card--dark .base-input:hover {
  border-color: #0ff;
  box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.15);
}
/* dark 必填星号：跟随项目主题色（不要硬编码 cyan）*/
.login-card--dark .base-form-item__required {
  color: var(--color-danger);
}
/* dark 按钮 hover：让项目主题色自己管（不要强制 cyan） */
.login-card--dark .base-button--type-primary:hover {
  box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.15);
}

/* 3. 极简
   ponytail: minimal 真正差异 = input 无边框 + 底部下划线 + 黑色按钮 + 居中布局。
     v2 升级：centerTitle prop 即可让标题居中（替代 v1 硬编码）。
     注意：LoginForm.vue <style> 是 unscoped（不带 scoped 属性），
     :deep() 在 unscoped style 里不生效，改用全局选择器 + !important 强覆盖。
     ponytail: minimal 黑色按钮 / 黑色文字保留 #1a1a2e 与 #000 —— 这是 minimal 风格的"纯黑"
     设计意图，与项目主题色无关（项目主题色留给其他 8 个变体）。*/
.login-card--minimal {
  background: transparent;
  border: none;
  --login-card-shadow: none;
}
/* minimal input：去框去底，留底部下划线（border 用 --color-border token） */
.login-card--minimal .base-input {
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid var(--color-border) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.login-card--minimal .base-input:focus-within {
  border-bottom-color: #1a1a2e !important;
  box-shadow: none !important;
}
.login-card--minimal .base-input__input {
  color: #1a1a2e !important;
  background: transparent !important;
}
/* minimal 按钮：黑底白字（覆写 base-button 默认的主题色背景）*/
.login-card--minimal .base-button--type-primary {
  background: #1a1a2e !important;
  color: var(--color-text-inverse) !important;
  border-color: #1a1a2e !important;
}
.login-card--minimal .base-button--type-primary:hover {
  background: var(--color-text) !important;
  border-color: var(--color-text) !important;
}

/* 4. 打字机
   ponytail: typewriter 终端风 = 等宽字体 + GitHub 配色 + 深色面板 + 终端三色圆点 + $ 提示行。
     v2 升级：3 色圆点改为通过 #terminal-header slot 默认内容渲染（更可定制）；
     $ 提示行通过 #terminal-prompt slot 默认内容渲染。
     ponytail: 整套 #161b22 / #0d1117 / #30363d / #c9d1d9 等是 GitHub Dark 调色板
     （专门复刻 GitHub 终端风格），token 系统无对应语义，保留硬编码；如未来
     vue-theme-skill 增加 --color-terminal-bg / border / text 等 token 再迁移。*/
.login-card--typewriter {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: var(--radius-md);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  --color-bg: #0d1117;
  --color-border: #30363d;
  --color-border-strong: #484f58;
  --color-text: #c9d1d9;
  --color-text-placeholder: #6e7681;
}
/* typewriter input：黑色面板 + 绿色 caret */
.login-card--typewriter .base-input {
  background: #0d1117;
  border-color: #30363d;
  color: #c9d1d9;
  font-family: inherit;
}
.login-card--typewriter .base-input:focus-within {
  border-color: #3fb950;
  box-shadow: 0 0 0 1px #3fb950;
}
.login-card--typewriter .base-input__input {
  font-family: inherit;
  color: #c9d1d9;
}
/* typewriter 按钮：GitHub 绿 #238636（消费者也可传 submitButtonBg 覆盖） */
.login-card--typewriter .base-button--type-primary {
  background: #238636 !important;
  color: var(--color-text-inverse) !important;
  border-color: #238636 !important;
}
.login-card--typewriter .base-button--type-primary:hover {
  background: #2ea043 !important;
  border-color: #2ea043 !important;
}
/* typewriter 必填星号用绿色系（呼应终端）*/
.login-card--typewriter .base-form-item__required {
  color: #3fb950;
}

/* 5. 粒子背景
     页面背景 + 粒子 canvas 由 ParticleBackground wrapper 提供；
     卡片层用半透明深底 + 主题色边框 + 渐变按钮（呼应粒子颜色）。
     v2 升级：z-index 与 particle canvas 配合（ParticleBackground 内已设置 z-index:0）。
     ponytail: 紫蓝调色板用 --color-primary 锚点（color-mix alpha）。*/
.login-card--particles {
  z-index: 10;
  background: color-mix(in srgb, var(--color-text) 85%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
  border-radius: var(--radius-lg);
  --color-bg: color-mix(in srgb, var(--color-primary) 8%, transparent);
  --color-border: color-mix(in srgb, var(--color-primary) 30%, transparent);
  --color-border-strong: color-mix(in srgb, var(--color-primary) 50%, transparent);
  --color-text: var(--color-text-inverse);
  --color-text-placeholder: color-mix(in srgb, var(--color-text-inverse) 50%, transparent);
}
/* particles input：主题色焦点态 */
.login-card--particles .base-input:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
}
/* particles 按钮：主题色渐变 */
.login-card--particles .base-button--type-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)) !important;
  color: var(--color-text-inverse) !important;
  border-color: transparent !important;
}
.login-card--particles .base-button--type-primary:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary)) !important;
}

/* 6. 3D 翻转
     SKILL.md 要求"两个 <LoginForm> 实例 + .flip-container 包裹 + .flipped 切换"；
     v2 升级：CSS 只负责卡片本身在 3D 容器里的定位。
     容器由 FlipLoginContainer wrapper 提供（perspective + transform-style + 翻转触发）。*/
.login-card--flip,
.login-card--flip-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}
/* ponytail: 反面也要 backface-visibility: hidden，否则不翻时反面也可见，
   与正面重叠，按钮点击会被遮挡（亲历 flip 项目 bug）*/
.login-card--flip-back {
  transform: rotateY(180deg);
}

/* 7. 分屏登录
     .login-page--split 用 flex 把页面切成品牌区 + 表单区（由 SplitLayout wrapper 提供）；
     .login-card--split 在表单区内白底展示。*/
.login-card--split {
  --login-card-shadow: none;
  background: var(--color-surface);
}

/* 8. 品牌分屏（产品落地页，全屏）
     SKILL.md 要求 .login-page--split-pro 全屏双栏 + 渐变品牌区 + 白底表单区；
     v2 升级：卡片层控制自身最大宽度 + 去阴影。input 高度 52px（v2 唯一尺寸覆写）。
     ponytail: 铜橙渐变用 --color-primary 锚点；hover 偏暗用 --color-primary-700 token。*/
.login-card--split-pro {
  --login-card-shadow: none;
  background: var(--color-surface);
}
/* split-pro input：52px 高（落地页大输入框）*/
.login-card--split-pro .base-input {
  height: 52px !important;
}
/* split-pro 按钮：主题色渐变 + hover translateY */
.login-card--split-pro .base-button--type-primary {
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600)) !important;
  color: var(--color-text-inverse) !important;
  border-color: transparent !important;
  transition: transform 0.2s ease !important;
}
.login-card--split-pro .base-button--type-primary:hover {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700)) !important;
  transform: translateY(-1px);
}

/* 9. 滑块拼图（拼图组件由消费者在 #captcha-puzzle 槽提供 PuzzleCaptcha）
     v2 升级：卡片本体圆角 24px + input 圆角 12px + 主题色渐变按钮 + hover translateY + disabled 灰态 */
.login-card--puzzle {
  background: color-mix(in srgb, var(--color-text-inverse) 95%, transparent);
  backdrop-filter: blur(8px);
  border-radius: 24px;
}
.login-card--puzzle .base-input {
  border-radius: 12px;
}
/* puzzle 按钮：主题色渐变 + hover translateY */
.login-card--puzzle .base-button--type-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)) !important;
  color: var(--color-text-inverse) !important;
  border-color: transparent !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}
.login-card--puzzle .base-button--type-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary)) !important;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-primary) 30%, transparent);
}
.login-card--puzzle .base-button--type-primary:disabled {
  background: var(--color-border-strong) !important;
  color: var(--color-text-tertiary) !important;
}
</style>