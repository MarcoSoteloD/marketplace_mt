// app/(admin)/page.tsx

import { getAdminDashboardStats, getRecentGestores } from '@/lib/db';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
// Importamos los iconos (quitamos UserCheck)
import { Users, Store, Tags } from "lucide-react";

export default async function AdminDashboardPage() {
  
  // 1. Obtenemos los datos (getAdminDashboardStats ahora solo devuelve 3 cosas)
  const [stats, recentGestores] = await Promise.all([
    getAdminDashboardStats(),
    getRecentGestores(5)
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
      
      {/* === 1. Tarjetas de KPIs (Ajustado a 3 columnas) === */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* <-- CAMBIO AQUÍ: lg:grid-cols-3 */}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Negocios</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNegocios}</div>
          </CardContent>
        </Card>

        {/* --- TARJETA DE GESTORES ELIMINADA --- */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías Globales</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategorias}</div>
          </CardContent>
        </Card>
      </div>

      {/* === 2. Tarjeta de Actividad Reciente (Sin cambios) === */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Los últimos 5 gestores/negocios creados.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/gestores">Ver Todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recentGestores.length > 0 ? recentGestores.map((gestor) => (
              <li key={gestor.id_usuario} className="flex items-center justify-between p-3">
                {/* Info de Usuario */}
                <div>
                  <p className="font-medium">{gestor.nombre}</p>
                  <p className="text-sm text-muted-foreground">{gestor.email}</p>
                </div>
                {/* Info de Negocio y Estado */}
                <div className="text-right">
                  <p className="font-medium">{gestor.negocios?.nombre || "N/A"}</p>
                  <Badge variant={gestor.activo ? "secondary" : "destructive"}>
                    {gestor.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </li>
            )) : (
              <p className="text-center text-muted-foreground py-4">
                No hay gestores registrados recientemente.
              </p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}