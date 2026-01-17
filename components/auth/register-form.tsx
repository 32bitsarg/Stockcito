"use client"

import { useState } from 'react'
import { registerUser } from '@/actions/auth-actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Lock, Loader2, Building2, AlertCircle, Check } from 'lucide-react'

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

  const passwordsMatch = password === confirmPassword && password.length > 0
  const passwordValid = password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordValid) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!businessName.trim()) {
      setError('El nombre del negocio es requerido')
      return
    }

    setLoading(true)
    const result = await registerUser({
      name,
      email,
      password,
      businessName
    })
    setLoading(false)

    if (result.success) {
      if (searchParams.get('mode') === 'subscription') {
        router.push('/subscription/upgrade?auto_checkout=true')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } else {
      const errorMsg = typeof result.error === 'string'
        ? result.error
        : 'Error al registrarse'
      setError(errorMsg)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </motion.div>
      )}

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <label className="text-sm font-medium">Nombre completo</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="name"
            placeholder="Tu nombre"
            className="pl-10 h-12 transition-all focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <label className="text-sm font-medium">Nombre del negocio</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            aria-label="business-name"
            placeholder="Ej: Kiosco María, Almacén El Sol"
            className="pl-10 h-12 transition-all focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <label className="text-sm font-medium">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            aria-label="email"
            placeholder="tu@email.com"
            className="pl-10 h-12 transition-all focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <label className="text-sm font-medium">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            aria-label="password"
            placeholder="••••••••"
            className="pl-10 h-12 transition-all focus:ring-2 focus:ring-primary/20"
            required
            minLength={8}
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-1.5 h-1.5 rounded-full ${passwordValid ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
          <span className={passwordValid ? 'text-green-600' : 'text-muted-foreground'}>
            Mínimo 8 caracteres
          </span>
        </div>
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <label className="text-sm font-medium">Confirmar contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            aria-label="confirm-password"
            placeholder="••••••••"
            className="pl-10 h-12 transition-all focus:ring-2 focus:ring-primary/20"
            required
          />
          {confirmPassword.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {passwordsMatch ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          disabled={loading || !passwordsMatch || !passwordValid}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
