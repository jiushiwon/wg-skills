export function isEmpty(value: unknown): boolean {
  return value === '' || value === null || value === undefined;
}

export function isPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value);
}
