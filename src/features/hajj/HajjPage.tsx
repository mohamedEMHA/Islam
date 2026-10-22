import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { m as motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PageShell } from '@/components/ui/PageShell'
import { TabPills } from '@/components/ui/TabPills'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { TabFade } from '@/components/motion/TabFade'
import { ArabicText } from '@/components/content/ArabicText'

interface StepDef {
  key: string
  icon: string
  dua: string | null
}

const HAJJ_STEP_DEFS: StepDef[] = [
  { key: 'ihram', icon: 'checkroom', dua: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ' },
  { key: 'tawaf', icon: 'sync', dua: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ' },
  { key: 'sai', icon: 'directions_walk', dua: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ' },
  { key: 'wuquf', icon: 'landscape', dua: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ' },
  { key: 'muzdalifah', icon: 'nightlight', dua: null },
  { key: 'rami', icon: 'target', dua: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ' },
  { key: 'sacrifice', icon: 'content_cut', dua: null },
  { key: 'farewellTawaf', icon: 'mosque', dua: null },
]

const UMRAH_STEP_DEFS: StepDef[] = [
  { key: 'ihram', icon: 'checkroom', dua: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً' },
  { key: 'tawaf', icon: 'sync', dua: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ' },
  { key: 'sai', icon: 'directions_walk', dua: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ' },
  { key: 'halq', icon: 'content_cut', dua: null },
  { key: 'duasHaram', icon: 'mosque', dua: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً' },
  { key: 'madinah', icon: 'location_city', dua: null },
]

function StepsList({ mode, steps }: { mode: 'hajj' | 'umrah'; steps: StepDef[] }) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <StaggerList className="space-y-3">
      {steps.map((step, i) => {
        const isOpen = open === i
        const title = t(`pages.hajj.steps.${mode}.${step.key}.title`)
        const content = t(`pages.hajj.steps.${mode}.${step.key}.content`)
        return (
          <StaggerListItem key={step.key}>
            <HoverCard className="p-0 overflow-hidden">
              <button
                type="button"
                className="w-full flex justify-between items-center p-5 text-start"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full bg-green-soft flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-sm">{step.icon}</span>
                  </span>
                  <span className="font-medium text-ink-black">
                    <span className="text-stone me-2 font-label-sm text-label-sm">{i + 1}.</span>
                    {title}
                  </span>
                </span>
                <span className="material-symbols-outlined text-stone">{isOpen ? 'expand_less' : 'expand_more'}</span>
              </button>
              {reduceMotion ? (
                isOpen ? (
                  <div className="px-5 pb-5 border-t border-hairline pt-4">
                    <p className="font-body-md text-body-md text-ink-soft leading-relaxed mb-4">{content}</p>
                    {step.dua && <ArabicText className="text-primary">{step.dua}</ArabicText>}
                  </div>
                ) : null
              ) : (
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-hairline pt-4">
                        <p className="font-body-md text-body-md text-ink-soft leading-relaxed mb-4">{content}</p>
                        {step.dua && <ArabicText className="text-primary">{step.dua}</ArabicText>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </HoverCard>
          </StaggerListItem>
        )
      })}
    </StaggerList>
  )
}

export function HajjPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'hajj' | 'umrah'>('hajj')
  const steps = useMemo(() => (tab === 'hajj' ? HAJJ_STEP_DEFS : UMRAH_STEP_DEFS), [tab])

  return (
    <PageShell title={t('pages.hajj.title')} subtitle={t('pages.hajj.subtitle')}>
      <TabPills
        tabs={[
          { id: 'hajj', label: t('pages.hajj.tabs.hajj') },
          { id: 'umrah', label: t('pages.hajj.tabs.umrah') },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-8"
      />
      <TabFade activeKey={tab}>
        <StepsList mode={tab} steps={steps} />
      </TabFade>
    </PageShell>
  )
}
