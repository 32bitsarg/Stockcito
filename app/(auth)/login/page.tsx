import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { AuthHero } from '@/components/auth/auth-hero'
import { getCSRFToken } from '@/lib/security/csrf'
import { Loader2, ArrowLeft } from 'lucide-react'

export default async function LoginPage() {
  const csrfToken = await getCSRFToken()

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white dark:bg-zinc-950">
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative">
        {/* Minimal Navigation */}
        <div className="absolute top-10 left-10 flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Salir</span>
          </Link>
        </div>

        <div className="w-full max-w-[320px] space-y-12">
          {/* Header */}
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-zinc-50 leading-none">
              Ingreso
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
              Verificación de Credenciales
            </p>
          </div>

          {/* Form */}
          <div className="relative">
            <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-zinc-200" /></div>}>
              <LoginForm csrfToken={csrfToken} />
            </Suspense>
          </div>

          {/* Footer Link */}
          <div className="pt-8 text-center md:text-left border-t border-zinc-50 dark:border-zinc-900">
            <Link href="/register" className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors italic">
              ¿No tienes cuenta? Crear Nodo
            </Link>
          </div>
        </div>
      </div>

      <AuthHero />
    </div>
  )
}
