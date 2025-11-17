"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Importamos las funciones de DB
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
    salario: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number()
            .positive("El salario debe ser un número positivo")
            .optional()
    ),
    activo: z.string().optional(),
    contacto: z.string().optional(), // + AÑADIDO
});

// --- Tipo de Estado del Formulario ---
export type VacanteState = {
    errors?: {
        titulo?: string[];
        descripcion?: string[];
        puesto?: string[];
        salario?: string[];
        activo?: string[];
        contacto?: string[]; // + AÑADIDO
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
        contacto: formData.get('contacto'), // + AÑADIDO
    };

    const validatedFields = VacanteSchema.safeParse(parsedData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors as NonNullable<VacanteState>["errors"],
            message: "Error de validación. Revisa los campos.",
            success: false,
        };
    }

    // + AÑADIDO 'contacto' a la desestructuración
    const { titulo, descripcion, puesto, salario, contacto } = validatedFields.data;

    try {
        // Preparamos el objeto para Prisma
        const data: Prisma.vacantesCreateInput = {
            titulo,
            descripcion,
            puesto,
            salario: salario ? new Prisma.Decimal(salario) : null,
            activo: formData.get('activo') === "on",
            fecha_publicacion: new Date(),
            contacto, // + AÑADIDO

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
// (No se necesitan cambios en 'deleteVacanteAction')
export async function deleteVacanteAction(vacanteId: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.negocioId) {
        return { success: false, message: "No autorizado." };
    }
    const negocioId = session.user.negocioId;

    try {
        await deleteVacante(vacanteId, negocioId);
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

  const parsedData = {
    titulo: formData.get('titulo'),
    descripcion: formData.get('descripcion'),
    puesto: formData.get('puesto'),
    salario: formData.get('salario'),
    activo: formData.get('activo'),
    contacto: formData.get('contacto'), // + AÑADIDO
  };

  const validatedFields = VacanteSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    return {
        errors: validatedFields.error.flatten().fieldErrors as NonNullable<VacanteState>["errors"],
        message: "Error de validación. Revisa los campos.",
        success: false,
    };
  }
  
  // + AÑADIDO 'contacto' a la desestructuración
  const { titulo, descripcion, puesto, salario, contacto } = validatedFields.data;

  try {
    // Preparamos el objeto para Prisma
    const data: Prisma.vacantesUpdateInput = {
      titulo,
      descripcion,
      puesto,
      salario: salario ? new Prisma.Decimal(salario) : null,
      activo: formData.get('activo') === "on",
      contacto, // + AÑADIDO
    };

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