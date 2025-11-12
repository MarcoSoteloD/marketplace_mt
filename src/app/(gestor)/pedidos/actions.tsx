// app/(gestor)/pedidos/actions.ts
"use server";

import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { estado_pedido, Prisma, usuarios, detalle_pedido, productos } from '@prisma/client';

// Importamos las funciones de DB
import { 
  updatePedidoEstado,
  getPedidosByNegocioId // ¡La usaremos para el polling!
} from '@/lib/db';

// Definimos el tipo de Pedido que el cliente espera
// (la solución que ya encontramos para el 'include')
type PedidosArray = Prisma.PromiseReturnType<typeof getPedidosByNegocioId>;
type DetalleConProducto = (detalle_pedido & {
  productos: {
    nombre: string;
    url_foto: string | null;
  } | null;
});

export type PedidoConCliente = Prisma.pedidosGetPayload<{
  include: {
    usuarios: {
      select: {
        nombre: true;
        email: true;
      }
    };
    detalle_pedido: {
      include: {
        productos: {
          select: {
            nombre: true;
            url_foto: true;
          }
        }
      }
    };
  }
}>;

/**
 * Server Action para actualizar el estado de un pedido (Drag-and-Drop)
 */
export async function updatePedidoEstadoAction(
  pedidoId: number,
  nuevoEstado: estado_pedido
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { success: false, message: "No autorizado." };
  }

  try {
    await updatePedidoEstado(pedidoId, session.user.negocioId, nuevoEstado);
    
    // Revalidamos la ruta (para que la próxima carga SSR esté actualizada)
    revalidatePath('/(gestor)/pedidos'); 
    return { success: true, message: "Estado actualizado." };

  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Server Action para que el cliente haga "polling" (SWR)
 * Obtiene TODOS los pedidos activos del negocio.
 */
export async function getPedidosAction(): Promise<PedidoConCliente[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    throw new Error("No autorizado.");
  }

  try {
    const pedidos = await getPedidosByNegocioId(session.user.negocioId);
    
    // Filtramos los que ya no son relevantes para el tablero
    return pedidos.filter(p => 
      p.estado === 'Recibido' || 
      p.estado === 'En_Preparaci_n' || 
      p.estado === 'Listo_para_recoger'
    );
    
  } catch (error) {
    console.error("Error en getPedidosAction:", error);
    return []; // Devuelve vacío si hay error
  }
}