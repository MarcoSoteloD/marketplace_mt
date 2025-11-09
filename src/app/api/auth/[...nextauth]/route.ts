// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // Asegúrate que esta sea tu ruta al singleton de prisma
import bcrypt from "bcrypt";
import { rol_usuario } from '@prisma/client';

// Define las opciones de autenticación
export const authOptions: NextAuthOptions = {
  // 1. El adaptador de Prisma v1 (el correcto para next-auth v4)
  adapter: PrismaAdapter(prisma),
  
  // 2. Define tus proveedores (en este caso, solo email/password)
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Lógica para buscar al usuario en tu BD
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.usuarios.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log('No se encontró el usuario');
          return null;
        }

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordsMatch) {
          console.log('Contraseña incorrecta');
          return null;
        }

        // El objeto que devolvemos aquí se pasa al callback de JWT
        return {
          id: user.id_usuario.toString(),
          email: user.email,
          name: user.nombre,
          rol: user.rol, // Campo personalizado
          negocioId: user.id_negocio, // Campo personalizado
        };
      },
    }),
  ],

  // 3. Configuración de la sesión
  session: {
    strategy: "jwt", // Obligatorio para CredentialsProvider
  },

  // 4. Callbacks para enriquecer el token y la sesión
  callbacks: {
    // 'user' solo está disponible en el primer login
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol as rol_usuario;
        token.negocioId = user.negocioId;
      }
      return token;
    },
    // El cliente (useSession) recibe esto
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as rol_usuario;
        session.user.negocioId = token.negocioId as number | null;
      }
      return session;
    },
  },

  // 5. Página de Login
  pages: {
    signIn: '/login', // Tu página de login personalizada
  },
};

// 6. Exporta los handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };