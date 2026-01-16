'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error
    console.error('Application error:', error)
    
    // Auto-reload for ChunkLoadError (common in Turbopack development)
    if (
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('Failed to load chunk') ||
      error.message?.includes('Loading chunk')
    ) {
      console.log('ChunkLoadError detected, reloading page...')
      // Wait a bit before reloading to avoid infinite loops
      const timer = setTimeout(() => {
        window.location.reload()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleRetry = () => {
    // For chunk errors, a full reload is usually needed
    if (
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('Failed to load chunk') ||
      error.message?.includes('Loading chunk')
    ) {
      window.location.reload()
    } else {
      reset()
    }
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <h2 className="text-xl font-semibold">Algo salió mal</h2>
      </div>
      
      <p className="text-center text-muted-foreground max-w-md">
        {error.message?.includes('ChunkLoadError') || error.message?.includes('Failed to load chunk')
          ? 'Hubo un problema cargando la página. Recargando automáticamente...'
          : 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'}
      </p>
      
      <div className="flex gap-2">
        <Button onClick={handleRetry} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
        <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
          Ir al Dashboard
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 max-w-lg text-xs text-muted-foreground">
          <summary className="cursor-pointer">Detalles del error</summary>
          <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-muted p-2">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  )
}
