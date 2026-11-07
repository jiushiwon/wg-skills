import { ref, computed } from 'vue';

export function useDatePicker(props: {
  format?: string;
  type?: 'date' | 'daterange' | 'month' | 'year';
}) {
  const selectedDate = ref<Date | null>(null);
  const selectedRange = ref<[Date | null, Date | null]>([null, null]);

  const formatDate = (date: Date): string => {
    const format = props.format || 'YYYY-MM-DD';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return format.replace('YYYY', String(y)).replace('MM', m).replace('DD', d);
  };

  const displayValue = computed(() => {
    if (props.type === 'daterange') {
      if (!selectedRange.value[0]) return '';
      if (!selectedRange.value[1]) return '开始 - 结束';
      return `${formatDate(selectedRange.value[0])} - ${formatDate(selectedRange.value[1])}`;
    }
    return selectedDate.value ? formatDate(selectedDate.value) : '';
  });

  return {
    selectedDate,
    selectedRange,
    formatDate,
    displayValue,
  };
}