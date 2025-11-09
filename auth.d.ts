// auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
// Asegúrate de que prisma generate se haya ejecutado
import { rol_usuario } from '@prisma/client';

/**
 * Extiende el objeto Session que usa el CLIENTE
 * (ej. en useSession() o getSession())
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // El ID de tu modelo 'usuarios'
      rol: rol_usuario;
      negocioId?: number | null;
    } & DefaultSession["user"]; // Mantiene name, email, image
  }

  /**
   * Extiende el objeto User (el que viene de la función 'authorize')
   * Esto es lo que soluciona tu error en 'route.ts'
   */
  interface User {
    id: string;
    rol: rol_usuario;
    negocioId?: number | null;
  }
}

/**
 * Extiende el Token (el que se guarda en la cookie)
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: rol_usuario;
    negocioId?: number | null;
  }
}