# 手机号验证码登录

> 手机号 + 验证码登录，手机号优先的 App 登录方式

## 风格

- 背景 → `var(--color-bg)` 浅灰
- 标题 → 大标题 + 副标题说明验证码用途
- 登录卡片 → 白色背景，`20px` 圆角，带阴影
- 输入框 → 图标 + 输入框，圆角 `12px`，高度 `52px`
- 验证码按钮 → 内嵌在验证码输入框右侧，圆角胶囊，高度 `30px`
- 登录按钮 → 渐变主色，`12px` 圆角，高度 `52px`

## 页面结构

```
┌─────────────────────────────────────┐
│                                     │
│  手机登录                           │ ← 标题
│  验证码将发送至您的手机号            │ ← 副标题
│                                     │
│  ┌────────────────────────────────┐ │ ← 登录卡片
│  │ 手机号                          │ │
│  │ [图标] _______________________   │ │
│  │                                 │ │
│  │ 验证码                          │ │
│  │ [图标] ______________ [获取验证码]│ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │ ← 主按钮
│  │           登 录                 │ │
│  └────────────────────────────────┘ │
│                                     │
│     也可以使用账号密码登录           │
│                                     │
│  登录即代表您同意《用户协议》...     │
└─────────────────────────────────────┘
```

## base-input + base-card 参数

> 输入框统一使用 [base-input](../../base-input.md)，与 [base-card](../../base-card.md) 同源（参数化外壳组件，包裹原生 input 元素）。

```vue
<!-- 登录卡片 -->
<base-card
  :background="'var(--color-surface)'"
  :border-radius="'var(--radius-lg)'"
  :padding="'var(--space-5)'"
  :shadow="'var(--shadow-sm)'"
>
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
</base-card>

<!-- 登录按钮 -->
<base-card
  :width="'100%'"
  :height="'52px'"
  :border-radius="'var(--radius-md)'"
  :background="'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'"
  :shadow="'0 8px 24px rgba(74, 144, 226, 0.3)'"
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

- 手机号优先的 App
- 需要快速注册登录的场景
- 国内移动互联网产品常用登录方式

## 触发词

```markdown
/uniapp-base-skill 做一个手机号登录页
/uniapp-base-skill 做一个验证码登录页
```

## 演示

[查看 HTML 演示](html/login-phone.html)

## 注意事项

1. 验证码按钮内嵌在输入框中，使用 `flex-shrink: 0` 防止被压缩。
2. 验证码按钮高度 `30px`，远小于输入框高度 `52px`，垂直居中显示。
3. HTML 演示使用 `div`/`input` 标签，实际 uniapp 开发请替换为 `view`/`input`。
4. 图标使用 lucide SVG，实际项目可替换为本地图标或图标字体。
5. 所有颜色使用主题变量，禁止写死色值。
