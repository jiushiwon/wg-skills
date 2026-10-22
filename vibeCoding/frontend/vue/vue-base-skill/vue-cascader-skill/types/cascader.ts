export interface CascaderOption {
  value: string | number
  label: string
  children?: CascaderOption[]
  disabled?: boolean
  [key: string]: unknown
}

export interface CascaderProps {
  modelValue?: string | string[]
  options?: CascaderOption[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  multiple?: boolean
  checkStrictly?: boolean
  showAllLevels?: boolean
  collapseTags?: boolean
  separator?: string
  size?: 'sm' | 'md' | 'lg'
}

export interface CascaderEmits {
  'update:modelValue': [value: string | string[]]
  change: [value: { value: string | string[]; selectedOptions: CascaderOption[] }]
  clear: []
  expandChange: [data: { value: string | number; option: CascaderOption; resolved: boolean }]
}
