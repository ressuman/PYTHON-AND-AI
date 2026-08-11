import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useChatStore } from '@/stores/chatStore'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { fadeUp, staggerContainer } from '@/lib/animations'
import type { BotId } from '@/types'

const CULTURE_SECTION = {
  title: 'Culture',
  icon: '🎭',
  color: '#C05A2C',
  subtitle: 'Arts, Heritage, Traditions & Creative Industries',
  overview: 'Culture is the soul of a people. Our Culture domain covers the full spectrum of human cultural expression — from the Adinkra symbols of the Akan people to UNESCO World Heritage sites, from traditional festivals to contemporary digital art.',
  ghanaFocus: 'Ghana is home to 2 UNESCO World Heritage sites: the Forts and Castles along the coast (inscribed 1979) and the Asante Traditional Buildings (inscribed 1980). Kente cloth was inscribed on UNESCO\'s Intangible Cultural Heritage list in 2023, and Ghanaian festivals like Homowo, Aboakyer, and Odwira are celebrated worldwide.',
  globalScale: 'From the rock-hewn churches of Lalibela (Ethiopia) to the Great Zimbabwe ruins, from Yoruba mythology to Maasai oral traditions — we cover cultural heritage across all 54 African nations and beyond.',
  topics: [
    { title: 'Visual Arts & Crafts', items: ['Adinkra Symbolism', 'Kente Weaving', 'Nok Sculpture', 'Benin Bronzes', 'Contemporary African Art'] },
    { title: 'Heritage & Museums', items: ['UNESCO Sites', 'Museum Curation', 'Repatriation Debates', 'Intangible Heritage', 'Cultural Documentation'] },
    { title: 'Performing Arts', items: ['Traditional Dance', 'Theatre & Drama', 'Storytelling', 'Festival Performance', 'Music Traditions'] },
    { title: 'Cultural Policy', items: ['UNESCO Conventions', 'Cultural Diplomacy', 'Heritage Protection', 'Creative Economy', 'Cultural Rights'] },
  ],
  botId: 'culture' as BotId,
}

const TOURISM_SECTION = {
  title: 'Tourism',
  icon: '✈️',
  color: '#1A6B4A',
  subtitle: 'Travel, Destinations, Hospitality & Sustainable Tourism',
  overview: 'Tourism is one of the world\'s largest industries — and Africa is its next great frontier. Our Tourism domain provides expert guidance on destinations, travel planning, hospitality, and sustainable tourism development across the continent and globally.',
  ghanaFocus: 'Ghana\'s tourism sector is booming, driven by initiatives like the "Year of Return" (2019) which brought over 1 million visitors. Key attractions include Cape Coast Castle, Kakum National Park, Mole National Park, the Kwame Nkrumah Mausoleum, and vibrant festivals. Ghana was ranked among the fastest-growing tourism destinations in Africa.',
  globalScale: 'From the Serengeti (Tanzania) to the Okavango Delta (Botswana), from Marrakech medinas to Zanzibar\'s Stone Town — we cover eco-tourism, cultural tourism, adventure travel, culinary tourism, and tourism policy worldwide.',
  topics: [
    { title: 'Destinations', items: ['Beach & Coastal', 'Safari & Wildlife', 'Cultural Cities', 'Eco-Lodges', 'Mountain & Hiking'] },
    { title: 'Travel Planning', items: ['Visa Guidance', 'Transportation', 'Accommodation', 'Packing Guides', 'Safety Tips'] },
    { title: 'Tourism Sectors', items: ['Eco Tourism', 'Cultural Tourism', 'Medical Tourism', 'Culinary Tourism', 'Business Travel'] },
    { title: 'Policy & Industry', items: ['UNWTO Guidelines', 'Sustainable Tourism', 'Community Tourism', 'Destination Marketing', 'Tourism Economics'] },
  ],
  botId: 'tourism' as BotId,
}

