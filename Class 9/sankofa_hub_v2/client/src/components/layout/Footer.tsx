import { Link } from 'react-router-dom'
import { Github, Linkedin, Twitter, Mail, MapPin, Globe } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { SankofaLogo } from '@/components/common/AdinkraPattern'

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Sectors', to: '/sectors' },
  { label: 'Features', to: '/features' },
  { label: 'Contact', to: '/contact' },
]

const SECTOR_LINKS = [
  { label: 'Culture', to: '/sectors' },
  { label: 'Tourism', to: '/sectors' },
  { label: 'Language', to: '/sectors' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="border-t border-border bg-muted/60">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <SankofaLogo size={32} />
              <span className="font-display text-lg font-bold text-foreground">Sankofa Hub</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Knowledge rooted in heritage. An intelligent platform bridging Culture, Tourism, and Language — from Ghana to the world.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-gold transition-colors">
                <Twitter className="h-4.5 w-4.5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-gold transition-colors">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-gold transition-colors">
                <Github className="h-4.5 w-4.5" />
              </a>
              <a href="#" aria-label="Email" className="text-muted-foreground hover:text-gold transition-colors">
                <Mail className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Sectors</h3>
            <ul className="space-y-2.5">
              {SECTOR_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>Accra, Ghana — Serving Africa and the World</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>Pan-African Knowledge Platform</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>hello@sankofahub.org</span>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ModeToggle />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Sankofa Hub. Knowledge rooted in heritage. Built with cultural intelligence.
          </p>
          <p className="text-xs text-muted-foreground">
            Aligned with UN SDG 11.4 &middot; AU Agenda 2063 Aspiration 5
          </p>
        </div>
      </div>
    </footer>
  )
}
