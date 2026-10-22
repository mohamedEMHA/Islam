import { useEffect, useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/ui/PageShell'
import { Button } from '@/components/ui/Button'
import { HoverCard } from '@/components/motion/HoverCard'
import { useDailyReflection } from '@/lib/hooks/useDailyReflection'
import { getSurah } from '@/lib/api/quran'

export function ShareCardPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const cardRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const [reference, setReference] = useState('')
  const [arabic, setArabic] = useState<string | undefined>()
  const [loadingAyah, setLoadingAyah] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const explicitText = params.get('text')
  const explicitRef = params.get('ref')
  const type = params.get('type')
  const surahParam = params.get('surah')
  const ayahParam = params.get('ayah')

  const useReflectionFallback = useMemo(
    () => !explicitText && !(type === 'ayah' && surahParam && ayahParam),
    [explicitText, type, surahParam, ayahParam],
  )

  const { reflection } = useDailyReflection(useReflectionFallback)

  useEffect(() => {
    if (explicitText) {
      setText(explicitText)
      setReference(explicitRef ?? '')
      setArabic(undefined)
      return
    }

    if (type === 'ayah' && surahParam && ayahParam) {
      return
    }

    setText(reflection.text)
    setReference(explicitRef ?? reflection.reference)
    setArabic(type === 'hadith' ? undefined : reflection.arabic)
  }, [explicitText, explicitRef, type, surahParam, ayahParam, reflection])

  useEffect(() => {
    if (type !== 'ayah' || !surahParam || !ayahParam || explicitText) return

    const surah = Number(surahParam)
    const ayah = Number(ayahParam)
    if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(ayah) || ayah < 1) {
      return
    }

    let active = true
    setLoadingAyah(true)

    getSurah(surah, 'uthmani', 'en.sahih')
      .then(({ arabic: arabicAyahs, translation }) => {
        if (!active) return
        const idx = ayah - 1
        setText(translation[idx]?.text ?? '')
        setReference(explicitRef ?? `Surah ${surah}:${ayah}`)
        setArabic(arabicAyahs[idx]?.text)
      })
      .catch(() => {
        if (!active) return
        setText(t('pages.share.ayahUnavailable'))
        setReference(`Surah ${surah}:${ayah}`)
        setArabic(undefined)
      })
      .finally(() => {
        if (active) setLoadingAyah(false)
      })

    return () => {
      active = false
    }
  }, [type, surahParam, ayahParam, explicitText, explicitRef, t])

  const downloadImage = async () => {
    setExportError(null)
    try {
      const { default: html2canvas } = await import('html2canvas')
      if (!cardRef.current) return
      await document.fonts.ready
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#FFFDF8',
        scale: 2,
        useCORS: true,
        allowTaint: false,
      })
      const link = document.createElement('a')
      link.download = 'islam-share.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      canvas.width = 0
      canvas.height = 0
    } catch {
      setExportError(t('pages.share.exportError'))
    }
  }

  const webShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Islam', text: `"${text}", ${reference}` })
    } else {
      await downloadImage()
    }
  }

  return (
    <PageShell title={t('pages.share.title')} subtitle={t('pages.share.subtitle')}>
      <div className="max-w-lg mx-auto space-y-6">
        <HoverCard className="p-0 shadow-sm overflow-hidden">
          <div ref={cardRef} className="p-8 text-center bg-paper-white dark:bg-dark-surface">
          <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4">
            {t('pages.share.brand')}
          </p>
          {loadingAyah ? (
            <p className="font-body-md text-body-md text-stone">{t('common.loading')}</p>
          ) : (
            <>
              {arabic && (
                <p dir="rtl" className="font-arabic-quran text-arabic-quran text-primary mb-6">
                  {arabic}
                </p>
              )}
              <p className="font-heading-h3 text-heading-h3 text-ink-black leading-relaxed mb-4">
                &ldquo;{text}&rdquo;
              </p>
              <p className="font-body-md text-body-md text-stone">{reference}</p>
            </>
          )}
          </div>
        </HoverCard>
        {exportError && (
          <p role="alert" className="text-center font-body-md text-body-md text-error">
            {exportError}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={downloadImage} disabled={loadingAyah || !text}>
            {t('common.downloadPng')}
          </Button>
          <Button variant="secondary" onClick={webShare} disabled={loadingAyah || !text}>
            {t('common.share')}
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
