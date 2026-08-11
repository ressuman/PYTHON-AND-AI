import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Globe, Users, Shield, Heart, Lightbulb, Target, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdinkraPattern } from '@/components/common/AdinkraPattern'
import { useChatStore } from '@/stores/chatStore'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { fadeUp, staggerContainer } from '@/lib/animations'

const VALUES = [
  {
    icon: BookOpen,
    title: 'Cultural Integrity',
    description: 'We represent cultures with accuracy, respect, and nuance — never stereotyping or flattening complexity.',
  },
  {
    icon: Globe,
    title: 'Pan-African Vision',
    description: 'Built in Ghana, designed for Africa, relevant to the world. We centre African knowledge systems.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Knowledge is communal. We honour the communities who are the custodians of the heritage we discuss.',
  },
  {
    icon: Shield,
    title: 'Scholarly Rigour',
    description: 'Every answer is grounded in established knowledge, academic consensus, and credible institutions.',
  },
  {
    icon: Heart,
    title: 'Inclusive Access',
    description: 'Knowledge should be accessible. We serve everyone from students to policymakers with equal respect.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation with Roots',
    description: 'We merge traditional wisdom with cutting-edge AI — the Sankofa principle in technological practice.',
  },
]

const TIMELINE = [
  { year: '2024', event: 'Sankofa Hub conceived in Accra, Ghana — a platform to digitise and democratise cultural, tourism, and linguistic knowledge.' },
  { year: '2024 Q3', event: 'Four specialist AI assistants developed: Nana Kwame (General), Maame Yaa (Tourism), Osei Tutu (Culture), Obaa Sarpongmaa (Language).' },
  { year: '2025', event: 'Platform launch with intelligent routing, session memory, and multi-bot architecture. Ghana heritage data integrated.' },
  { year: '2025 Q4', event: 'Expanded coverage to all 54 African nations. UNESCO heritage registry integration. AU Agenda 2063 compliance tracking.' },
  { year: '2026', event: 'Global scaling initiative. Multilingual support. Partnership framework for cultural institutions and tourism boards worldwide.' },
]

