"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { CartItem } from '@/store/cart-store'; 
import { getNegocioBasicoById } from '@/lib/data/businesses';

type CreatePedidoResult = {
  success: true;
  pedidoId: number;
} | {
  success: false;
  message: string;
};

/**
 * Acción para que el cliente (SWR) obtenga el nombre del negocio
 * basado en el ID guardado en el carrito.
 */
export async function getNegociosDelCarritoAction(negociosIds: number[]) {
  if (!negociosIds.length) return [];
  
  try {
    return await prisma.negocios.findMany({
      where: {
        id_negocio: { in: negociosIds }
      },
      select: {
        id_negocio: true,
        nombre: true,
        slug: true,
        url_logo: true
      }
    });
  } catch (error) {
    return [];
  }
}

export async function getNegocioDelCarritoAction(negocioId: number) {
  if (!negocioId) return null;
  return getNegocioBasicoById(negocioId);
}

/**
 * Server Action: CREAR PEDIDO
 */
export async function createPedidoAction(
  items: CartItem[], 
  negocioId: number, 
  total: number
): Promise<CreatePedidoResult> {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Usuario no autenticado" };
  }
  const clienteId = Number(session.user.id);

  const detallesData = items.map(item => ({
    id_producto: item.id_producto,
    cantidad: item.quantity,
    precio_unitario: item.precio,
    comentarios: item.comentarios || null, 
  }));

  try {
    const newPedido = await prisma.pedidos.create({
      data: {
        id_usuario: clienteId,
        id_negocio: negocioId,
        total: new Prisma.Decimal(total),
        estado: 'Recibido',
        metodo_pago: 'efectivo',
        detalle_pedido: {
          create: detallesData,
        },
      },
    });

    return { success: true, pedidoId: newPedido.id_pedido };

  } catch (error) {
    console.error("Error en createPedidoAction:", error);
    return { success: false, message: "No se pudo crear el pedido." };
  }
}