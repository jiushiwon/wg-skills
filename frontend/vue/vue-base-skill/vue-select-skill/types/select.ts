export interface SelectOption {
  label: string;
  value: unknown;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps {
  modelValue?: unknown;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxTagCount?: number;
}

export interface SelectEmits {
  'update:modelValue': [value: unknown];
  change: [value: unknown];
  clear: [];
}