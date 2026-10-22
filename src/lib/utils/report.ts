export const REPORT_EMAIL = 'support@islam.house'

export function buildReportMailto(page: string): string {
  const subject = encodeURIComponent('Islam App Report')
  const body = encodeURIComponent(`Page: ${page}\n\nDescribe the issue:\n`)
  return `mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`
}
