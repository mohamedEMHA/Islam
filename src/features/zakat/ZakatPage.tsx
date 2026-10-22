import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ZAKAT_CURRENCIES, type NisabStandard, type ZakatCurrency } from '@/lib/api/ummah'
import {
  calculateZakatAlFitr,
  ZAKAT_AL_FITR_AMOUNTS,
} from '@/lib/utils/zakat'
import {
  useZakatCalculator,
  type ZakatFormValues,
} from '@/lib/hooks/useZakatCalculator'
import { PageShell } from '@/components/ui/PageShell'
import { TabPills } from '@/components/ui/TabPills'
import { TabFade } from '@/components/motion/TabFade'
import { HoverCard } from '@/components/motion/HoverCard'
import { Input } from '@/components/ui/Input'
import { AttributionChip } from '@/components/content/AttributionChip'
import { cn } from '@/lib/utils/format'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'

export function ZakatPage() {
  const { t } = useTranslation()
  const { formatNumber, formatInteger } = useLocaleFormat()
  const [tab, setTab] = useState<'zakat' | 'fitr'>('zakat')
  const [currency, setCurrency] = useState<ZakatCurrency>('USD')
  const [cash, setCash] = useState(0)
  const [goldGrams, setGoldGrams] = useState(0)
  const [silverGrams, setSilverGrams] = useState(0)
  const [stocks, setStocks] = useState(0)
  const [businessGoods, setBusinessGoods] = useState(0)
  const [liabilities, setLiabilities] = useState(0)
  const [nisabStandard, setNisabStandard] = useState<NisabStandard>('gold')
  const [members, setMembers] = useState(1)

  const formValues = useMemo<ZakatFormValues>(
    () => ({
      currency,
      cash,
      goldGrams,
      silverGrams,
      stocks,
      businessGoods,
      liabilities,
      nisabStandard,
    }),
    [currency, cash, goldGrams, silverGrams, stocks, businessGoods, liabilities, nisabStandard],
  )

  const { result, verification, loading, error, retry } = useZakatCalculator(formValues)

  const fitrDue = calculateZakatAlFitr(members, ZAKAT_AL_FITR_AMOUNTS[currency] ?? 15)

  const formatMoney = (value: number) =>
    formatNumber(value, { maximumFractionDigits: 2 })

  return (
    <PageShell title={t('pages.zakat.title')} subtitle={t('pages.zakat.subtitle')}>
      <TabPills
        tabs={[
          { id: 'zakat', label: t('pages.zakat.tabs.zakat') },
          { id: 'fitr', label: t('pages.zakat.tabs.fitr') },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-8"
      />

      <TabFade activeKey={tab}>
        {tab === 'zakat' ? (
          <div className="space-y-6">
            <div>
              <label className="font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary">
                {t('pages.zakat.currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as ZakatCurrency)}
                className="w-full bg-transparent border-b border-hairline dark:border-dark-border py-2 text-ink dark:text-dark-text focus:outline-none focus:border-secondary"
              >
                {ZAKAT_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary mb-2">
                {t('pages.zakat.nisabStandard')}
              </p>
              <div className="flex gap-2">
                {(['gold', 'silver'] as const).map((standard) => (
                  <button
                    key={standard}
                    type="button"
                    onClick={() => setNisabStandard(standard)}
                    className={cn(
                      'px-4 py-2 rounded-full font-label-sm text-label-sm border transition-colors',
                      nisabStandard === standard
                        ? 'bg-green-soft border-secondary text-secondary'
                        : 'border-hairline dark:border-dark-border text-ink-soft hover:border-secondary',
                    )}
                  >
                    {standard === 'gold'
                      ? t('pages.zakat.nisabGold')
                      : t('pages.zakat.nisabSilver')}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label={t('pages.zakat.cash')}
              type="number"
              min={0}
              value={cash || ''}
              onChange={(e) => setCash(Number(e.target.value))}
            />
            <Input
              label={t('pages.zakat.goldGrams')}
              type="number"
              min={0}
              value={goldGrams || ''}
              onChange={(e) => setGoldGrams(Number(e.target.value))}
            />
            <Input
              label={t('pages.zakat.silverGrams')}
              type="number"
              min={0}
              value={silverGrams || ''}
              onChange={(e) => setSilverGrams(Number(e.target.value))}
            />
            <Input
              label={t('pages.zakat.stocks')}
              type="number"
              min={0}
              value={stocks || ''}
              onChange={(e) => setStocks(Number(e.target.value))}
            />
            <Input
              label={t('pages.zakat.businessGoods')}
              type="number"
              min={0}
              value={businessGoods || ''}
              onChange={(e) => setBusinessGoods(Number(e.target.value))}
            />
            <Input
              label={t('pages.zakat.liabilities')}
              type="number"
              min={0}
              value={liabilities || ''}
              onChange={(e) => setLiabilities(Number(e.target.value))}
            />

            {error && (
              <div className="rounded-lg border border-error/30 bg-error/5 p-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-body-md text-body-md text-error">{t('pages.zakat.calculateError')}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="px-4 py-2 rounded-full border border-hairline font-label-sm text-label-sm text-secondary hover:bg-green-soft transition-colors"
                >
                  {t('common.retry')}
                </button>
              </div>
            )}

            <HoverCard
              className={cn(
                'p-6 bg-green-soft border-secondary/20 dark:bg-dark-surface dark:border-dark-border',
                loading && 'animate-pulse',
              )}
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="font-label-sm text-label-sm text-ink-soft uppercase tracking-wider">
                  {t('pages.zakat.results')}
                </h3>
                {verification?.verified && (
                  <div className="flex items-center gap-1 text-secondary bg-paper-white dark:bg-dark-surface px-2 py-1 rounded shrink-0">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span className="text-[11px] font-bold uppercase tracking-wide">
                      {t('common.verifiedSource')}
                    </span>
                  </div>
                )}
              </div>

              {loading && !result ? (
                <p className="font-body-md text-body-md text-stone">{t('pages.zakat.calculating')}</p>
              ) : result ? (
                <div className="space-y-2">
                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                    {t('pages.zakat.nisab')}: {formatMoney(result.nisab_value)} {currency}
                    {' · '}
                    {result.nisab_standard === 'gold'
                      ? t('pages.zakat.nisabGold')
                      : t('pages.zakat.nisabSilver')}
                  </p>
                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                    {t('pages.zakat.totalWealth')}: {formatMoney(result.breakdown.net_zakatable_wealth)} {currency}
                  </p>
                  <p className="font-heading-h3 text-heading-h3 text-secondary mt-2">
                    {t('pages.zakat.zakatDue')}: {formatMoney(result.zakat_due)} {currency}
                  </p>
                  <p className="font-label-sm text-label-sm text-stone mt-2">
                    {t('pages.zakat.rateNote', { rate: result.rate })}
                  </p>
                  {!result.above_nisab && (
                    <p className="font-label-sm text-label-sm text-stone mt-2">
                      {t('pages.zakat.belowNisab')}
                    </p>
                  )}
                  <p className="font-label-sm text-label-sm text-stone mt-2">
                    {t('pages.zakat.hawlNote')}
                  </p>

                  <div className="mt-4 pt-4 border-t border-secondary/20 space-y-1">
                    <p className="font-label-sm text-label-sm text-ink-soft uppercase tracking-wider">
                      {t('pages.zakat.metalPrices')}
                    </p>
                    <p className="font-label-sm text-label-sm text-stone">
                      {t('pages.zakat.goldPrice')}: {result.prices_used.gold_price_per_gram.toFixed(2)} {currency}/g
                    </p>
                    <p className="font-label-sm text-label-sm text-stone">
                      {t('pages.zakat.silverPrice')}: {result.prices_used.silver_price_per_gram.toFixed(2)} {currency}/g
                    </p>
                    <p className="font-label-sm text-label-sm text-stone opacity-80">
                      {t('pages.zakat.priceSource', {
                        source: result.prices_used.source,
                        date: new Date(result.prices_used.as_of).toLocaleDateString(),
                      })}
                    </p>
                    {verification && !verification.verified && (
                      <p className="font-label-sm text-label-sm text-stone opacity-80">
                        {t('pages.zakat.pricesUnverified')}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </HoverCard>
          </div>
        ) : (
          <div className="space-y-6">
            <Input
              label={t('pages.zakat.members')}
              type="number"
              min={1}
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
            />
            <HoverCard className="p-6 bg-green-soft border-secondary/20 dark:bg-dark-surface dark:border-dark-border">
              <p className="font-heading-h3 text-heading-h3 text-secondary">
                {t('pages.zakat.fitrDue')}: {formatInteger(fitrDue)} {currency}
              </p>
              <p className="font-label-sm text-label-sm text-stone mt-2">
                {t('pages.zakat.fitrPerPerson', {
                  amount: ZAKAT_AL_FITR_AMOUNTS[currency] ?? 15,
                  currency,
                })}
              </p>
            </HoverCard>
          </div>
        )}
      </TabFade>

      <div className="mt-8">
        <AttributionChip
          source={t('pages.zakat.attribution')}
          url="https://ummahapi.com"
          page="Zakat Calculator"
        />
      </div>
    </PageShell>
  )
}
