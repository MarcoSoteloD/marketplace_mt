// app/(admin)/gestores/actions.ts
"use server";

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createGestorYNegocioInDb } from '@/lib/db'; // Importamos la función transaccional
import { Prisma } from '@prisma/client';

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
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<CreateGestorState>["errors"],
      message: "Error de validación. Revisa los campos.",
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