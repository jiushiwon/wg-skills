# 浮动圆形背景登录

> 深色背景 + 浮动圆形渐变 + 毛玻璃 Logo + 滑动切换登录方式，适合社交、内容、社区类 App

## 风格

- 背景 → 深色渐变 `linear-gradient(160deg, #1a1f3a 0%, #2d3a6b 50%, #1a1f3a 100%)`
- 浮动圆形 → 4 个不同大小/颜色的渐变圆形，`translateY + rotate` 浮动动画
- 头部 Logo → 毛玻璃方块 `88px`，圆角 `12px`，白色边框
- 标题/副标题 → 白色文字居中
- 登录卡片 → 白色半透明 `rgba(255,255,255,0.96)`，圆角 `8px`
- 切换 Tab → 灰色背景 + 白色滑块 + 点击/手势滑动切换
- 微信登录面板 → 绿色渐变按钮 + 提示文字
- 手机号登录面板 → 手机号输入 + 验证码输入 + 登录按钮
- 输入框 → 浅灰背景，圆角 `8px`
- 按钮 → 主色渐变 / 微信绿渐变，圆角 `8px`

## 页面结构

```
┌─────────────────────────────────────┐
│ ╔═════════════════════════════════╗ │ ← 深色背景 + 浮动圆形
│ ║  ○        ○                     ║ │
│ ║       ○        ○                ║ │
│ ║                                 ║ │
│ ║  ┌────┐                         ║ │
│ ║  │ ◈  │  考拉搞AI                ║ │ ← 毛玻璃 Logo
│ ║  └────┘  让 AI 成为你的超级助手  ║ │
│ ║                                 ║ │
│ ║  ┌────────────────────────────┐ ║ │ ← 登录卡片
│ ║  │ [微信登录] [手机号登录]    │ ║ │ ← Tab 切换
│ ║  │                            │ ║ │
│ ║  │  ┌──────────────────────┐  │ ║ │
│ ║  │  │ 微信一键登录          │  │ ║ │
│ ║  │  └──────────────────────┘  │ ║ │
│ ║  │  点击上方按钮授权登录       │  │ ║ │
│ ║  │                            │ ║ │
│ ║  │  登录即代表同意...          │ ║ │
│ ║  └────────────────────────────┘ ║ │
│ ╚═════════════════════════════════╝ │
└─────────────────────────────────────┘
```

## base-input + base-card 参数

> 输入框统一使用 [base-input](../../base-input.md)，与 [base-card](../../base-card.md) 同源（参数化外壳组件，包裹原生 input 元素）。手机号登录面板使用 `border="all"` 形态，验证码按钮通过 `#suffix` slot 内嵌。

```vue
<!-- 背景层 -->
<base-card
  :background="'linear-gradient(160deg, #1a1f3a 0%, #2d3a6b 50%, #1a1f3a 100%)'"
/>

<!-- 浮动圆形 -->
<base-card
  :position="'absolute'"
  :border-radius="'50%'"
  :opacity="'0.18'"
  :background="'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))'"
  :animation="'float 8s ease-in-out infinite'"
/>

<!-- Logo 卡片 -->
<base-card
  :width="'88px'"
  :height="'88px'"
  :border-radius="'var(--radius-lg)'"
  :background="'rgba(255,255,255,0.15)'"
  :backdrop-filter="'blur(10px)'"
  :border="'1px solid rgba(255,255,255,0.25)'"
/>

<!-- 登录卡片 -->
<base-card
  :background="'rgba(255,255,255,0.96)'"
  :border-radius="'var(--radius-md)'"
  :padding="'var(--space-5)'"
  :shadow="'var(--shadow-md)'"
/>

<!-- 切换 Tab -->
<base-card
  :display="'flex'"
  :background="'var(--color-bg)'"
  :border-radius="'var(--radius-sm)'"
  :padding="'4px'"
/>

<!-- 手机号输入 -->
<base-input
  v-model="form.phone"
  type="number"
  :maxlength="11"
  label="手机号"
  required
  border="all"
  placeholder="请输入手机号"
/>

<!-- 验证码输入（右侧带发送按钮） -->
<base-input
  v-model="form.code"
  type="number"
  :maxlength="6"
  label="验证码"
  required
  border="all"
  placeholder="请输入验证码"
>
  <template #suffix>
    <view class="send-btn" :class="{ disabled: countdown > 0 }" @click="onSendCode">
      <text>{{ countdown > 0 ? `${countdown}s` : '发送验证码' }}</text>
    </view>
  </template>
</base-input>

<!-- 登录按钮 -->
<base-card
  :width="'100%'"
  :height="'48px'"
  :border-radius="'var(--radius-md)'"
  :background="'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))'"
  :color="'white'"
  clickable
  @click="onLogin"
>
  <text style="color:#fff;">登录</text>
</base-card>
```

> 详细场景：参见 [base-input-verify.md](../../base-input/base-input-verify.md)

## 主题变量

> 详见 [uniapp-theme-skill](../../uniapp-theme-skill/)

## 适用场景

- 社交类 App
- 内容平台
- 社区类产品
- 需要多种登录方式切换的场景

## 触发词

```markdown
/uniapp-base-skill 做一个浮动登录页
/uniapp-base-skill 做一个圆形浮动背景的登录页
/uniapp-base-skill 做一个带登录方式切换的登录页
```

## 演示

[查看 HTML 演示](html/login-float.html)

## 注意事项

1. 登录方式支持点击 Tab 切换和左右手势滑动切换。
2. 浮动圆形使用绝对定位，注意不同屏幕尺寸下的裁剪问题。
3. HTML 演示使用 `div`/`input` 标签，实际 uniapp 开发请替换为 `view`/`input`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
5. 所有颜色使用主题变量，禁止写死色值。
