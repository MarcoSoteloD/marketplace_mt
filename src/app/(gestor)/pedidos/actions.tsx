"use server";

import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { estado_pedido, Prisma } from '@prisma/client';
import { updatePedidoEstado, getKanbanPedidos } from '@/lib/db';

// Definimos el tipo de Pedido que el cliente espera
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
    // Usamos la función encapsulada en db.ts
    const pedidos = await getKanbanPedidos(session.user.negocioId);
    return pedidos;
    
  } catch (error) {
    console.error("Error en getPedidosAction:", error);
    return [];
  }
}