import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Card, CardContent } from '@/components/ui/card'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { TESTIMONIALS } from '@/lib/constants'
import { staggerContainer, fadeUp } from '@/lib/animations'

export function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <PageWrapper className="bg-muted/30">
      <SectionHeading
        title="What People Say"
        subtitle="Trusted by researchers, scholars, and students"
      />

      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        className="grid gap-8 md:grid-cols-3"
      >
        {TESTIMONIALS.map((t) => (
          <motion.div key={t.name} variants={fadeUp}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col p-6">
                <p className="flex-1 text-sm italic leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </PageWrapper>
  )
}
