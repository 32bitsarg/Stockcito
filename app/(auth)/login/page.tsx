import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { AuthHero } from '@/components/auth/auth-hero'
import { getCSRFToken } from '@/lib/security/csrf'

export default async function LoginPage() {
  const csrfToken = await getCSRFToken()

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-6 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
            <p className="text-muted-foreground text-sm">Ingresá tus datos para acceder</p>
          </div>

          <LoginForm csrfToken={csrfToken} />

          <p className="text-center text-sm text-muted-foreground">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline transition-colors">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visuals */}
      <AuthHero />
    </div>
  )
}
