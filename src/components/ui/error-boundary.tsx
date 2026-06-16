'use client'

import { Component, type ReactNode } from 'react'
import { Button } from './button'
import { AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8">
          <div className="w-14 h-14 rounded-full bg-red-950 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-white font-semibold mb-2">Algo deu errado</p>
          <p className="text-slate-400 text-sm mb-6 max-w-sm">{this.state.message || 'Ocorreu um erro inesperado.'}</p>
          <Button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Tentar novamente
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
