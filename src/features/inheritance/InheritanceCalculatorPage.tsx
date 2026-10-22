import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { HoverCard } from '@/components/motion/HoverCard'
import {
  calculateInheritanceShares,
  type DecedentSex,
} from '@/lib/utils/inheritance'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'

export function InheritanceCalculatorPage() {
  const { t } = useTranslation()
  const { formatNumber } = useLocaleFormat()
  const [decedentSex, setDecedentSex] = useState<DecedentSex>('male')
  const [husbandAlive, setHusbandAlive] = useState(false)
  const [wives, setWives] = useState('0')
  const [sons, setSons] = useState('0')
  const [daughters, setDaughters] = useState('0')
  const [father, setFather] = useState(false)
  const [mother, setMother] = useState(false)
  const [estate, setEstate] = useState('100000')
  const [submitted, setSubmitted] = useState(false)

  const result = useMemo(() => {
    if (!submitted) return null
    return calculateInheritanceShares({
      estateValue: Number(estate) || 0,
      decedentSex,
      husbandAlive,
      wives: Number(wives) || 0,
      sons: Number(sons) || 0,
      daughters: Number(daughters) || 0,
      father,
      mother,
    })
  }, [
    submitted,
    estate,
    decedentSex,
    husbandAlive,
    wives,
    sons,
    daughters,
    father,
    mother,
  ])

  return (
    <PageShell
      title={t('pages.inheritance.title')}
      subtitle={t('pages.inheritance.subtitle')}
    >
      <HoverCard className="p-6 mb-6 space-y-3 dark:bg-dark-surface dark:border-dark-border">
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
          {t('pages.inheritance.howItWorks')}
        </p>
        <p
          role="note"
          className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary leading-relaxed border border-hairline dark:border-dark-border rounded-lg p-3 bg-cream-deep/40 dark:bg-dark-surface/80"
        >
          {t('pages.inheritance.disclaimer')}
        </p>
      </HoverCard>

      <HoverCard className="p-6 space-y-4 dark:bg-dark-surface dark:border-dark-border">
        <fieldset>
          <legend className="text-sm font-medium text-ink-soft dark:text-dark-text-secondary mb-2">
            {t('pages.inheritance.decedentSex')}
          </legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 font-body-md text-body-md text-ink-black dark:text-dark-text">
              <input
                type="radio"
                name="decedentSex"
                checked={decedentSex === 'male'}
                onChange={() => {
                  setDecedentSex('male')
                  setHusbandAlive(false)
                  setSubmitted(false)
                }}
              />
              {t('pages.inheritance.decedentMale')}
            </label>
            <label className="flex items-center gap-2 font-body-md text-body-md text-ink-black dark:text-dark-text">
              <input
                type="radio"
                name="decedentSex"
                checked={decedentSex === 'female'}
                onChange={() => {
                  setDecedentSex('female')
                  setWives('0')
                  setSubmitted(false)
                }}
              />
              {t('pages.inheritance.decedentFemale')}
            </label>
          </div>
        </fieldset>

        <Input
          label={t('pages.inheritance.estate')}
          type="number"
          min="0"
          value={estate}
          onChange={(e) => {
            setEstate(e.target.value)
            setSubmitted(false)
          }}
        />

        {decedentSex === 'male' ? (
          <Input
            label={t('pages.inheritance.wives')}
            type="number"
            min="0"
            max="4"
            value={wives}
            onChange={(e) => {
              setWives(e.target.value)
              setSubmitted(false)
            }}
          />
        ) : (
          <label className="flex items-center gap-2 font-body-md text-body-md text-ink-black dark:text-dark-text">
            <input
              type="checkbox"
              checked={husbandAlive}
              onChange={(e) => {
                setHusbandAlive(e.target.checked)
                setSubmitted(false)
              }}
            />
            {t('pages.inheritance.husbandAlive')}
          </label>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label={t('pages.inheritance.sons')}
            type="number"
            min="0"
            value={sons}
            onChange={(e) => {
              setSons(e.target.value)
              setSubmitted(false)
            }}
          />
          <Input
            label={t('pages.inheritance.daughters')}
            type="number"
            min="0"
            value={daughters}
            onChange={(e) => {
              setDaughters(e.target.value)
              setSubmitted(false)
            }}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 font-body-md text-body-md text-ink-black dark:text-dark-text">
            <input
              type="checkbox"
              checked={father}
              onChange={(e) => {
                setFather(e.target.checked)
                setSubmitted(false)
              }}
            />
            {t('pages.inheritance.father')}
          </label>
          <label className="flex items-center gap-2 font-body-md text-body-md text-ink-black dark:text-dark-text">
            <input
              type="checkbox"
              checked={mother}
              onChange={(e) => {
                setMother(e.target.checked)
                setSubmitted(false)
              }}
            />
            {t('pages.inheritance.mother')}
          </label>
        </div>

        <Button type="button" variant="primary" onClick={() => setSubmitted(true)}>
          {t('pages.inheritance.calculate')}
        </Button>
      </HoverCard>

      {result ? (
        <div className="mt-8 space-y-3">
          {result.shares.map((share) => (
            <HoverCard
              key={share.id}
              className="p-5 dark:bg-dark-surface dark:border-dark-border"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-body-lg text-body-lg text-ink-black dark:text-dark-text">
                    {t(`pages.inheritance.heirs.${share.heir}`)}
                  </p>
                  <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mt-1">
                    {share.fraction}
                  </p>
                </div>
                <p className="font-body-lg text-body-lg text-secondary dark:text-dark-green">
                  {formatNumber(share.amount, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </HoverCard>
          ))}
          {result.noteKeys.length > 0 ? (
            <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
              {result.noteKeys.map((key) => t(`pages.inheritance.notes.${key}`)).join(' ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  )
}
