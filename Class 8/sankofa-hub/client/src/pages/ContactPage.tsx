import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, Send, CheckCircle, Globe, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useChatStore } from '@/stores/chatStore'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { fadeUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Location',
    value: 'Accra, Ghana',
    detail: 'Serving Africa and the World',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@sankofahub.org',
    detail: 'We respond within 24 hours',
  },
  {
    icon: Globe,
    label: 'Coverage',
    value: '54 African Nations',
    detail: 'Global knowledge platform',
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: '< 24 hours',
    detail: 'Business days',
  },
]

const FAQ_ITEMS = [
  {
    q: 'What is Sankofa Hub?',
    a: 'Sankofa Hub is an intelligent knowledge platform covering Culture, Tourism, and Language — powered by four specialist AI assistants. Rooted in Ghanaian heritage and scaled globally.',
  },
  {
    q: 'How do the AI assistants work?',
    a: 'Nana Kwame (General) routes your questions to the right specialist: Maame Yaa (Tourism), Osei Tutu (Culture), or Obaa Sarpongmaa (Language). Context is preserved across bot handoffs.',
  },
  {
    q: 'Is Sankofa Hub free to use?',
    a: 'Yes, the platform is currently free. We believe cultural knowledge should be accessible to everyone — from students to policymakers.',
  },
  {
    q: 'Can I contribute content or expertise?',
    a: 'We welcome collaborations with cultural institutions, tourism boards, linguists, and researchers. Contact us to explore partnership opportunities.',
  },
  {
    q: 'How is the platform aligned with international frameworks?',
    a: 'Sankofa Hub aligns with UN SDG 11.4 (Protect cultural & natural heritage), AU Agenda 2063 Aspiration 5 (Strong Cultural Identity), and UNESCO conventions on cultural diversity and heritage.',
  },
]

export function ContactPage() {
  const openChat = useChatStore((s) => s.openChat)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <main>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-gold/5 via-background to-background">
        <PageWrapper className="pb-16 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 mb-6">
              <Mail className="h-3.5 w-3.5 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Get in Touch</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Let&apos;s{' '}
              <span className="text-gold">Connect</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Have a question, collaboration idea, or feedback? We&apos;d love to hear from you. 
              Or start a conversation with our AI assistants right now.
            </p>
          </div>
        </PageWrapper>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <PageWrapper>
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Contact Information</h2>
              <p className="text-sm text-muted-foreground">
                Reach out through any of these channels, or use the form. We aim to respond to all inquiries within 24 hours.
              </p>
            </div>

            <div className="space-y-3">
              {CONTACT_INFO.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                      <p className="text-[11px] text-muted-foreground/70">{item.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <Card className="bg-forest/5 border-forest/20 dark:bg-forest/10">
              <CardContent className="p-5 flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Prefer instant answers?</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Our AI assistants are available 24/7. Start a chat right now.
                  </p>
                  <Button size="sm" onClick={openChat} className="mt-3 cursor-pointer" variant="outline">
                    Talk to Our Bots
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {['Culture', 'Tourism', 'Language', 'Partnerships', 'Research', 'Media'].map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <Card className="border-border/70">
              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                      <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">Message Sent!</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                      Thank you for reaching out. We&apos;ll respond within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-xs font-semibold text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold text-foreground">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-xs font-semibold text-foreground">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-xs font-semibold text-foreground">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all resize-none"
                        placeholder="Tell us about your inquiry..."
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full cursor-pointer">
                      <Send className="mr-2 h-4 w-4" /> Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>

      {/* ─── FAQ ─── */}
      <section className="bg-muted/30 border-y border-border">
        <PageWrapper>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-muted-foreground">Quick answers to common questions</p>
            <div className="mt-4 h-1 w-16 rounded-full bg-gold mx-auto" />
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                  <span className={cn(
                    'text-gold text-lg transition-transform duration-200',
                    expandedFaq === i && 'rotate-45'
                  )}>+</span>
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </PageWrapper>
      </section>
    </main>
  )
}
