import { buildReportMailto } from '@/lib/utils/report'

interface ReportIssueButtonProps {
  page: string
  className?: string
}

export function ReportIssueButton({ page, className = '' }: ReportIssueButtonProps) {
  return (
    <a
      href={buildReportMailto(page)}
      className={`text-xs text-stone hover:text-error transition-colors inline-flex items-center gap-1 ${className}`}
    >
      <span className="material-symbols-outlined text-sm">flag</span>
      Report an issue
    </a>
  )
}
