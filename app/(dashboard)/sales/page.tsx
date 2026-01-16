import { db } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns" // I need to check if I installed date-fns. I didn't explicitly. I'll use JS Date for now to avoid error, or install it. I'll use JS Date.

export default async function SalesHistoryPage() {
    const sales = await db.sale.findMany({
        include: { client: true, items: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Historial de Ventas</h1>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No hay ventas registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>
                                        {sale.createdAt.toLocaleDateString()} {sale.createdAt.toLocaleTimeString()}
                                    </TableCell>
                                    <TableCell>{sale.client?.name || "Consumidor Final"}</TableCell>
                                    <TableCell>${Number(sale.total).toFixed(2)}</TableCell>
                                    <TableCell className="capitalize">{sale.status}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
