# validation-rules

> 校验规则库。内置常用校验规则，支持自定义扩展。

## 内置规则

```typescript
// 内置规则库（不引入第三方，自行实现）
export const builtinRules = {
  // 必填
  required: (message = '此项为必填项'): FormRule => ({
    required: true,
    message,
  }),

  // 字符串长度
  length: (len: number, message?: string): FormRule => ({
    len,
    message: message ?? `长度必须为 ${len} 个字符`,
  }),

  // 最小长度
  minLength: (min: number, message?: string): FormRule => ({
    min,
    message: message ?? `最少 ${min} 个字符`,
  }),

  // 最大长度
  maxLength: (max: number, message?: string): FormRule => ({
    max,
    message: message ?? `最多 ${max} 个字符`,
  }),

  // 邮箱
  email: (message = '请输入正确的邮箱地址'): FormRule => ({
    type: 'email',
    message,
  }),

  // URL
  url: (message = '请输入正确的 URL'): FormRule => ({
    type: 'url',
    message,
  }),

  // 手机号（中国大陆）
  phone: (message = '请输入正确的手机号'): FormRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message,
  }),

  // 身份证号（中国大陆）
  idCard: (message = '请输入正确的身份证号'): FormRule => ({
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message,
  }),

  // 数字
  number: (message = '请输入数字'): FormRule => ({
    pattern: /^-?\d+(\.\d+)?$/,
    message,
  }),

  // 整数
  integer: (message = '请输入整数'): FormRule => ({
    pattern: /^-?\d+$/,
    message,
  }),

  // 正数
  positive: (message = '请输入正数'): FormRule => ({
    validator: (value) => {
      const num = Number(value)
      return (!isNaN(num) && num > 0) || message
    },
  }),

  // 负数
  negative: (message = '请输入负数'): FormRule => ({
    validator: (value) => {
      const num = Number(value)
      return (!isNaN(num) && num < 0) || message
    },
  }),

  // 范围
  range: (min: number, max: number, message?: string): FormRule => ({
    validator: (value) => {
      const num = Number(value)
      return (!isNaN(num) && num >= min && num <= max) || message ?? `请输入 ${min} 到 ${max} 之间的数字`
    },
  }),

  // 中文
  chinese: (message = '请输入中文'): FormRule => ({
    pattern: /^[一-龥]+$/,
    message,
  }),

  // 英文
  english: (message = '请输入英文'): FormRule => ({
    pattern: /^[a-zA-Z]+$/,
    message,
  }),

  // 字母数字
  alphanumeric: (message = '只能输入字母和数字'): FormRule => ({
    pattern: /^[a-zA-Z0-9]+$/,
    message,
  }),

  // 密码强度（至少 8 位，包含大小写字母和数字）
  strongPassword: (message = '密码需包含大小写字母和数字，至少 8 位'): FormRule => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    message,
  }),

  // 确认密码
  confirmPassword: (getPassword: () => string, message = '两次输入的密码不一致'): FormRule => ({
    validator: (value) => value === getPassword() || message,
  }),

  // IP 地址
  ip: (message = '请输入正确的 IP 地址'): FormRule => ({
    pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    message,
  }),
}
```

## 使用示例

```typescript
import { builtinRules } from './validation-rules'

const rules = {
  username: [
    builtinRules.required('请输入用户名'),
    builtinRules.minLength(3, '用户名至少 3 个字符'),
    builtinRules.maxLength(20, '用户名最多 20 个字符'),
    builtinRules.alphanumeric('用户名只能包含字母和数字'),
  ],
  email: [
    builtinRules.required('请输入邮箱'),
    builtinRules.email(),
  ],
  phone: [
    builtinRules.phone(),
  ],
  password: [
    builtinRules.required('请输入密码'),
    builtinRules.strongPassword(),
  ],
  confirmPassword: [
    builtinRules.required('请确认密码'),
    builtinRules.confirmPassword(() => form.password),
  ],
  age: [
    builtinRules.number('请输入数字'),
    builtinRules.range(0, 150, '年龄需在 0-150 之间'),
  ],
}
```

## 自定义校验器

```typescript
// 异步校验：检查用户名是否已存在
const checkUsername: FormRule = {
  validator: async (value: unknown) => {
    if (typeof value !== 'string' || value.length < 3) return true
    const res = await fetch(`/api/check-username?name=${value}`)
    const data = await res.json()
    return data.exists ? '用户名已存在' : true
  },
  trigger: 'blur',
}

const rules = {
  username: [
    builtinRules.required(),
    checkUsername,
  ],
}
```

## 异步校验实现

```typescript
// base-form 内部的异步校验支持
async function runRule(rule: FormRule, value: unknown, prop: string): Promise<{ valid: boolean; message: string }> {
  // 同步校验
  if (rule.required && isEmpty(value)) {
    return { valid: false, message: rule.message ?? `${prop} 不能为空` }
  }

  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return { valid: false, message: rule.message ?? '格式不正确' }
  }

  if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
    return { valid: false, message: rule.message ?? `最少 ${rule.min} 个字符` }
  }

  if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
    return { valid: false, message: rule.message ?? `最多 ${rule.max} 个字符` }
  }

  // 异步校验
  if (rule.validator) {
    try {
      const result = await rule.validator(value, rule)
      if (result === true) return { valid: true, message: '' }
      return { valid: false, message: typeof result === 'string' ? result : rule.message ?? '校验失败' }
    } catch (err) {
      return { valid: false, message: rule.message ?? '校验异常' }
    }
  }

  return { valid: true, message: '' }
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}
```
