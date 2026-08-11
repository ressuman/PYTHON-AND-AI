import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { ScrollProgress } from '@/components/common/ScrollProgress'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { SectorsPage } from '@/pages/SectorsPage'
import { FeaturesPage } from '@/pages/FeaturesPage'
import { ContactPage } from '@/pages/ContactPage'
import { AuthPage } from '@/pages/AuthPage'
import { AiChatPage } from '@/pages/AiChatPage'
import { AdminPage } from '@/pages/AdminPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="sankofa-ui-theme">
          <TooltipProvider>
            <div className="min-h-screen bg-background font-body text-foreground">
              <ScrollProgress />
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/ai"
                  element={<ProtectedRoute><AiChatPage /></ProtectedRoute>}
                />
                <Route
                  path="/ai/:conversationId"
                  element={<ProtectedRoute><AiChatPage /></ProtectedRoute>}
                />
                <Route
                  path="/admin"
                  element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>}
                />
                <Route
                  path="*"
                  element={
                    <>
                      <Navbar />
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/sectors" element={<SectorsPage />} />
                        <Route path="/features" element={<FeaturesPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                      </Routes>
                      <Footer />
                      <ChatWidget />
                    </>
                  }
                />
              </Routes>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
