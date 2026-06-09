import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdinkraPattern } from '@/components/common/AdinkraPattern'
import { useChatStore } from '@/stores/chatStore'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function HeroSection() {
  const openChat = useChatStore((s) => s.openChat)

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-accent-gold) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <AdinkraPattern
        symbol="sankofa"
        size={200}
        opacity={0.06}
        className="absolute right-10 top-20 hidden lg:block"
      />
      <AdinkraPattern
        symbol="gye-nyame"
        size={120}
        opacity={0.05}
        className="absolute bottom-32 left-10 hidden md:block"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.p
          variants={fadeUp}
          className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold"
        >
          Culture · Tourism · Language
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl"
        >
          Retrieve Knowledge.
          <br />
          <span className="text-gold">Navigate Culture.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Sankofa Hub is your intelligent gateway to African and global knowledge
          across Culture, Tourism, and Language — powered by four specialist AI
          assistants.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild>
            <a href="#sectors">Explore the Platform</a>
          </Button>
          <Button size="lg" variant="outline" onClick={openChat}>
            Talk to Our Bots
          </Button>
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 flex flex-col items-center gap-1 text-muted-foreground"
        aria-label="Scroll to about section"
      >
        <span className="text-xs">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </motion.a>
    </section>
  )
}
