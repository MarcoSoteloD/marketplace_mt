import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; 
import bcrypt from "bcrypt";
import { rol_usuario } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // Usamos el PrismaAdapter para que NextAuth pueda interactuar con la BD
  adapter: PrismaAdapter(prisma),

  // Configuramos el proveedor de credenciales (login con email/password)
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

        // Buscar al usuario en la base de datos
        const user = await prisma.usuarios.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        // --- SEGURIDAD: Verificar si el usuario está activo ---
        if (user.activo === false) {
             return null; 
        }

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Devolver el objeto de usuario (sin la contraseña)
        // Lo que se devuelve aquí pasa al callback 'jwt'
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

  // Estrategia de sesión: JWT con Caducidad
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días (en segundos)
    // updateAge: 24 * 60 * 60, // Opcional: Con qué frecuencia actualizar la sesión en la BD (diario)
  },

  // Callbacks para enriquecer el token y la sesión
  callbacks: {
    async jwt({ token, user }) {
      // Cuando el usuario inicia sesión (el objeto 'user' está presente),
      // transferimos los datos personalizados al token.
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.negocioId = user.negocioId;
        token.telefono = user.telefono;
      }
      return token;
    },
    async session({ session, token }) {
      // Hacemos que los datos personalizados del token estén disponibles
      // en el objeto de sesión del cliente (useSession).
      if (token) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as rol_usuario;
        session.user.negocioId = token.negocioId;
        session.user.telefono = token.telefono;
      }
      return session;
    },
  },

  // Páginas personalizadas
  pages: {
    signIn: "/login",
    error: "/login", // Redirigir a login en caso de error
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };