/**
 * 表单校验规则的唯一来源（避免各页面各写一套正则）。
 *
 * 正则表示法与 `vue-form-skill/references/form-contract.md` §3.2
 * 「文本类子类型 + 正则映射（自动推导）」完全一致：
 * 手机号 / 邮箱 属于文本类的 **subType**（契约写法 `{ type: 'input', subType: 'phone' }`），
 * 不是独立的字段类型，所以这里只提供规则片段，不提供新的 type。
 */

export const PHONE_PATTERN = /^1[3-9]\d{9}$/;
export const EMAIL_PATTERN = /^[\w.-]+@[\w.-]+\.\w+$/;

/** 必填规则 */
export function required(message: string, trigger: FormRule['trigger'] = 'blur'): FormRule {
  return { required: true, message, trigger };
}

/** 文本长度规则（对应契约的 minlength / maxlength） */
export function length(min: number, max: number, label: string): FormRule {
  return { min, max, message: `${label}长度需为 ${min}-${max} 个字符` };
}

/** 手机号规则（对应 subType: 'phone'） */
export const phoneRule: FormRule = {
  pattern: PHONE_PATTERN,
  message: '请输入正确的手机号'
};

/** 邮箱规则（对应 subType: 'email'） */
export const emailRule: FormRule = {
  pattern: EMAIL_PATTERN,
  message: '请输入正确的邮箱地址'
};

/** URL 规则（对应 subType: 'url' 或 callback_url 字段） */
export const URL_PATTERN = /^https?:\/\/[\w.-]+(?::\d+)?(?:\/[\w./?=&%-]*)?$/;
export const urlRule: FormRule = {
  pattern: URL_PATTERN,
  message: '请输入正确的 URL（http/https 开头）'
};

/** 状态类字段选项：后端为 Integer(0/1)，禁止用 switch 绑 number（form-contract §十三 R3） */
export const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
];
