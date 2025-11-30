import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; 
import { SidebarNav } from "./SidebarNav";
import { LogoutButton } from "../../../components/layout/LogoutButton";
import { User, Globe } from "lucide-react";

// Rutas del Gestor
const routes = [
  {
    label: "Pedidos",
    href: "/pedidos",
    iconName: "ShoppingCart",
  },
  {
    label: "Categorías",
    href: "/categorias-productos",
    iconName: "LayoutGrid",
  },
  {
    label: "Productos",
    href: "/productos",
    iconName: "Package",
  },
  {
    label: "Vacantes",
    href: "/vacantes",
    iconName: "Briefcase",
  },
  {
    label: "Configuración",
    href: "/configuracion",
    iconName: "Settings",
  },
];

// Componente ASÍNCRONO (Server Component)
export async function GestorSidebar() {

  const session = await getServerSession(authOptions);

  let negocioNombre = "Mi Negocio"; 
  if (session?.user?.negocioId) {
    const negocio = await prisma.negocios.findUnique({
      where: { id_negocio: session.user.negocioId },
      select: { nombre: true } 
    });
    if (negocio) {
      negocioNombre = negocio.nombre;
    }
  }

  return (
    <div className="hidden border-r bg-slate-950 md:block w-64"> 
      <div className="flex h-full max-h-screen flex-col gap-4">

        {/* Encabezado del Sidebar */}
        <div className="flex h-auto flex-col items-start border-b border-b-slate-700 px-4 py-5 lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold mb-2 text-white">
            <span className="">{negocioNombre}</span>
          </Link>
          <p className="text-sm text-muted-foreground text-gray-400">
            Gestor: {session?.user?.name || 'Usuario'}
          </p>
        </div>

        {/* Links de Navegación (Client Component) */}
        <div className="flex-1">
          <SidebarNav routes={routes} />
        </div>

        {/* Footer del Sidebar con Ver Plataforma, Mi Perfil y Logout */}
        <div className="mt-auto py-4 space-y-2 border-t border-slate-700">
          
          <Link
            href="/"
            target="_blank" // Abre en nueva pestaña para no perder el gestor
            className="flex items-center gap-3 px-4 py-2 text-gray-200 transition-all hover:text-white hover:bg-white/10 rounded-none h-10"
          >
            <Globe className="h-4 w-4" />
            Ver Plataforma
          </Link>

          <Link
            href="/perfil-gestor" 
            className="flex items-center gap-3 px-4 py-2 text-gray-200 transition-all hover:text-white hover:bg-white/10 rounded-none h-10"
          >
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>

          <LogoutButton />
        </div>

      </div>
    </div>
  );
}