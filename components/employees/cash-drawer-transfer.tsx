"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    ArrowRightLeft,
    DollarSign,
    User,
    Loader2
} from "lucide-react"
import { Dialog } from "@ark-ui/react"
import { transferCashDrawer, getUsersWithPin, getCurrentDrawerStatus } from "@/actions/employee-actions"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface CashDrawerTransferProps {
    onTransferred?: () => void
}

export function CashDrawerTransfer({ onTransferred }: CashDrawerTransferProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [drawerStatus, setDrawerStatus] = useState<{
        id: number
        name: string
        expectedAmount: number
    } | null>(null)
    const [users, setUsers] = useState<{ id: number; name: string; role: string }[]>([])
    
    // Form
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [countedAmount, setCountedAmount] = useState("")
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (isOpen) {
            loadData()
        }
    }, [isOpen])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [status, usersData] = await Promise.all([
                getCurrentDrawerStatus(),
                getUsersWithPin()
            ])
            
            if (status) {
                setDrawerStatus({
                    id: status.id,
                    name: status.name,
                    expectedAmount: status.expectedAmount
                })
                setCountedAmount(status.expectedAmount.toFixed(2))
            }
            
            setUsers(usersData)
        } catch (error) {
            toast.error("Error al cargar datos")
        } finally {
            setIsLoading(false)
        }
    }

    const handleTransfer = async () => {
        if (!drawerStatus || !selectedUserId) {
            toast.error("Selecciona un usuario")
            return
        }

        const amount = parseFloat(countedAmount)
        if (isNaN(amount) || amount < 0) {
            toast.error("Ingresa un monto válido")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await transferCashDrawer(
                drawerStatus.id,
                selectedUserId,
                amount,
                notes
            )

            if (result.success) {
                const diff = result.difference || 0
                if (diff !== 0) {
                    toast.success(`Caja traspasada. Diferencia: $${diff.toFixed(2)}`)
                } else {
                    toast.success("Caja traspasada correctamente")
                }
                setIsOpen(false)
                onTransferred?.()
                router.refresh()
            } else {
                toast.error(result.error || "Error")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Button 
                variant="outline" 
                onClick={() => setIsOpen(true)}
                className="gap-2"
            >
                <ArrowRightLeft className="w-4 h-4" />
                Traspasar Caja
            </Button>

            <Dialog.Root 
                open={isOpen} 
                onOpenChange={(details) => setIsOpen(details.open)}
            >
                <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Positioner className="fixed inset-0 flex items-center justify-center z-50">
                    <Dialog.Content className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
                        <Dialog.Title className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5" />
                            Traspasar Caja
                        </Dialog.Title>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : !drawerStatus ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No tienes una caja abierta</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Current Drawer Info */}
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-8 h-8 text-green-500" />
                                            <div>
                                                <p className="font-medium">{drawerStatus.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Esperado: ${drawerStatus.expectedAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Select User */}
                                <div className="space-y-2">
                                    <Label>Traspasar a</Label>
                                    <div className="grid gap-2">
                                        {users.filter(u => u.id !== drawerStatus.id).map((user) => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => setSelectedUserId(user.id)}
                                                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                                                    selectedUserId === user.id 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {user.role}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Counted Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="countedAmount">Monto Contado</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="countedAmount"
                                            type="number"
                                            step="0.01"
                                            value={countedAmount}
                                            onChange={(e) => setCountedAmount(e.target.value)}
                                            className="pl-9"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {countedAmount && drawerStatus && (
                                        <p className={`text-sm ${
                                            parseFloat(countedAmount) - drawerStatus.expectedAmount !== 0 
                                                ? 'text-amber-600' 
                                                : 'text-green-600'
                                        }`}>
                                            Diferencia: ${(parseFloat(countedAmount) - drawerStatus.expectedAmount).toFixed(2)}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas (opcional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Observaciones del traspaso..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                            <Dialog.CloseTrigger asChild>
                                <Button variant="outline">Cancelar</Button>
                            </Dialog.CloseTrigger>
                            <Button 
                                onClick={handleTransfer} 
                                disabled={isSubmitting || !selectedUserId || !drawerStatus}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Traspasando...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                                        Traspasar
                                    </>
                                )}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    )
}
