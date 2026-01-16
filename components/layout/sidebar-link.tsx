'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderKanban,
  History,
  Building2,
  Percent,
  Shield,
  ClipboardList,
  BarChart3,
  Calculator,
  Clock,
  User,
  LucideIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderKanban,
  History,
  Building2,
  Percent,
  Shield,
  ClipboardList,
  BarChart3,
  Calculator,
  Clock,
  User,
}

interface SidebarLinkProps {
  href: string
  label: string
  iconName: string
  badge?: number
}

export function SidebarLink({ href, label, iconName, badge }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  const Icon = iconMap[iconName] || Package

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-primary/5",
        isActive
          ? "bg-primary/15 text-primary font-medium shadow-sm ring-1 ring-primary/10"
          : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {
        badge !== undefined && badge > 0 && (
          <Badge className="ml-auto">{badge}</Badge>
        )
      }
    </Link >
  )
}

interface SidebarLinksProps {
  routes: Array<{
    href: string
    label: string
    iconName: string
    badge?: number
  }>
}

export function SidebarLinks({ routes }: SidebarLinksProps) {
  return (
    <>
      {routes.map((route) => (
        <SidebarLink
          key={route.href}
          href={route.href}
          label={route.label}
          iconName={route.iconName}
          badge={route.badge}
        />
      ))}
    </>
  )
}
