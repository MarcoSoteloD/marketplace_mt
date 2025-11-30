"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma } from '@prisma/client';
import {  createCategoriaProducto, deleteCategoriaProducto, updateCategoriaProducto, reorderCategorias } from '@/lib/data/products';

const CategoriaProductoSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  descripcion: z.string().optional(),
});

export type CategoriaState = {
  errors?: {
    nombre?: string[];
    descripcion?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

// --- CREAR ---
export async function createCategoriaAction(prevState: CategoriaState, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) return { message: "Error de autenticación.", success: false };
  const negocioId = session.user.negocioId;

  const validatedFields = CategoriaProductoSchema.safeParse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<CategoriaState>["errors"],
      message: 'Error de validación.',
      success: false,
    };
  }

  try {
    const { nombre, descripcion } = validatedFields.data;
    const data: Prisma.categorias_productoCreateInput = {
      nombre: nombre,
      descripcion: descripcion,
      activo: true,
      orden: 0, 
      negocios: { connect: { id_negocio: negocioId } }
    };
    
    await createCategoriaProducto(data);
    revalidatePath('/categorias-productos');
    return { message: `Categoría "${data.nombre}" creada.`, success: true };
  } catch (error) {
    return { errors: { _form: [(error as Error).message] }, message: 'Error al crear.', success: false };
  }
}

// --- ELIMINAR ---
export async function deleteCategoriaAction(categoriaId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) return { success: false, message: "No autorizado." };
  const negocioId = session.user.negocioId;

  try {
    await deleteCategoriaProducto(categoriaId, negocioId);
    revalidatePath('/categorias-productos');
    return { success: true, message: "Categoría eliminada." };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

// --- ACTUALIZAR ---
export async function updateCategoriaAction(categoriaId: number, prevState: CategoriaState, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) return { message: "Error de autenticación.", success: false };
  const negocioId = session.user.negocioId;

  const validatedFields = CategoriaProductoSchema.safeParse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<CategoriaState>["errors"],
      message: 'Error de validación.',
      success: false,
    };
  }
  
  const data = {
    nombre: validatedFields.data.nombre,
    descripcion: validatedFields.data.descripcion,
  };

  try {
    await updateCategoriaProducto(categoriaId, negocioId, data);
    revalidatePath('/categorias-productos'); 
    revalidatePath(`/categorias-productos/editar/${categoriaId}`); 
    return { message: `Categoría "${data.nombre}" actualizada.`, success: true };
  } catch (error) {
    return { errors: { _form: [(error as Error).message] }, message: 'Error al actualizar.', success: false };
  }
}

// --- REORDENAR ---
export async function reorderCategoriasAction(items: { id_categoria: number; orden: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { message: "No autorizado", success: false };
  }
  const negocioId = session.user.negocioId;

  try {
    await reorderCategorias(items, negocioId);

    revalidatePath('/categorias-productos');
    revalidatePath('/(public)/[slug_negocio]', 'page'); 
    
    return { message: "Orden actualizado.", success: true };
  } catch (error) {
    console.error("Error reordenando:", error);
    return { message: "Error al guardar el orden.", success: false };
  }
}