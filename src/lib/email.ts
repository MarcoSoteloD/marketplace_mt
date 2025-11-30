import { Resend } from 'resend';

// Inicializamos el cliente con la API Key (que pondremos en .env)
// Si no hay key (desarrollo sin configurar), esto no tronará hasta que intentes enviar.
export const resend = new Resend(process.env.RESEND_API_KEY);

// Definimos el remitente global para no repetirlo
// En pruebas (sin dominio propio), Resend solo deja enviar desde "onboarding@resend.dev"
// Cuando configures tu dominio (manostonilenses.com), cambiarás esto.
export const EMAIL_REMITENTE = "Manos Tonilenses <onboarding@resend.dev>";
