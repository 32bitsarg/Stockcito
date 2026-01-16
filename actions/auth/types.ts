import type { UserPermissions } from '@/lib/permissions'

// Extended role types to include all system roles
export type UserRole = "owner" | "admin" | "manager" | "cashier" | "waiter" | "viewer"

export interface SessionUser {
    id: number
    name: string
    email: string
    role: UserRole
    organizationId: number | null
    organizationName: string | null
    plan: string | null
    planStatus: string | null
    permissions: UserPermissions
    emailVerified: boolean
}

export interface JWTPayload {
    userId: number
    role: string
    organizationId?: number
    iat?: number
    exp?: number
}
