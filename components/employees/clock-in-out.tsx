"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog"
import { clockIn, clockOut, getActiveTimeEntry } from "@/actions/employee-actions"
import { cn } from "@/lib/utils"
import { Clock, Play, Square, Coffee, Timer } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ClockInOutProps {
  activeEntry: {
    id: number
    clockIn: Date
    breakMinutes: number
  } | null
}

export function ClockInOut({ activeEntry: initialEntry }: ClockInOutProps) {
  const router = useRouter()
  const [activeEntry, setActiveEntry] = useState(initialEntry)
  const [confirmDialog, setConfirmDialog] = useState<"in" | "out" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ totalMinutes?: number } | null>(null)
  const [elapsedTime, setElapsedTime] = useState("")

  // Update elapsed time every minute
  useEffect(() => {
    if (!activeEntry) return

    const updateElapsed = () => {
      const clockInTime = new Date(activeEntry.clockIn)
      const now = new Date()
      const diffMs = now.getTime() - clockInTime.getTime() - (activeEntry.breakMinutes * 60 * 1000)
      const hours = Math.floor(diffMs / 3600000)
      const minutes = Math.floor((diffMs % 3600000) / 60000)
      setElapsedTime(`${hours}h ${minutes}m`)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 60000)
    return () => clearInterval(interval)
  }, [activeEntry])

  const handleClockIn = async () => {
    setIsLoading(true)
    setError(null)

    // Get location if available
    let location: { lat: number; lng: number } | undefined
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        location = { lat: position.coords.latitude, lng: position.coords.longitude }
      }
    } catch {
      // Location not required
    }

    const response = await clockIn(location)
    
    if (response.success) {
      setConfirmDialog(null)
      router.refresh()
      // Refetch active entry
      const entry = await getActiveTimeEntry()
      setActiveEntry(entry)
    } else {
      setError(response.error || "Error al registrar entrada")
    }
    
    setIsLoading(false)
  }

  const handleClockOut = async () => {
    setIsLoading(true)
    setError(null)

    // Get location if available
    let location: { lat: number; lng: number } | undefined
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        location = { lat: position.coords.latitude, lng: position.coords.longitude }
      }
    } catch {
      // Location not required
    }

    const response = await clockOut(location)
    
    if (response.success) {
      setResult({ totalMinutes: response.totalMinutes })
      setActiveEntry(null)
      router.refresh()
    } else {
      setError(response.error || "Error al registrar salida")
    }
    
    setIsLoading(false)
  }

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Control de Horario
          </CardTitle>
          <CardDescription>
            {activeEntry 
              ? `Trabajando desde ${format(new Date(activeEntry.clockIn), "HH:mm", { locale: es })}`
              : "Registrá tu entrada para comenzar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeEntry ? (
            <>
              {/* Timer Display */}
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="h-5 w-5 text-green-600 animate-pulse" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Trabajando
                  </Badge>
                </div>
                <p className="text-4xl font-bold text-green-700">{elapsedTime}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Entrada: {format(new Date(activeEntry.clockIn), "HH:mm 'del' d 'de' MMMM", { locale: es })}
                </p>
              </div>

              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setConfirmDialog("out")}
              >
                <Square className="h-4 w-4 mr-2" />
                Registrar Salida
              </Button>
            </>
          ) : (
            <>
              <div className="text-center p-6 bg-muted rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Sin entrada activa</p>
              </div>

              <Button 
                className="w-full"
                onClick={() => setConfirmDialog("in")}
              >
                <Play className="h-4 w-4 mr-2" />
                Registrar Entrada
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog !== null} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog === "in" ? "Registrar Entrada" : "Registrar Salida"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog === "in" 
                ? "¿Confirmas que querés registrar tu entrada?"
                : "¿Confirmas que querés registrar tu salida?"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <p className="text-3xl font-bold">
              {format(new Date(), "HH:mm")}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmDialog === "in" ? handleClockIn : handleClockOut}
              disabled={isLoading}
              variant={confirmDialog === "out" ? "destructive" : "default"}
            >
              {isLoading 
                ? "Registrando..." 
                : confirmDialog === "in" 
                  ? "Confirmar Entrada" 
                  : "Confirmar Salida"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={result !== null} onOpenChange={() => setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Salida Registrada
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 text-center">
            {result?.totalMinutes !== undefined && (
              <>
                <p className="text-sm text-muted-foreground mb-2">Tiempo trabajado</p>
                <p className="text-4xl font-bold text-primary">
                  {formatMinutes(result.totalMinutes)}
                </p>
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setResult(null)
              setConfirmDialog(null)
            }}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
