import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; 
import bcrypt from "bcrypt";
import { rol_usuario } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.usuarios.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        // SEGURIDAD: Verificar si el usuario está activo
        if (user.activo === false) {
             return null; 
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id_usuario.toString(),
          email: user.email,
          name: user.nombre,
          rol: user.rol,
          negocioId: user.id_negocio,
          telefono: user.telefono,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.negocioId = user.negocioId;
        token.telefono = user.telefono;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as rol_usuario;
        session.user.negocioId = token.negocioId;
        session.user.telefono = token.telefono;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", 
  },
};