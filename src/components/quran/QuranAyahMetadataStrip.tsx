import { useTranslation } from 'react-i18next'
import type { AyahMetadata } from '@/types/quran'

interface MetadataChip {
  key: string
  icon: string
  label: string
  value: number
}

interface QuranAyahMetadataStripProps {
  ayahNumber: number
  metadata?: AyahMetadata
}

export function QuranAyahMetadataStrip({ ayahNumber, metadata }: QuranAyahMetadataStripProps) {
  const { t } = useTranslation()

  const chips: MetadataChip[] = [
    {
      key: 'ayah',
      icon: 'format_list_numbered',
      label: t('quranReader.meta.ayah'),
      value: ayahNumber,
    },
  ]

  if (metadata?.page != null) {
    chips.push({
      key: 'page',
      icon: 'book_2',
      label: t('quranReader.meta.page'),
      value: metadata.page,
    })
  }
  if (metadata?.juz != null) {
    chips.push({
      key: 'juz',
      icon: 'bookmark',
      label: t('quranReader.meta.juz'),
      value: metadata.juz,
    })
  }
  if (metadata?.hizbQuarter != null) {
    chips.push({
      key: 'hizbQuarter',
      icon: 'segment',
      label: t('quranReader.meta.hizbQuarter'),
      value: metadata.hizbQuarter,
    })
  }
  if (metadata?.manzil != null) {
    chips.push({
      key: 'manzil',
      icon: 'pin_drop',
      label: t('quranReader.meta.manzil'),
      value: metadata.manzil,
    })
  }
  if (metadata?.ruku != null) {
    chips.push({
      key: 'ruku',
      icon: 'view_list',
      label: t('quranReader.meta.ruku'),
      value: metadata.ruku,
    })
  }

  return (
    <div className="flex flex-wrap gap-1.5" dir="ltr">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-hairline bg-cream-deep/40 font-label-sm text-[11px] leading-tight text-stone"
        >
          <span className="material-symbols-outlined text-[12px] text-secondary" aria-hidden>
            {chip.icon}
          </span>
          <span className="text-ink-soft">{chip.label}</span>
          <span className="text-ink-black font-medium tabular-nums">{chip.value}</span>
        </span>
      ))}
    </div>
  )
}
