// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rol_usuario } from '@prisma/client';

// 1. Define tus rutas de cada rol
// (¡Asegúrate de que estas rutas coincidan con tus carpetas!)
const ADMIN_PATHS = ["/dashboard", "/categorias", "/gestores"];
const GESTOR_PATHS = ["/configuracion", "/categorias-productos", "/productos", "/pedidos", "/vacantes"]; // <-- QUÍTALE LA 's'
// ...

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 2. Obtenemos el token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 3. Si no hay token (no está logueado), lo mandamos al login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 4. Si SÍ hay token, revisamos el rol
  const userRole = token.rol as rol_usuario;

  // 5. Lógica de Admin
  const esRutaAdmin = ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (esRutaAdmin) {
    if (userRole === rol_usuario.admin) {
      return NextResponse.next(); // OK
    }
    // Es Gestor intentando entrar a Admin -> Bloqueado
    return NextResponse.redirect(new URL('/router', req.url)); // Redirige a su "home"
  }

  // 6. Lógica de Gestor
  const esRutaGestor = GESTOR_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (esRutaGestor) {
    if (userRole === rol_usuario.gestor) {
      return NextResponse.next(); // OK
    }
    // Es Admin intentando entrar a Gestor -> Bloqueado
    return NextResponse.redirect(new URL('/router', req.url)); // Redirige a su "home"
  }

  // 7. Si está logueado pero la ruta no es de Admin ni de Gestor (ej. /router)
  return NextResponse.next();
}


// 8. El Matcher Explícito (La solución real)
export const config = {
  matcher: [
    // Rutas de Admin
    '/dashboard/:path*',
    '/categorias/:path*',
    '/gestores/:path*',
    
    // Rutas de Gestor
    '/configuracion/:path*',
    '/categorias-productos/:path*', // ¡Esta es la que te faltaba en tu log!
    '/productos/:path*',
    '/pedidos/:path*',
    '/vacantes/:path*',
    
    // Las páginas raíz de cada sección
    '/dashboard',
    '/categorias',
    '/gestores',
    '/configuracion',
    '/categorias-productos',
    '/productos',
    '/pedidos',
    '/vacantes',
  ],
};