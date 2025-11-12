// app/(gestor)/_components/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, User } from "lucide-react";
import {
  Settings,
  LayoutGrid,
  Package,
  ShoppingCart,
  Briefcase
} from "lucide-react";

// 1. Mapa de Iconos para el Gestor
const iconMap: Record<string, LucideIcon> = {
  Settings: Settings,
  LayoutGrid: LayoutGrid,
  Package: Package,
  ShoppingCart: ShoppingCart,
  Briefcase: Briefcase,
};

// 2. Función 'helper' de clases
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// 3. Tipo para las rutas del gestor
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
    // 4. Mapeo (con la corrección que ya hicimos)
    <nav className="grid items-start font-medium">
      {routes.map((route) => {
        const Icon = iconMap[route.iconName];
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 h-10 text-gray-200 transition-all hover:text-white hover:bg-white/10",
              pathname === route.href ? "bg-white/10 text-white" : ""
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}