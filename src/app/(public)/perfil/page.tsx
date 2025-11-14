// app/(public)/perfil/page.tsx
// (Este ahora es un SERVER Component)

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPedidosByClienteId } from '@/lib/db'; // Importamos la nueva función
import { redirect } from "next/navigation";
import { Prisma } from '@prisma/client';
import Link from 'next/link';

// Componentes UI
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 1. Importamos el formulario que acabamos de crear
import EditProfileForm from "./EditProfileForm";

// --- Definimos los tipos que necesitamos ---
type PedidosArray = Prisma.PromiseReturnType<typeof getPedidosByClienteId>;
type PedidoConNegocio = PedidosArray[number];
// ---

// --- Helpers (copiados de la pág. de pedidos del gestor) ---
function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount));
}
function formatDate(date: Date | null | undefined) {
  if (!date) return "Fecha desconocida";
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}
function formatEstado(estado: string) {
  return estado.replace(/_/g, ' ');
}
// ---

export default async function PerfilPage() {

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Obtenemos el historial de pedidos en el servidor
  const pedidos = await getPedidosByClienteId(Number(session.user.id));

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Mi Perfil
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* --- Columna Izquierda: Formulario de Edición --- */}
        <div className="md:col-span-1">
          {/* 3. Renderizamos el Componente Cliente */}
          <EditProfileForm />
        </div>

        {/* --- Columna Derecha: Historial de Pedidos --- */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pedidos</CardTitle>
              <CardDescription>
                Aquí puedes ver todos los pedidos que has realizado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pedidos.length > 0 ? (
                <ul className="divide-y">
                  {pedidos.map((pedido: PedidoConNegocio) => (
                    <li key={pedido.id_pedido} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">
                          Pedido a <span className="text-primary">{pedido.negocios?.nombre || 'Negocio eliminado'}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(pedido.fecha_hora)}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {formatEstado(pedido.estado)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(pedido.total)}</p>
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                          {/* TODO: Crear esta página de detalle */}
                          <Link href={`/perfil/pedidos/${pedido.id_pedido}`}>
                            Ver detalle
                          </Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aún no has realizado ningún pedido.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}