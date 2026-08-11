import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useChatStore } from '@/stores/chatStore'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { fadeUp } from '@/lib/animations'

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation()
  const openChat = useChatStore((s) => s.openChat)

  return (
    <PageWrapper>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={fadeUp}
        className="rounded-3xl bg-gradient-to-br from-gold/20 via-muted to-forest/10 p-12 text-center"
      >
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Ready to explore?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start a conversation with Nana Kwame and let our intelligent routing connect
          you to the right specialist — instantly.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" onClick={openChat}>
            Start Chatting
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#sectors">Browse Sectors</a>
          </Button>
        </div>
      </motion.div>
    </PageWrapper>
  )
}
