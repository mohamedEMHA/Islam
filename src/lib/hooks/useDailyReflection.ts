import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDailySpiritualTab } from '@/lib/hooks/useDailySpiritualFeed'
import { daySeed } from '@/lib/utils/dailySpiritual'

export interface DailyReflection {
  type: 'ayah' | 'hadith'
  text: string
  reference: string
  arabic?: string
}

const FALLBACK: DailyReflection = {
  type: 'ayah',
  text: 'And He found you lost and guided [you].',
  reference: 'Surah Ad-Duhaa [93:7]',
  arabic: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ',
}

export function useDailyReflection(enabled = true) {
  const { t } = useTranslation()
  const seed = daySeed()
  const useHadith = seed % 2 === 0
  const tab = useHadith ? 'hadith' : 'verse'
  const { data, isLoading, isError } = useDailySpiritualTab(tab, enabled)

  const reflection = useMemo<DailyReflection>(() => {
    if (!data) {
      return {
        ...FALLBACK,
        text: t('home.fallbackReflection'),
      }
    }

    if (data.type === 'verse') {
      return {
        type: 'ayah',
        text: data.text,
        reference: data.reference,
        arabic: data.arabic,
      }
    }

    return {
      type: 'hadith',
      text: data.text,
      reference: data.reference,
      arabic: data.arabic,
    }
  }, [data, t])

  return {
    reflection: isError
      ? {
          ...FALLBACK,
          text: t('home.fallbackReflection'),
        }
      : reflection,
    loading: enabled && isLoading,
  }
}
