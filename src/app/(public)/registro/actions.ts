"use server";

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { Prisma, rol_usuario } from '@prisma/client';
import { createClienteUser, getUserByEmail } from '@/lib/data/users';

// --- Schema de Contraseña Robusta ---
const PasswordSchema = z.string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial (ej. @, #, $)");

const RegistroSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  email: z.string().email("Debe ser un email válido"),
  password: PasswordSchema,
  confirmPassword: z.string(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type RegistroState = {
  errors?: {
    nombre?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    _form?: string[]; 
  };
  message?: string;
  success?: boolean;
} | undefined;


// --- Server Action: CREAR CLIENTE ---
export async function createClienteAction(prevState: RegistroState, formData: FormData) {
  
  // Validar los datos del formulario con Zod
  const validatedFields = RegistroSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<RegistroState>["errors"],
      message: "Revisa los requisitos de la contraseña.",
      success: false,
    };
  }
  
  const { nombre, email, password } = validatedFields.data;

  try {
    // Verificar si el email ya existe
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      return {
        errors: { email: ["Este email ya está registrado."] },
        message: "Error al crear la cuenta.",
        success: false
      };
    }

    // Hashear la contraseña (12 rondas es el estándar actual seguro)
    const passwordHash = await bcrypt.hash(password, 12);

    // Preparar datos para Prisma
    const data: Prisma.usuariosCreateInput = {
      nombre,
      email,
      password: passwordHash,
      rol: rol_usuario.cliente,
      activo: true,
    };

    await createClienteUser(data);

  } catch (error) {
    return { 
      errors: { _form: [(error as Error).message || 'Error de base de datos.'] }, 
      message: 'Error al crear la cuenta.', 
      success: false 
    };
  }

  // ¡Éxito! Redirigir al login
  redirect('/login?registro=exitoso');
}