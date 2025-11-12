// app/(admin)/perfil/actions.ts
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateUsuarioPerfil } from '@/lib/db'; // Importamos la nueva función

// Esquema de validación
const PerfilSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  telefono: z.string().optional(),
});

// Tipo de estado
export type PerfilState = {
  errors?: {
    nombre?: string[];
    telefono?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

// Server Action
export async function updatePerfilAction(prevState: PerfilState, formData: FormData) {
  
  const session = await getServerSession(authOptions);
  // Seguridad: obtenemos el ID desde la sesión, no del formulario
  if (!session?.user?.id) {
    return { message: "Error de autenticación.", success: false };
  }
  const usuarioId = Number(session.user.id);

  const validatedFields = PerfilSchema.safeParse({
    nombre: formData.get('nombre'),
    telefono: formData.get('telefono'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<PerfilState>["errors"],
      message: "Error de validación.",
      success: false,
    };
  }

  try {
    await updateUsuarioPerfil(usuarioId, {
      nombre: validatedFields.data.nombre,
      telefono: validatedFields.data.telefono || null,
    });
    
    revalidatePath('/(admin)/perfil-admin'); // Revalida esta misma página
    return { message: "Perfil actualizado con éxito.", success: true };

  } catch (error) {
    return { 
      errors: { _form: [(error as Error).message] }, 
      message: 'Error al actualizar.', 
      success: false 
    };
  }
}