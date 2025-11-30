"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { CartItem } from '@/store/cart-store'; 
import { getNegocioBasicoById } from '@/lib/data/businesses';
import { resend, EMAIL_REMITENTE } from '@/lib/email';
import NewOrderClientEmail from '@/components/emails/NewOrderClientEmail';
import NewOrderGestorEmail from '@/components/emails/NewOrderGestorEmail';
import { render } from '@react-email/render'; 
import React from 'react';

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
  } catch {
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
  if (!session?.user?.id || !session.user.email) {
    return { success: false, message: "Usuario no autenticado" };
  }
  const clienteId = Number(session.user.id);
  const clienteEmail = session.user.email;
  const clienteNombre = session.user.name || "Cliente";

  // --- MAPEO DE DETALLES ---
  const detallesData = items.map(item => ({
    id_producto: item.id_producto,
    cantidad: item.quantity,
    precio_unitario: item.precio,
    comentarios: item.comentarios || null, 
  }));

  try {
    // CREAR EL PEDIDO EN DB
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

    // 2. NOTIFICACIONES POR CORREO (Fire & Forget)
    // No usamos 'await' para bloquear la respuesta, pero sí un try-catch interno seguro
    // O mejor, lo hacemos asíncrono pero esperamos que se "encole" la promesa sin detener el return crítico si es rápido.
    // Para seguridad en Serverless, es mejor hacer await pero atrapar errores para no tirar la UI.
    
    (async () => {
        try {
            // Obtener datos necesarios para los correos
            const negocio = await prisma.negocios.findUnique({
                where: { id_negocio: negocioId },
                select: { nombre: true }
            });
            
            // Obtener emails de los gestores de este negocio
            const gestores = await prisma.usuarios.findMany({
                where: { 
                    id_negocio: negocioId,
                    rol: 'gestor',
                    activo: true
                },
                select: { email: true, nombre: true }
            });

            if (!negocio) return;

            const nombreNegocio = negocio.nombre;
            const idPedido = newPedido.id_pedido;
            
            // Renderizar HTML de Cliente
            const clientHtml = await render(
                React.createElement(NewOrderClientEmail, {
                    nombreCliente: clienteNombre,
                    nombreNegocio: nombreNegocio,
                    idPedido: idPedido,
                    total: total,
                    items: items.map(i => ({ nombre: i.nombre, cantidad: i.quantity, precio: Number(i.precio) }))
                })
            );

            // Enviar al Cliente
            await resend.emails.send({
                from: EMAIL_REMITENTE,
                to: clienteEmail,
                subject: `Tu pedido en ${nombreNegocio} ha sido recibido 🛒`,
                html: clientHtml
            });

            // Enviar a los Gestores
            // Renderizamos una vez el html del gestor (usamos 'Gestor' genérico o iteramos si queremos personalizar el nombre)
            for (const gestor of gestores) {
                 const gestorHtml = await render(
                    React.createElement(NewOrderGestorEmail, {
                        nombreGestor: gestor.nombre,
                        nombreNegocio: nombreNegocio,
                        idPedido: idPedido,
                        total: total,
                        nombreCliente: clienteNombre
                    })
                );

                await resend.emails.send({
                    from: EMAIL_REMITENTE,
                    to: gestor.email,
                    subject: `¡Nuevo Pedido! #${idPedido} 🔔`,
                    html: gestorHtml
                });
            }

        } catch (emailError) {
            console.error("Error enviando correos de pedido:", emailError);
        }
    })();

    return { success: true, pedidoId: newPedido.id_pedido };

  } catch (error) {
    console.error("Error en createPedidoAction:", error);
    return { success: false, message: "No se pudo crear el pedido." };
  }
}