import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { TabPills } from '@/components/ui/TabPills'
import { TabFade } from '@/components/motion/TabFade'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AttributionChip } from '@/components/content/AttributionChip'
import { cn } from '@/lib/utils/format'
import { useHalalProductLookup } from '@/lib/hooks/useHalalProductLookup'
import { useBarcodeScanner } from '@/lib/hooks/useBarcodeScanner'
import { lookupENumber, searchENumbers, type HalalStatus } from '@/lib/halal/eNumbers'
import { normalizeENumber } from '@/lib/halal/parseIngredients'
import { OPEN_FOOD_FACTS_ATTRIBUTION } from '@/lib/api/openFoodFacts'
import type { AdditiveResult } from '@/lib/halal/types'

type TabId = 'scan' | 'lookup'

const STATUS_BADGE: Record<HalalStatus, 'success' | 'error' | 'caution' | 'neutral'> = {
  halal: 'success',
  haram: 'error',
  mushbooh: 'caution',
  unknown: 'neutral',
}

function StatusBadge({ status }: { status: HalalStatus }) {
  const { t } = useTranslation()
  return <Badge variant={STATUS_BADGE[status]}>{t(`pages.halalVerification.status.${status}`)}</Badge>
}

function AdditiveRow({ additive }: { additive: AdditiveResult }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 py-2 border-b border-hairline dark:border-dark-border last:border-0">
      <div className="min-w-0">
        <p className="font-medium text-ink dark:text-dark-text">
          {additive.code}
          {additive.name ? ` · ${additive.name}` : ''}
        </p>
        {additive.notes && (
          <p className="text-xs text-stone dark:text-dark-text-secondary mt-0.5">{additive.notes}</p>
        )}
        {additive.source && (
          <p className="text-xs text-stone dark:text-dark-text-secondary">
            {t('pages.halalVerification.source')}: {additive.source}
          </p>
        )}
      </div>
      <StatusBadge status={additive.status} />
    </div>
  )
}

