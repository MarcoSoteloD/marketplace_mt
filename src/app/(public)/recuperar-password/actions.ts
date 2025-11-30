"use server";

import { z } from 'zod';
import { randomBytes } from 'crypto';
import { getUserByEmail, setUserResetToken } from '@/lib/data/users';
import { resend, EMAIL_REMITENTE } from '@/lib/email';
import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail';
import { render } from '@react-email/render';
import React from 'react';

const ForgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

export type ForgotPasswordState = {
  errors?: {
    email?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
} | undefined;

export async function sendResetEmailAction(prevState: ForgotPasswordState, formData: FormData) {
  
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Email inválido.",
      success: false,
    };
  }

  const { email } = validatedFields.data;

  try {
    // Verificamos si el usuario existe
    const user = await getUserByEmail(email);
    
    // POR SEGURIDAD: Si el usuario no existe, NO le decimos "no existe".
    // Simplemente decimos "Si el correo existe, se envió el link".
    // Esto evita que hackers sepan qué correos están registrados.
    if (!user) {
      return { success: true, message: "Si el correo existe, recibirás un enlace." };
    }

    // Generamos Token y Expiración (1 hora)
    // Usamos crypto nativo de Node.js para generar un string aleatorio seguro
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hora desde ahora

    // Guardamos en BD
    await setUserResetToken(email, token, expires);

    // Generamos el Link
    // Asegúrense de tener NEXT_PUBLIC_URL en tu .env (ej. http://localhost:3000)
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/restablecer-password/${token}`;

    // Enviamos el Correo
    try {
        const emailHtml = await render(
            React.createElement(ResetPasswordEmail, {
                nombreUsuario: user.nombre,
                resetLink: resetLink
            })
        );

        await resend.emails.send({
            from: EMAIL_REMITENTE,
            to: email,
            subject: "Restablecer tu contraseña 🔒",
            html: emailHtml,
        });

    } catch (emailError) {
        console.error("Error enviando correo de recuperación:", emailError);
        return { success: false, message: "Error al enviar el correo." };
    }

    return { success: true, message: "Si el correo existe, recibirás un enlace." };

  } catch {
    return { 
      success: false, 
      message: "Ocurrió un error inesperado." 
    };
  }
}