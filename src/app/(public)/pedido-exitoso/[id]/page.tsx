// app/(public)/pedido-exitoso/[id]/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPedidoDetailsByClienteId } from '@/lib/db';
import { notFound, redirect } from "next/navigation";
import { Prisma } from '@prisma/client';
import Link from 'next/link';

// Componentes UI
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package } from "lucide-react";

// --- Tipos (La solución que ya conocemos) ---
type PedidoExitoso = Prisma.PromiseReturnType<typeof getPedidoDetailsByClienteId>;
// ---

// --- Helpers ---
function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(amount));
}
// ---

export default async function PaginaPedidoExitoso({ 
  params 
}: { 
  params: { id: string } 
}) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // Si no está logueado, no puede ver esta página
    redirect("/login"); 
  }

  const pedidoId = Number(params.id);
  const clienteId = Number(session.user.id);
  
  // 1. Obtenemos el pedido (solo si es de este cliente)
  const pedido = await getPedidoDetailsByClienteId(pedidoId, clienteId);

  if (!pedido) {
    notFound(); // Si el pedido no existe o no es de este cliente, 404
  }

  const direccionNegocio = [
    pedido.negocios?.calle,
    pedido.negocios?.colonia
  ].filter(Boolean).join(', ');

  return (
    <div className="container py-12 md:py-20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-600" />
          <CardTitle className="text-3xl font-bold pt-4">¡Gracias por tu pedido!</CardTitle>
          <CardDescription className="text-base">
            Tu pedido <span className="font-bold">#{pedido.id_pedido}</span> ha sido recibido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <Separator />

          {/* --- Resumen de Productos --- */}
          <div className="space-y-2">
            <h3 className="font-semibold">Resumen de tu compra:</h3>
            <ul className="divide-y rounded-md border">
              {pedido.detalle_pedido.map(item => (
                <li key={item.id_producto} className="flex items-center justify-between p-3">
                  <div>
                    <span className="font-medium">{item.productos?.nombre || "Producto"}</span>
                    <span className="text-sm text-muted-foreground ml-2">x {item.cantidad}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(Number(item.precio_unitario) * item.cantidad)}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between p-3 bg-muted font-bold text-lg">
                <p>Total:</p>
                <p>{formatCurrency(pedido.total)}</p>
              </li>
            </ul>
          </div>

          <Separator />
          
          {/* --- Info del Negocio --- */}
          <div className="space-y-3">
            <h3 className="font-semibold">Información de Recogida:</h3>
            <div className="flex items-center gap-4 rounded-md border p-4">
              <Package className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Recoger en: <span className="font-bold text-primary">{pedido.negocios?.nombre}</span></p>
                <p className="text-sm text-muted-foreground">{direccionNegocio}</p>
                <p className="text-sm text-muted-foreground">Teléfono: {pedido.negocios?.telefono || 'N/A'}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu pedido estará listo pronto. El negocio te notificará (o puedes revisar el estado en "Mi Perfil").
            </p>
          </div>

          <Separator />

          <Button asChild className="w-full">
            <Link href="/">Volver a la tienda</Link>
          </Button>
          
        </CardContent>
      </Card>
    </div>
  );
}