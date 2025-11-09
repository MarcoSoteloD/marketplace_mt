// middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { rol_usuario } from "@prisma/client"; // Importa tu enum

export default withAuth(
  // `withAuth` decodifica el token y lo pone en `req.nextauth.token`
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Proteger rutas de Admin
    if (pathname.startsWith("/(admin)")) {
      if (token?.rol !== rol_usuario.admin) {
        // Redirige si no es admin
        return new NextResponse("Acceso Denegado", { status: 403 });
      }
    }

    // Proteger rutas de Gestor
    if (pathname.startsWith("/(gestor)")) {
      if (token?.rol !== rol_usuario.gestor) {
        // Redirige si no es gestor
        return new NextResponse("Acceso Denegado", { status: 403 });
      }
    }

    // Si todo está bien, continúa
    return NextResponse.next();
  },
  {
    callbacks: {
      // Devuelve true si el usuario está autorizado (logueado)
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login", // Página a la que se redirige si 'authorized' es false
    },
  }
);

// El 'matcher' define QUÉ rutas van a pasar por este middleware
export const config = {
  matcher: [
    "/(admin)/:path*", // Todas las rutas dentro de (admin)
    "/(gestor)/:path*", // Todas las rutas dentro de (gestor)
  ],
};