const LANGUAGE_SECTION = {
  title: 'Language',
  icon: '🗣️',
  color: '#6B4A9A',
  subtitle: 'Linguistics, Translation, Education, Preservation & Technology',
  overview: 'Language is the carrier of identity, knowledge, history, and power. Our Language domain covers the extraordinary diversity of human language — from Akan proverbs to machine translation, from endangered language preservation to multilingual education policy.',
  ghanaFocus: 'Ghana is home to ~80 living languages. English is the official language, while 9 indigenous languages are government-sponsored: Akan (Asante Twi, Akuapem Twi, Fante), Ewe, Ga, Dangme, Nzema, Dagbani, Dagaare, Gonja, and Kasem. Akan is spoken by ~80% of the population. Ghanaian Sign Language serves the Deaf community.',
  globalScale: 'Africa is home to over 2,000 languages from 6 major language families: Niger-Congo (2,000+ languages, 700M speakers), Afroasiatic (500M speakers), Nilo-Saharan (60M speakers), Khoisan, Austronesian (Madagascar), and Indo-European (colonial legacy). We cover linguistics, translation, and language technology across all of them.',
  topics: [
    { title: 'Linguistics', items: ['Phonetics & Phonology', 'Syntax & Morphology', 'Sociolinguistics', 'Historical Linguistics', 'Psycholinguistics'] },
    { title: 'Translation', items: ['Literary Translation', 'Legal & Medical', 'Interpretation', 'Localisation', 'Machine Translation'] },
    { title: 'Language Preservation', items: ['Endangered Languages', 'Revitalisation', 'Documentation', 'Digital Archiving', 'Community Programmes'] },
    { title: 'Language Technology', items: ['NLP & AI', 'Speech Recognition', 'Low-Resource Languages', 'Language Models', 'Ethical AI'] },
  ],
  botId: 'language' as BotId,
}

type SectorTab = 'culture' | 'tourism' | 'language'

