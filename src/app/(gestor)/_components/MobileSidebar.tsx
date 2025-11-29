"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, Globe } from "lucide-react";
import { SidebarNav } from "./SidebarNav"; 
import { LogoutButton } from "../../../components/layout/LogoutButton";
import Link from "next/link";

const routes = [
  { label: "Pedidos", href: "/pedidos", iconName: "ShoppingCart" },
  { label: "Categorías", href: "/categorias-productos", iconName: "LayoutGrid" },
  { label: "Productos", href: "/productos", iconName: "Package" },
  { label: "Vacantes", href: "/vacantes", iconName: "Briefcase" },
  { label: "Configuración", href: "/configuracion", iconName: "Settings" },
];

interface MobileSidebarProps {
    negocioNombre: string;
    gestorNombre: string;
}

export function GestorMobileSidebar({ negocioNombre, gestorNombre }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-slate-950 px-4 md:hidden">
      <div className="font-bold text-white truncate max-w-[200px]">
        {negocioNombre}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-72 bg-slate-950 border-r-slate-800 text-white p-0 flex flex-col">
          
          <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <SheetDescription className="sr-only">Opciones de gestión</SheetDescription>

          {/* Header del Sheet */}
          <div className="p-6 border-b border-slate-800">
             <h2 className="font-bold text-lg text-white">{negocioNombre}</h2>
             <p className="text-xs text-slate-400 mt-1">Hola, {gestorNombre}</p>
          </div>

          {/* Navegación Principal */}
          <div className="flex-1 py-4 overflow-y-auto" onClick={() => setOpen(false)}>
             <SidebarNav routes={routes} />
          </div>

          {/* Footer (Links extra) */}
          <div className="p-4 border-t border-slate-800 space-y-2" onClick={() => setOpen(false)}>
             <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-4 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-md text-sm font-medium transition-colors"
              >
                <Globe className="h-4 w-4" />
                Ver Plataforma
              </Link>
             
             <Link
                href="/perfil-gestor"
                className="flex items-center gap-3 px-4 py-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-md text-sm font-medium transition-colors"
              >
                <User className="h-4 w-4" />
                Mi Perfil
              </Link>
             
             <div className="pt-2 px-3">
                <LogoutButton />
             </div>
          </div>

        </SheetContent>
      </Sheet>
    </header>
  );
}