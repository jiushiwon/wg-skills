/**
 * 表单校验规则类型（全局声明，页面免导入直接使用）。
 *
 * 与 `vue-form-skill/types.ts` 的 `FormRule`、`references/form-contract.md` §六 的
 * 推导结果一致：rules 由字段契约（required / minlength / maxlength / min / max /
 * pattern / subType）推导而来，页面只做「契约 → rules」的翻译，不要再写第二套正则。
 *
 * ⚠️ 一旦出现 `export`，本文件变成模块，全局类型失效，故此处不写 export。
 */
interface FormRule {
  required?: boolean;
  message?: string;
  trigger?: 'blur' | 'change';
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'date' | 'url' | 'email';
  validator?: (value: unknown, rule: FormRule) => boolean | string | Promise<boolean | string>;
}

/** `<base-form :rules="...">` 的形状：字段名 → 规则数组 */
type FormRules = Record<string, FormRule[]>;
