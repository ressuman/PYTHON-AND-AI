import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SankofaLogo } from '@/components/common/AdinkraPattern'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export function AuthPage() {
  const [tab, setTab] = useState('login')

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B8860B_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <nav className="relative z-10 px-6 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md relative z-10 border-border shadow-xl">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="inline-block">
              <div className="flex justify-center mb-4 hover:opacity-80 transition-opacity">
                <SankofaLogo size={48} />
              </div>
            </Link>
            <CardTitle className="font-display text-2xl text-foreground">
              {tab === 'login' ? 'Welcome Back' : 'Join Sankofa Hub'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === 'login'
                ? 'Sign in to access your conversations and history'
                : 'Create an account to start your journey'}
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onSwitchToRegister={() => setTab('register')} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm onSwitchToLogin={() => setTab('login')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
