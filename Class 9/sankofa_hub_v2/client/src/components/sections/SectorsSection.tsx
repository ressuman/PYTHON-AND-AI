import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useChatStore } from '@/stores/chatStore'
import { SECTORS, BOT_CONFIGS } from '@/lib/constants'
import { staggerContainer, fadeUp } from '@/lib/animations'

export function SectorsSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)
  const { openChat } = useChatStore()

  const openBotChat = () => {
    openChat()
  }

  return (
    <PageWrapper id="sectors" className="bg-muted/50">
      <SectionHeading
        title="Three Specialist Domains"
        subtitle="Culture, Tourism, and Language — each with a dedicated AI expert"
      />

      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {SECTORS.map((sector) => {
          const bot = BOT_CONFIGS[sector.botId]
          return (
            <motion.div key={sector.id} variants={fadeUp}>
              <Card
                className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ borderBottomColor: sector.color, borderBottomWidth: 4 }}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <span className="text-4xl" aria-hidden="true">
                    {sector.icon}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold">{sector.title}</h3>
                  <p className="text-sm font-medium text-gold">{sector.subtitle}</p>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">
                    {sector.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sector.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                    <button
                    onClick={openBotChat}
                    className="mt-6 flex items-center gap-1 text-sm font-semibold opacity-0 transition-all group-hover:opacity-100"
                    style={{ color: sector.color }}
                    aria-label={`Ask ${bot.name}`}
                  >
                    Ask {bot.name}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </PageWrapper>
  )
}
