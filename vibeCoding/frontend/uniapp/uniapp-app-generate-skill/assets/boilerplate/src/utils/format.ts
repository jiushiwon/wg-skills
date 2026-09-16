export function formatPrice(value: number): string {
  return `¥${value.toFixed(2)}`;
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toFixed(fractionDigits);
}
