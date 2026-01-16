"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Delete, Check, X } from "lucide-react"

interface PinPadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (pin: string) => Promise<{ success: boolean; error?: string }>
  title?: string
  description?: string
  userName?: string
  maxLength?: number
  minLength?: number
}

export function PinPad({
  open,
  onOpenChange,
  onSubmit,
  title = "Ingresá tu PIN",
  description,
  userName,
  maxLength = 6,
  minLength = 4
}: PinPadProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Reset cuando se abre/cierra
  useEffect(() => {
    if (!open) {
      setPin("")
      setError(null)
    }
  }, [open])

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < maxLength) {
      setPin(prev => prev + digit)
      setError(null)
    }
  }, [pin.length, maxLength])

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1))
    setError(null)
  }, [])

  const handleClear = useCallback(() => {
    setPin("")
    setError(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (pin.length < minLength) {
      setError(`El PIN debe tener al menos ${minLength} dígitos`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await onSubmit(pin)
      if (result.success) {
        onOpenChange(false)
      } else {
        setError(result.error || "PIN incorrecto")
        setPin("")
      }
    } catch {
      setError("Error al verificar PIN")
      setPin("")
    } finally {
      setIsLoading(false)
    }
  }, [pin, minLength, onSubmit, onOpenChange])

  // Keyboard support
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key)
      } else if (e.key === "Backspace") {
        handleDelete()
      } else if (e.key === "Enter" && pin.length >= minLength) {
        handleSubmit()
      } else if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, pin.length, minLength, handleDigit, handleDelete, handleSubmit, onOpenChange])

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "delete"]

  return (
    <Dialog open={open} onOpenChange={(details) => onOpenChange(details.open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
          {userName && (
            <p className="text-sm font-medium text-primary mt-1">{userName}</p>
          )}
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* PIN Display */}
          <div className="flex gap-2">
            {Array.from({ length: maxLength }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all",
                  i < pin.length
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {digits.map((digit) => {
              if (digit === "clear") {
                return (
                  <Button
                    key={digit}
                    variant="ghost"
                    size="lg"
                    className="h-16 w-16 text-xl"
                    onClick={handleClear}
                    disabled={isLoading || pin.length === 0}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )
              }
              if (digit === "delete") {
                return (
                  <Button
                    key={digit}
                    variant="ghost"
                    size="lg"
                    className="h-16 w-16 text-xl"
                    onClick={handleDelete}
                    disabled={isLoading || pin.length === 0}
                  >
                    <Delete className="h-5 w-5" />
                  </Button>
                )
              }
              return (
                <Button
                  key={digit}
                  variant="outline"
                  size="lg"
                  className="h-16 w-16 text-2xl font-semibold"
                  onClick={() => handleDigit(digit)}
                  disabled={isLoading || pin.length >= maxLength}
                >
                  {digit}
                </Button>
              )
            })}
          </div>

          {/* Submit button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || pin.length < minLength}
          >
            {isLoading ? (
              <span className="animate-pulse">Verificando...</span>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Confirmar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// PIN Setup component
interface PinSetupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSetup: (pin: string) => Promise<{ success: boolean; error?: string }>
}

export function PinSetup({ open, onOpenChange, onSetup }: PinSetupProps) {
  const [step, setStep] = useState<"enter" | "confirm">("enter")
  const [firstPin, setFirstPin] = useState("")

  useEffect(() => {
    if (!open) {
      setStep("enter")
      setFirstPin("")
    }
  }, [open])

  const handleFirstPin = async (pin: string) => {
    setFirstPin(pin)
    setStep("confirm")
    return { success: true }
  }

  const handleConfirmPin = async (pin: string) => {
    if (pin !== firstPin) {
      setStep("enter")
      setFirstPin("")
      return { success: false, error: "Los PINs no coinciden. Intentá de nuevo." }
    }
    return onSetup(pin)
  }

  if (step === "enter") {
    return (
      <PinPad
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleFirstPin}
        title="Crear tu PIN"
        description="Ingresá un PIN de 4-6 dígitos"
      />
    )
  }

  return (
    <PinPad
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleConfirmPin}
      title="Confirmar PIN"
      description="Ingresá el PIN nuevamente"
    />
  )
}
