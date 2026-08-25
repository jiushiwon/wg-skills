/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @returns 格式：YYYY-MM-DD HH:mm
 */
export function formatDateTime(date: Date | number | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @returns 格式：YYYY-MM-DD
 */
export function formatDate(date: Date | number | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
