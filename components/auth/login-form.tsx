"use client"

import { useState, Suspense } from 'react'
import { loginUser, loginWithPin, loginWithBusinessCode, getEmployeesForBusinessCode } from '@/actions/auth-actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, Loader2, KeyRound, Building2, User, ArrowLeft, Users, ShieldCheck } from 'lucide-react'
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

  const [mode, setMode] = useState<LoginMode>('owner')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [ownerMethod, setOwnerMethod] = useState<OwnerMethod>('password')
  const [rememberMe, setRememberMe] = useState(false)

  const [businessCode, setBusinessCode] = useState('')
  const [employeeStep, setEmployeeStep] = useState<EmployeeStep>('code')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeCredential, setEmployeeCredential] = useState('')
  const [employeeMethod, setEmployeeMethod] = useState<EmployeeMethod>('pin')
  const [businessName, setBusinessName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        ? await loginUser({ email, password, csrfToken, rememberMe })
        : await loginWithPin({ email, pin, csrfToken, rememberMe })

      if (result.success) {
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError(typeof result.error === 'string' ? result.error : 'FALLO_AUTENTICACION')
      }
    } catch {
      setError('ERROR_CONEXION')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (businessCode.length < 11) {
      setError('CODIGO_INCOMPLETO')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getEmployeesForBusinessCode(businessCode)

      if (result.success && result.employees) {
        if (result.employees.length === 0) {
          setError('SIN_AGENTES_ACTIVOS')
        } else {
          setEmployees(result.employees)
          setBusinessName(result.businessName || '')
          setEmployeeStep('select')
        }
      } else {
        setError(result.error || 'CODIGO_INVALIDO')
      }
    } catch {
      setError('ERROR_CONEXION')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
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
        setError(result.error || 'CREDENCIALES_INVALIDAS')
      }
    } catch {
      setError('ERROR_CONEXION')
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
    <div className="space-y-8">
      {/* Tab select - No background, just text with indicators */}
      <div className="flex gap-8 border-b border-zinc-50 dark:border-zinc-900 pb-2">
        <button
          type="button"
          onClick={() => { setMode('owner'); resetEmployeeFlow() }}
          className={cn(
            "relative text-[10px] font-black uppercase tracking-[0.3em] transition-all pb-2",
            mode === 'owner' ? "text-zinc-900 dark:text-white" : "text-zinc-500"
          )}
        >
          Propietario
          {mode === 'owner' && <motion.div layoutId="tab-active" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-zinc-900 dark:bg-white" />}
        </button>
        <button
          type="button"
          onClick={() => { setMode('employee'); setError(null) }}
          className={cn(
            "relative text-[10px] font-black uppercase tracking-[0.3em] transition-all pb-2",
            mode === 'employee' ? "text-zinc-900 dark:text-white" : "text-zinc-500"
          )}
        >
          Personal
          {mode === 'employee' && <motion.div layoutId="tab-active" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-zinc-900 dark:bg-white" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="text-red-500 text-[8px] font-black uppercase tracking-[0.2em] italic"
          >
            [ Error: {error} ]
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mode === 'owner' && (
          <motion.form key="owner" onSubmit={handleOwnerSubmit} className="grid gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-1">
              <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Identificador</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="CORREO_ELECTRONICO"
                className="h-10 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold uppercase text-[10px] tracking-widest placeholder:text-zinc-200 dark:placeholder:text-zinc-800 shadow-none"
                required
              />
            </div>

            {ownerMethod === 'password' ? (
              <div className="space-y-1">
                <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Clave</label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="CONTRASEÑA"
                  className="h-10 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold text-[10px] tracking-widest placeholder:text-zinc-200 dark:placeholder:text-zinc-800 shadow-none"
                  required
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Pin</label>
                <Input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  type="password"
                  inputMode="numeric"
                  placeholder="0000"
                  className="h-10 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold text-lg tracking-[1em] placeholder:text-zinc-200 dark:placeholder:text-zinc-800 shadow-none"
                  required
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3 w-3 rounded-none border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 cursor-pointer italic hover:text-zinc-700 transition-colors">
                Mantener sesión
              </label>
            </div>

            <div className="space-y-4 pt-4">
              <Button type="submit" className="w-full h-11 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-none font-black uppercase tracking-[0.3em] text-[10px] shadow-none border border-zinc-900 dark:border-white" disabled={loading}>
                {loading ? "INICIANDO..." : "Ejecutar Acceso"}
              </Button>

              <button
                type="button"
                onClick={toggleOwnerMethod}
                className="w-full text-[7px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all text-center italic"
              >
                Cambiar vector de ingreso
              </button>
            </div>
          </motion.form>
        )}

        {/* Staff / Employee Flow */}
        {mode === 'employee' && employeeStep === 'code' && (
          <motion.form key="staff-code" onSubmit={handleBusinessCodeSubmit} className="grid gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-1">
              <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Código de Nodo</label>
              <Input
                value={businessCode}
                onChange={(e) => setBusinessCode(formatBusinessCode(e.target.value))}
                placeholder="XXX-0000-XX"
                className="h-10 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-mono font-bold text-center uppercase tracking-widest text-[12px] placeholder:text-zinc-200 dark:placeholder:text-zinc-800 shadow-none"
                maxLength={11}
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-none font-black uppercase tracking-[0.3em] text-[10px] shadow-none border border-zinc-900 dark:border-white" disabled={loading || businessCode.length < 11}>
              {loading ? "LOCALIZANDO..." : "Localizar Nodo"}
            </Button>
          </motion.form>
        )}

        {/* Staff select/cred flows */}
        {mode === 'employee' && (employeeStep === 'select' || employeeStep === 'credential') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between border-b border-dashed border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <span className="text-[6px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Nodo: {businessName}</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest">{selectedEmployee ? selectedEmployee.name : "Seleccionar Agente"}</h3>
              </div>
              <button onClick={resetEmployeeFlow} className="text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 underline underline-offset-4">Reiniciar</button>
            </div>

            {employeeStep === 'select' && (
              <div className="grid gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-none">
                {employees.map(e => (
                  <button key={e.id} onClick={() => handleEmployeeSelect(e)} className="flex items-center justify-between p-3 border border-zinc-50 dark:border-zinc-900 hover:border-zinc-900 dark:hover:border-white transition-all text-[9px] font-black uppercase tracking-widest">
                    {e.name}
                    <ArrowLeft className="w-3 h-3 rotate-180 opacity-20" />
                  </button>
                ))}
              </div>
            )}

            {employeeStep === 'credential' && (
              <form onSubmit={handleEmployeeCredentialSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Vector: {employeeMethod}</label>
                  <Input
                    value={employeeCredential}
                    onChange={(e) => setEmployeeCredential(employeeMethod === 'pin' ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value)}
                    type="password"
                    placeholder="****"
                    className="h-10 bg-transparent border-0 border-b border-zinc-300 dark:border-zinc-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-white transition-all font-bold text-center tracking-[1em] text-[12px] shadow-none"
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-none font-black uppercase tracking-[0.3em] text-[10px] shadow-none border border-zinc-900 dark:border-white" disabled={loading}>
                  {loading ? "VERIFICANDO..." : "Verificar Identidad"}
                </Button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LoginFormLoading() {
  return (
    <div className="space-y-8">
      <div className="h-4 w-32 bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
      <div className="space-y-4">
        <div className="h-10 w-full bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
        <div className="h-10 w-full bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
      </div>
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
