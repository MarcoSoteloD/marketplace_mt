// app/(admin)/categorias/actions.ts

"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// 1. Importa las NUEVAS funciones de db.ts
import { 
  createCategoriaInDb, 
  updateCategoriaInDb, 
  deleteCategoriaInDb 
} from '@/lib/db';

// --- Schema y Estado ---
// El schema de Zod no cambia
const CategoriaSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  descripcion: z.string().optional(),
});

// El tipo 'State' se queda aquí. 
// Borré el 'import' confuso que puse antes.
export type State = {
  errors?: {
    nombre?: string[];
    descripcion?: string[];
  };
  message?: string | null;
  success?: boolean;
} | undefined;


// --- 1. ACCIÓN DE CREAR (Refactorizada) ---
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

    revalidatePath('/(admin)/categorias');
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

// --- 2. ACCIÓN DE ACTUALIZAR (Refactorizada) ---
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

    revalidatePath('/(admin)/categorias');
    revalidatePath(`/categorias/editar/${id}`);
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

// --- 3. ACCIÓN DE ELIMINAR (Refactorizada) ---
export async function deleteCategoriaGlobal(id: number) {
  try {
    // Llama a la función de db.ts
    await deleteCategoriaInDb(id);
    
    revalidatePath('/(admin)/categorias');
    
  } catch (error) {
    // Si algo sale mal (ej. la categoría está en uso), 
    // lo ideal sería redirigir con un mensaje de error.
    // Por ahora, solo logueamos y redirigimos.
    console.error("Error al eliminar categoría:", (error as Error).message);
  }
  
  // Redirigimos a la lista principal pase lo que pase
  redirect('/categorias');
}