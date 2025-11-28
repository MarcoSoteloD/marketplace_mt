import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User, Globe } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { LogoutButton } from "../../../components/layout/LogoutButton";

// Definimos las rutas aquí, en el servidor
const routes = [
  {
    label: "Dashboard",
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
    href: "/gestion-categorias",
    iconName: "LayoutGrid"
  },
];

export async function AdminSidebar() {
  // Obtenemos la sesión en el servidor
  const session = await getServerSession(authOptions);

  return (
    <div className="hidden border-r bg-slate-950 text-white md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-4">

        {/* Encabezado del Sidebar */}
        <div className="flex h-auto flex-col items-start border-b px-4 py-5 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold mb-2">
            <span className="">Panel Administrativo</span>
          </Link>
          {/* Mensaje de Bienvenida */}
          <p className="text-sm text-white">
            Bienvenid@, {session?.user?.name || 'Admin'}
          </p>
        </div>

        {/* Links de Navegación */}
        <div className="flex-1">
          <SidebarNav routes={routes} />
        </div>

        {/* Footer del Sidebar */}
        <div className="mt-auto py-4 space-y-2 border-t border-slate-700">
          
          {/* --- IR A PLATAFORMA --- */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2 h-10 text-gray-200 transition-all hover:text-white hover:bg-white/10 rounded-none"
          >
            <Globe className="h-4 w-4" />
            Ver Plataforma
          </Link>

          {/* Link de Perfil */}
          <Link
            href="/perfil-admin"
            className="flex items-center gap-3 px-4 py-2 h-10 text-gray-200 transition-all hover:text-white hover:bg-white/10 rounded-none"
          >
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>

          {/* Botón de Logout */}
          <LogoutButton />
        </div>

      </div>
    </div>
  );
}