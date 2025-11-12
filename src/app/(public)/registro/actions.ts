// app/(public)/registro/actions.ts
"use server";

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { Prisma, rol_usuario } from '@prisma/client';

// Importamos las nuevas funciones de DB
import { createClienteUser, getUserByEmail } from '@/lib/db';

// --- Esquema de Validación de Zod ---
// Añadimos 'confirmPassword' y un 'refine' para validarlos
const RegistroSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  email: z.string().email("Debe ser un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"], // Asigna el error al campo de confirmación
});

// --- Tipo de Estado del Formulario ---
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
  
  // 1. Validar los datos del formulario con Zod
  const validatedFields = RegistroSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<RegistroState>["errors"],
      message: "Error de validación. Revisa los campos.",
      success: false,
    };
  }
  
  const { nombre, email, password } = validatedFields.data;

  try {
    // 2. Verificar si el email ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        errors: { email: ["Este email ya está registrado."] },
        message: "Error al crear la cuenta.",
        success: false
      };
    }

    // 3. Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Preparar datos para Prisma
    const data: Prisma.usuariosCreateInput = {
      nombre,
      email,
      password: passwordHash,
      rol: rol_usuario.cliente, // <-- AÑADE ESTA LÍNEA
      activo: true,             // <-- AÑADE ESTA LÍNEA
    };

    // 5. Crear el usuario
    await createClienteUser(data);

  } catch (error) {
    return { 
      errors: { _form: [(error as Error).message || 'Error de base de datos.'] }, 
      message: 'Error al crear la cuenta.', 
      success: false 
    };
  }

  // 6. ¡Éxito! Redirigir al login
  redirect('/login?registro=exitoso'); // Añadimos un param para mostrar un mensaje
}