// app/(admin)/gestion-categorias/actions.ts

"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createCategoriaInDb, updateCategoriaInDb, deleteCategoriaInDb } from '@/lib/data/global-categories';

// --- Schema y Estado ---
const CategoriaSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  descripcion: z.string().optional(),
});

export type State = {
  errors?: {
    nombre?: string[];
    descripcion?: string[];
  };
  message?: string | null;
  success?: boolean;
} | undefined;


// --- ACCIÓN DE CREAR ---
export async function createCategoriaGlobal(prevState: State, formData: FormData) {
  const validatedFields = CategoriaSchema.safeParse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación.',
      success: false,
    };
  }

  try {
    // Llama a la función de db.ts
    await createCategoriaInDb(validatedFields.data);

    revalidatePath('/(admin)/gestion-categorias');
    return { message: `Categoría "${validatedFields.data.nombre}" creada.`, success: true };

  } catch (error) {
    // Atrapa el error que lanzamos desde db.ts
    return { 
      // Asignamos el error.message al campo 'nombre' (ya que es el único campo 'unique')
      errors: { nombre: [ (error as Error).message ] }, 
      message: 'Error al crear la categoría.', 
      success: false 
    };
  }
}

// --- ACCIÓN DE ACTUALIZAR ---
export async function updateCategoriaGlobal(id: number, prevState: State, formData: FormData) {
  const validatedFields = CategoriaSchema.safeParse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación.',
      success: false,
    };
  }

  try {
    // Llama a la función de db.ts
    await updateCategoriaInDb(id, validatedFields.data);

    revalidatePath('/(admin)/gestion-categorias');
    revalidatePath(`/gestion-categorias/editar/${id}`);
    return { message: `Categoría "${validatedFields.data.nombre}" actualizada.`, success: true };

  } catch (error) {
    // Atrapa el error que lanzamos desde db.ts
    return { 
      errors: { nombre: [ (error as Error).message ] }, 
      message: 'Error al actualizar la categoría.', 
      success: false 
    };
  }
}

// --- ACCIÓN DE ELIMINAR ---
export async function deleteCategoriaGlobal(id: number) {
  try {
    // Llama a la función de db.ts
    await deleteCategoriaInDb(id);
    
    revalidatePath('/(admin)/gestion-categorias');
    
  } catch (error) {
    // Si algo sale mal (ej. la categoría está en uso), 
    // lo ideal sería redirigir con un mensaje de error.
    console.error("Error al eliminar categoría:", (error as Error).message);
  }
  
  // Redirigimos a la lista principal pase lo que pase
  redirect('/gestion-categorias');
}