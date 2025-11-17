// src/components/layout/PublicNavbar.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store, User, Loader2, ShoppingCart } from "lucide-react"; // <-- AÑADIDO ShoppingCart
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store"; // <-- AÑADIDO (Importa el store)
import { useEffect, useState } from "react"; // <-- AÑADIDO (Para la hidratación)
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle, // Importa el estilo de los links
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white text-black shadow-sm overflow-x-hidden">
      <div className="container flex h-20 items-center">
        
        {/* Logo y Nombre (sin cambios) */}
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2 font-bold text-stone-700">
            <Store className="h-6 w-6" />
            <span>Manos Tonilenses</span>
          </Link>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {/* Link a Negocios */}
            <NavigationMenuItem>
              <Link href="/negocios" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent text-stone-700 hover:bg-black/10 focus:bg-white/10 hover:text-black")}
                >
                  Negocios
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            {/* Link a Categorías */}
            <NavigationMenuItem>
              <Link href="/categorias" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent text-stone-700 hover:bg-black/10 focus:bg-black/10 hover:text-black")}
                >
                  Categorías
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {/* Link a Vacantes */}
            <NavigationMenuItem>
              <Link href="/empleos" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent text-stone-700 hover:bg-black/10 focus:bg-black/10 hover:text-black")}
                >
                  Empleos
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

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
                className="hover:bg-black/10 hover:text-black focus-visible:ring-black text-stone-700"
              >
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button 
                asChild 
                className="bg-orange-600 text-white hover:bg-orange-500"
              >
                <Link href="/registro">Registrarse</Link>
              </Button>
            </>
          )}

          {/* C. Estado Logeado (sin cambios) */}
          {status === "authenticated" && (
            <>
              <Button variant="ghost" asChild className="border-black/20 hover:bg-black/10 text-stone-700">
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </Button>
            </>
          )}

          {/* --- D. BOTÓN DE CARRITO (AÑADIDO) --- */}
          {/* Solo se muestra si estamos en el cliente y el 'status' NO es 'loading' */}
          {isClient && status === "authenticated" && (
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="relative hover:bg-black/10 hover:text-black text-stone-700"
            >
              <Link href="/carrito">
                <ShoppingCart className="h-5 w-5" />
                {/* Contador (solo se muestra si hay items) */}
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
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