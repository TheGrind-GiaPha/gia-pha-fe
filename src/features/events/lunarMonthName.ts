export function lunarMonthName(n: number): string {
  if (n === 1) return 'Tháng Giêng'
  if (n === 12) return 'Tháng Chạp'
  return `Tháng ${n}`
}
