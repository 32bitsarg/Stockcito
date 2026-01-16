"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PinPad } from "./pin-pad"
import { quickLoginWithPin, getUsersWithPin } from "@/actions/employee-actions"
import { SYSTEM_ROLES, type SystemRole } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { User, Lock, LogIn, X, Loader2 } from "lucide-react"
import { Dialog } from "@ark-ui/react"
import toast from "react-hot-toast"

interface UserQuickLoginProps {
  users?: {
    id: number
    name: string
    role: string
    hasPin: boolean
  }[]
  onLogin?: (userId: number) => void
  onClose?: () => void
  className?: string
}

export function UserQuickLogin({ users: initialUsers, onLogin, onClose, className }: UserQuickLoginProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers || [])
  const [isLoading, setIsLoading] = useState(!initialUsers)
  const [selectedUser, setSelectedUser] = useState<{
    id: number
    name: string
    role: string
  } | null>(null)
  const [pinOpen, setPinOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (!initialUsers) {
      loadUsers()
    }
  }, [initialUsers])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await getUsersWithPin()
      setUsers(data)
    } catch (error) {
      toast.error("Error al cargar usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserClick = (user: typeof users[0]) => {
    if (!user.hasPin) {
      toast.error("Este usuario no tiene PIN configurado")
      return
    }
    setSelectedUser({ id: user.id, name: user.name, role: user.role })
    setPinOpen(true)
  }

  const handlePinSubmit = async (pin: string) => {
    if (!selectedUser) return { success: false, error: "Usuario no seleccionado" }

    const result = await quickLoginWithPin(selectedUser.id, pin)
    if (result.success) {
      toast.success(`Bienvenido, ${result.user?.name || selectedUser.name}`)
      onLogin?.(selectedUser.id)
      setIsOpen(false)
      onClose?.()
      router.refresh()
    }
    return result
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  const getRoleInfo = (role: string) => {
    const info = SYSTEM_ROLES[role as SystemRole]
    return info || { name: role, color: "#6b7280", icon: "user" }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Si se proporcionaron usuarios, renderizar sin diálogo
  if (initialUsers) {
    return (
      <>
        <Card className={cn("w-full max-w-2xl", className)}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              Cambio de Usuario
            </CardTitle>
            <CardDescription>
              Seleccioná tu usuario para ingresar con PIN
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {users.map((user) => {
              const roleInfo = getRoleInfo(user.role)
              return (
                <Button
                  key={user.id}
                  variant="outline"
                  className={cn(
                    "h-auto flex-col p-4 gap-2 relative",
                    !user.hasPin && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleUserClick(user)}
                  disabled={!user.hasPin}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback 
                      style={{ backgroundColor: roleInfo.color + "20", color: roleInfo.color }}
                    >
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm truncate w-full text-center">
                    {user.name}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: roleInfo.color + "20", 
                      color: roleInfo.color 
                    }}
                  >
                    {roleInfo.name}
                  </Badge>
                  {!user.hasPin && (
                    <div className="absolute top-1 right-1">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </Button>
              )
            })}
          </div>

          {users.some(u => !u.hasPin) && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              <Lock className="h-3 w-3 inline mr-1" />
              Usuarios sin PIN deben configurarlo desde su perfil
            </p>
          )}
        </CardContent>
      </Card>

      <PinPad
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSubmit={handlePinSubmit}
        title="Ingresá tu PIN"
        userName={selectedUser?.name}
      />
    </>
  )
  }

  // Renderizar como diálogo modal
  return (
    <>
      <Dialog.Root 
        open={isOpen} 
        onOpenChange={(details) => {
          setIsOpen(details.open)
          if (!details.open) onClose?.()
        }}
      >
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <Dialog.Content className="bg-background rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Cambio de Usuario
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.CloseTrigger>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay usuarios disponibles</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Seleccioná tu usuario para ingresar con PIN
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {users.map((user) => {
                      const roleInfo = getRoleInfo(user.role)
                      return (
                        <Button
                          key={user.id}
                          variant="outline"
                          className={cn(
                            "h-auto flex-col p-4 gap-2 relative",
                            !user.hasPin && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => handleUserClick(user)}
                          disabled={!user.hasPin}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback 
                              style={{ backgroundColor: roleInfo.color + "20", color: roleInfo.color }}
                            >
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm truncate w-full text-center">
                            {user.name}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: roleInfo.color + "20", 
                              color: roleInfo.color 
                            }}
                          >
                            {roleInfo.name}
                          </Badge>
                          {!user.hasPin && (
                            <div className="absolute top-1 right-1">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </Button>
                      )
                    })}
                  </div>

                  {users.some(u => !u.hasPin) && (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      <Lock className="h-3 w-3 inline mr-1" />
                      Usuarios sin PIN deben configurarlo desde su perfil
                    </p>
                  )}
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <PinPad
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSubmit={handlePinSubmit}
        title="Ingresá tu PIN"
        userName={selectedUser?.name}
      />
    </>
  )
}
