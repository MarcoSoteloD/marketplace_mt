"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma'; 
import type { CartItem } from '@/store/cart-store'; 
import { Prisma } from '@prisma/client';

/**
 * Guarda el estado actual del carrito en la BD.
 */
export async function saveCartToDB(items: CartItem[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return; 

  try {
    await prisma.usuarios.update({
      where: { id_usuario: Number(session.user.id) },
      data: { carrito_persistente: items as unknown as Prisma.InputJsonValue } 
    });
  } catch (error) {
    console.error("Error guardando carrito:", error);
  }
}

/**
 * Recupera el carrito guardado en la BD.
 */
export async function getCartFromDB(): Promise<CartItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: Number(session.user.id) },
      select: { carrito_persistente: true }
    });

    if (usuario?.carrito_persistente) {
      return usuario.carrito_persistente as unknown as CartItem[];
    }
    return [];
  } catch (error) {
    console.error("Error recuperando carrito:", error);
    return [];
  }
}