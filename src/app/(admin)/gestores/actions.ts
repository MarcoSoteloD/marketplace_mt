// app/(admin)/gestores/actions.ts
"use server";

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';// Importamos la función transaccional
import { Prisma } from '@prisma/client';
import { 
  createGestorYNegocioInDb,
  updateGestorInfoInDb,
  toggleGestorStatusInDb,
  deleteGestorYNegocioInDb
} from '@/lib/db';

// 1. Esquema de validación para el formulario combinado
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

// 2. Tipo de estado para el feedback del formulario
export type CreateGestorState = {
  errors?: {
    gestorNombre?: string[];
    gestorEmail?: string[];
    gestorPassword?: string[];
    gestorTelefono?: string[]; // <-- AÑADIDO
    negocioNombre?: string[];
    negocioSlug?: string[];
    negocioTelefono?: string[]; // <-- AÑADIDO
    _form?: string[]; 
  };
  message?: string;
} | undefined;


// 3. La Server Action principal
export async function createGestorYNegocio(prevState: CreateGestorState, formData: FormData) {
  
  // 4. Validar los datos del formulario
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
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<UpdateGestorState>["errors"],
      message: "Error de validación. Revisa los campos.",
      success: false,
    };
  }

  const data = validatedFields.data;

  // 5. Hashear la contraseña (¡Importante!)
  const passwordHash = await bcrypt.hash(data.gestorPassword, 12);

  // 6. Llamar a la función transaccional de la BD
  try {
    await createGestorYNegocioInDb({
      gestor: {
        email: data.gestorEmail,
        nombre: data.gestorNombre,
        passwordHash: passwordHash,
        telefono: data.gestorTelefono,
      },
      negocio: {
        nombre: data.negocioNombre,
        slug: data.negocioSlug,
        telefono: data.negocioTelefono,
      }
    });

  } catch (error) {
    // 7. Manejar errores (especialmente email o slug duplicados)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      let formErrors: NonNullable<CreateGestorState>["errors"] = {};
      
      if (target.includes('email')) {
        formErrors.gestorEmail = ['Este email ya está en uso.'];
      }
      if (target.includes('slug')) {
        formErrors.negocioSlug = ['Este slug ya está en uso.'];
      }
      
      return {
        errors: formErrors,
        message: "Error: Email o Slug ya existen.",
      };
    }
    
    // Error genérico
    return {
      errors: { _form: ['Error de base de datos. No se pudo crear el gestor/negocio.'] },
      message: "Error de base de datos.",
    };
  }

  // 8. Éxito: Refrescar la lista y redirigir
  revalidatePath('/(admin)/gestores');
  redirect('/gestores');
}

//================================================================
// 2. ACCIÓN DE ACTUALIZAR INFO BÁSICA DEL GESTOR
//================================================================

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
    gestorPassword?: string[]; // <-- AÑADE ESTA LÍNEA
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
  
  const validatedFields = UpdateGestorSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<UpdateGestorState>["errors"],
      message: "Error de validación.",
      success: false,
    };
  }

  const data = validatedFields.data;
  
  try {
    // Preparamos los datos para la BD
    const gestorData: Prisma.usuariosUpdateInput = {
      nombre: data.gestorNombre,
      email: data.gestorEmail,
      telefono: data.gestorTelefono || null,
    };
    
    // Llamamos a la función de db.ts
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

//================================================================
// 3. ACCIÓN DE ACTIVAR/DESACTIVAR (Tu idea)
//================================================================

export async function toggleGestorStatusAction(
  gestorId: number,
  negocioId: number,
  newStatus: boolean
) {
  try {
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

//================================================================
// 4. ACCIÓN DE ELIMINAR GESTOR Y NEGOCIO
//================================================================

export async function deleteGestorYNegocioAction(gestorId: number, negocioId: number) {
  try {
    await deleteGestorYNegocioInDb(gestorId, negocioId);
  } catch (error) {
    // Si falla, redirige de vuelta con un mensaje
    return redirect(`/gestores/editar/${gestorId}?error=NoSePudoEliminar`);
  }
  
  // Si tiene éxito, redirige a la lista
  revalidatePath('/(admin)/gestores');
  redirect('/gestores');
}