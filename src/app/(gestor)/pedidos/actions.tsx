"use server";

import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { estado_pedido, Prisma } from '@prisma/client';
import { updatePedidoEstado, getKanbanPedidos } from '@/lib/data/orders';

export type PedidoConCliente = Omit<Prisma.pedidosGetPayload<{
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
}>, 'total' | 'detalle_pedido'> & {
  total: number;
  detalle_pedido: (Omit<Prisma.detalle_pedidoGetPayload<{
    include: {
        productos: { select: { nombre: true; url_foto: true } }
    }
  }>, 'precio_unitario'> & { precio_unitario: number })[];
};

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
    // Obtenemos datos crudos
    const pedidosRaw = await getKanbanPedidos(session.user.negocioId);
    
    // TRANSFORMACIÓN DE DATOS
    const pedidosLimpios = pedidosRaw.map(pedido => ({
        ...pedido,
        total: Number(pedido.total),
        detalle_pedido: pedido.detalle_pedido.map(detalle => ({
            ...detalle,
            precio_unitario: Number(detalle.precio_unitario)
        }))
    }));

    return pedidosLimpios;
    
  } catch (error) {
    console.error("Error en getPedidosAction:", error);
    return [];
  }
}