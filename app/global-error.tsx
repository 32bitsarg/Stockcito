'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
    
    // Auto-reload for ChunkLoadError
    if (
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('Failed to load chunk') ||
      error.message?.includes('Loading chunk')
    ) {
      console.log('ChunkLoadError in global error boundary, reloading...')
      const timer = setTimeout(() => {
        window.location.reload()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <html lang="es">
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
            Algo salió mal
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error.message?.includes('ChunkLoadError') 
              ? 'Recargando la página automáticamente...'
              : 'Ocurrió un error crítico. Por favor, recarga la página.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Recargar página
          </button>
        </div>
      </body>
    </html>
  )
}
