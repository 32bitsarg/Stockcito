import { Suspense } from 'react'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'
import { AuthHero } from '@/components/auth/auth-hero'
import { Loader2, ArrowLeft } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white dark:bg-zinc-950">
      <AuthHero
        title="Registro"
        subtitle="Comienza a gestionar tu negocio de forma profesional en segundos."
      />

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative">
        {/* Minimal Navigation */}
        <div className="absolute top-10 right-10">
          <Link href="/" className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Salir</span>
            <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="w-full max-w-[380px] space-y-12">
          {/* Header */}
          <div className="space-y-2 text-center md:text-right">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-zinc-50 leading-none">
              Registro
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300 italic">
              Nuevo Usuario
            </p>
          </div>

          <div className="relative">
            <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-zinc-200" /></div>}>
              <RegisterForm />
            </Suspense>
          </div>

          <div className="pt-8 text-center md:text-right border-t border-zinc-50 dark:border-zinc-900">
            <Link href={`/login${params.mode ? `?mode=${params.mode}` : ''}`} className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors italic">
              ¿Ya tienes cuenta? Ingresar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
