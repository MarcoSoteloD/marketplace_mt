// src/components/layout/PublicNavbar.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store, User, Loader2, ShoppingCart } from "lucide-react"; // <-- AÑADIDO ShoppingCart
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart-store"; // <-- AÑADIDO (Importa el store)
import { useEffect, useState } from "react"; // <-- AÑADIDO (Para la hidratación)

export function PublicNavbar() {
  // 1. Obtenemos el estado de la sesión
  const { data: session, status } = useSession();

  // --- LÓGICA DEL CARRITO (AÑADIDA) ---
  // 2. Leemos los items del store
  const items = useCartStore((state) => state.items);
  // 3. Calculamos el total
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // 4. Corrección para evitar "Hydration Mismatch"
  // (localStorage solo existe en el cliente)
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  // --- FIN DE LÓGICA DEL CARRITO ---


  // 5. Función para cerrar sesión (ya la tenías)
  const handleLogout = () => {
    signOut({ callbackUrl: '/' }); // Al salir, lo mandamos a la raíz
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-600/50 bg-amber-500 text-black shadow-sm overflow-x-hidden">
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center px-4 sm:px-6 lg:px-8">
        
        {/* Logo y Nombre (sin cambios) */}
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Store className="h-6 w-6" />
            <span>Manos Tonilenses</span>
          </Link>
        </div>

        {/* 6. Botones Dinámicos (con el carrito añadido) */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          
          {/* A. Estado de Carga (sin cambios) */}
          {status === "loading" && (
            <Button variant="ghost" size="icon" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          )}

          {/* B. Estado Deslogeado (sin cambios) */}
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

          {/* C. Estado Logeado (sin cambios) */}
          {status === "authenticated" && (
            <>
              <Button variant="outline" asChild className="border-black/20 hover:bg-black/10">
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="hover:bg-black/10 hover:text-black"
              >
                Cerrar Sesión
              </Button>
            </>
          )}

          {/* --- D. BOTÓN DE CARRITO (AÑADIDO) --- */}
          {/* Solo se muestra si estamos en el cliente y el 'status' NO es 'loading' */}
          {isClient && status !== "loading" && (
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="relative hover:bg-black/10 hover:text-black focus-visible:ring-black"
            >
              <Link href="/carrito">
                <ShoppingCart className="h-5 w-5" />
                {/* Contador (solo se muestra si hay items) */}
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Ver carrito</span>
              </Link>
            </Button>
          )}

        </div>
      </div>
    </header>
  );
}