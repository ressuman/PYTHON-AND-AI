import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Card, CardContent } from '@/components/ui/card'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { FEATURES } from '@/lib/constants'
import { staggerContainer, fadeUp } from '@/lib/animations'

export function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <PageWrapper id="features">
      <SectionHeading
        title="Platform Features"
        subtitle="Intelligent, culturally aware, and built for everyone"
      />

      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <motion.div key={feature.title} variants={fadeUp}>
            <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-6">
                <span className="text-3xl" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </PageWrapper>
  )
}
