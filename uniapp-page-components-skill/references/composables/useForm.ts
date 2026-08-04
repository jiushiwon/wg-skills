/**
 * useForm — 表单校验与提交 Composable
 * ============================================================
 * 配合 form-page / login-page / base-form-item 使用，
 * 统一表单数据、校验规则、提交 loading、重置逻辑。
 *
 * 使用方式：
 *   const { form, errors, submitting, validate, submit, reset }
 *     = useForm({ nickname: '', bio: '' }, (data) => api.saveProfile(data))
 *
 *   // 模板里：
 *   <form-page :loading="submitting" @submit="submit">
 *     <template #form>
 *       <base-form-item label="昵称" required :error="errors.nickname">
 *         <input v-model="form.nickname" />
 *       </base-form-item>
 *     </template>
 *   </form-page>
 */

import { reactive, ref } from 'vue'

type RuleFunc = (value: any, form: Record<string, any>) => string | true | Promise<string | true>
type Rules = Record<string, RuleFunc | RuleFunc[]>

export function useForm<T extends Record<string, any>>(
  initial: T,
  submitter: (data: T) => Promise<void>,
) {
  const form = reactive<T>({ ...initial }) as T
  const errors = reactive<Record<string, string>>({})
  const submitting = ref(false)

  const rulesMap: Rules = {}

  /** 注册校验规则 */
  function rules(r: Rules) {
    Object.assign(rulesMap, r)
  }

  /** 执行校验，返回是否通过 */
  async function validate(): Promise<boolean> {
    let valid = true
    const newErrors: Record<string, string> = {}

    for (const [field, rule] of Object.entries(rulesMap)) {
      const value = (form as any)[field]
      const tests = Array.isArray(rule) ? rule : [rule]

      for (const test of tests) {
        const result = await test(value, form)
        if (result !== true) {
          newErrors[field] = result
          valid = false
          break
        }
      }
    }

    Object.keys(errors).forEach((k) => delete errors[k])
    Object.assign(errors, newErrors)
    return valid
  }

  /** 提交：先校验，通过后调 submitter */
  async function submit() {
    if (submitting.value) return
    const ok = await validate()
    if (!ok) return
    submitting.value = true
    try {
      await submitter({ ...form } as T)
    } finally {
      submitting.value = false
    }
  }

  /** 重置表单 */
  function reset() {
    Object.assign(form, initial)
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  return { form, errors, submitting, rules, validate, submit, reset }
}

/** 内置校验器 */
export const required = (msg = '不能为空') => (v: any) => {
  if (v == null || v === '') return msg
  return typeof v === 'string' && !v.trim() ? msg : true
}
export const isPhone = (msg = '请输入正确的手机号') => (v: string) =>
  /^1[3-9]\d{9}$/.test(v) ? true : msg
export const minLength = (n: number, msg?: string) => (v: string) =>
  v && v.length >= n ? true : (msg || `至少输入 ${n} 个字符`)
export const maxLength = (n: number, msg?: string) => (v: string) =>
  !v || v.length <= n ? true : (msg || `最多输入 ${n} 个字符`)
