import type { BotConfig } from '@/types'

export const BOT_CONFIGS: Record<string, BotConfig> = {
  general: {
    id: 'general',
    skillId: 'general-nana-kwame_bot',
    name: 'Nana Kwame',
    fullName: 'Nana Kwame — General Assistant',
    description: 'Your entry guide across all three domains',
    color: '#C8920A',
    darkColor: '#E5A93C',
    bgColor: '#FDF8EE',
    darkBgColor: '#2A2318',
    icon: '🌍',
    emoji: '👑',
    greeting:
      "Akwaaba! I'm Nana Kwame, your general guide to Sankofa Hub. Ask me anything about Culture, Tourism, or Language — or let me connect you to the right specialist.",
    placeholder: 'Ask about culture, tourism, or language...',
    avatarInitials: 'NK',
  },
  tourism: {
    id: 'tourism',
    skillId: 'tourism-maame-yaa_bot',
    name: 'Maame Yaa',
    fullName: 'Maame Yaa — Tourism Specialist',
    description: 'Expert in travel, destinations & hospitality',
    color: '#2D6A4F',
    darkColor: '#2D9A6B',
    bgColor: '#F0FAF5',
    darkBgColor: '#0F2318',
    icon: '✈️',
    emoji: '🗺️',
    greeting:
      "Hello! I'm Maame Yaa, your tourism specialist. I can help you discover destinations, plan trips, understand hospitality, and explore the world of travel — especially across Africa.",
    placeholder: 'Ask about destinations, travel tips, visas...',
    avatarInitials: 'MY',
  },
  culture: {
    id: 'culture',
    skillId: 'culture-osei-tutu_bot',
    name: 'Osei Tutu',
    fullName: 'Osei Tutu — Culture Specialist',
    description: 'Expert in arts, heritage & traditions',
    color: '#8B1A1A',
    darkColor: '#D97040',
    bgColor: '#FDF3EE',
    darkBgColor: '#2A1510',
    icon: '🎭',
    emoji: '🏛️',
    greeting:
      "Greetings! I'm Osei Tutu, your culture specialist. From Adinkra symbols to world heritage sites, performing arts to cultural policy — I'm here to help you explore the richness of human culture.",
    placeholder: 'Ask about arts, heritage, traditions, festivals...',
    avatarInitials: 'OT',
  },
  language: {
    id: 'language',
    skillId: 'language-obaa-sarpongmaa_bot',
    name: 'Obaa Sarpongmaa',
    fullName: 'Obaa Sarpongmaa — Language Specialist',
    description: 'Expert in linguistics, translation & policy',
    color: '#2C2D6B',
    darkColor: '#9B7AC8',
    bgColor: '#F5F0FF',
    darkBgColor: '#1A1228',
    icon: '🗣️',
    emoji: '📚',
    greeting:
      "Hello! I'm Obaa Sarpongmaa, your language specialist. Whether you need help with translation, want to learn about African languages, explore linguistics, or understand language policy — I'm your guide.",
    placeholder: 'Ask about languages, translation, linguistics...',
    avatarInitials: 'OS',
  },
}

export const BOT_ORDER: string[] = ['general', 'tourism', 'culture', 'language']

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Sectors', href: '/sectors' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
]

export const SITE_STATS = [
  { value: 3, suffix: '', label: 'Specialist Domains', prefix: '' },
  { value: 4, suffix: '', label: 'AI Assistants', prefix: '' },
  { value: 54, suffix: '+', label: 'Countries Covered', prefix: '' },
  { value: 2000, suffix: '+', label: 'Languages Tracked', prefix: '' },
]

