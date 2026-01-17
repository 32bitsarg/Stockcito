import { Suspense } from 'react'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'
import { AuthHero } from '@/components/auth/auth-hero'
import { Loader2 } from 'lucide-react'

export default function RegisterPage({ searchParams }: { searchParams: { mode?: string } }) {
  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left side - Info with animations */}
      <AuthHero
        title="Comenzá con Stockcito"
        subtitle="Registrate y probá el POS en minutos. Tené tu inventario y facturación listos."
      />

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-background p-6 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="text-muted-foreground text-sm">Registrate para usar Stockcito gratis</p>
          </div>

          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <RegisterForm />
          </Suspense>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link
              href={`/login${searchParams.mode ? `?mode=${searchParams.mode}` : ''}`}
              className="font-medium text-primary hover:underline transition-colors"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
