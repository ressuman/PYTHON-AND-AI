import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot, Route, RefreshCw, Globe, Lock, Smartphone, MessageSquare, Brain, Users, Shield, Search, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useChatStore } from '@/stores/chatStore'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { fadeUp, staggerContainer } from '@/lib/animations'

const FEATURES_LIST = [
  {
    icon: Route,
    title: 'Intelligent Routing',
    description: 'Ask any question and be seamlessly connected to the right specialist AI. No wrong door — just smarter conversations. Our NLP classification evaluates intent across Culture, Tourism, and Language domains in real-time.',
    details: ['Domain classification across 3 specialist areas', 'Seamless handoff with full context preservation', 'No dead ends — every question finds its home'],
  },
  {
    icon: RefreshCw,
    title: 'Bidirectional Handoff',
    description: 'Switch between specialists mid-conversation without ever losing context. Your entire conversation history follows you, making each exchange richer than the last.',
    details: ['Cross-bot context transfer', 'Session history persistence', 'Redirect notifications with reasoning'],
  },
  {
    icon: Globe,
    title: 'Africa-First Knowledge',
    description: 'Built with deep attention to African cultures, languages, and tourism contexts — not as an afterthought. Our knowledge base centres African voices, scholarship, and perspectives.',
    details: ['54 African nations covered', '2,000+ languages tracked', 'UNESCO & AU aligned content'],
  },
  {
    icon: Bot,
    title: 'Four Specialist AI Assistants',
    description: 'Nana Kwame (General), Maame Yaa (Tourism), Osei Tutu (Culture), and Obaa Sarpongmaa (Language) — each with deep domain expertise and distinct professional personas.',
    details: ['Domain-specific system prompts', 'Professional tone & cultural sensitivity', 'Specialised knowledge boundaries'],
  },
  {
    icon: Brain,
    title: 'Advanced AI with Fallback',
    description: 'Multiple AI models with intelligent fallback ensure you always get a thoughtful, reliable response. Our architecture prioritizes accuracy and uptime.',
    details: ['Multi-model redundancy', 'Graceful degradation', '30s timeout with error recovery'],
  },
  {
    icon: Lock,
    title: 'Session Memory & Privacy',
    description: 'Your conversation context is maintained throughout your session. Session data is stored locally and never shared — privacy-first by design.',
    details: ['Zustand-persisted state', 'localStorage session IDs', 'No cookies — no CSRF risk'],
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Chat Interface',
    description: 'Floating chat widget accessible from every page. Auto-opens on first visit. Supports Markdown, keyboard shortcuts, and smooth animations.',
    details: ['Keyboard shortcuts (Enter, Shift+Enter, Escape)', 'Auto-scroll & typing indicators', 'Dark/light theme support'],
  },
  {
    icon: Users,
    title: 'Multi-Stakeholder Ready',
    description: 'Designed for researchers, policymakers, travellers, students, cultural professionals, and curious minds — from the African Union to local communities.',
    details: ['Accessible to all expertise levels', 'Depth on demand architecture', 'Policy compliance tracking'],
  },
  {
    icon: Smartphone,
    title: 'Fully Responsive',
    description: 'A seamless experience whether you\'re on desktop, tablet, or mobile. The chat panel adapts from a fixed widget to a full-screen overlay on mobile.',
    details: ['Mobile-first responsive design', 'Safe area inset support', 'Touch-friendly interactions'],
  },
  {
    icon: Shield,
    title: 'Security & Accessibility',
    description: 'Built with security best practices and accessibility standards. Keyboard navigable, screen-reader friendly, with reduced motion support.',
    details: ['WAI-ARIA compliant', 'Reduced motion support', 'Input sanitisation'],
  },
  {
    icon: Sliders,
    title: 'Customisable Experience',
    description: 'Light, dark, and system theme options. Bot preferences persisted across sessions. Minimisable chat panel that stays out of your way.',
    details: ['Theme persistence', 'Bot preference memory', 'Minimisable interface'],
  },
  {
    icon: Search,
    title: 'Heritage Registry & Analytics',
    description: 'Integrated database of UNESCO heritage sites, tourism corridors, language families, and policy indicators — all aligned with UN SDGs and AU Agenda 2063.',
    details: ['UNESCO heritage tracking', 'Tourism corridor mapping', 'Policy compliance metrics'],
  },
]