export const SECTORS = [
  {
    id: 'culture',
    title: 'Culture',
    subtitle: 'Arts, Heritage & Creative Life',
    description:
      'Explore the full spectrum of human cultural expression — from Adinkra symbolism and Kente traditions to world heritage sites, performing arts, and cultural policy across Africa and beyond.',
    icon: '🎭',
    color: '#C05A2C',
    botId: 'culture' as const,
    items: [
      'Visual Arts',
      'Heritage Sites',
      'Performing Arts',
      'Festivals',
      'Cultural Policy',
      'Traditional Crafts',
    ],
  },
  {
    id: 'tourism',
    title: 'Tourism',
    subtitle: 'Travel, Destinations & Hospitality',
    description:
      "Discover Africa and the world through expert tourism guidance — from eco-tourism in Ghana's forests to cultural heritage trails, culinary adventures, and sustainable travel practices.",
    icon: '✈️',
    color: '#1A6B4A',
    botId: 'tourism' as const,
    items: [
      'Eco Tourism',
      'Cultural Tourism',
      'Adventure Travel',
      'Culinary Tourism',
      'Medical Tourism',
      'Tourism Policy',
    ],
  },
  {
    id: 'language',
    title: 'Language',
    subtitle: 'Linguistics, Translation & Policy',
    description:
      'Navigate the extraordinary diversity of human language — from Akan proverbs and Twi translation to endangered language preservation, NLP technology, and multilingual education.',
    icon: '🗣️',
    color: '#6B4A9A',
    botId: 'language' as const,
    items: [
      'Translation',
      'Linguistics',
      'Language Preservation',
      'Sign Language',
      'Language Technology',
      'Sociolinguistics',
    ],
  },
]

export const FEATURES = [
  {
    icon: '🤖',
    title: 'Intelligent Routing',
    description:
      'Ask any question and be seamlessly connected to the right specialist. No wrong door — just smarter conversations.',
  },
  {
    icon: '🔄',
    title: 'Bidirectional Handoff',
    description:
      'Switch between specialists mid-conversation without losing context. Your history follows you everywhere.',
  },
  {
    icon: '🌍',
    title: 'Africa-First Knowledge',
    description:
      'Built with deep attention to African cultures, languages, and tourism contexts — not as an afterthought.',
  },
  {
    icon: '⚡',
    title: 'Powered by Advanced AI',
    description:
      'Multiple AI models with intelligent fallback ensure you always get a thoughtful, reliable response.',
  },
  {
    icon: '🔒',
    title: 'Session Memory',
    description:
      'Your conversation context is maintained throughout your session, making each exchange richer than the last.',
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    description:
      "A seamless experience whether you're on desktop, tablet, or mobile — the bots are always with you.",
  },
]

export const TESTIMONIALS = [
  {
    name: 'Ama Serwaa',
    role: 'Travel Researcher, University of Ghana',
    quote:
      'Maame Yaa helped me plan a heritage trail through the Ashanti Region with remarkable cultural sensitivity. The routing between bots felt seamless.',
    avatar: 'AS',
  },
  {
    name: 'Kwesi Mensah',
    role: 'Cultural Studies Scholar',
    quote:
      "Osei Tutu's depth on Adinkra symbolism and festival traditions exceeded my expectations. Sankofa Hub treats African culture with the respect it deserves.",
    avatar: 'KM',
  },
  {
    name: 'Efua Boateng',
    role: 'Linguistics Student, KNUST',
    quote:
      'Obaa Sarpongmaa guided me through Twi translation nuances and language preservation policy. Finally, a platform that centres African languages.',
    avatar: 'EB',
  },
]

// Professional AU/UN Dashboard Registry & Analytics Constants

export interface RegistryItem {
  id: string
  name: string
  region: 'West' | 'East' | 'Central' | 'Southern' | 'North'
  country: string
  category: 'Cultural' | 'Natural' | 'Mixed'
  status: 'Active Preservation' | 'Threatened' | 'Under Review' | 'Nominated'
  yearInscribed: number
  description: string
  policyAlignment: string
}

