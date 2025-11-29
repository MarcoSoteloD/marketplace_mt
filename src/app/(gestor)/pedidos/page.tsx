// app/(gestor)/pedidos/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPedidosByNegocioId } from '@/lib/data/orders';
import { redirect } from "next/navigation";
import { estado_pedido } from '@prisma/client';
import { KanbanBoard } from './KanbanBoard';

export default async function PaginaPedidos() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  // Obtenemos los pedidos LA PRIMERA VEZ en el servidor
  const initialPedidos = await getPedidosByNegocioId(session.user.negocioId);

  // Filtramos solo los pedidos "activos" para el tablero
  const activePedidos = initialPedidos.filter(p => 
    p.estado === estado_pedido.Recibido || 
    p.estado === estado_pedido.En_Preparaci_n || 
    p.estado === estado_pedido.Listo_para_recoger
  );

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold tracking-tight mb-4">
        Tablero de Pedidos
      </h1>
      
      {/* Renderizamos el componente cliente con los datos iniciales */}
      <KanbanBoard initialPedidos={activePedidos} />
    </div>
  );
}