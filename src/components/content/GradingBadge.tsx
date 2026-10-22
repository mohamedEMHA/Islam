import type { HadithGrade } from '@/types/hadith'
import { Badge } from '@/components/ui/Badge'

const GRADE_MAP: Record<HadithGrade, { label: string; variant: 'success' | 'caution' | 'neutral' }> = {
  sahih: { label: 'Sahih', variant: 'success' },
  hasan: { label: 'Hasan', variant: 'caution' },
  daif: { label: "Da'if", variant: 'neutral' },
  unknown: { label: 'Ungraded', variant: 'neutral' },
}

export function GradingBadge({ grade }: { grade: HadithGrade }) {
  const { label, variant } = GRADE_MAP[grade]
  return <Badge variant={variant}>{label}</Badge>
}
