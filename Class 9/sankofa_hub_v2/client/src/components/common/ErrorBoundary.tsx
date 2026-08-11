import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 ">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sankofa Hub encountered an unexpected error.
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            aria-label="Reload page"
          >
            Reload page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
