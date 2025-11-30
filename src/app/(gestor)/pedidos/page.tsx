import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getPedidosByNegocioId } from '@/lib/data/orders';
import { redirect } from "next/navigation";
import { estado_pedido } from '@prisma/client';
import { KanbanBoard } from './KanbanBoard';
import type { PedidoConCliente } from './actions'; 

export default async function PaginaPedidos() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  // Obtenemos los pedidos LA PRIMERA VEZ en el servidor (vienen con Decimales)
  const initialPedidosRaw = await getPedidosByNegocioId(session.user.negocioId);

  // TRANSFORMACIÓN Y FILTRADO
  // Convertimos Decimal -> Number para que coincida con 'PedidoConCliente'
  const activePedidos: PedidoConCliente[] = initialPedidosRaw
    .filter(p => 
      p.estado === estado_pedido.Recibido || 
      p.estado === estado_pedido.En_Preparaci_n || 
      p.estado === estado_pedido.Listo_para_recoger
    )
    .map(pedido => ({
        ...pedido,
        total: Number(pedido.total),
        detalle_pedido: pedido.detalle_pedido.map(detalle => ({
            ...detalle,
            precio_unitario: Number(detalle.precio_unitario)
        }))
    }));

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold tracking-tight mb-4">
        Tablero de Pedidos
      </h1>
      
      {/* Renderizamos el componente cliente con los datos ya limpios */}
      <KanbanBoard initialPedidos={activePedidos} />
    </div>
  );
}