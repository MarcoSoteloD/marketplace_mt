// app/(public)/carrito/actions.ts
"use server";

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import type { CartItem } from '@/store/cart-store'; // Importamos el tipo

// Importamos la función de DB que acabamos de crear
import { getNegocioBasicoById } from '@/lib/db';

// Definimos un tipo de respuesta
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
export async function getNegocioDelCarritoAction(negocioId: number) {
  if (!negocioId) return null;
  return getNegocioBasicoById(negocioId);
}

/**
 * Server Action: CREAR PEDIDO
 * (Versión corregida: ahora devuelve JSON, no redirige)
 */
export async function createPedidoAction(
  items: CartItem[], 
  negocioId: number, 
  total: number
): Promise<CreatePedidoResult> { // <-- 2. Usamos el tipo de respuesta
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // 3. Si no está logueado, devolvemos un error
    return { success: false, message: "Usuario no autenticado" };
  }
  const clienteId = Number(session.user.id);

  const detallesData = items.map(item => ({
    id_producto: item.id_producto,
    cantidad: item.quantity,
    precio_unitario: item.precio,
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

    // 4. ¡Éxito! Devolvemos 'success' y el ID
    return { success: true, pedidoId: newPedido.id_pedido };

  } catch (error) {
    console.error("Error en createPedidoAction:", error);
    // 5. Fallo: Devolvemos 'success: false'
    return { success: false, message: "No se pudo crear el pedido." };
  }
}