export const UNESCO_HERITAGE_REGISTRY: RegistryItem[] = [
  {
    id: 'elmina-castle',
    name: 'Forts and Castles, Volta, Greater Accra, Central and Western Regions',
    region: 'West',
    country: 'Ghana',
    category: 'Cultural',
    status: 'Active Preservation',
    yearInscribed: 1979,
    description: 'Fortified trading posts, founded between 1482 and 1786, and along the coast of Ghana between Keta and Beyin. They were significant nodes in the transatlantic trade of gold and enslaved peoples.',
    policyAlignment: 'UN SDG 11.4 / AU Agenda 2063 Aspiration 5'
  },
  {
    id: 'asante-buildings',
    name: 'Asante Traditional Buildings',
    region: 'West',
    country: 'Ghana',
    category: 'Cultural',
    status: 'Threatened',
    yearInscribed: 1980,
    description: 'To the north-east of Kumasi, these buildings represent the last remaining testimony of the great Asante civilization, which reached its peak in the 18th century.',
    policyAlignment: 'UN SDG 11.4'
  },
  {
    id: 'lalibela-churches',
    name: 'Rock-Hewn Churches, Lalibela',
    region: 'East',
    country: 'Ethiopia',
    category: 'Cultural',
    status: 'Active Preservation',
    yearInscribed: 1978,
    description: 'Eleven monolithic cave churches carved out of solid rock in the 13th century, designed to create a "New Jerusalem" in the mountainous heart of Ethiopia.',
    policyAlignment: 'UN SDG 11.4 / AU Agenda 2063 Aspiration 5'
  },
  {
    id: 'great-zimbabwe',
    name: 'Great Zimbabwe National Monument',
    region: 'Southern',
    country: 'Zimbabwe',
    category: 'Cultural',
    status: 'Active Preservation',
    yearInscribed: 1986,
    description: 'Ruins of a medieval city constructed of dry stone walls spanning the 11th to 15th centuries. A major trading hub for gold and porcelain with Indian Ocean markets.',
    policyAlignment: 'AU Agenda 2063 Aspiration 5'
  },
  {
    id: 'djenne-towns',
    name: 'Old Towns of Djenné',
    region: 'West',
    country: 'Mali',
    category: 'Cultural',
    status: 'Threatened',
    yearInscribed: 1988,
    description: 'Inhabited since 250 B.C., Djenné became an essential market-center and a link in the trans-Saharan gold trade, famous for its monumental adobe architecture.',
    policyAlignment: 'UN SDG 11.4 / Endangered List'
  },
  {
    id: 'serengeti-park',
    name: 'Serengeti National Park',
    region: 'East',
    country: 'Tanzania',
    category: 'Natural',
    status: 'Active Preservation',
    yearInscribed: 1981,
    description: 'Immense savanna plains hosting the largest remaining unaltered animal migration in the world, with over a million wildebeest and zebra moving seasonally.',
    policyAlignment: 'UN SDG 15 (Life on Land)'
  },
  {
    id: 'tassili-n-ajjer',
    name: 'Tassili n\'Ajjer rock art',
    region: 'North',
    country: 'Algeria',
    category: 'Mixed',
    status: 'Under Review',
    yearInscribed: 1982,
    description: 'One of the most important groupings of prehistoric cave art in the world, with more than 15,000 drawings and engravings detailing climatic changes and human life from 6000 BC.',
    policyAlignment: 'UN SDG 11.4'
  },
  {
    id: 'okavango-delta',
    name: 'Okavango Delta',
    region: 'Southern',
    country: 'Botswana',
    category: 'Natural',
    status: 'Active Preservation',
    yearInscribed: 2014,
    description: 'One of the very few large inland delta systems without an outlet to the ocean, showcasing annual flooding in a hyper-arid region that supports high wildlife biodiversity.',
    policyAlignment: 'UN SDG 15'
  }
]

export interface TravelCorridor {
  id: string
  name: string
  countries: string[]
  durationDays: number
  focus: string
  stops: string[]
  highlights: string[]
}

