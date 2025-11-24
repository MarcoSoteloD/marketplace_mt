"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User, Loader2, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { useEffect, useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  // Obtenemos el estado de la sesión
  const { data: session, status } = useSession();

  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white text-black shadow-sm overflow-x-hidden">
      <div className="container flex h-24 items-center">

        <div className="mr-4 flex">
          <Link href="/" className="flex items-center">
            <Image
              src="/mt_logo.svg"
              alt="Logo de Manos Tonilenses"
              width={200}
              height={200}
              className="h-24 w-auto"
              priority
            />
          </Link>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>

            {/* Link a Negocios */}
            <NavigationMenuItem>
              <Link href="/negocios" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent text-stone-700 hover:bg-black/10 focus:bg-white/10 hover:text-black text-base rounded-full")}
                >
                  Negocios
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {/* Link a Categorías */}
            <NavigationMenuItem>
              <Link href="/categorias" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent text-stone-700 hover:bg-black/10 focus:bg-white/10 hover:text-black text-base rounded-full")}
                >
                  Categorías
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {/* Link a Vacantes */}
            <NavigationMenuItem>
              <Link href="/empleos" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent text-stone-700 hover:bg-black/10 focus:bg-white/10 hover:text-black text-base rounded-full")}
                >
                  Empleos
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        {/* Botones Dinámicos */}
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
                className="hover:bg-black/10 hover:text-black focus-visible:ring-black text-stone-700 text-base rounded-full"
              >
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button
                asChild
                className="bg-orange-600 text-white hover:bg-orange-500 text-base rounded-full"
              >
                <Link href="/registro">Registrarse</Link>
              </Button>
            </>
          )}

          {/* C. Estado Logeado */}
          {status === "authenticated" && (
            <>
              <Button variant="ghost" asChild className="border-black/20 hover:bg-black/10 text-stone-700 text-base rounded-full">
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </Button>
            </>
          )}

          {/* --- BOTÓN DE CARRITO --- */}
          {isClient && status === "authenticated" && (
            <Button
              variant="ghost"
              asChild
              className="relative hover:bg-black/10 hover:text-black text-stone-700 h-9 w-9 rounded-full flex items-center justify-center"
            >
              <Link href="/carrito">
                <ShoppingCart style={{ width: '20px', height: '20px' }} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
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