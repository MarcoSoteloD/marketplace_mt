// app/(gestor)/_components/Sidebar.tsx

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"; // Importamos prisma para buscar el negocio

// Importamos los componentes cliente
import { SidebarNav } from "./SidebarNav";
import { LogoutButton } from "../../../components/layout/LogoutButton";
import { User } from "lucide-react";

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

  // 1. Obtenemos la sesión en el servidor
  const session = await getServerSession(authOptions);

  // 2. Buscamos el nombre del negocio del gestor
  let negocioNombre = "Mi Negocio"; // Valor por defecto
  if (session?.user?.negocioId) {
    const negocio = await prisma.negocios.findUnique({
      where: { id_negocio: session.user.negocioId },
      select: { nombre: true } // Solo traemos el nombre
    });
    if (negocio) {
      negocioNombre = negocio.nombre;
    }
  }

  return (
    <div className="hidden border-r bg-slate-950 md:block w-64"> {/* Tu color slate */}
      <div className="flex h-full max-h-screen flex-col gap-4">

        {/* Encabezado del Sidebar */}
        <div className="flex h-auto flex-col items-start border-b border-b-slate-700 px-4 py-5 lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold mb-2 text-white">
            {/* Mostramos el nombre del negocio */}
            <span className="">{negocioNombre}</span>
          </Link>
          <p className="text-sm text-muted-foreground text-gray-400">
            {/* Mostramos el nombre del gestor */}
            Gestor: {session?.user?.name || 'Usuario'}
          </p>
        </div>

        {/* Links de Navegación (Client Component) */}
        <div className="flex-1">
          <SidebarNav routes={routes} />
        </div>

        {/* Footer del Sidebar con Perfil y Logout */}
        <div className="mt-auto py-4 space-y-2 border-t border-slate-700">
          <Link
            href="/perfil-gestor" // <-- Ruta correcta del gestor
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