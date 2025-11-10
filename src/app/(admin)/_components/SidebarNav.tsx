"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

// 1. Importa los iconos que vas a usar
import {
  LayoutDashboard,
  LayoutGrid,
  Users,
} from "lucide-react";

// 2. Crea el mapa de iconos
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboard,
  LayoutGrid: LayoutGrid,
  Users: Users,
};

// Función 'helper' para las clases de CSS
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Definimos el "tipo" de una ruta
type Route = {
  label: string;
  href: string;
  iconName: string;
};

interface SidebarNavProps {
  routes: Route[];
}

export function SidebarNav({ routes }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start text-sm font-medium">
      
      {/* --- INICIO DE LA CORRECCIÓN --- */}
      {routes.map((route) => {
        
        // 1. Ahora esto es válido porque estamos dentro de llaves {}
        const Icon = iconMap[route.iconName];

        // 2. Usamos un 'return' explícito
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-6 py-2 text-gray-200 transition-all hover:text-white", // <-- CÓDIGO NUEVO
              pathname === route.href ? "text-white bg-white/10" : ""
            )}
          >
            {/* 3. Usamos la variable 'Icon' (con mayúscula) */}
            {Icon && <Icon className="h-4 w-4" />}
            
            {route.label}
          </Link>
        );
      })}
      {/* --- FIN DE LA CORRECCIÓN --- */}

    </nav>
  );
}