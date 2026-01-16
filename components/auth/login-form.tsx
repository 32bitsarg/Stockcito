"use client"

import { useState, Suspense } from 'react'
import { loginUser, loginWithPin, loginWithBusinessCode, getEmployeesForBusinessCode } from '@/actions/auth-actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, Loader2, KeyRound, Building2, User, ArrowLeft, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type LoginMode = 'owner' | 'employee'
type OwnerMethod = 'password' | 'pin'
type EmployeeStep = 'code' | 'select' | 'credential'
type EmployeeMethod = 'pin' | 'password'

interface Employee {
  id: number
  name: string
  hasPin: boolean
  hasPassword: boolean
}

interface LoginFormProps {
  csrfToken?: string
}

function LoginFormInner({ csrfToken }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  // Mode selection
  const [mode, setMode] = useState<LoginMode>('owner')

  // Owner login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [ownerMethod, setOwnerMethod] = useState<OwnerMethod>('password')

  // Employee login state
  const [businessCode, setBusinessCode] = useState('')
  const [employeeStep, setEmployeeStep] = useState<EmployeeStep>('code')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeCredential, setEmployeeCredential] = useState('')
  const [employeeMethod, setEmployeeMethod] = useState<EmployeeMethod>('pin')
  const [businessName, setBusinessName] = useState('')

  // Common state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format business code as user types (XXX-NNNN-CC)
  const formatBusinessCode = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const parts = []
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 3))
    if (cleaned.length > 3) parts.push(cleaned.slice(3, 7))
    if (cleaned.length > 7) parts.push(cleaned.slice(7, 9))
    return parts.join('-')
  }

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = ownerMethod === 'password'
        ? await loginUser({ email, password, csrfToken })
        : await loginWithPin({ email, pin, csrfToken })

      if (result.success) {
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError(typeof result.error === 'string' ? result.error : 'Error al iniciar sesión')
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (businessCode.length < 11) {
      setError('Ingresa el código completo (ej: ABC-1234-XY)')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getEmployeesForBusinessCode(businessCode)

      if (result.success && result.employees) {
        if (result.employees.length === 0) {
          setError('No hay empleados registrados en este negocio')
        } else {
          setEmployees(result.employees)
          setBusinessName(result.businessName || '')
          setEmployeeStep('select')
        }
      } else {
        setError(result.error || 'Código de negocio inválido')
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
    // Default to PIN if available, otherwise password
    setEmployeeMethod(employee.hasPin ? 'pin' : 'password')
    setEmployeeStep('credential')
    setError(null)
  }

  const handleEmployeeCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return

    setLoading(true)
    setError(null)

    try {
      const result = await loginWithBusinessCode({
        businessCode,
        userId: selectedEmployee.id,
        credential: employeeCredential,
        method: employeeMethod,
        csrfToken
      })

      if (result.success) {
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError(result.error || (employeeMethod === 'pin' ? 'PIN incorrecto' : 'Contraseña incorrecta'))
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const resetEmployeeFlow = () => {
    setEmployeeStep('code')
    setBusinessCode('')
    setEmployees([])
    setSelectedEmployee(null)
    setEmployeeCredential('')
    setEmployeeMethod('pin')
    setBusinessName('')
    setError(null)
  }

  const toggleOwnerMethod = () => {
    setOwnerMethod(m => m === 'password' ? 'pin' : 'password')
    setError(null)
    setPassword('')
    setPin('')
  }

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => { setMode('owner'); resetEmployeeFlow() }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
            mode === 'owner'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="w-4 h-4" />
          Propietario
        </button>
        <button
          type="button"
          onClick={() => { setMode('employee'); setError(null) }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
            mode === 'employee'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          Empleado
        </button>
      </div>

      {/* Error Display */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Owner Login */}
      <AnimatePresence mode="wait">
        {mode === 'owner' && (
          <motion.form
            key="owner"
            onSubmit={handleOwnerSubmit}
            className="space-y-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {ownerMethod === 'password' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">PIN de acceso</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    type="password"
                    inputMode="numeric"
                    placeholder="••••"
                    className="pl-10 h-12 tracking-widest"
                    required
                    minLength={4}
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continuar
              </Button>

              <button
                type="button"
                onClick={toggleOwnerMethod}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                {ownerMethod === 'password' ? (
                  <><KeyRound className="h-4 w-4" /> Ingresar con PIN</>
                ) : (
                  <><Lock className="h-4 w-4" /> Ingresar con contraseña</>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* Employee Login */}
        {mode === 'employee' && employeeStep === 'code' && (
          <motion.form
            key="employee-code"
            onSubmit={handleBusinessCodeSubmit}
            className="space-y-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="text-center pb-2">
              <p className="text-sm text-muted-foreground">
                Ingresa el código de negocio que te proporcionó tu empleador
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Código de negocio</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={businessCode}
                  onChange={(e) => setBusinessCode(formatBusinessCode(e.target.value))}
                  placeholder="ABC-1234-XY"
                  className="pl-10 h-12 font-mono tracking-wider text-center uppercase"
                  maxLength={11}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12" disabled={loading || businessCode.length < 11}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Buscar mi negocio
            </Button>
          </motion.form>
        )}

        {mode === 'employee' && employeeStep === 'select' && (
          <motion.div
            key="employee-select"
            className="space-y-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetEmployeeFlow}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="font-medium">{businessName}</p>
                <p className="text-sm text-muted-foreground">Selecciona tu nombre</p>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => handleEmployeeSelect(employee)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{employee.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'employee' && employeeStep === 'credential' && selectedEmployee && (
          <motion.form
            key="employee-credential"
            onSubmit={handleEmployeeCredentialSubmit}
            className="space-y-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setEmployeeStep('select'); setEmployeeCredential(''); setError(null) }}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="font-medium">{selectedEmployee.name}</p>
                <p className="text-sm text-muted-foreground">{businessName}</p>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-semibold text-primary">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Method toggle - only show if employee has both options */}
            {selectedEmployee.hasPin && selectedEmployee.hasPassword && (
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => { setEmployeeMethod('pin'); setEmployeeCredential(''); setError(null) }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all",
                    employeeMethod === 'pin'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  PIN
                </button>
                <button
                  type="button"
                  onClick={() => { setEmployeeMethod('password'); setEmployeeCredential(''); setError(null) }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all",
                    employeeMethod === 'password'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Contraseña
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-center block">
                {employeeMethod === 'pin' ? 'Ingresa tu PIN' : 'Ingresa tu contraseña'}
              </label>
              <div className="relative">
                {employeeMethod === 'pin' ? (
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  value={employeeCredential}
                  onChange={(e) => {
                    if (employeeMethod === 'pin') {
                      setEmployeeCredential(e.target.value.replace(/\D/g, '').slice(0, 6))
                    } else {
                      setEmployeeCredential(e.target.value)
                    }
                  }}
                  type="password"
                  inputMode={employeeMethod === 'pin' ? 'numeric' : 'text'}
                  placeholder={employeeMethod === 'pin' ? '••••' : '••••••••'}
                  className={cn(
                    "pl-10 h-12",
                    employeeMethod === 'pin' && "tracking-widest text-center"
                  )}
                  required
                  minLength={employeeMethod === 'pin' ? 4 : 6}
                  maxLength={employeeMethod === 'pin' ? 6 : undefined}
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading || (employeeMethod === 'pin' ? employeeCredential.length < 4 : employeeCredential.length < 6)}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ingresar
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function LoginFormLoading() {
  return (
    <div className="space-y-6">
      <div className="flex rounded-lg bg-muted p-1">
        <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
        <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

export function LoginForm({ csrfToken }: LoginFormProps) {
  return (
    <Suspense fallback={<LoginFormLoading />}>
      <LoginFormInner csrfToken={csrfToken} />
    </Suspense>
  )
}
