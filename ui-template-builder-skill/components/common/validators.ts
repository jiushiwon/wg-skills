/**
 * 通用表单校验规则
 * React / Vue 表单组件共享同一套基础校验逻辑
 */

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  type?: 'email' | 'phone' | 'url'
  pattern?: RegExp
  message?: string
  validator?: (value: any, model?: Record<string, any>) => boolean | Promise<boolean>
  asyncValidator?: (value: any, model?: Record<string, any>) => Promise<boolean>
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^1[3-9]\d{9}$/
const URL_REGEX = /^https?:\/\/.+/

/**
 * 校验单个字段
 * @param value 字段值
 * @param rules 校验规则数组
 * @param model 完整表单数据（供自定义校验器使用）
 * @returns 校验通过返回 null，否则返回错误信息
 */
export async function validateField(
  value: any,
  rules: ValidationRule[],
  model?: Record<string, any>
): Promise<string | null> {
  for (const rule of rules) {
    // 必填校验
    if (rule.required) {
      if (value === '' || value === null || value === undefined) {
        return rule.message || '此项为必填项'
      }
    }

    // 跳过空值的其他格式校验（除非明确 required）
    if (value === '' || value === null || value === undefined) {
      continue
    }

    // 最小长度
    if (rule.min && String(value).length < rule.min) {
      return rule.message || `长度不能少于 ${rule.min} 个字符`
    }

    // 最大长度
    if (rule.max && String(value).length > rule.max) {
      return rule.message || `长度不能超过 ${rule.max} 个字符`
    }

    // 正则校验
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return rule.message || '格式不正确'
    }

    // 邮箱校验
    if (rule.type === 'email' && !EMAIL_REGEX.test(String(value))) {
      return rule.message || '请输入正确的邮箱格式'
    }

    // 手机号校验
    if (rule.type === 'phone' && !PHONE_REGEX.test(String(value))) {
      return rule.message || '请输入正确的手机号'
    }

    // URL 校验
    if (rule.type === 'url' && !URL_REGEX.test(String(value))) {
      return rule.message || '请输入正确的 URL 地址'
    }

    // 自定义校验器（支持同步/异步）
    if (rule.validator) {
      try {
        const result = await rule.validator(value, model)
        if (!result) {
          return rule.message || '验证失败'
        }
      } catch (err: any) {
        return err.message || rule.message || '验证失败'
      }
    }

    // 异步校验器（兼容旧版 asyncValidator）
    if (rule.asyncValidator) {
      try {
        await rule.asyncValidator(value, model)
      } catch (err: any) {
        return err.message || rule.message || '验证失败'
      }
    }
  }

  return null
}

/**
 * 必填校验快捷函数
 */
export function required(message = '此项为必填项'): ValidationRule {
  return { required: true, message }
}

/**
 * 长度范围校验快捷函数
 */
export function length(min: number, max: number, message?: string): ValidationRule {
  return { min, max, message: message || `长度需在 ${min} 到 ${max} 个字符之间` }
}

/**
 * 邮箱校验快捷函数
 */
export function email(message = '请输入正确的邮箱格式'): ValidationRule {
  return { type: 'email', message }
}

/**
 * 手机号校验快捷函数
 */
export function phone(message = '请输入正确的手机号'): ValidationRule {
  return { type: 'phone', message }
}
