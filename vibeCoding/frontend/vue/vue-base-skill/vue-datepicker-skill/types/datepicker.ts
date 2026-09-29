export interface Shortcut {
  text: string;
  value: () => [Date, Date] | Date;
}

export interface DatePickerProps {
  modelValue?: string;
  type?: 'date' | 'daterange' | 'month' | 'year';
  placeholder?: string;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
  format?: string;
  shortcuts?: Shortcut[];
  clearable?: boolean;
}

export interface DatePickerEmits {
  'update:modelValue': [value: string];
  change: [value: string];
}