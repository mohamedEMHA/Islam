import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FadeInSection } from '@/components/motion/FadeInSection'

const FAQ_IDS = ['sources', 'offline', 'methods', 'privacy', 'ads'] as const

export function HomeFaqSection() {
  const { t } = useTranslation()

  useEffect(() => {
    const mainEntity = FAQ_IDS.map((id) => ({
      '@type': 'Question',
      name: t(`home.faq.${id}.q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`home.faq.${id}.a`),
      },
    }))

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'home-faq-jsonld'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity,
    })

    const existing = document.getElementById('home-faq-jsonld')
    if (existing) existing.remove()
    document.head.appendChild(script)

    return () => {
      document.getElementById('home-faq-jsonld')?.remove()
    }
  }, [t])

  return (
    <FadeInSection>
      <section className="px-margin-mobile md:px-margin-desktop py-section-y max-w-3xl mx-auto border-t border-hairline dark:border-dark-border">
        <div className="section-intro text-center">
          <h2 className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-text mb-3">
            {t('home.faqTitle')}
          </h2>
          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
            {t('home.faqSubtitle')}
          </p>
        </div>
        <div className="space-y-3">
          {FAQ_IDS.map((id) => (
            <details
              key={id}
              className="group rounded-xl border border-hairline dark:border-dark-border bg-paper-white dark:bg-dark-surface open:border-secondary/40 dark:open:border-dark-green/40"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-5 font-body-lg text-body-lg text-ink-black dark:text-dark-text font-medium">
                {t(`home.faq.${id}.q`)}
                <span className="material-symbols-outlined text-stone dark:text-dark-text-secondary group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="px-5 pb-5 font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
                {t(`home.faq.${id}.a`)}
              </p>
            </details>
          ))}
        </div>
      </section>
    </FadeInSection>
  )
}
