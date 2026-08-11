import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCounter } from '@/components/common/AnimatedCounter'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { SITE_STATS } from '@/lib/constants'
import { fadeUp } from '@/lib/animations'

export function StatsSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="bg-forest py-16 text-white dark:bg-forest-dark">
      <PageWrapper className="py-0">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {SITE_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-4xl font-bold md:text-5xl">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-2 text-sm text-white/80">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </PageWrapper>
    </section>
  )
}
