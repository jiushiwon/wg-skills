# 场景：金融应用（Fintech App）

银行、支付、财富管理、保险、投资 App。**信任感、稳重、可读性**。

---

## 适用

- 银行 App
- 支付 App（钱包、转账）
- 财富管理
- 投资 / 股票 / 加密
- 保险 App
- 信用卡管理

## 不适用

- 通用电商（用 `mobile-native`）
- 后台管理系统（用 `admin-dashboard`）
- 营销活动（用 `landing-marketing`）

---

## 核心组件

| 组件 | 说明 |
|------|------|
| **Account Card** | 账户卡（银行卡、余额卡） |
| **Transaction List** | 交易明细列表 |
| **Amount Display** | 大金额展示，tabular-nums |
| **Quick Actions** | 转账/充值/缴费/收款 |
| **Payment Sheet** | 支付弹层（密码/生物识别） |
| **Beneficiary Picker** | 收款人选择 |
| **Amount Input** | 金额输入（带千分位） |
| **Rate Display** | 汇率/利率展示 |
| **Chart** | 资产曲线、收益走势 |
| **Confirmation Modal** | 关键操作确认 |
| **Biometric Auth** | Face ID / Touch ID / 指纹 |
| **OTP Input** | 验证码输入 |
| **Receipt** | 交易回执页 |

---

## 布局基线

### 移动 App 布局（默认）

```css
.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: 56px;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
}

.app-content {
  flex: 1;
  padding: var(--space-4);
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0)); /* 留出 bottom nav */
}

.app-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--color-surface-elevated);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

---

## 余额卡片

```html
<div class="balance-card">
  <div class="balance-header">
    <span class="balance-label">总资产</span>
    <button class="balance-toggle" aria-label="隐藏金额">👁</button>
  </div>
  <div class="balance-amount">
    <span class="currency">¥</span>
    <span class="amount">123,456.78</span>
  </div>
  <div class="balance-trend">
    <span class="trend-up">+1,234.56</span>
    <span class="trend-period">今日</span>
  </div>
</div>
```

```css
.balance-card {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: var(--color-on-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  margin: var(--space-4);
  box-shadow: var(--shadow-lg);
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  margin: var(--space-2) 0;
}

.balance-amount .currency {
  font-size: 1.25rem;
  vertical-align: super;
  margin-right: var(--space-1);
  opacity: 0.8;
}
```

---

## 交易列表

```html
<div class="transaction-list">
  <div class="list-group">
    <div class="list-group-header">
      <span>今天</span>
      <span class="list-group-amount">-128.00</span>
    </div>
    <div class="list-item">
      <div class="list-item-icon">
        <Icon name="shopping" />
      </div>
      <div class="list-item-content">
        <div class="list-item-title">星巴克咖啡</div>
        <div class="list-item-meta">10:23 · 信用卡</div>
      </div>
      <div class="list-item-amount expense">-¥38.00</div>
    </div>
    <div class="list-item">
      <div class="list-item-icon">
        <Icon name="transfer" />
      </div>
      <div class="list-item-content">
        <div class="list-item-title">收到转账</div>
        <div class="list-item-meta">09:15 · 来自 张三</div>
      </div>
      <div class="list-item-amount income">+¥200.00</div>
    </div>
  </div>
</div>
```

```css
.list-group {
  background: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  margin: var(--space-4);
  overflow: hidden;
}

.list-group-header {
  display: flex;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-on-surface-muted);
  background: var(--color-surface-tinted);
  font-variant-numeric: tabular-nums;
}

.list-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  min-height: 64px;  /* 触摸友好 */
  transition: background-color 100ms;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:active {
  background: var(--color-surface-tinted);
}

.list-item-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-surface-tinted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.list-item-content {
  flex: 1;
  min-width: 0;
}

.list-item-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: 2px;
}

.list-item-meta {
  font-size: var(--font-size-sm);
  color: var(--color-on-surface-muted);
}

.list-item-amount {
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
  text-align: right;
  flex-shrink: 0;
}

