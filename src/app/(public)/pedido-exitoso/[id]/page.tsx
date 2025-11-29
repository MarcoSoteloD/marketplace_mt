import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPedidoDetailsByClienteId } from '@/lib/data/orders';
import { notFound, redirect } from "next/navigation";
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package } from "lucide-react";

// --- Helpers ---
function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(amount));
}

export default async function PaginaPedidoExitoso({
  params
}: {
  params: { id: string }
}) {

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const pedidoId = Number(params.id);
  const clienteId = Number(session.user.id);

  const pedido = await getPedidoDetailsByClienteId(pedidoId, clienteId);

  if (!pedido) {
    notFound();
  }

  const direccionNegocio = [
    pedido.negocios?.calle,
    pedido.negocios?.colonia
  ].filter(Boolean).join(', ');

  return (
    <div className="container py-12 md:py-16">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-600" />
          <CardTitle className="text-3xl font-bold pt-4 text-stone-700">¡Gracias por tu pedido!</CardTitle>
          <CardDescription className="text-base">
            Tu pedido <span className="font-bold">#{pedido.id_pedido}</span> ha sido recibido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <Separator />

          {/* --- Resumen de Productos --- */}
          <div className="space-y-2">
            <h3 className="font-semibold text-stone-700">Resumen de tu compra:</h3>
            <ul className="divide-y rounded-md border">
              {pedido.detalle_pedido.map(item => (
                <li key={item.id_producto} className="flex items-center justify-between p-3 text-stone-700">
                  <div className="flex-1 pr-4">
                    <div>
                        <span className="font-medium">{item.productos?.nombre || "Producto"}</span>
                        <span className="text-sm text-muted-foreground ml-2">x {item.cantidad}</span>
                    </div>
                  
                    {item.comentarios && (
                        <p className="text-xs text-stone-500 italic mt-1">
                            Nota: {item.comentarios}
                        </p>
                    )}
                  </div>
                  
                  <span className="font-medium whitespace-nowrap">
                    {formatCurrency(Number(item.precio_unitario) * item.cantidad)}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between p-3 bg-muted font-bold text-lg text-stone-700">
                <p>Total:</p>
                <p>{formatCurrency(pedido.total)}</p>
              </li>
            </ul>
          </div>

          <Separator />

          {/* --- Info del Negocio --- */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-700">Información de Recogida:</h3>
            <div className="flex items-center gap-4 rounded-md border p-4 text-stone-700">
              <Package className="h-8 w-8 text-stone-700 flex-shrink-0" />
              <div>
                <p className="font-medium ">Recoger en: <span className="font-bold text-stone-700">{pedido.negocios?.nombre}</span></p>
                <p className="text-sm text-muted-foreground">{direccionNegocio}</p>
                <p className="text-sm text-muted-foreground">Teléfono: {pedido.negocios?.telefono || 'N/A'}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu pedido estará listo pronto. El negocio te notificará (o puedes revisar el estado en "Mi Perfil").
            </p>
          </div>

          <Separator />

          <Button asChild className="w-full rounded-full bg-orange-600 hover:bg-orange-500">
            <Link href="/perfil">Visualizar mis pedidos</Link>
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}