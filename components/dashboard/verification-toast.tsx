"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'info' | null

export function VerificationToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [toast, setToast] = useState<{ type: ToastType; title: string; description: string } | null>(null)

  useEffect(() => {
    const verified = searchParams.get('verified')
    const alreadyVerified = searchParams.get('already_verified')

    if (verified === 'true') {
      setToast({
        type: 'success',
        title: '¡Email verificado!',
        description: 'Tu cuenta ha sido verificada correctamente. Ya puedes acceder a todas las funciones.'
      })
      // Clean URL without refresh
      router.replace('/dashboard', { scroll: false })
    }

    if (alreadyVerified === 'true') {
      setToast({
        type: 'info',
        title: 'Cuenta ya verificada',
        description: 'Tu email ya fue verificado anteriormente. No es necesario verificarlo de nuevo.'
      })
      // Clean URL without refresh
      router.replace('/dashboard', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-4 left-1/2 z-50 w-full max-w-md"
        >
          <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${
                toast.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'
              }`}>
                {toast.title}
              </p>
              <p className={`text-sm mt-0.5 ${
                toast.type === 'success' ? 'text-green-600 dark:text-green-300' : 'text-blue-600 dark:text-blue-300'
              }`}>
                {toast.description}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 ${
                toast.type === 'success' ? 'text-green-500' : 'text-blue-500'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