.list-item-amount.income { color: var(--color-success); }
.list-item-amount.expense { color: var(--color-on-surface); }
```

---

## 金额输入

```html
<div class="amount-input-container">
  <label class="amount-input-label">转账金额</label>
  <div class="amount-input">
    <span class="currency-symbol">¥</span>
    <input
      type="text"
      inputmode="decimal"
      class="amount-field"
      value="0.00"
      placeholder="0.00"
    />
  </div>
  <div class="amount-input-helper">
    余额 ¥12,345.67
  </div>
</div>
```

```css
.amount-input-container {
  padding: var(--space-6);
}

.amount-input {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-4) 0;
  border-bottom: 2px solid var(--color-border);
}

.amount-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 2.5rem;
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.amount-field:focus {
  border-color: var(--color-primary);
}

.currency-symbol {
  font-size: 1.5rem;
  color: var(--color-on-surface-muted);
  font-weight: var(--font-weight-medium);
}
```

---

## 支付确认

```html
<div class="payment-confirm">
  <div class="payment-amount">
    <span class="amount">¥128.00</span>
    <span class="receiver">付给 星巴克咖啡</span>
  </div>
  <div class="payment-method">
    <span>支付方式</span>
    <div class="method-selector">
      <span>招商银行 ****1234</span>
      <Icon name="chevron-right" />
    </div>
  </div>
  <button class="btn-primary btn-block">确认支付</button>
</div>
```

```css
.payment-confirm {
  padding: var(--space-6);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-2xl);
  margin: var(--space-4);
}

.payment-amount {
  text-align: center;
  padding: var(--space-6) 0;
  border-bottom: 1px solid var(--color-border);
}

.payment-amount .amount {
  display: block;
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.payment-amount .receiver {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-on-surface-muted);
}

.btn-block {
  width: 100%;
  height: 48px;
  margin-top: var(--space-6);
}
```

---

## 关键 Token 偏向

```css
/* 间距紧凑（信息密度中等） */
--space-section: var(--space-6);    /* 24px 区块 */

/* 圆角中等（稳重 + 亲和） */
--radius-button: var(--radius-md);
--radius-card: var(--radius-lg);

/* 数字字体（关键）等宽 */
--font-variant-numeric: tabular-nums;

/* 字号偏大（金额显示） */
--font-size-amount: 2rem;
--font-size-amount-hero: 2.5rem;

/* 阴影柔和（专业感） */
--shadow-card: var(--shadow-sm);
--shadow-elevated: var(--shadow-md);
```

---

## 推荐调色板

- **金融稳重**（默认）— 深绿 + 金，Revolut 风
- **2B 灰蓝** — 银行、信用卡管理
- **冷调极简** — 数字银行、加密货币
- **数据深色**（可选）— 投资 / 加密 / 高级用户

---

## 反模式

- ❌ 装饰性动效（金融需要稳重）
- ❌ 渐变文字
- ❌ 紫色渐变 + 白色
- ❌ 模糊金额展示（必须可读）
- ❌ 缺少关键操作确认
- ❌ 错误信息不明确
- ❌ 没有 PIN/生物识别
- ❌ 网络异常无降级
- ❌ 大数字 hero-metric 模板
- ❌ 浮动装饰元素干扰交易

---

## 安全规范

- **永远确认** 转账、支付关键操作
- **金额大写 + 数字** 双重展示（不易出错）
- **关键操作倒计时** 防止误触
- **生物识别 / PIN** 强制要求
- **交易回执** 清晰可保存
- **超时退出** 5 分钟无操作自动登出
- **遮挡敏感信息** 截屏保护 + 后台模糊
- **HTTPS 强制** + 证书校验

---

## 验证清单

- [ ] 金额等宽数字（tabular-nums）
- [ ] 关键操作二次确认
- [ ] 生物识别 / PIN 强制
- [ ] 错误信息明确且近源
- [ ] 网络异常有降级
- [ ] 超时自动退出
- [ ] 截屏保护
- [ ] 触摸目标 ≥44pt
- [ ] 减弱动效模式
- [ ] 数字大小合适（不疲劳）
- [ ] 没有 AI slop
