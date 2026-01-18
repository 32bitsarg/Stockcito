"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, LogIn, BookOpen, X, Package, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LandingHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Detect scroll to add border/shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-md border-b py-3" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Stockcito</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            Documentación
          </Link>
          <Link href="/changelog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ScrollText className="w-4 h-4" />
            Changelog
          </Link>
          <div className="flex items-center gap-4 border-l pl-4 ml-2 h-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Ingresar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Comenzar Gratis</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" aria-label="menu" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-background border-b p-4 md:hidden shadow-xl animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-4">
            <Link
              href="/docs"
              className="text-sm font-medium p-2 hover:bg-muted rounded-md flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <BookOpen className="w-4 h-4" /> Documentación
            </Link>
            <Link
              href="/changelog"
              className="text-sm font-medium p-2 hover:bg-muted rounded-md flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <ScrollText className="w-4 h-4" /> Changelog
            </Link>
            <div className="h-px bg-border my-1" />
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/login" onClick={() => setOpen(false)}>Ingresar</Link>
            </Button>
            <Button asChild className="w-full justify-start">
              <Link href="/register" onClick={() => setOpen(false)}>Crear Cuenta Gratis</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
