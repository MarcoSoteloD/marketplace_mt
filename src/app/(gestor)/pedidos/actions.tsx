"use server";

import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { estado_pedido, Prisma } from '@prisma/client';
import { updatePedidoEstado, getKanbanPedidos } from '@/lib/data/orders';
import { resend, EMAIL_REMITENTE } from '@/lib/email';
import OrderStatusEmail from '@/components/emails/OrderStatusEmail';
import { render } from '@react-email/render';
import React from 'react';
import { prisma } from '@/lib/prisma';

// Definimos el tipo de Pedido que el cliente espera
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
    // Actualizar el estado en la BD
    await updatePedidoEstado(pedidoId, session.user.negocioId, nuevoEstado);
    
    // ENVIAR CORREO DE ACTUALIZACIÓN AL CLIENTE (Fire & Forget)
    // Buscamos los datos necesarios para el correo (Email del cliente, Nombre del Negocio)
    (async () => {
        try {
            const pedidoInfo = await prisma.pedidos.findUnique({
                where: { id_pedido: pedidoId },
                include: {
                    usuarios: { select: { email: true, nombre: true } },
                    negocios: { select: { nombre: true } }
                }
            });

            if (pedidoInfo && pedidoInfo.usuarios.email) {
                console.log(`Enviando notificación de estado '${nuevoEstado}' a ${pedidoInfo.usuarios.email}`);
                
                const emailHtml = await render(
                    React.createElement(OrderStatusEmail, {
                        nombreCliente: pedidoInfo.usuarios.nombre,
                        nombreNegocio: pedidoInfo.negocios.nombre,
                        idPedido: pedidoId,
                        nuevoEstado: nuevoEstado
                    })
                );

                await resend.emails.send({
                    from: EMAIL_REMITENTE,
                    to: pedidoInfo.usuarios.email,
                    subject: `Actualización de tu pedido #${pedidoId} 🔔`,
                    html: emailHtml,
                });
            }
        } catch (emailError) {
            console.error("Error enviando correo de estado:", emailError);
        }
    })();
    
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
    
    // TRANSFORMACIÓN DE DATOS (Decimal -> Number)
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