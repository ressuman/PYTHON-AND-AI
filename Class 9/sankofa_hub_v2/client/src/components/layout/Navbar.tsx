import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/mode-toggle'
import { SankofaLogo } from '@/components/common/AdinkraPattern'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Sectors', to: '/sectors' },
  { label: 'Features', to: '/features' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const openChat = useChatStore((s) => s.openChat)
  const { isAuthenticated, user } = useAuthStore()
  const { logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2.5 group">
          <SankofaLogo size={34} />
          <div className="flex flex-col">
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground leading-none group-hover:text-gold transition-colors">
              Sankofa Hub
            </span>
            <span className="text-[8px] font-bold text-gold uppercase tracking-[0.2em] mt-0.5 leading-none">
              Culture · Tourism · Language
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-gold bg-gold/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink
              to="/ai"
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors',
                  isActive
                    ? 'text-gold bg-gold/15'
                    : 'text-gold hover:bg-gold/10',
                )
              }
            >
              AI Chat
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className="h-7 w-7 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to="/ai" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    AI Chat
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-terracotta" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="hidden sm:inline-flex cursor-pointer">
                  Register
                </Button>
              </Link>
            </>
          )}
          <Button
            size="sm"
            className="hidden sm:inline-flex cursor-pointer"
            onClick={openChat}
            aria-label="Talk to our AI assistants"
          >
            Talk to Bots
          </Button>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-gold bg-gold/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink
              to="/ai"
              className="block px-3.5 py-2.5 rounded-lg text-sm font-semibold text-gold"
            >
              AI Chat
            </NavLink>
          )}
          {isAuthenticated ? (
            <>
              <div className="px-3.5 py-2 text-sm text-muted-foreground border-t border-border pt-3 mt-2">
                Signed in as {user?.name}
              </div>
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground"
                >
                  Admin Dashboard
                </NavLink>
              )}
              <button
                onClick={logout}
                className="block w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-terracotta"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="w-full mt-2 cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="w-full mt-1 cursor-pointer">
                  Register
                </Button>
              </Link>
            </>
          )}
          <Button size="sm" className="w-full mt-2 cursor-pointer" onClick={openChat}>
            Talk to Bots
          </Button>
        </div>
      )}
    </header>
  )
}