export function SectorsPage() {
  const [activeTab, setActiveTab] = useState<SectorTab>('culture')
  const { openChat } = useChatStore()
  const { ref, isVisible } = useScrollAnimation(0.1)

  const openBotChat = () => {
    openChat()
  }

  const sections = { culture: CULTURE_SECTION, tourism: TOURISM_SECTION, language: LANGUAGE_SECTION }
  const current = sections[activeTab]

  return (
    <main>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-gold/5 via-background to-background">
        <PageWrapper className="pb-16 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 mb-6">
              <Globe className="h-3.5 w-3.5 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Our Domains</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Three Domains.{' '}
              <span className="text-gold">One Platform.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Deep expertise in Culture, Tourism, and Language — each with a dedicated AI specialist, 
              backed by rigorous research and cultural intelligence.
            </p>
          </div>
        </PageWrapper>
      </section>

      {/* ─── SECTOR TABS ─── */}
      <PageWrapper>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SectorTab)} className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3 mb-12 h-auto p-1">
            <TabsTrigger value="culture" className="text-base py-3 data-[state=active]:text-[#C05A2C]">
              <span className="mr-2">🎭</span> Culture
            </TabsTrigger>
            <TabsTrigger value="tourism" className="text-base py-3 data-[state=active]:text-[#1A6B4A]">
              <span className="mr-2">✈️</span> Tourism
            </TabsTrigger>
            <TabsTrigger value="language" className="text-base py-3 data-[state=active]:text-[#6B4A9A]">
              <span className="mr-2">🗣️</span> Language
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Overview */}
              <div className="grid gap-10 lg:grid-cols-5 mb-16">
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{current.icon}</span>
                    <div>
                      <h2 className="font-display text-3xl font-bold text-foreground">{current.title}</h2>
                      <p className="text-sm font-medium text-gold">{current.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{current.overview}</p>
                  <Button
                    onClick={openBotChat}
                    className="cursor-pointer"
                    style={{ backgroundColor: current.color }}
                  >
                    Ask {current.botId === 'culture' ? 'Osei Tutu' : current.botId === 'tourism' ? 'Maame Yaa' : 'Obaa Sarpongmaa'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <Card className="border-l-4 h-full" style={{ borderLeftColor: current.color }}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold" />
                        <h3 className="font-semibold text-sm text-foreground">Ghana Focus</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{current.ghanaFocus}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 h-full" style={{ borderLeftColor: current.color }}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gold" />
                        <h3 className="font-semibold text-sm text-foreground">Global Scale</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{current.globalScale}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Topics Grid */}
              <motion.div
                ref={ref}
                variants={staggerContainer}
                initial="hidden"
                animate={isVisible ? 'visible' : 'hidden'}
                className="grid gap-6 md:grid-cols-2"
              >
                {current.topics.map((topic) => (
                  <motion.div key={topic.title} variants={fadeUp}>
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <h3 className="font-display text-lg font-bold text-foreground mb-3">{topic.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          {topic.items.map((item) => (
                            <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </PageWrapper>

      {/* ─── GHANA SHOWCASE EXTENDED ─── */}
      <section className="bg-muted/50 border-y border-border">
        <PageWrapper>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Ghana: Where We Begin
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground mx-auto">
              Our platform is built on Ghanaian heritage — here are just some of the cultural treasures that inspire our work.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Kente Cloth',
                category: 'UNESCO Intangible Heritage',
                description: 'Hand-woven textile with over 400 years of tradition. Each pattern tells a story — from the "Sankofa" pattern to "Fatia Nkrumah". Inscribed by UNESCO in 2023 and now Ghana\'s first Geographical Indication product.',
                tags: ['UNESCO 2023', 'GI Status', 'Ashanti Royalty'],
                color: '#C8922A',
              },
              {
                title: 'Forts & Castles',
                category: 'UNESCO World Heritage',
                description: '28 fortified trading posts spanning 500km of coastline. Built between 1482-1786 by European powers. Elmina Castle (1482) is one of the oldest European buildings outside Europe. A symbol of the African Diaspora.',
                tags: ['UNESCO 1979', 'Diaspora Heritage', 'Museum Sites'],
                color: '#C05A2C',
              },
              {
                title: 'Akan Language & Adinkra',
                category: 'Living Heritage',
                description: 'Akan (Twi/Fante) is spoken by 80% of Ghanaians. Adinkra symbols like Gye Nyame and Sankofa carry profound philosophical meaning. The Akan Orthography Committee unified the writing system in 1978.',
                tags: ['80% Speak Akan', 'Adinkra Symbols', 'BGL Sponsored'],
                color: '#6B4A9A',
              },
            ].map((item) => (
              <Card key={item.title} className="h-full overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
                style={{ borderTopColor: item.color, borderTopWidth: 4 }}>
                <CardContent className="p-6 flex flex-col h-full">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold mb-1">{item.category}</p>
                  <h3 className="font-display text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]" style={{ borderColor: item.color, color: item.color }}>{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageWrapper>
      </section>

      {/* ─── AI ASSISTANTS ─── */}
      <PageWrapper>
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Meet Your AI Assistants
          </h2>
          <p className="mt-3 text-muted-foreground">Four specialists, one seamless experience</p>
          <div className="mt-4 h-1 w-16 rounded-full bg-gold mx-auto" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {[
            { name: 'Nana Kwame', role: 'General Assistant', emoji: '👑', desc: 'Your entry guide. Routes you to the right specialist.', color: '#C8922A' },
            { name: 'Maame Yaa', role: 'Tourism Specialist', emoji: '🗺️', desc: 'Expert in travel, destinations & hospitality.', color: '#1A6B4A' },
            { name: 'Osei Tutu', role: 'Culture Specialist', emoji: '🏛️', desc: 'Expert in arts, heritage & traditions.', color: '#C05A2C' },
            { name: 'Obaa Sarpongmaa', role: 'Language Specialist', emoji: '📚', desc: 'Expert in linguistics, translation & policy.', color: '#6B4A9A' },
          ].map((bot) => (
            <Card key={bot.name} className="text-center group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg cursor-pointer"
              onClick={openBotChat}>
              <CardContent className="p-6">
                <span className="text-4xl">{bot.emoji}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">{bot.name}</h3>
                <p className="text-xs font-medium text-gold">{bot.role}</p>
                <p className="mt-2 text-xs text-muted-foreground">{bot.desc}</p>
                <div className="mt-4 text-gold text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Chatting →
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageWrapper>
    </main>
  )
}