export function AboutPage() {
  const openChat = useChatStore((s) => s.openChat)
  const { ref: timelineRef, isVisible: timelineVisible } = useScrollAnimation(0.1)

  return (
    <main>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-gold/5 via-background to-background">
        <AdinkraPattern symbol="sankofa" size={160} opacity={0.05} className="absolute right-10 top-10 hidden lg:block" />
        <PageWrapper className="pb-16 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 mb-6">
              <BookOpen className="h-3.5 w-3.5 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Our Story</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              About{' '}
              <span className="text-gold">Sankofa Hub</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Drawing from the past to build the future — Sankofa Hub is a culturally intelligent platform 
              that bridges heritage and innovation across Culture, Tourism, and Language.
            </p>
          </div>
        </PageWrapper>
      </section>

      {/* ─── THE SANFOFA PHILOSOPHY ─── */}
      <PageWrapper>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-bold text-foreground">
              The <span className="text-gold">Sankofa</span> Philosophy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Sankofa</strong> — from the Akan proverb <em>&ldquo;Se wo were fi na wosan kofa a yenkyi&rdquo;</em> 
              (&ldquo;It is not wrong to go back and fetch what you have forgotten&rdquo;) — teaches us that wisdom from the 
              past is essential for building the future.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This principle guides everything we do. We believe that Africa&apos;s rich cultural heritage, 
              its extraordinary linguistic diversity, and its vast tourism potential are not relics to be 
              preserved in amber — they are living knowledge systems that can inform and enrich our collective future.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Sankofa Hub is the technological expression of this philosophy: a platform that centres 
              African knowledge while embracing intelligent technology, making it accessible, navigable, 
              and actionable for everyone — from Accra to the African Union headquarters, from local 
              communities to global institutions.
            </p>
          </div>
          <div className="relative flex items-center justify-center">
            <AdinkraPattern symbol="sankofa" size={300} opacity={0.08} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-lg text-center max-w-xs">
                <Quote className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  &ldquo;Go back and fetch it. The past is not behind us — it is beneath us, 
                  the foundation upon which we build.&rdquo;
                </p>
                <div className="mt-4 h-px bg-border" />
                <p className="mt-3 text-xs font-semibold text-foreground">Akan Proverb</p>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ─── GHANA ROOTS ─── */}
      <section className="bg-muted/50 border-y border-border">
        <PageWrapper>
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-forest/30 bg-forest/5 px-4 py-1.5">
                <Globe className="h-3.5 w-3.5 text-forest" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-forest">Made in Ghana</span>
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                Rooted in Ghana, Designed for{' '}
                <span className="text-gold">Africa</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ghana — the first sub-Saharan African nation to gain independence, the land of Kwame Nkrumah, 
                home to the rich Akan, Ewe, Ga, Dagomba, and many other cultures — is where Sankofa Hub was born.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With 2 UNESCO World Heritage sites, Kente cloth inscribed on UNESCO&apos;s Intangible Cultural Heritage list (2023), 
                ~80 living languages, and a tourism sector growing at 8-12% annually, Ghana provides an ideal foundation 
                for a platform that scales African cultural intelligence globally.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                But our vision extends across the continent and beyond. We cover all 54 African nations, 
                track 2,000+ languages, and align with the African Union&apos;s Agenda 2063 and UN Sustainable Development Goals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'UNESCO Heritage Sites', value: '2', suffix: '', color: 'text-gold' },
                { label: 'Living Languages', value: '80', suffix: '+', color: 'text-terracotta' },
                { label: 'Government-Sponsored Languages', value: '9', suffix: '', color: 'text-forest' },
                { label: 'Years of Independence', value: '68', suffix: '', color: 'text-amber-500' },
              ].map((stat) => (
                <Card key={stat.label} className="text-center border-border/70">
                  <CardContent className="p-5">
                    <p className={`font-display text-3xl font-black ${stat.color}`}>
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </PageWrapper>
      </section>

      {/* ─── MISSION & VALUES ─── */}
      <PageWrapper>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Our Mission &amp; Values
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground mx-auto">
            Six principles that guide every interaction, every answer, every decision.
          </p>
          <div className="mt-4 h-1 w-16 rounded-full bg-gold mx-auto" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {VALUES.map((value, i) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </PageWrapper>

      {/* ─── TIMELINE ─── */}
      <section className="bg-muted/30 border-y border-border">
        <PageWrapper>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Our Journey</h2>
            <p className="mt-3 text-muted-foreground">From concept to global platform</p>
            <div className="mt-4 h-1 w-16 rounded-full bg-gold mx-auto" />
          </div>

          <motion.div
            ref={timelineRef}
            variants={staggerContainer}
            initial="hidden"
            animate={timelineVisible ? 'visible' : 'hidden'}
            className="relative max-w-3xl mx-auto"
          >
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border hidden sm:block" />
            {TIMELINE.map((item) => (
              <motion.div key={item.year} variants={fadeUp} className="relative pl-0 sm:pl-14 pb-10 last:pb-0">
                <div className="hidden sm:flex absolute left-0 top-1 h-10 w-10 items-center justify-center rounded-full border-2 border-gold bg-background">
                  <div className="h-2.5 w-2.5 rounded-full bg-gold" />
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="border-gold/30 text-gold text-xs font-bold">{item.year}</Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </PageWrapper>
      </section>

      {/* ─── CTA ─── */}
      <PageWrapper>
        <div className="rounded-3xl bg-gradient-to-br from-gold/15 via-background to-forest/10 p-12 text-center border border-border/50">
          <Target className="h-10 w-10 text-gold mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Join Our Mission
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Whether you&apos;re a researcher, policymaker, traveller, or lifelong learner — 
            Sankofa Hub is your gateway to culturally intelligent knowledge.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={openChat} className="cursor-pointer">
              Start a Conversation
            </Button>
            <Button size="lg" variant="outline" asChild className="cursor-pointer">
              <Link to="/sectors">Explore Our Sectors <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </PageWrapper>
    </main>
  )
}
