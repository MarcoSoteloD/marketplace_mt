import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rol_usuario } from '@prisma/client';

// Define las rutas de cada rol
const ADMIN_PATHS = ["/dashboard", "/gestion-categorias", "/gestores", "/perfil-admin"];
const GESTOR_PATHS = ["/configuracion", "/categorias-productos", "/productos", "/pedidos", "/vacantes", "/perfil-gestor"];
const PUBLIC_ONLY_PATHS = ["/login", "/registro"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Obtenemos el token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // + Comprobamos si la ruta es /login o /registro
  const isPublicOnlyRoute = PUBLIC_ONLY_PATHS.includes(pathname);

  // SI SÍ HAY TOKEN (Usuario Logueado)
  if (token) {
    // Si está logueado e intenta ver login/registro, lo sacamos
    if (isPublicOnlyRoute) {
      return NextResponse.redirect(new URL('/router', req.url));
    }

    // Lógica de roles (tu lógica existente)
    const userRole = token.rol as rol_usuario;

    // Lógica de Admin
    const esRutaAdmin = ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
    if (esRutaAdmin) {
      if (userRole === rol_usuario.admin) {
        return NextResponse.next(); // OK
      }
      return NextResponse.redirect(new URL('/router', req.url));
    }

    // Lógica de Gestor
    const esRutaGestor = GESTOR_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
    if (esRutaGestor) {
      if (userRole === rol_usuario.gestor) {
        return NextResponse.next(); // OK
      }
      return NextResponse.redirect(new URL('/router', req.url));
    }

    // Si está logueado en una ruta de cliente (ej. /perfil), lo dejamos pasar
    return NextResponse.next();
  }

  // SI NO HAY TOKEN (Usuario No Logueado)
  if (!token) {
    // Si no está logueado y va a login/registro, lo dejamos
    if (isPublicOnlyRoute) {
      return NextResponse.next(); // OK
    }
    
    // Si no está logueado e intenta entrar a CUALQUIER OTRA ruta del matcher, lo mandamos a login.
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Fallback (no debería llegar aquí)
  return NextResponse.next();
}


// El Matcher Explícito
export const config = {
  matcher: [
    // Rutas públicas
    '/login',
    '/registro',

    // Rutas de Admin
    '/dashboard/:path*',
    '/gestion-categorias/:path*',
    
    // Rutas de Gestor
    '/configuracion/:path*',
    '/categorias-productos/:path*',

    // Rutas de Cliente
    '/perfil/:path*',
    '/carrito/:path*',
    '/pedido-exitoso/:path*',
    
    // Las páginas raíz de cada sección
    '/dashboard',
    '/gestion-categorias',
    '/gestores',
    '/perfil-admin',
    '/configuracion',
    '/categorias-productos',
    '/productos',
    '/pedidos',
    '/vacantes',
    '/perfil-gestor',
    '/perfil',
    '/carrito',
    '/pedido-exitoso'
  ],
};