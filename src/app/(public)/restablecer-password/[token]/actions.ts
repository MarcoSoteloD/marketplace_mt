"use server";

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { getUserByResetToken, updateUserPassword } from '@/lib/data/users';

const PasswordSchema = z.string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial");

const ResetSchema = z.object({
  token: z.string(),
  password: PasswordSchema,
  confirmPassword: z.string(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type ResetPasswordState = {
  errors?: {
    password?: string[];
    confirmPassword?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

export async function resetPasswordAction(prevState: ResetPasswordState, formData: FormData) {
  
  const validatedFields = ResetSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<ResetPasswordState>["errors"],
      message: "Error de validación.",
      success: false,
    };
  }

  const { token, password } = validatedFields.data;

  try {
    // Verificar si el token es válido y no ha expirado
    const user = await getUserByResetToken(token);

    if (!user) {
      return {
        errors: { _form: ["El enlace es inválido o ha expirado."] },
        message: "Token inválido.",
        success: false
      };
    }

    // Hashear la nueva contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Actualizar en BD y quemar el token
    await updateUserPassword(user.id_usuario, passwordHash);

  } catch {
    return { 
      errors: { _form: ["Ocurrió un error al actualizar la contraseña."] },
      message: "Error de servidor.",
      success: false 
    };
  }

  // Éxito: Redirigir al login con mensaje de éxito
  redirect('/login?reset=exitoso');
}