const TECH_STACK = [
  { name: 'React 19', role: 'UI Framework' },
  { name: 'TypeScript', role: 'Type Safety' },
  { name: 'Tailwind CSS v4', role: 'Styling' },
  { name: 'shadcn/ui', role: 'Component Library' },
  { name: 'Framer Motion', role: 'Animations' },
  { name: 'Zustand', role: 'State Management' },
  { name: 'TanStack Query', role: 'Data Fetching' },
  { name: 'Axios', role: 'HTTP Client' },
  { name: 'FastAPI', role: 'Backend API' },
  { name: 'Python', role: 'AI/ML Backend' },
]

export function FeaturesPage() {
  const openChat = useChatStore((s) => s.openChat)
  const { ref, isVisible } = useScrollAnimation(0.05)
  const { ref: techRef, isVisible: techVisible } = useScrollAnimation(0.1)

  return (
    <main>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-gold/5 via-background to-background">
        <PageWrapper className="pb-16 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 mb-6">
              <Sliders className="h-3.5 w-3.5 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Platform Capabilities</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Platform{' '}
              <span className="text-gold">Features</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Intelligent, culturally aware, and built for everyone — Sankofa Hub combines cutting-edge AI 
              with deep cultural intelligence to deliver an unparalleled knowledge experience.
            </p>
          </div>
        </PageWrapper>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <PageWrapper>
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES_LIST.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
                    <div className="mt-4 pt-4 border-t border-border space-y-1">
                      {feature.details.map((detail) => (
                        <p key={detail} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-gold mt-0.5">◆</span> {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </PageWrapper>

      {/* ─── TECH STACK ─── */}
      <section className="bg-muted/50 border-y border-border">
        <PageWrapper>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Built With Modern Technology
            </h2>
            <p className="mt-3 text-muted-foreground">
              Enterprise-grade tech stack for reliability, performance, and scale
            </p>
            <div className="mt-4 h-1 w-16 rounded-full bg-gold mx-auto" />
          </div>

          <motion.div
            ref={techRef}
            variants={staggerContainer}
            initial="hidden"
            animate={techVisible ? 'visible' : 'hidden'}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto"
          >
            {TECH_STACK.map((tech) => (
              <motion.div key={tech.name} variants={fadeUp}>
                <Card className="text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                    <p className="text-sm font-bold text-foreground">{tech.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{tech.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </PageWrapper>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <PageWrapper>
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground">From question to answer in four intelligent steps</p>
          <div className="mt-4 h-1 w-16 rounded-full bg-gold mx-auto" />
        </div>

        <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto">
          {[
            { step: '01', title: 'Ask Anything', desc: 'Type your question about Culture, Tourism, or Language into the chat widget.', icon: MessageSquare },
            { step: '02', title: 'Smart Routing', desc: 'Nana Kwame classifies your intent and routes you to the right specialist.', icon: Route },
            { step: '03', title: 'Expert Response', desc: 'The domain specialist (Maame Yaa, Osei Tutu, or Obaa Sarpongmaa) provides a deep, accurate answer.', icon: Brain },
            { step: '04', title: 'Continue or Explore', desc: 'Ask follow-ups, switch bots, or browse the platform — your context is always preserved.', icon: RefreshCw },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.step} className="text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold mx-auto mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-1">{item.step}</p>
                <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </PageWrapper>

      {/* ─── CTA ─── */}
      <section className="bg-forest py-16 text-white dark:bg-forest-dark">
        <PageWrapper className="py-0 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Ready to Experience It?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Start a conversation and see the power of culturally intelligent AI in action.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={openChat} variant="secondary" className="cursor-pointer">
              Start Chatting Now
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 cursor-pointer">
              <Link to="/contact">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </PageWrapper>
      </section>
    </main>
  )
}
