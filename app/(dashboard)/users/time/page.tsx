import { getSession } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { getTimeEntries, getActiveTimeEntry, getShiftHistory } from "@/actions/employee-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ClockInOut } from "@/components/employees/clock-in-out"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, Calendar, Timer, TrendingUp } from "lucide-react"

export default async function TimeEntriesPage() {
    const session = await getSession()
    
    if (!session) {
        redirect("/login")
    }

    const [activeEntry, timeEntries] = await Promise.all([
        getActiveTimeEntry(),
        getTimeEntries(undefined, undefined, undefined)
    ])

    // Calculate stats
    const thisWeekEntries = timeEntries.filter(e => {
        const entryDate = new Date(e.clockIn)
        const now = new Date()
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        return entryDate >= weekStart
    })

    const totalMinutesThisWeek = thisWeekEntries.reduce((acc, e) => acc + (e.totalMinutes || 0), 0)
    const totalHoursThisWeek = Math.floor(totalMinutesThisWeek / 60)
    const remainingMinutes = totalMinutesThisWeek % 60

    const formatMinutes = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return `${h}h ${m}m`
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700">Activa</Badge>
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-700">Completada</Badge>
            case 'edited':
                return <Badge className="bg-yellow-100 text-yellow-700">Editada</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Control de Horario</h1>
                <p className="text-muted-foreground">
                    Registrá tu entrada y salida
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Clock In/Out Card */}
                <ClockInOut 
                    activeEntry={activeEntry ? {
                        id: activeEntry.id,
                        clockIn: activeEntry.clockIn,
                        breakMinutes: activeEntry.breakMinutes
                    } : null}
                />

                {/* Stats Cards */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Esta Semana
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalHoursThisWeek}h {remainingMinutes}m</div>
                        <p className="text-xs text-muted-foreground">
                            {thisWeekEntries.length} días trabajados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Promedio Diario
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {thisWeekEntries.length > 0 
                                ? formatMinutes(Math.floor(totalMinutesThisWeek / thisWeekEntries.length))
                                : '0h 0m'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            basado en esta semana
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        Historial de Entradas
                    </CardTitle>
                    <CardDescription>
                        Tus últimas entradas y salidas registradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Entrada</TableHead>
                                <TableHead>Salida</TableHead>
                                <TableHead>Duración</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {timeEntries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No hay registros de horario
                                    </TableCell>
                                </TableRow>
                            ) : (
                                timeEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(entry.clockIn), "EEE d MMM", { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(entry.clockIn), "HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            {entry.clockOut 
                                                ? format(new Date(entry.clockOut), "HH:mm")
                                                : <span className="text-muted-foreground">-</span>}
                                        </TableCell>
                                        <TableCell>
                                            {entry.totalMinutes 
                                                ? formatMinutes(entry.totalMinutes)
                                                : <span className="text-green-600">En curso</span>}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(entry.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
