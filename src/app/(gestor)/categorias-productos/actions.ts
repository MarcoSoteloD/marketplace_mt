// app/(gestor)/categorias-productos/actions.ts
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Prisma } from '@prisma/client';

// Importamos las nuevas funciones de DB
import { 
  createCategoriaProducto,
  deleteCategoriaProducto,
  updateCategoriaProducto
} from '@/lib/db';

// --- Schema y Estado para CREAR ---
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


// --- 1. ACCIÓN DE CREAR ---
export async function createCategoriaAction(prevState: CategoriaState, formData: FormData) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { message: "Error de autenticación.", success: false };
  }
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

    // 1. Creamos el objeto 'data' con la sintaxis 'connect' de Prisma
    const data: Prisma.categorias_productoCreateInput = {
      nombre: nombre,
      descripcion: descripcion,
      activo: true,
      orden: 0, // (Asignamos el 'default' explícitamente)
      
      // 2. Aquí está la magia:
      // Le decimos a Prisma que conecte este nuevo registro
      // con el 'negocios' cuyo 'id_negocio' es 'negocioId'
      negocios: {
        connect: {
          id_negocio: negocioId
        }
      }
    };
    
    await createCategoriaProducto(data);

    revalidatePath('/categorias-productos');
    return { message: `Categoría "${data.nombre}" creada.`, success: true };

  } catch (error) {
    return { 
      errors: { _form: [(error as Error).message] }, 
      message: 'Error al crear.', 
      success: false 
    };
  }
}

// --- 2. ACCIÓN DE ELIMINAR ---
export async function deleteCategoriaAction(categoriaId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { success: false, message: "No autorizado." };
  }
  const negocioId = session.user.negocioId;

  try {
    await deleteCategoriaProducto(categoriaId, negocioId); // Pasamos ambos IDs por seguridad
    revalidatePath('/categorias-productos');
    return { success: true, message: "Categoría eliminada." };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

// --- 3. ACCIÓN DE ACTUALIZAR ---
export async function updateCategoriaAction(
  categoriaId: number,
  prevState: CategoriaState, 
  formData: FormData
) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { message: "Error de autenticación.", success: false };
  }
  const negocioId = session.user.negocioId;

  // Usamos el mismo schema que 'create'
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

    revalidatePath('/categorias-productos'); // Refresca la lista
    revalidatePath(`/categorias-productos/editar/${categoriaId}`); // Refresca esta pág.
    return { message: `Categoría "${data.nombre}" actualizada.`, success: true };

  } catch (error) {
    return { 
      errors: { _form: [(error as Error).message] }, 
      message: 'Error al actualizar.', 
      success: false 
    };
  }
}