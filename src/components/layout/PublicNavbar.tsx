// src/components/layout/PublicNavbar.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store, User, Loader2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react"; // <-- Importamos hooks

export function PublicNavbar() {
  // 1. Obtenemos el estado de la sesión
  const { data: session, status } = useSession();

  // 2. Función para cerrar sesión
  const handleLogout = () => {
    signOut({ callbackUrl: '/' }); // Al salir, lo mandamos a la raíz
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-600/50 bg-amber-500 text-black shadow-sm overflow-x-hidden">
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center px-4 sm:px-6 lg:px-8">
        
        {/* Logo y Nombre */}
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Store className="h-6 w-6" />
            <span>Manos Tonilenses</span>
          </Link>
        </div>

        {/* 3. Botones Dinámicos */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          
          {/* A. Estado de Carga */}
          {status === "loading" && (
            <Button variant="ghost" size="icon" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          )}

          {/* B. Estado Deslogeado */}
          {status === "unauthenticated" && (
            <>
              <Button 
                variant="ghost" 
                asChild 
                className="hover:bg-black/10 hover:text-black focus-visible:ring-black"
              >
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button 
                asChild 
                className="bg-amber-700 text-white hover:bg-amber-800 focus-visible:ring-amber-300"
              >
                <Link href="/registro">Registrarse</Link>
              </Button>
            </>
          )}

          {/* C. Estado Logeado */}
          {status === "authenticated" && (
            <>
              {/* Botón de Perfil */}
              <Button variant="outline" asChild className="border-black/20 hover:bg-black/10">
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </Button>
              {/* Botón de Salir */}
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="hover:bg-black/10 hover:text-black"
              >
                Cerrar Sesión
              </Button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}