export const TOURISM_CORRIDORS: TravelCorridor[] = [
  {
    id: 'west-heritage',
    name: 'West African Heritage Trail',
    countries: ['Ghana', 'Togo', 'Benin'],
    durationDays: 14,
    focus: 'Historical memory, arts, traditional architecture',
    stops: ['Accra', 'Cape Coast', 'Lomé', 'Ouidah', 'Cotonou'],
    highlights: ['Kakum Canopy Walk', 'Elmina Castle dungeons', 'Lomé Fetish Market', 'Ouidah Temple of Pythons', 'Ganvié lake village']
  },
  {
    id: 'east-safari-swahili',
    name: 'Swahili Coast & Wildlife Corridor',
    countries: ['Kenya', 'Tanzania'],
    durationDays: 18,
    focus: 'Ecotourism, marine ecosystems, archaeological ruins',
    stops: ['Nairobi', 'Maasai Mara', 'Mombasa', 'Zanzibar', 'Dar es Salaam'],
    highlights: ['Great Migration crossing', 'Stone Town tour', 'Fort Jesus ruins', 'Dhow boat sailing', 'Marine conservation reefs']
  },
  {
    id: 'south-conservation',
    name: 'Southern Conservation & Wilderness Loop',
    countries: ['Botswana', 'Zimbabwe', 'South Africa'],
    durationDays: 21,
    focus: 'Sustainable wildlife, water resources, stone monuments',
    stops: ['Gaborone', 'Okavango Delta', 'Victoria Falls', 'Bulawayo', 'Kruger National Park'],
    highlights: ['Mekoro delta canoes', 'Victoria Falls mist trail', 'Great Zimbabwe Dry-Stone walls', 'Kruger ecosystem drives']
  }
]

export interface LanguageFamily {
  name: string
  speakersMillions: number
  branches: string[]
  keyLanguages: string[]
  description: string
}

export const LANGUAGE_FAMILIES: LanguageFamily[] = [
  {
    name: 'Niger-Congo',
    speakersMillions: 700,
    branches: ['Bantu', 'Kwa', 'Gur', 'Mande'],
    keyLanguages: ['Swahili', 'Yoruba', 'Zulu', 'Twi', 'Shona', 'Igbo', 'Wolof'],
    description: 'The largest language family in Africa, spanning West, Central, East, and Southern regions. Known for its extensive noun-class systems and tonal dynamics.'
  },
  {
    name: 'Afroasiatic',
    speakersMillions: 500,
    branches: ['Semitic', 'Cushitic', 'Berber', 'Chadic'],
    keyLanguages: ['Arabic', 'Amharic', 'Hausa', 'Oromo', 'Somali', 'Tamazight'],
    description: 'Spanned across North Africa, the Horn of Africa, and parts of the Sahel. Contains some of the world\'s oldest written language traditions.'
  },
  {
    name: 'Nilo-Saharan',
    speakersMillions: 60,
    branches: ['Nilotic', 'Songhay', 'Sahara'],
    keyLanguages: ['Dinka', 'Luo', 'Maasai', 'Kanuri', 'Zarma', 'Nuer'],
    description: 'Predominantly spoken in the upper Nile basin, parts of East Africa, and the central Sahel. Highly diverse with complex phonetic systems.'
  },
  {
    name: 'Khoisan / Indigenous Click Families',
    speakersMillions: 0.4,
    branches: ['Khoe-Kwadi', 'Tuu', 'Kx\'a'],
    keyLanguages: ['Nama (Khoekhoegowab)', 'Ju|\'hoansi', '!Xóõ'],
    description: 'Historically spoken by hunter-gatherer populations across Southern Africa. Famous for utilizing click consonants as phonemes.'
  }
]

export interface PhraseEntry {
  english: string
  twi: string
  swahili: string
  yoruba: string
  literalMeaning: string
  culturalContext: string
}

export const PHRASE_DICTIONARY: PhraseEntry[] = [
  {
    english: 'Welcome / Feel at home',
    twi: 'Akwaaba',
    swahili: 'Karibu',
    yoruba: 'E kaabo',
    literalMeaning: 'Enter / Come in',
    culturalContext: 'Represents the fundamental African value of hospitality. In Ghana, it signifies warmth, validation, and instantaneous communal entry.'
  },
  {
    english: 'Go back and fetch it (Heritage)',
    twi: 'Sankofa',
    swahili: 'Kumbukumbu ya kale',
    yoruba: 'Àpadà bọ̀ wá mú',
    literalMeaning: 'Return and take it',
    culturalContext: 'Akan philosophical concept. Encourages retrieving positive cultural roots to construct a progressive, conscious future.'
  },
  {
    english: 'Humanity / I am because we are',
    twi: 'Nnipa banbɔ (Obra)',
    swahili: 'Utu / Ubuntu',
    yoruba: 'Omoluabi / Iwa',
    literalMeaning: 'Human goodness / Personhood',
    culturalContext: 'The foundational philosophy of African social contracts. Acknowledges that individual wellness is structurally tethered to community wellbeing.'
  },
  {
    english: 'Patience solves all things',
    twi: 'Abotare fa manya',
    swahili: 'Subira huvuta heri',
    yoruba: 'Suuru lere',
    literalMeaning: 'Patience attracts blessing',
    culturalContext: 'Taught to counsel resilience in times of friction or national hardship. Deeply embedded in political and family systems.'
  }
]