function VerdictCard({
  verdict,
  hasHalalLabel,
  additives,
  productName,
  productImage,
  ingredientsText,
  barcode,
}: {
  verdict: HalalStatus
  hasHalalLabel: boolean
  additives: AdditiveResult[]
  productName?: string
  productImage?: string
  ingredientsText?: string
  barcode?: string
}) {
  const { t } = useTranslation()

  return (
    <Card className="mt-6 bg-paper dark:bg-dark-surface border-hairline dark:border-dark-border">
      <div className="flex flex-col sm:flex-row gap-4">
        {productImage && (
          <img
            src={productImage}
            alt={productName ?? t('pages.halalVerification.productImage')}
            className="w-24 h-24 object-contain rounded bg-cream-deep dark:bg-dark-bg self-start"
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0">
          {productName && (
            <h3 className="text-lg font-semibold text-ink dark:text-dark-text">{productName}</h3>
          )}
          {barcode && (
            <p className="text-xs text-stone dark:text-dark-text-secondary mt-1">
              {t('pages.halalVerification.barcode')}: {barcode}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-sm text-ink-soft dark:text-dark-text-secondary">
              {t('pages.halalVerification.overallVerdict')}:
            </span>
            <StatusBadge status={verdict} />
            {hasHalalLabel && (
              <Badge variant="success">{t('pages.halalVerification.halalLabelDetected')}</Badge>
            )}
          </div>
        </div>
      </div>

      {ingredientsText && (
        <div className="mt-4">
          <p className="font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary mb-1">
            {t('pages.halalVerification.ingredients')}
          </p>
          <p className="text-sm text-ink dark:text-dark-text leading-relaxed">{ingredientsText}</p>
        </div>
      )}

      <div className="mt-4">
        <p className="font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary mb-2">
          {t('pages.halalVerification.additives')}
          {additives.length > 0 && ` (${additives.length})`}
        </p>
        {additives.length === 0 ? (
          <p className="text-sm text-stone dark:text-dark-text-secondary">
            {t('pages.halalVerification.noAdditives')}
          </p>
        ) : (
          <div>{additives.map((a) => <AdditiveRow key={a.code} additive={a} />)}</div>
        )}
      </div>

      {barcode && (
        <AttributionChip
          source={OPEN_FOOD_FACTS_ATTRIBUTION.name}
          url={OPEN_FOOD_FACTS_ATTRIBUTION.productUrl(barcode)}
          page="halal_verification"
        />
      )}
    </Card>
  )
}

export function HalalVerificationPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabId>('scan')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [eCodeInput, setECodeInput] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)

  const {
    loading,
    error,
    analysis,
    lookup,
    reset,
    productName,
    productImage,
    ingredientsText,
    barcode,
  } = useHalalProductLookup()

  const handleBarcodeDetected = (value: string) => {
    setBarcodeInput(value)
    setCameraOpen(false)
    lookup(value)
  }

  const scanner = useBarcodeScanner({
    enabled: cameraOpen,
    onDetected: handleBarcodeDetected,
  })

  const eLookupResult = useMemo(() => {
    const normalized = normalizeENumber(eCodeInput)
    if (!normalized) return null
    return lookupENumber(normalized)
  }, [eCodeInput])

  const eSearchResults = useMemo(() => {
    if (eCodeInput.trim().length < 2) return []
    return searchENumbers(eCodeInput, 12)
  }, [eCodeInput])

  const handleScanSubmit = (event: FormEvent) => {
    event.preventDefault()
    lookup(barcodeInput)
  }

  const toggleCamera = async () => {
    if (cameraOpen) {
      scanner.stop()
      setCameraOpen(false)
      return
    }
    setCameraOpen(true)
    await scanner.start()
  }

  return (
    <PageShell
      title={t('pages.halalVerification.title')}
      subtitle={t('pages.halalVerification.subtitle')}
    >
      <div
        role="note"
        className="mb-6 rounded-xl border border-caution/40 bg-caution/10 px-4 py-3 font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary"
      >
        {t('pages.halalVerification.scholarlyDisclaimer')}
      </div>
      <TabPills
        tabs={[
          { id: 'scan', label: t('pages.halalVerification.tabs.scan') },
          { id: 'lookup', label: t('pages.halalVerification.tabs.lookup') },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-8"
      />

      <TabFade activeKey={tab}>
        {tab === 'scan' ? (
          <div className="space-y-6">
            <form onSubmit={handleScanSubmit} className="space-y-4">
              <Input
                label={t('pages.halalVerification.barcodeInput')}
                placeholder={t('pages.halalVerification.barcodePlaceholder')}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading || !barcodeInput.trim()}
                  className={cn(
                    'px-5 py-2.5 rounded-full font-label-sm text-label-sm transition-colors',
                    'bg-secondary text-white hover:opacity-90 disabled:opacity-50',
                  )}
                >
                  {loading ? t('pages.halalVerification.loading') : t('pages.halalVerification.lookupProduct')}
                </button>
                {scanner.supported && (
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={cn(
                      'px-5 py-2.5 rounded-full font-label-sm text-label-sm border transition-colors',
                      cameraOpen
                        ? 'bg-green-soft border-secondary text-secondary'
                        : 'border-hairline dark:border-dark-border text-ink-soft hover:border-secondary',
                    )}
                  >
                    <span className="material-symbols-outlined text-sm align-middle me-1">barcode_scanner</span>
                    {cameraOpen
                      ? t('pages.halalVerification.stopCamera')
                      : t('pages.halalVerification.scanCamera')}
                  </button>
                )}
                {(barcodeInput || analysis) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBarcodeInput('')
                      reset()
                    }}
                    className="px-5 py-2.5 rounded-full font-label-sm text-label-sm text-stone hover:text-ink"
                  >
                    {t('pages.halalVerification.clear')}
                  </button>
                )}
              </div>
            </form>

            {!scanner.supported && (
              <p className="text-xs text-stone dark:text-dark-text-secondary">
                {t('pages.halalVerification.cameraUnsupported')}
              </p>
            )}

            {scanner.error === 'permission' && (
              <p className="text-sm text-error">{t('pages.halalVerification.cameraPermission')}</p>
            )}

            {cameraOpen && (
              <div className="relative overflow-hidden rounded-lg border border-hairline dark:border-dark-border bg-black">
                <video
                  ref={scanner.videoRef}
                  className="w-full aspect-video object-cover"
                  playsInline
                  muted
                />
                <p className="absolute bottom-2 inset-x-0 text-center text-xs text-white/80">
                  {t('pages.halalVerification.cameraHint')}
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-error">{t(error)}</p>
            )}

            {analysis && (
              <VerdictCard
                verdict={analysis.verdict}
                hasHalalLabel={analysis.hasHalalLabel}
                additives={analysis.additives}
                productName={productName}
                productImage={productImage}
                ingredientsText={ingredientsText}
                barcode={barcode}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Input
              label={t('pages.halalVerification.eCodeInput')}
              placeholder={t('pages.halalVerification.eCodePlaceholder')}
              value={eCodeInput}
              onChange={(e) => setECodeInput(e.target.value)}
              autoComplete="off"
            />

            {eLookupResult && (
              <Card className="bg-paper dark:bg-dark-surface border-hairline dark:border-dark-border">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink dark:text-dark-text">
                      {eLookupResult.code} · {eLookupResult.name}
                    </h3>
                    <p className="text-sm text-stone dark:text-dark-text-secondary mt-1">
                      {eLookupResult.notes}
                    </p>
                    <p className="text-xs text-stone dark:text-dark-text-secondary mt-1">
                      {t('pages.halalVerification.source')}: {eLookupResult.source}
                    </p>
                  </div>
                  <StatusBadge status={eLookupResult.status} />
                </div>
              </Card>
            )}

            {eCodeInput.trim().length >= 2 && !eLookupResult && eSearchResults.length === 0 && (
              <p className="text-sm text-stone dark:text-dark-text-secondary">
                {t('pages.halalVerification.eCodeNotFound')}
              </p>
            )}

            {eSearchResults.length > 0 && !eLookupResult && (
              <div className="space-y-2">
                <p className="font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary">
                  {t('pages.halalVerification.searchResults')}
                </p>
                {eSearchResults.map((entry) => (
                  <button
                    key={entry.code}
                    type="button"
                    onClick={() => setECodeInput(entry.code)}
                    className="w-full text-start px-4 py-3 rounded-lg border border-hairline dark:border-dark-border hover:border-secondary transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-ink dark:text-dark-text">
                        {entry.code} · {entry.name}
                      </span>
                      <StatusBadge status={entry.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <AttributionChip
              source={t('pages.halalVerification.localDatabase')}
              page="halal_verification"
            />
          </div>
        )}
      </TabFade>
    </PageShell>
  )
}
