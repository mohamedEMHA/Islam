/** Parse AlAdhan DD-MM-YYYY into a local Date at midnight. */
export function parseDmy(dateStr: string): Date | null {
  const parts = dateStr.trim().split('-').map(Number)
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return null
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
  const date = new Date(yyyy, mm - 1, dd)
  if (Number.isNaN(date.getTime())) return null
  if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
    return null
  }
  date.setHours(0, 0, 0, 0)
  return date
}
