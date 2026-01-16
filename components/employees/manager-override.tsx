"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { PinPad } from "./pin-pad"
import { requestOverride } from "@/actions/employee-actions"
import { type ProtectedAction, PROTECTED_ACTIONS } from "@/lib/permissions"
import { ShieldAlert } from "lucide-react"

interface ManagerOverrideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: ProtectedAction
  entityType?: string
  entityId?: number
  originalValue?: string
  newValue?: string
  description?: string
  onSuccess: (overrideId: number) => void
  onCancel?: () => void
}

export function ManagerOverrideDialog({
  open,
  onOpenChange,
  action,
  entityType,
  entityId,
  originalValue,
  newValue,
  description,
  onSuccess,
  onCancel
}: ManagerOverrideDialogProps) {
  const [showPinPad, setShowPinPad] = useState(false)
  
  const actionInfo = PROTECTED_ACTIONS[action]

  const handlePinSubmit = async (pin: string) => {
    const result = await requestOverride(action, pin, {
      entityType,
      entityId,
      originalValue,
      newValue,
      description
    })

    if (result.success && result.overrideId) {
      onSuccess(result.overrideId)
      onOpenChange(false)
      return { success: true }
    }

    return { success: false, error: result.error }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  if (showPinPad) {
    return (
      <PinPad
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowPinPad(false)
            handleCancel()
          }
        }}
        onSubmit={handlePinSubmit}
        title="PIN de Autorización"
        description="Ingresá el PIN de un gerente"
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={(details) => onOpenChange(details.open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-yellow-600" />
            Autorización Requerida
          </DialogTitle>
          <DialogDescription>
            Esta acción requiere autorización de un gerente
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="font-medium text-yellow-800">{actionInfo?.name || action}</p>
            <p className="text-sm text-yellow-700 mt-1">
              {actionInfo?.description || description}
            </p>
          </div>

          {(originalValue || newValue) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {originalValue && (
                <div className="p-2 bg-muted rounded">
                  <p className="text-muted-foreground">Original</p>
                  <p className="font-medium">{originalValue}</p>
                </div>
              )}
              {newValue && (
                <div className="p-2 bg-muted rounded">
                  <p className="text-muted-foreground">Nuevo</p>
                  <p className="font-medium">{newValue}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={() => setShowPinPad(true)}>
            Ingresar PIN de Gerente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar override fácilmente
export function useManagerOverride() {
  const [overrideState, setOverrideState] = useState<{
    open: boolean
    action: ProtectedAction
    entityType?: string
    entityId?: number
    originalValue?: string
    newValue?: string
    description?: string
    resolve?: (overrideId: number | null) => void
  }>({
    open: false,
    action: "void_sale"
  })

  const requestOverrideUI = (params: {
    action: ProtectedAction
    entityType?: string
    entityId?: number
    originalValue?: string
    newValue?: string
    description?: string
  }): Promise<number | null> => {
    return new Promise((resolve) => {
      setOverrideState({
        open: true,
        ...params,
        resolve
      })
    })
  }

  const OverrideDialog = () => (
    <ManagerOverrideDialog
      open={overrideState.open}
      onOpenChange={(open) => {
        if (!open) {
          overrideState.resolve?.(null)
        }
        setOverrideState(prev => ({ ...prev, open }))
      }}
      action={overrideState.action}
      entityType={overrideState.entityType}
      entityId={overrideState.entityId}
      originalValue={overrideState.originalValue}
      newValue={overrideState.newValue}
      description={overrideState.description}
      onSuccess={(id) => {
        overrideState.resolve?.(id)
        setOverrideState(prev => ({ ...prev, open: false }))
      }}
      onCancel={() => {
        overrideState.resolve?.(null)
      }}
    />
  )

  return { requestOverride: requestOverrideUI, OverrideDialog }
}
