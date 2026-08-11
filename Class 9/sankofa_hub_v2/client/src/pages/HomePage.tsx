import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Globe, MapPin, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdinkraPattern } from '@/components/common/AdinkraPattern'
import { useChatStore } from '@/stores/chatStore'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { AnimatedCounter } from '@/components/common/AnimatedCounter'
import { fadeUp, staggerContainer } from '@/lib/animations'

const HERO_STATS = [
  { value: 3, suffix: '', label: 'Specialist Domains' },
  { value: 4, suffix: '', label: 'AI Assistants' },
  { value: 54, suffix: '+', label: 'Countries Covered' },
  { value: 2000, suffix: '+', label: 'Languages Tracked' },
]

const GHANA_HIGHLIGHTS = [
  {
    icon: '🏛️',
    title: 'UNESCO Heritage Sites',
    description: 'Forts & Castles (1979) and Asante Traditional Buildings (1980) — Ghana has 2 inscribed World Heritage sites and 6 more on the tentative list.',
    color: '#C8922A',
  },
  {
    icon: '🧵',
    title: 'Kente & Adinkra Textiles',
    description: 'Kente was inscribed on UNESCO\'s Intangible Cultural Heritage list in 2023. Adinkra symbols carry centuries of Akan philosophy and proverbial wisdom.',
    color: '#C05A2C',
  },
  {
    icon: '🗣️',
    title: '80 Living Languages',
    description: 'Ghana is home to ~80 languages. Akan (Twi/Fante) is spoken by 80% of the population. The Bureau of Ghana Languages sponsors 9 indigenous languages.',
    color: '#6B4A9A',
  },
  {
    icon: '🎭',
    title: 'Rich Festival Calendar',
    description: 'From Homowo (Ga) to Aboakyer (Effutu), Odwira (Akan) to Hogbetsotso (Anlo) — Ghana\'s festivals are living cultural heritage celebrated year-round.',
    color: '#1A6B4A',
  },
]

const SECTOR_PREVIEWS = [
  {
    id: 'culture',
    title: 'Culture',
    subtitle: 'Arts, Heritage & Creative Industries',
    description: 'From Adinkra symbolism and Kente traditions to world heritage sites, performing arts, and cultural policy across Africa and the diaspora.',
    icon: '🎭',
    color: '#C05A2C',
    items: ['Visual Arts', 'Heritage Sites', 'Festivals', 'Cultural Policy'],
  },
  {
    id: 'tourism',
    title: 'Tourism',
    subtitle: 'Travel, Destinations & Hospitality',
    description: 'Discover Africa through expert guidance — eco-tourism in Ghana\'s forests, heritage trails, culinary adventures, and sustainable travel worldwide.',
    icon: '✈️',
    color: '#1A6B4A',
    items: ['Eco Tourism', 'Cultural Tourism', 'Adventure Travel', 'Tourism Policy'],
  },
  {
    id: 'language',
    title: 'Language',
    subtitle: 'Linguistics, Translation & Policy',
    description: 'Navigate the diversity of human language — from Akan proverbs and Twi translation to endangered language preservation and NLP technology.',
    icon: '🗣️',
    color: '#6B4A9A',
    items: ['Translation', 'Linguistics', 'Language Preservation', 'Language Tech'],
  },
]

