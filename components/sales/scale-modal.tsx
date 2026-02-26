"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Scale } from "lucide-react"

interface ScaleModalProps {
    isOpen: boolean
    onClose: () => void
    product: any | null
    onConfirm: (weightInGrams: number) => void
}

export function ScaleModal({ isOpen, onClose, product, onConfirm }: ScaleModalProps) {
    const [grams, setGrams] = useState<string>("")

    useEffect(() => {
        if (isOpen) setGrams("")
    }, [isOpen])

    if (!product) return null

    const handleConfirm = () => {
        const parsed = parseInt(grams)
        if (!isNaN(parsed) && parsed > 0) {
            onConfirm(parsed)
            onClose()
        }
    }

    const setQuickWeight = (w: number) => {
        onConfirm(w)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase italic tracking-widest text-orange-600 dark:text-orange-400">
                        <Scale className="h-6 w-6" />
                        Báscula Virtual
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-bold uppercase tracking-wider text-xs">
                        Ingreso de peso manual para: <span className="text-zinc-900 dark:text-zinc-100 font-black">{product.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Quick Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button variant="outline" className="font-mono font-black border-orange-200 hover:bg-orange-50 dark:border-orange-900/50 dark:hover:bg-orange-900/20" onClick={() => setQuickWeight(100)}>
                            100 GR
                        </Button>
                        <Button variant="outline" className="font-mono font-black border-orange-200 hover:bg-orange-50 dark:border-orange-900/50 dark:hover:bg-orange-900/20" onClick={() => setQuickWeight(250)}>
                            250 GR
                        </Button>
                        <Button variant="outline" className="font-mono font-black border-orange-200 hover:bg-orange-50 dark:border-orange-900/50 dark:hover:bg-orange-900/20" onClick={() => setQuickWeight(500)}>
                            500 GR
                        </Button>
                        <Button variant="outline" className="font-mono font-black border-orange-200 hover:bg-orange-50 dark:border-orange-900/50 dark:hover:bg-orange-900/20" onClick={() => setQuickWeight(1000)}>
                            1 KG
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Input
                                type="number"
                                min="1"
                                placeholder="0"
                                value={grams}
                                onChange={(e) => setGrams(e.target.value)}
                                className="pl-4 pr-12 text-2xl font-black font-mono h-14 tracking-tighter"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
                                GR
                            </div>
                        </div>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white h-14 px-8 font-black uppercase tracking-widest rounded-xl transition-all"
                            onClick={handleConfirm}
                            disabled={!grams || parseInt(grams) <= 0}
                        >
                            Agregar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
