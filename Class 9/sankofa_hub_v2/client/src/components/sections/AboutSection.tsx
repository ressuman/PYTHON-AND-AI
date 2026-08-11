import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { AdinkraPattern } from '@/components/common/AdinkraPattern'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { fadeUp } from '@/lib/animations'

export function AboutSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <PageWrapper id="about">
      <SectionHeading
        title="About Sankofa Hub"
        subtitle="Drawing from the past to build the future"
      />

      <motion.div
        ref={ref}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={fadeUp}
        className="grid items-center gap-12 lg:grid-cols-2"
      >
        <div className="space-y-4 text-muted-foreground">
          <p className="text-lg leading-relaxed">
            <strong className="text-foreground">Sankofa</strong> — from
            the Akan proverb meaning &ldquo;go back and fetch it&rdquo; — teaches us that
            wisdom from the past is essential for building the future.
          </p>
          <p className="leading-relaxed">
            Sankofa Hub honours this principle: a platform that centres cultural
            knowledge while embracing intelligent technology. We bridge heritage and
            innovation across three specialist domains.
          </p>
          <p className="leading-relaxed">
            Three domains. Four AI assistants. One unified experience — whether you
            explore independently, chat with our bots, or do both at once.
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <AdinkraPattern symbol="adinkrahene" size={280} opacity={0.12} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-border bg-white p-8 shadow-lg dark:bg-sankofa-card">
              <dl className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <dt className="font-display text-3xl font-bold text-gold">3</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">Domains</dd>
                </div>
                <div>
                  <dt className="font-display text-3xl font-bold text-forest">4</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">Assistants</dd>
                </div>
                <div>
                  <dt className="font-display text-3xl font-bold text-terracotta">∞</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">Knowledge</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
