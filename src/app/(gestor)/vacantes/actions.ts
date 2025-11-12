// app/(gestor)/vacantes/actions.ts
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Importamos las funciones de DB que acabamos de crear
import {
    createVacante,
    deleteVacante,
    updateVacante,
} from '@/lib/db';

// --- Esquema de Validación de Zod ---
const VacanteSchema = z.object({
    titulo: z.string().min(3, "El título es requerido"),
    descripcion: z.string().min(10, "La descripción debe ser más detallada"),
    puesto: z.string().optional(),
    // 'coerce' convierte el string vacío "" a NaN, 
    // que Zod (correctamente) falla al validar como número.
    // Usamos 'transform' para convertir "" a 'undefined' antes de validar.
    salario: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number() // <-- SIN ARGUMENTOS
            .positive("El salario debe ser un número positivo")
            .optional()
    ),
    activo: z.string().optional(), // El checkbox envía "on" o nada
});

// --- Tipo de Estado del Formulario ---
export type VacanteState = {
    errors?: {
        titulo?: string[];
        descripcion?: string[];
        puesto?: string[];
        salario?: string[];
        activo?: string[];
        _form?: string[];
    };
    message?: string;
    success?: boolean;
} | undefined;


// --- 1. Server Action: CREAR VACANTE ---
export async function createVacanteAction(prevState: VacanteState, formData: FormData) {

    const session = await getServerSession(authOptions);
    if (!session?.user?.negocioId) {
        return { message: "Error de autenticación.", success: false };
    }
    const negocioId = session.user.negocioId;

    const parsedData = {
        titulo: formData.get('titulo'),
        descripcion: formData.get('descripcion'),
        puesto: formData.get('puesto'),
        salario: formData.get('salario'),
        activo: formData.get('activo'),
    };

    const validatedFields = VacanteSchema.safeParse(parsedData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors as NonNullable<VacanteState>["errors"],
            message: "Error de validación. Revisa los campos.",
            success: false,
        };
    }

    const { titulo, descripcion, puesto, salario } = validatedFields.data;

    try {
        // Preparamos el objeto para Prisma
        const data: Prisma.vacantesCreateInput = {
            titulo,
            descripcion,
            puesto,
            // Convertimos el 'number' de Zod a 'Decimal' de Prisma
            salario: salario ? new Prisma.Decimal(salario) : null,
            activo: formData.get('activo') === "on", // El checkbox
            fecha_publicacion: new Date(), // Asignamos la fecha actual

            // Conectamos con el negocio
            negocios: {
                connect: { id_negocio: negocioId }
            }
        };

        await createVacante(data);

        revalidatePath('/(gestor)/vacantes');
        return { message: `Vacante "${titulo}" creada.`, success: true };

    } catch (error) {
        return {
            errors: { _form: [(error as Error).message] },
            message: 'Error al crear la vacante.',
            success: false
        };
    }
}


// --- 2. Server Action: ELIMINAR VACANTE ---
export async function deleteVacanteAction(vacanteId: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.negocioId) {
        return { success: false, message: "No autorizado." };
    }
    const negocioId = session.user.negocioId;

    try {
        await deleteVacante(vacanteId, negocioId); // Pasamos ambos IDs por seguridad
        revalidatePath('/(gestor)/vacantes');
        return { success: true, message: "Vacante eliminada." };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

// --- 3. Server Action: ACTUALIZAR VACANTE ---
export async function updateVacanteAction(
  vacanteId: number,
  prevState: VacanteState, 
  formData: FormData
) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { message: "Error de autenticación.", success: false };
  }
  const negocioId = session.user.negocioId;

  // Reutilizamos el mismo schema de 'create'
  const parsedData = {
    titulo: formData.get('titulo'),
    descripcion: formData.get('descripcion'),
    puesto: formData.get('puesto'),
    salario: formData.get('salario'),
    activo: formData.get('activo'),
  };

  const validatedFields = VacanteSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<VacanteState>["errors"],
      message: "Error de validación. Revisa los campos.",
      success: false,
    };
  }
  
  const { titulo, descripcion, puesto, salario } = validatedFields.data;

  try {
    // Preparamos el objeto para Prisma
    const data: Prisma.vacantesUpdateInput = {
      titulo,
      descripcion,
      puesto,
      salario: salario ? new Prisma.Decimal(salario) : null,
      activo: formData.get('activo') === "on", // El checkbox
      // No actualizamos la fecha_publicacion
    };

    // Llamamos a la función de db.ts (que ya creamos)
    await updateVacante(vacanteId, negocioId, data);

    revalidatePath('/(gestor)/vacantes');
    revalidatePath(`/vacantes/editar/${vacanteId}`);
    
    return { message: `Vacante "${titulo}" actualizada.`, success: true };

  } catch (error) {
    return { 
      errors: { _form: [(error as Error).message] }, 
      message: 'Error al actualizar la vacante.', 
      success: false 
    };
  }
}