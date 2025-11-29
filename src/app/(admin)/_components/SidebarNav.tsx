"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { LayoutDashboard, LayoutGrid, Users } from "lucide-react";

// Crea el mapa de iconos
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboard,
  LayoutGrid: LayoutGrid,
  Users: Users,
};

// Función 'helper' para las clases de CSS
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

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
      
      {routes.map((route) => {
        
        const Icon = iconMap[route.iconName];

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-6 py-2 h-10 text-gray-200 transition-all hover:text-white",
              pathname === route.href ? "text-white bg-white/10" : ""
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