export function HomePage() {
  const openChat = useChatStore((s) => s.openChat)
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation()
  const { ref: ghanaRef, isVisible: ghanaVisible } = useScrollAnimation(0.1)
  const { ref: sectorsRef, isVisible: sectorsVisible } = useScrollAnimation(0.1)

  return (
    <main>
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-accent-gold) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <AdinkraPattern symbol="sankofa" size={220} opacity={0.06} className="absolute right-10 top-20 hidden lg:block" />
        <AdinkraPattern symbol="gye-nyame" size={140} opacity={0.05} className="absolute bottom-32 left-10 hidden md:block" />
        <AdinkraPattern symbol="adinkrahene" size={100} opacity={0.04} className="absolute top-1/3 left-1/4 hidden lg:block" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
              From Ghana — Serving the World
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Retrieve Knowledge.
            <br />
            <span className="text-gold">Navigate Culture.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground md:text-lg leading-relaxed">
            Sankofa Hub is your intelligent gateway to African and global knowledge across{' '}
            <strong>Culture</strong>, <strong>Tourism</strong>, and <strong>Language</strong> —
            powered by four specialist AI assistants. Rooted in Ghanaian heritage, scaled for the world.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="cursor-pointer">
              <Link to="/about">Explore the Platform <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" onClick={openChat} className="cursor-pointer">
              Talk to Our Bots
            </Button>
          </motion.div>
        </motion.div>

        <motion.a
          href="#platform-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 flex flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="text-xs">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </motion.a>
      </section>

      {/* ─── PLATFORM STATS ─── */}
      <section id="platform-stats" className="bg-forest py-16 text-white dark:bg-forest-dark">
        <PageWrapper className="py-0">
          <motion.div
            ref={statsRef}
            initial="hidden"
            animate={statsVisible ? 'visible' : 'hidden'}
            variants={fadeUp}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-4xl font-bold md:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </PageWrapper>
      </section>

      {/* ─── GHANA SHOWCASE ─── */}
      <PageWrapper id="ghana">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 mb-4">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Rooted in Ghana</span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            From the Heart of Ghana to the World
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground mx-auto">
            Ghana&apos;s rich cultural heritage, linguistic diversity, and tourism potential form the foundation — 
            our platform scales these insights globally.
          </p>
          <div className="mt-4 h-1 w-16 rounded-full bg-gold mx-auto" />
        </div>

        <motion.div
          ref={ghanaRef}
          variants={staggerContainer}
          initial="hidden"
          animate={ghanaVisible ? 'visible' : 'hidden'}
          className="grid gap-6 sm:grid-cols-2"
        >
          {GHANA_HIGHLIGHTS.map((item) => (
            <motion.div key={item.title} variants={fadeUp}>
              <Card className="h-full border-l-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ borderLeftColor: item.color }}>
                <CardContent className="p-6">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="mt-3 font-display text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </PageWrapper>

      {/* ─── SECTORS PREVIEW ─── */}
      <PageWrapper className="bg-muted/50">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Three Specialist Domains
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground mx-auto">
            Culture, Tourism, and Language — each powered by a dedicated AI expert with deep domain knowledge.
          </p>
          <div className="mt-4 h-1 w-16 rounded-full bg-gold mx-auto" />
        </div>

        <motion.div
          ref={sectorsRef}
          variants={staggerContainer}
          initial="hidden"
          animate={sectorsVisible ? 'visible' : 'hidden'}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {SECTOR_PREVIEWS.map((sector) => (
            <motion.div key={sector.id} variants={fadeUp}>
              <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ borderBottomColor: sector.color, borderBottomWidth: 4 }}>
                <CardContent className="flex h-full flex-col p-6">
                  <span className="text-4xl">{sector.icon}</span>
                  <h3 className="mt-4 font-display text-2xl font-bold">{sector.title}</h3>
                  <p className="text-sm font-medium text-gold">{sector.subtitle}</p>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{sector.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sector.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                  <Link
                    to="/sectors"
                    className="mt-6 flex items-center gap-1 text-sm font-semibold text-gold opacity-0 transition-all group-hover:opacity-100"
                  >
                    Explore {sector.title} <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </PageWrapper>

      {/* ─── FEATURES TEASER ─── */}
      <PageWrapper>
        <div className="rounded-3xl bg-gradient-to-br from-gold/10 via-background to-forest/5 p-10 md:p-14 text-center border border-border/50">
          <Sparkles className="h-8 w-8 text-gold mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Powered by Intelligent AI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Our four AI assistants — <strong>Nana Kwame</strong> (General), <strong>Maame Yaa</strong> (Tourism),
            {' '}<strong>Osei Tutu</strong> (Culture), and <strong>Obaa Sarpongmaa</strong> (Language) — 
            work together with intelligent routing to give you accurate, context-aware answers across all three domains.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="cursor-pointer">
              <Link to="/features">View All Features</Link>
            </Button>
            <Button size="lg" variant="outline" onClick={openChat} className="cursor-pointer">
              Start Chatting
            </Button>
          </div>
        </div>
      </PageWrapper>

      {/* ─── GLOBAL REACH ─── */}
      <section className="border-t border-border bg-muted/30">
        <PageWrapper>
          <div className="grid gap-10 md:grid-cols-3 items-center">
            <div className="md:col-span-1 flex justify-center">
              <div className="relative">
                <AdinkraPattern symbol="adinkrahene" size={200} opacity={0.1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="h-16 w-16 text-gold" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-display text-2xl font-bold text-foreground">Global Vision, African Roots</h3>
              <p className="text-muted-foreground leading-relaxed">
                While Sankofa Hub was built in Ghana — inspired by the Akan principle of drawing wisdom from the past to build the future —
                our mission is global. We provide culturally intelligent knowledge services for the African Union, United Nations agencies,
                cultural institutions, tourism boards, linguistic researchers, and anyone seeking deep, respectful understanding of 
                Culture, Tourism, and Language — from Accra to Addis Ababa, from London to Lagos.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {['UN SDG 11.4', 'AU Agenda 2063', 'UNESCO Aligned', 'Pan-African'].map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-gold/30 text-gold">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </PageWrapper>
      </section>
    </main>
  )
}
