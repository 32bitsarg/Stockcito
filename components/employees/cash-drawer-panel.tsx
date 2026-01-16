"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog"
import { PinPad } from "./pin-pad"
import { 
  openCashDrawer, 
  closeCashDrawer, 
  recordCashMovement,
  requestOverride,
  getCurrentDrawerStatus
} from "@/actions/employee-actions"
import { cn } from "@/lib/utils"
import { 
  DollarSign, 
  Lock, 
  Unlock, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Calculator,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface CashDrawerPanelProps {
  drawer: {
    id: number
    name: string
    status: string
    currentAmount: number
    expectedAmount: number
    openingAmount: number
    openedAt: Date | null
  } | null
  userCanCashOut?: boolean
}

export function CashDrawerPanel({ drawer, userCanCashOut = false }: CashDrawerPanelProps) {
  const router = useRouter()
  const [openDrawerDialog, setOpenDrawerDialog] = useState(false)
  const [closeDrawerDialog, setCloseDrawerDialog] = useState(false)
  const [movementDialog, setMovementDialog] = useState<"in" | "out" | null>(null)
  const [overridePinOpen, setOverridePinOpen] = useState(false)
  
  const [openingAmount, setOpeningAmount] = useState("")
  const [closingAmount, setClosingAmount] = useState("")
  const [movementAmount, setMovementAmount] = useState("")
  const [movementDescription, setMovementDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ difference?: number } | null>(null)

  const handleOpenDrawer = async () => {
    setIsLoading(true)
    setError(null)
    
    const amount = parseFloat(openingAmount) || 0
    const response = await openCashDrawer(drawer?.id || 0, amount)
    
    if (response.success) {
      setOpenDrawerDialog(false)
      setOpeningAmount("")
      router.refresh()
    } else {
      setError(response.error || "Error al abrir caja")
    }
    
    setIsLoading(false)
  }

  const handleCloseDrawer = async () => {
    setIsLoading(true)
    setError(null)
    
    const amount = parseFloat(closingAmount) || 0
    const response = await closeCashDrawer(drawer?.id || 0, amount, notes)
    
    if (response.success) {
      setResult({ difference: response.difference })
      setClosingAmount("")
      setNotes("")
      router.refresh()
    } else {
      setError(response.error || "Error al cerrar caja")
    }
    
    setIsLoading(false)
  }

  const handleMovement = async (overrideId?: number) => {
    if (!movementDialog || !drawer) return
    
    setIsLoading(true)
    setError(null)
    
    const amount = parseFloat(movementAmount) || 0
    const response = await recordCashMovement(
      drawer.id,
      movementDialog === "in" ? "cash_in" : "cash_out",
      amount,
      movementDescription,
      overrideId
    )
    
    if (response.success) {
      setMovementDialog(null)
      setMovementAmount("")
      setMovementDescription("")
      router.refresh()
    } else {
      if (response.error === "Requiere autorización de gerente") {
        setOverridePinOpen(true)
      } else {
        setError(response.error || "Error al registrar movimiento")
      }
    }
    
    setIsLoading(false)
  }

  const handleOverridePin = async (pin: string) => {
    if (!drawer) return { success: false, error: "No hay caja" }
    
    const overrideResult = await requestOverride("cash_out", pin, {
      entityType: "cash_drawer",
      entityId: drawer.id,
      newValue: movementAmount,
      description: movementDescription
    })
    
    if (overrideResult.success && overrideResult.overrideId) {
      await handleMovement(overrideResult.overrideId)
      return { success: true }
    }
    
    return { success: false, error: overrideResult.error }
  }

  // Si no hay caja abierta
  if (!drawer || drawer.status === "closed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Caja Cerrada
          </CardTitle>
          <CardDescription>
            Abrí la caja para comenzar a registrar ventas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpenDrawerDialog(true)} className="w-full">
            <Unlock className="h-4 w-4 mr-2" />
            Abrir Caja
          </Button>

          <Dialog open={openDrawerDialog} onOpenChange={(details) => setOpenDrawerDialog(details.open)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir Caja</DialogTitle>
                <DialogDescription>
                  Ingresá el monto inicial de efectivo en la caja
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="opening-amount">Monto Inicial</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="opening-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-9"
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDrawerDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleOpenDrawer} disabled={isLoading}>
                  {isLoading ? "Abriendo..." : "Abrir Caja"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  // Caja abierta
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {drawer.name}
              </CardTitle>
              <CardDescription>
                Abierta desde {drawer.openedAt ? new Date(drawer.openedAt).toLocaleTimeString() : "N/A"}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Abierta
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Montos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Monto Actual</p>
              <p className="text-2xl font-bold">
                ${drawer.currentAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Esperado</p>
              <p className="text-2xl font-bold">
                ${drawer.expectedAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setMovementDialog("in")}
              className="flex-col h-auto py-3"
            >
              <ArrowDownCircle className="h-5 w-5 mb-1 text-green-600" />
              <span className="text-xs">Ingreso</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setMovementDialog("out")}
              className="flex-col h-auto py-3"
            >
              <ArrowUpCircle className="h-5 w-5 mb-1 text-red-600" />
              <span className="text-xs">Retiro</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCloseDrawerDialog(true)}
              className="flex-col h-auto py-3"
            >
              <Lock className="h-5 w-5 mb-1" />
              <span className="text-xs">Cerrar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Cerrar Caja */}
      <Dialog open={closeDrawerDialog} onOpenChange={(details) => setCloseDrawerDialog(details.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Caja</DialogTitle>
            <DialogDescription>
              Contá el efectivo y registrá el monto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Monto esperado según sistema</p>
              <p className="text-2xl font-bold">
                ${drawer.expectedAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closing-amount">Monto Contado</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="closing-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-9"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                />
              </div>
            </div>

            {closingAmount && (
              <div className={cn(
                "p-3 rounded-lg",
                parseFloat(closingAmount) === drawer.expectedAmount 
                  ? "bg-green-100" 
                  : "bg-yellow-100"
              )}>
                <p className="text-sm font-medium">
                  Diferencia: $
                  {(parseFloat(closingAmount) - drawer.expectedAmount).toLocaleString("es-AR", { 
                    minimumFractionDigits: 2,
                    signDisplay: "always"
                  })}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones del cierre..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDrawerDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCloseDrawer} 
              disabled={isLoading || !closingAmount}
            >
              {isLoading ? "Cerrando..." : "Cerrar Caja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Resultado */}
      <Dialog open={result !== null} onOpenChange={() => setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Caja Cerrada
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {result?.difference !== undefined && (
              <div className={cn(
                "p-4 rounded-lg text-center",
                result.difference === 0 
                  ? "bg-green-100" 
                  : result.difference > 0 
                    ? "bg-blue-100" 
                    : "bg-yellow-100"
              )}>
                <p className="text-sm text-muted-foreground mb-1">Diferencia</p>
                <p className="text-3xl font-bold">
                  ${result.difference.toLocaleString("es-AR", { 
                    minimumFractionDigits: 2,
                    signDisplay: "always"
                  })}
                </p>
                <p className="text-sm mt-2">
                  {result.difference === 0 && "✓ Caja cuadrada"}
                  {result.difference > 0 && "↑ Sobrante"}
                  {result.difference < 0 && "↓ Faltante"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setResult(null)
              setCloseDrawerDialog(false)
            }}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Movimiento */}
      <Dialog open={movementDialog !== null} onOpenChange={() => setMovementDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {movementDialog === "in" ? (
                <>
                  <ArrowDownCircle className="h-5 w-5 text-green-600" />
                  Ingreso de Efectivo
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-5 w-5 text-red-600" />
                  Retiro de Efectivo
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="movement-amount">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="movement-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-9"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-description">Descripción *</Label>
              <Input
                id="movement-description"
                placeholder="Motivo del movimiento..."
                value={movementDescription}
                onChange={(e) => setMovementDescription(e.target.value)}
              />
            </div>

            {!userCanCashOut && movementDialog === "out" && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                <AlertCircle className="h-4 w-4" />
                Requiere autorización de gerente
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMovementDialog(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => handleMovement()} 
              disabled={isLoading || !movementAmount || !movementDescription}
            >
              {isLoading ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override PIN */}
      <PinPad
        open={overridePinOpen}
        onOpenChange={setOverridePinOpen}
        onSubmit={handleOverridePin}
        title="Autorización Requerida"
        description="Ingresá el PIN de un gerente para autorizar"
      />
    </>
  )
}
