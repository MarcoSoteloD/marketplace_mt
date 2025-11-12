// app/(admin)/_components/Sidebar.tsx

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  LayoutDashboard,
  LayoutGrid,
  Users,
  User,
} from "lucide-react";

// Importamos los nuevos componentes cliente
import { SidebarNav } from "./SidebarNav";
import { LogoutButton } from "./LogoutButton";

// Definimos las rutas aquí, en el servidor
const routes = [
  {
    label: "Dashboard", // El "botón superior" que pediste
    href: "/dashboard",
    iconName: "LayoutDashboard"
  },
  {
    label: "Gestores",
    href: "/gestores",
    iconName: "Users"
  },
  {
    label: "Categorías",
    href: "/categorias",
    iconName: "LayoutGrid"
  },
];

export async function AdminSidebar() {
  // Obtenemos la sesión en el servidor
  const session = await getServerSession(authOptions);

  return (
    <div className="hidden border-r bg-slate-950 text-white md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-4"> {/* Añadí más gap */}

        {/* Encabezado del Sidebar (¡Como lo pediste!) */}
        <div className="flex h-auto flex-col items-start border-b px-4 py-5 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold mb-2">
            <span className="">Panel Administrativo</span>
          </Link>
          {/* Mensaje de Bienvenida */}
          <p className="text-sm text-white">
            Bienvenid@, {session?.user?.name || 'Admin'}
          </p>
        </div>

        {/* Links de Navegación (ahora es un Client Component) */}
        <div className="flex-1">
          <SidebarNav routes={routes} />
        </div>

        {/* --- INICIO DE LA CORRECCIÓN --- */}
        {/* Footer del Sidebar con Perfil y Logout */}
        <div className="mt-auto py-4 space-y-2 border-t border-slate-700">
          {/* 1. Nuevo Link de Perfil (estilo Jenga) */}
          <Link
            href="/perfil-admin"
            className="flex items-center gap-3 px-4 py-2 h-10 text-gray-200 transition-all hover:text-white hover:bg-white/10 rounded-none"
          >
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>

          {/* 2. Botón de Logout (con el nuevo estilo) */}
          <LogoutButton />
        </div>
        {/* --- FIN DE LA CORRECCIÓN --- */}

      </div>
    </div>
  );
}