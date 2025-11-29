import { getRecentGlobalOrders } from '@/lib/data/orders';
import { getRecentGestores } from '@/lib/data/users';
import { getAdminDashboardStats} from '@/lib/data/stats';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Store, DollarSign, ShoppingBag, ArrowRight, TrendingUp, ShoppingCart } from "lucide-react";

// Helper de moneda
function formatCurrency(amount: any) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount));
}

function formatDate(date: any) {
    if(!date) return "";
    return new Intl.DateTimeFormat('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export default async function AdminDashboardPage() {
  
  // Obtenemos datos
  const [stats, recentGestores, recentOrders] = await Promise.all([
    getAdminDashboardStats(),
    getRecentGestores(5),
    getRecentGlobalOrders(5)
  ]);

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-stone-800">Dashboard General</h1>
        <div className="text-sm text-muted-foreground">
            Resumen de impacto económico y actividad.
        </div>
      </div>
      
      {/* === Tarjetas de KPIs === */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Ventas */}
        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Derrama Económica</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{formatCurrency(stats.totalVentas)}</div>
            <p className="text-xs text-muted-foreground mt-1">
                Ventas totales acumuladas
            </p>
          </CardContent>
        </Card>

        {/* Total Pedidos */}
        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Movimiento Comercial</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{stats.totalPedidos}</div>
            <p className="text-xs text-muted-foreground mt-1">
                Transacciones procesadas
            </p>
          </CardContent>
        </Card>

        {/* Negocios */}
        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Oferta Local</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Store className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{stats.totalNegocios}</div>
            <p className="text-xs text-muted-foreground mt-1">
                Negocios registrados
            </p>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card className="border-stone-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ciudadanos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground mt-1">
                Usuarios activos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === Feed en Vivo === */}
        <Card className="border-stone-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between bg-stone-50/50 border-b pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Actividad en Tiempo Real
                    </CardTitle>
                    <CardDescription>Monitor de transacciones recientes.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ul className="divide-y">
                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                        <li key={order.id_pedido} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                    <ShoppingCart className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="font-medium text-sm text-stone-800">
                                        Nueva compra en <span className="font-bold text-orange-600">{order.negocios?.nombre}</span>
                                    </p>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        {formatDate(order.fecha_hora)} • Folio #{order.id_pedido}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-stone-700">{formatCurrency(order.total)}</span>
                                <Badge variant="outline" className="text-[10px] uppercase bg-white">
                                    {order.estado}
                                </Badge>
                            </div>
                        </li>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                            <ShoppingCart className="h-8 w-8 opacity-20" />
                            <p className="text-sm">Esperando las primeras ventas...</p>
                        </div>
                    )}
                </ul>
            </CardContent>
        </Card>

        {/* === Gestores Recientes === */}
        <Card className="border-stone-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg">Nuevos Negocios</CardTitle>
                    <CardDescription>Últimas altas en el padrón.</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                    <Link href="/gestores" className="gap-1">Ver Todos <ArrowRight className="h-3 w-3" /></Link>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <ul className="divide-y">
                    {recentGestores.length > 0 ? recentGestores.map((gestor) => (
                        <li key={gestor.id_usuario} className="flex items-center justify-between p-4">
                            <div className="flex flex-col">
                                <p className="font-medium text-sm text-stone-800">{gestor.negocios?.nombre || "Sin negocio asignado"}</p>
                                <p className="text-xs text-muted-foreground">Responsable: {gestor.nombre}</p>
                            </div>
                            <Badge variant={gestor.activo ? "secondary" : "destructive"} className="text-xs">
                                {gestor.activo ? "Activo" : "Inactivo"}
                            </Badge>
                        </li>
                    )) : (
                        <p className="text-center text-muted-foreground py-8">No hay registros recientes.</p>
                    )}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}