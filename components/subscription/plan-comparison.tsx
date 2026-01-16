"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanComparisonProps {
  className?: string
}

const comparisonData = {
  limits: [
    { name: "Productos", free: "500", premium: "Ilimitados" },
    { name: "Clientes", free: "100", premium: "Ilimitados" },
    { name: "Usuarios", free: "2", premium: "10" },
    { name: "Facturas/mes", free: "50", premium: "Ilimitadas" },
    { name: "Notas de crédito/mes", free: "10", premium: "Ilimitadas" },
    { name: "Historial de reportes", free: "7 días", premium: "Completo" },
  ],
  features: [
    { name: "POS completo", free: true, premium: true },
    { name: "Gestión de inventario", free: true, premium: true },
    { name: "Dashboard en tiempo real", free: true, premium: true },
    { name: "Cálculo de IVA", free: true, premium: true },
    { name: "Gestión de descuentos", free: true, premium: true },
    { name: "App de escritorio (Electron)", free: true, premium: true },
    { name: "Gestión de proveedores", free: false, premium: true },
    { name: "Exportación PDF profesional", free: false, premium: true },
    { name: "Exportación Excel", free: false, premium: true },
    { name: "Reportes avanzados", free: false, premium: true },
    { name: "Alertas automáticas", free: false, premium: true },
    { name: "Auditoría completa", free: false, premium: true },
    { name: "Operaciones masivas", free: false, premium: true },
    { name: "Temas personalizados", free: false, premium: true },
    { name: "Soporte prioritario", free: false, premium: true },
  ]
}

export function PlanComparison({ className }: PlanComparisonProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 border-b font-semibold">Característica</th>
            <th className="text-center p-3 border-b font-semibold w-32">Free</th>
            <th className="text-center p-3 border-b font-semibold w-32 bg-primary/5">Premium</th>
          </tr>
        </thead>
        <tbody>
          {/* Limits section */}
          <tr>
            <td colSpan={3} className="p-3 bg-muted/50 font-semibold text-sm uppercase tracking-wider">
              Límites
            </td>
          </tr>
          {comparisonData.limits.map((item, i) => (
            <tr key={`limit-${i}`} className="border-b">
              <td className="p-3 text-sm">{item.name}</td>
              <td className="p-3 text-sm text-center">{item.free}</td>
              <td className="p-3 text-sm text-center bg-primary/5 font-medium">{item.premium}</td>
            </tr>
          ))}
          
          {/* Features section */}
          <tr>
            <td colSpan={3} className="p-3 bg-muted/50 font-semibold text-sm uppercase tracking-wider">
              Funciones
            </td>
          </tr>
          {comparisonData.features.map((item, i) => (
            <tr key={`feature-${i}`} className="border-b">
              <td className="p-3 text-sm">{item.name}</td>
              <td className="p-3 text-center">
                {item.free ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground mx-auto" />
                )}
              </td>
              <td className="p-3 text-center bg-primary/5">
                {item.premium ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground mx-auto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
