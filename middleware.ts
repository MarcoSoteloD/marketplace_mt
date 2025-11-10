// middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { rol_usuario } from "@prisma/client";

export default withAuth(
  // `withAuth` decodifica el token
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // --- Definimos nuestras rutas protegidas ---
    const adminPaths = ["/", "/negocios", "/categorias", "/gestores"];
    const gestorPaths = ["/productos", "/pedidos", "/vacantes", "/configuracion"];

    // 1. Comprueba si es una ruta de Admin
    const esRutaAdmin = adminPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
    if (esRutaAdmin) {
      if (token?.rol !== rol_usuario.admin) {
        // Si no es admin, lo sacamos
        return new NextResponse("Acceso No Autorizado", { status: 403 });
      }
    }

    // 2. Comprueba si es una ruta de Gestor
    const esRutaGestor = gestorPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
    if (esRutaGestor) {
      if (token?.rol !== rol_usuario.gestor) {
        // Si no es gestor, lo sacamos
        return new NextResponse("Acceso No Autorizado", { status: 403 });
      }
    }

    // 3. Si pasó ambas pruebas (o no es una ruta protegida), déjalo pasar
    return NextResponse.next();
  },
  {
    callbacks: {
      // Devuelve true si el usuario está logueado (tiene un token)
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login", // Página a la que se redirige si no está logueado
    },
  }
);

// El NUEVO matcher (más seguro)
export const config = {
  /*
   * Coincide con todas las rutas excepto las que SÍ son públicas:
   * - api (rutas de API, incluyendo /api/auth/...)
   * - _next/static (archivos estáticos)
   * - _next/image (imágenes)
   * - favicon.ico
   * - login (nuestra página de login)
   * - registro (nuestra futura página de registro)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|registro).*)',
  ],
};