export interface PolicyIndicator {
  code: string
  title: string
  auGoal: string
  unSdg: string
  progress: number // 0-100 percentage
  metric: string
}

export const POLICY_INDICATORS: PolicyIndicator[] = [
  {
    code: 'AU-5.1',
    title: 'African Cultural Identity Integration',
    auGoal: 'Aspiration 5: Strong Cultural Identity & Common Heritage',
    unSdg: 'SDG 11.4: Protect cultural & natural heritage',
    progress: 68,
    metric: '41 out of 55 member states have integrated national heritage programs in primary education.'
  },
  {
    code: 'AU-5.2',
    title: 'Pan-African Creative Industry Growth',
    auGoal: 'Goal 16: African cultural renaissance is pre-eminent',
    unSdg: 'SDG 8.9: Devise policies to promote sustainable tourism & local culture',
    progress: 52,
    metric: 'Creative sector output across AU states expanded by 8.4% annually, matching Agenda 2063 mid-term targets.'
  },
  {
    code: 'UN-11.4.1',
    title: 'UNESCO World Heritage Protection Financing',
    auGoal: 'Aspiration 5, Goal 16',
    unSdg: 'SDG 11.4: Protection of cultural/natural heritage',
    progress: 44,
    metric: 'Allocations for endangered site preservation increased by $12M across African biosphere reserves.'
  },
  {
    code: 'AU-1.3',
    title: 'Indigenous Language Literacy Systems',
    auGoal: 'Aspiration 1, Goal 4: Educated citizenry & skills revolution',
    unSdg: 'SDG 4.6: Universal literacy & numeracy',
    progress: 59,
    metric: '18 West/East African states implemented mother-tongue bilingual instruction frameworks in early-grade curricula.'
  }
]

export const AGENT_FLOW_STEPS = [
  {
    step: 1,
    agent: 'Intelligent Router (Nana Kwame)',
    action: 'Intercepts incoming query',
    details: 'Uses NLP classification models to evaluate query intent across Culture, Tourism, and Language domains.'
  },
  {
    step: 2,
    agent: 'Semantic Classifier',
    action: 'Analyzes dominant intent',
    details: 'Triggers a handoff protocol if the intent matches a specialist bot, or routes to "general" if multi-domain.'
  },
  {
    step: 3,
    agent: 'Session Memory Manager',
    action: 'Preserves chat history state',
    details: 'Maintains context across bot handoffs, transferring previous parameters, inputs, and conversation vectors.'
  },
  {
    step: 4,
    agent: 'Domain Expert Execution',
    action: 'Formulates domain response',
    details: 'Executes using the designated specialist prompt (Maame Yaa for Tourism, Osei Tutu for Culture, Obaa Sarpongmaa for Language) with custom API fallbacks.'
  }
]

export const AGENT_SAMPLES = [
  {
    label: 'Tourism Query',
    text: 'What are the visa requirements and best eco-tourism spots in Ghana?',
    targetBot: 'tourism',
    reason: 'Matches "travel, visa, eco-tourism destinations" categories.'
  },
  {
    label: 'Culture Query',
    text: 'Can you explain the meaning and history of the Adinkra symbol Gye Nyame?',
    targetBot: 'culture',
    reason: 'Matches "heritage, traditional symbols, history" categories.'
  },
  {
    label: 'Language Query',
    text: 'How do you say welcome in Swahili and translate "I am because we are"?',
    targetBot: 'language',
    reason: 'Matches "translation, vocabulary, linguistics" categories.'
  },
  {
    label: 'Cross-Domain / Router',
    text: 'How does linguistic preservation impact cultural tourism policy in West Africa?',
    targetBot: 'general',
    reason: 'Spans all three sectors equally; processed directly by Nana Kwame.'
  }
]

