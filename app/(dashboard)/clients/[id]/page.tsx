import { getClientById } from "@/actions/client-actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClientById(parseInt(id))
  
  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">Cliente desde {format(client.createdAt, "MMMM yyyy", { locale: es })}</p>
          </div>
        </div>
        <Link href={`/clients/${id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client.address}</span>
              </div>
            )}
            {client.taxId && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>CUIT: {client.taxId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{client._count.sales}</div>
            <p className="text-xs text-muted-foreground">Compras totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${client.sales.reduce((acc, sale) => acc + Number(sale.total), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">En todas las compras</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {client.sales.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Este cliente no tiene compras registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{format(sale.date, "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                    <TableCell>{sale.items.length} productos</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === 'completed' ? 'default' : sale.status === 'cancelled' ? 'destructive' : 'secondary'}>
                        {sale.status === 'completed' ? 'Completada' : sale.status === 'cancelled' ? 'Cancelada' : sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(sale.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
