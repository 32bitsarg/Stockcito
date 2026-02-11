"use client"

import { useState, useMemo } from 'react'
import { registerUser } from '@/actions/auth-actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const passwordRules = [
  { id: 'length', label: '8+ CHARS', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'MAYUS', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'MINUS', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'NUM', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'ESPEC', test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(p) },
]

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordRules, setShowPasswordRules] = useState(false)

  const passwordValidation = useMemo(() => passwordRules.map(rule => ({ ...rule, passed: rule.test(password) })), [password])
  const allRulesPassed = passwordValidation.every(r => r.passed)
  const passedCount = passwordValidation.filter(r => r.passed).length
  const passwordsMatch = password === confirmPassword && password.length > 0

  const strengthLevel = useMemo(() => {
    if (passedCount <= 1) return { label: 'CRÍTICO', color: 'bg-red-500', width: '20%' }
    if (passedCount === 2) return { label: 'DÉBIL', color: 'bg-orange-500', width: '40%' }
    if (passedCount === 3) return { label: 'REGULAR', color: 'bg-zinc-400', width: '60%' }
    if (passedCount === 4) return { label: 'BUENO', color: 'bg-zinc-600', width: '80%' }
    return { label: 'SEGURO', color: 'bg-emerald-500', width: '100%' }
  }, [passedCount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!allRulesPassed) { setError('REQUISITOS_SEGURIDAD_INCUMPLIDOS'); return }
    if (!passwordsMatch) { setError('LAS_CONTRASEÑAS_NO_COINCIDEN'); return }
    if (!businessName.trim()) { setError('NOMBRE_NEGOCIO_REQUERIDO'); return }

    setLoading(true)
    const result = await registerUser({ name, email, password, businessName })
    setLoading(false)

    if (result.success) {
      if (searchParams.get('mode') === 'subscription') {
        const plan = searchParams.get('plan') || 'premium'
        router.push(`/subscription/upgrade?auto_checkout=true&plan=${plan}`)
      }
      else router.push('/dashboard')
      router.refresh()
    } else {
      setError(typeof result.error === 'string' ? result.error : 'FALLO_DESPLIEGUE')
    }
  }

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-[8px] font-black uppercase tracking-[0.2em] italic">
            [ ERROR: {error} ]
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Nombre Completo</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ALPHA"
              className="h-9 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold uppercase text-[10px] tracking-widest placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Nombre del Negocio</label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="DELTA_6"
              className="h-9 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold uppercase text-[10px] tracking-widest placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-none"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="USUARIO@NODO.LOCAL"
            className="h-9 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold uppercase text-[10px] tracking-widest placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Clave</label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordRules(true)}
              type="password"
              placeholder="****"
              className="h-9 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold text-[10px] tracking-widest placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Confirmar</label>
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="****"
              className="h-9 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold text-[10px] tracking-widest placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-none"
              required
            />
          </div>
        </div>

        <AnimatePresence>
          {(password.length > 0) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-dashed border-zinc-100 dark:border-zinc-800 pb-1">
                <span className="text-[6px] font-black uppercase tracking-widest text-zinc-500 italic">Nivel Encriptación:</span>
                <span className={cn("text-[6px] font-black tracking-widest italic", strengthLevel.color.replace('bg-', 'text-'))}>{strengthLevel.label}</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {passwordValidation.map(rule => (
                  <div key={rule.id} className={cn("h-1 transition-all", rule.passed ? "bg-zinc-900 dark:bg-white" : "bg-zinc-100 dark:bg-zinc-900")} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-6">
        <Button type="submit" className="w-full h-11 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-none font-black uppercase tracking-[0.3em] text-[10px] shadow-none border border-zinc-900 dark:border-white transition-all" disabled={loading || !passwordsMatch || !allRulesPassed}>
          {loading ? "PROCESANDO..." : "Crear Cuenta"}
        </Button>
      </div>
    </motion.form>
  )
}
