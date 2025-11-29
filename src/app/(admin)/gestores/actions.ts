"use server";

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { createGestorYNegocioInDb, toggleGestorStatusInDb, deleteGestorYNegocioInDb } from '@/lib/data/businesses';
import { updateGestorInfoInDb, getUserByEmail } from '@/lib/data/users';

// ESQUEMA COMBINADO (GESTOR + NEGOCIO)
const GestorYNegocioSchema = z.object({
  // Campos del Gestor
  gestorNombre: z.string().min(3, "El nombre del gestor es requerido"),
  gestorEmail: z.string().email("Debe ser un email válido"),
  gestorPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  gestorTelefono: z.string().optional(),
  
  // Campos del Negocio
  negocioNombre: z.string().min(3, "El nombre del negocio es requerido"),
  negocioSlug: z.string()
    .min(3, "El slug es requerido")
    .regex(/^[a-z0-9-]+$/, "Slug inválido (solo minúsculas, números y guiones, sin espacios)"),
  negocioTelefono: z.string().optional(),
});

// TIPO DE ESTADO
export type CreateGestorState = {
  errors?: {
    // Gestor
    gestorNombre?: string[];
    gestorEmail?: string[];
    gestorPassword?: string[];
    gestorTelefono?: string[];
    // Negocio
    negocioNombre?: string[];
    negocioSlug?: string[];
    negocioTelefono?: string[];
    
    _form?: string[]; 
  };
  message?: string;
  success?: boolean;
} | undefined;


// --- ACCIÓN: CREAR GESTOR Y NEGOCIO ---
export async function createGestorYNegocio(prevState: CreateGestorState, formData: FormData) {
  
  // Validar los datos del formulario
  const validatedFields = GestorYNegocioSchema.safeParse({
    gestorNombre: formData.get('gestorNombre'),
    gestorEmail: formData.get('gestorEmail'),
    gestorPassword: formData.get('gestorPassword'),
    gestorTelefono: formData.get('gestorTelefono'),
    negocioNombre: formData.get('negocioNombre'),
    negocioSlug: formData.get('negocioSlug'),
    negocioTelefono: formData.get('negocioTelefono'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<CreateGestorState>["errors"],
      message: "Error de validación. Revisa los campos.",
      success: false,
    };
  }

  const data = validatedFields.data;

  try {
    // Validación manual de email duplicado antes de intentar crear
    const existingUser = await getUserByEmail(data.gestorEmail);
    if (existingUser) {
        return {
            errors: { gestorEmail: ["Este correo ya está registrado."] },
            message: "Error de duplicidad.",
            success: false,
        };
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(data.gestorPassword, 12);

    // Llamar a la función transaccional
    await createGestorYNegocioInDb({
      gestor: {
        email: data.gestorEmail,
        nombre: data.gestorNombre,
        passwordHash: passwordHash,
        telefono: data.gestorTelefono || null,
      },
      negocio: {
        nombre: data.negocioNombre,
        slug: data.negocioSlug,
        telefono: data.negocioTelefono || null,
      }
    });

  } catch (error) {
    // Manejo de errores de base de datos (slug duplicado)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { 
      return {
        errors: { negocioSlug: ['Este slug ya está en uso por otro negocio.'] },
        message: "Error: Datos duplicados.",
        success: false
      };
    }
    
    // Error genérico (con mensaje seguro)
    const errorMsg = (error as Error).message;
    return {
      errors: { _form: ['Ocurrió un error al crear el gestor y su negocio.'] },
      message: errorMsg.includes("slug") ? "Error de slug." : "Error de base de datos.",
      success: false
    };
  }

  // Éxito: Refrescar la lista y redirigir
  revalidatePath('/(admin)/gestores');
  redirect('/gestores');
}

// ------------------------------------------------------------
// ACCIONES DE EDICIÓN Y ESTADO
// ------------------------------------------------------------

// Esquema para actualizar solo datos del gestor
const UpdateGestorSchema = z.object({
  gestorNombre: z.string().min(3, "El nombre es requerido"),
  gestorEmail: z.string().email("Email inválido"),
  gestorTelefono: z.string().optional(),
});

export type UpdateGestorState = {
  errors?: {
    gestorNombre?: string[];
    gestorEmail?: string[];
    gestorTelefono?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

export async function updateGestorInfoAction(
  gestorId: number,
  prevState: UpdateGestorState, 
  formData: FormData
) {
  
  const validatedFields = UpdateGestorSchema.safeParse({
    gestorNombre: formData.get('gestorNombre'),
    gestorEmail: formData.get('gestorEmail'),
    gestorTelefono: formData.get('gestorTelefono'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<UpdateGestorState>["errors"],
      message: "Error de validación.",
      success: false,
    };
  }

  const data = validatedFields.data;
  
  try {
    const gestorData: Prisma.usuariosUpdateInput = {
      nombre: data.gestorNombre,
      email: data.gestorEmail,
      telefono: data.gestorTelefono || null,
    };
    
    // Usamos la función importada de @/lib/data/users
    await updateGestorInfoInDb(gestorId, gestorData);

    revalidatePath('/(admin)/gestores');
    revalidatePath(`/gestores/editar/${gestorId}`);
    return { message: "Datos del gestor actualizados.", success: true };

  } catch (error) {
    return {
      errors: { _form: [(error as Error).message] },
      message: "Error al actualizar.",
      success: false,
    };
  }
}

// ACCIÓN DE ACTIVAR/DESACTIVAR
export async function toggleGestorStatusAction(
  gestorId: number,
  negocioId: number,
  newStatus: boolean
) {
  try {
    // Usamos la función importada de @/lib/data/businesses
    await toggleGestorStatusInDb(gestorId, negocioId, newStatus);
    
    revalidatePath('/(admin)/gestores');
    revalidatePath(`/gestores/editar/${gestorId}`);

    return { 
      message: `Gestor y negocio ${newStatus ? 'activados' : 'desactivados'}.`, 
      success: true 
    };

  } catch (error) {
    return { 
      message: "Error al cambiar el estado.", 
      success: false 
    };
  }
}

// ACCIÓN DE ELIMINAR GESTOR Y NEGOCIO
export async function deleteGestorYNegocioAction(gestorId: number, negocioId: number) {
  try {
    // Usamos la función importada de @/lib/data/businesses
    await deleteGestorYNegocioInDb(gestorId, negocioId);
  } catch (error) {
    // Si falla, redirige de vuelta con un mensaje
    return redirect(`/gestores/editar/${gestorId}?error=NoSePudoEliminar`);
  }
  
  // Si tiene éxito, redirige a la lista
  revalidatePath('/(admin)/gestores');
  redirect('/gestores');
}