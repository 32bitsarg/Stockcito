"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Páginas públicas donde los shortcuts no deben funcionar
const PUBLIC_PATHS = ['/', '/login', '/register', '/docs']

export default function GlobalShortcuts() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // No ejecutar shortcuts en páginas públicas
      if (PUBLIC_PATHS.includes(pathname)) {
        return
      }

      const target = e.target as HTMLElement | null
      const isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      // Ctrl/Cmd + tecla para navegación rápida
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault()
            window.dispatchEvent(new CustomEvent('stockcito:focus-pos-search'))
            return
          case 'd':
            e.preventDefault()
            router.push('/dashboard')
            return
          case 'j': // Usamos J para ventas (sales)
            e.preventDefault()
            router.push('/sales/new')
            return
          case 'i':
            e.preventDefault()
            router.push('/inventory')
            return
          case 'l': // Usamos L para clientes
            e.preventDefault()
            router.push('/clients')
            return
          case 'r':
            e.preventDefault()
            router.push('/reports')
            return
          case 'u':
            e.preventDefault()
            router.push('/users')
            return
        }
      }

      // '/' focuses POS search (unless in an input)
      if (e.key === '/' && !isEditable) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('stockcito:focus-pos-search'))
        return
      }

      // ? abre la ayuda (solo fuera de inputs)
      if (e.key === '?' && !isEditable) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('stockcito:open-help'))
        return
      }

      // F2 - Finalizar venta (en POS)
      if (e.key === 'F2' && pathname === '/sales/new') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('stockcito:finalize-sale'))
        return
      }

      // F4 - Cancelar venta (en POS)
      if (e.key === 'F4' && pathname === '/sales/new') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('stockcito:cancel-sale'))
        return
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pathname, router])

  return null
}
