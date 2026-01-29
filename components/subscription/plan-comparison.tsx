"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanComparisonProps {
  className?: string
}

const comparisonData = {
  limits: [
    { name: "Productos", free: "25", entrepreneur: "300", premium: "Ilimitados" },
    { name: "Clientes", free: "10", entrepreneur: "200", premium: "Ilimitados" },
    { name: "Usuarios", free: "1", entrepreneur: "2", premium: "Ilimitados" },
    { name: "Proveedores", free: "0", entrepreneur: "10", premium: "Ilimitados" },
    { name: "Facturas/mes", free: "20", entrepreneur: "200", premium: "Ilimitadas" },
    { name: "Notas de crédito/mes", free: "5", entrepreneur: "50", premium: "Ilimitadas" },
    { name: "Historial de reportes", free: "24hs", entrepreneur: "30 días", premium: "Completo" },
  ],
  features: [
    { name: "POS completo", free: true, entrepreneur: true, premium: true },
    { name: "Gestión de inventario", free: true, entrepreneur: true, premium: true },
    { name: "Dashboard en tiempo real", free: true, entrepreneur: true, premium: true },
    { name: "Cálculo de IVA", free: true, entrepreneur: true, premium: true },
    { name: "Gestión de descuentos", free: true, entrepreneur: true, premium: true },
    { name: "App de escritorio (Electron)", free: true, entrepreneur: true, premium: true },
    { name: "Gestión de proveedores", free: false, entrepreneur: true, premium: true },
    { name: "Exportación PDF", free: false, entrepreneur: true, premium: true },
    { name: "Exportación Excel", free: false, entrepreneur: true, premium: true },
    { name: "Reportes avanzados", free: false, entrepreneur: false, premium: true },
    { name: "Alertas automáticas", free: false, entrepreneur: false, premium: true },
    { name: "Auditoría completa", free: false, entrepreneur: false, premium: true },
    { name: "Operaciones masivas", free: false, entrepreneur: false, premium: true },
    { name: "Temas personalizados", free: false, entrepreneur: false, premium: true },
    { name: "Soporte prioritario", free: false, entrepreneur: false, premium: true },
    { name: "Acceso API", free: false, entrepreneur: false, premium: true },
  ]
}

export function PlanComparison({ className }: PlanComparisonProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 border-b font-semibold">Característica</th>
            <th className="text-center p-3 border-b font-semibold w-28">Free</th>
            <th className="text-center p-3 border-b font-semibold w-28 bg-blue-50 dark:bg-blue-900/20">Emprendedor</th>
            <th className="text-center p-3 border-b font-semibold w-28 bg-primary/5">Pyme</th>
          </tr>
        </thead>
        <tbody>
          {/* Limits section */}
          <tr>
            <td colSpan={4} className="p-3 bg-muted/50 font-semibold text-sm uppercase tracking-wider">
              Límites
            </td>
          </tr>
          {comparisonData.limits.map((item, i) => (
            <tr key={`limit-${i}`} className="border-b">
              <td className="p-3 text-sm">{item.name}</td>
              <td className="p-3 text-sm text-center">{item.free}</td>
              <td className="p-3 text-sm text-center bg-blue-50 dark:bg-blue-900/20">{item.entrepreneur}</td>
              <td className="p-3 text-sm text-center bg-primary/5 font-medium">{item.premium}</td>
            </tr>
          ))}

          {/* Features section */}
          <tr>
            <td colSpan={4} className="p-3 bg-muted/50 font-semibold text-sm uppercase tracking-wider">
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
              <td className="p-3 text-center bg-blue-50 dark:bg-blue-900/20">
                {item.entrepreneur ? (
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
