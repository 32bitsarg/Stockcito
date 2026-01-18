"use client"

import { useState, useMemo } from 'react'
import { registerUser } from '@/actions/auth-actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Lock, Loader2, Building2, AlertCircle, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Password validation rules
const passwordRules = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Al menos 1 mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Al menos 1 minúscula', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Al menos 1 número', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Al menos 1 caracter especial (!@#$%^&*)', test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(p) },
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

  // Validate password against all rules
  const passwordValidation = useMemo(() => {
    return passwordRules.map(rule => ({
      ...rule,
      passed: rule.test(password)
    }))
  }, [password])

  const allRulesPassed = passwordValidation.every(r => r.passed)
  const passedCount = passwordValidation.filter(r => r.passed).length
  const passwordsMatch = password === confirmPassword && password.length > 0

  // Password strength indicator
  const strengthLevel = useMemo(() => {
    if (passedCount <= 1) return { label: 'Muy débil', color: 'bg-red-500', width: '20%' }
    if (passedCount === 2) return { label: 'Débil', color: 'bg-orange-500', width: '40%' }
    if (passedCount === 3) return { label: 'Regular', color: 'bg-yellow-500', width: '60%' }
    if (passedCount === 4) return { label: 'Buena', color: 'bg-lime-500', width: '80%' }
    return { label: 'Excelente', color: 'bg-green-500', width: '100%' }
  }, [passedCount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!allRulesPassed) {
      setError('La contraseña no cumple con todos los requisitos de seguridad')
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
          className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-start gap-2"
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
            onFocus={() => setShowPasswordRules(true)}
            type="password"
            aria-label="password"
            placeholder="••••••••"
            className="pl-10 h-12 transition-all focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Seguridad:</span>
              <span className={cn(
                "font-medium",
                passedCount <= 2 ? "text-red-500" : passedCount <= 3 ? "text-yellow-500" : "text-green-500"
              )}>
                {strengthLevel.label}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", strengthLevel.color)}
                initial={{ width: 0 }}
                animate={{ width: strengthLevel.width }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Password Requirements Checklist */}
        {showPasswordRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-lg bg-muted/50 border space-y-1.5"
          >
            <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos de seguridad:</p>
            {passwordValidation.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2 text-xs">
                {rule.passed ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                )}
                <span className={cn(
                  rule.passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                )}>
                  {rule.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}
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
          disabled={loading || !passwordsMatch || !allRulesPassed}
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
