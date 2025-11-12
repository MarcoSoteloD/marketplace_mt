// app/(gestor)/pedidos/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPedidosByNegocioId } from '@/lib/db';
import { redirect } from "next/navigation";
import { estado_pedido } from '@prisma/client';

// Importamos el nuevo Tablero Cliente que crearemos
import { KanbanBoard } from './KanbanBoard';

export default async function PaginaPedidos() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  // 1. Obtenemos los pedidos LA PRIMERA VEZ en el servidor
  const initialPedidos = await getPedidosByNegocioId(session.user.negocioId);

  // 2. Filtramos solo los pedidos "activos" para el tablero
  const activePedidos = initialPedidos.filter(p => 
    p.estado === estado_pedido.Recibido || 
    p.estado === estado_pedido.En_Preparaci_n || 
    p.estado === estado_pedido.Listo_para_recoger
  );

  return (
    <div className="flex flex-col h-full"> {/* h-full es importante */}
      <h1 className="text-3xl font-bold tracking-tight mb-4">
        Tablero de Pedidos
      </h1>
      
      {/* 3. Renderizamos el componente cliente con los datos iniciales */}
      <KanbanBoard initialPedidos={activePedidos} />
    </div>
  );
}