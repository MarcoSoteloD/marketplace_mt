"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User, Loader2, ShoppingCart, Menu, BookOpen, Store, LayoutGrid, Briefcase } from "lucide-react"; 
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { useEffect, useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const { status } = useSession();
  
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clases base unificadas para los links de escritorio
  const navLinkClass = cn(
    navigationMenuTriggerStyle(), 
    "bg-transparent text-stone-700 hover:bg-orange-50 focus:bg-orange-50 hover:text-orange-600 text-base rounded-full gap-2"
  );

  // Clases base unificadas para los links móviles
  const mobileLinkClass = "flex items-center gap-3 px-4 py-3 text-lg font-medium text-stone-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white text-black shadow-sm overflow-x-hidden">
      <div className="container flex h-24 items-center justify-between">

        {/* --- LOGO --- */}
        <div className="flex items-center">
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

        {/* --- MENÚ DE ESCRITORIO --- */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            
            <NavigationMenuItem>
              <Link href="/negocios" legacyBehavior passHref>
                <NavigationMenuLink className={navLinkClass}>
                  <Store className="h-4 w-4" />
                  Negocios
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link href="/categorias" legacyBehavior passHref>
                <NavigationMenuLink className={navLinkClass}>
                  <LayoutGrid className="h-4 w-4" />
                  Categorías
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link href="/empleos" legacyBehavior passHref>
                <NavigationMenuLink className={navLinkClass}>
                  <Briefcase className="h-4 w-4" />
                  Empleos
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {/* Separador */}
            <div className="h-6 w-px bg-stone-300 mx-2 self-center" aria-hidden="true" />

            <NavigationMenuItem>
              <Link href="/historia" legacyBehavior passHref>
                <NavigationMenuLink className={navLinkClass}>
                  <BookOpen className="h-4 w-4" />
                  Historia de Tonila
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
          </NavigationMenuList>
        </NavigationMenu>

        {/* --- ACCIONES Y MENÚ MÓVIL --- */}
        <div className="flex items-center gap-2">

          {status === "loading" && (
            <Button variant="ghost" size="icon" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          )}

          {status === "unauthenticated" && (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" asChild className="hover:bg-black/10 text-stone-700 text-base rounded-full">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="bg-orange-600 text-white hover:bg-orange-500 text-base rounded-full">
                <Link href="/registro">Registrarse</Link>
              </Button>
            </div>
          )}

          {status === "authenticated" && (
            <div className="hidden md:block">
              <Button variant="ghost" asChild className="border-black/20 hover:bg-black/10 text-stone-700 text-base rounded-full">
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </Button>
            </div>
          )}

          {isClient && status === "authenticated" && (
            <Button
              variant="ghost"
              asChild
              className="relative hover:bg-black/10 hover:text-black text-stone-700 h-10 w-10 rounded-full flex items-center justify-center"
            >
              <Link href="/carrito">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Ver carrito</span>
              </Link>
            </Button>
          )}

          {/* --- MENÚ HAMBURGUESA (MÓVIL) --- */}
          <div className="md:hidden ml-1">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-stone-700">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col gap-6 pt-10">
                
                <SheetTitle className="text-left text-2xl font-bold text-stone-700 flex items-center gap-2">
                    <Image src="/mt_logo.svg" alt="Logo" width={40} height={40} className="h-10 w-auto" />
                    Menú
                </SheetTitle>
                <SheetDescription className="sr-only">
                    Navegación principal
                </SheetDescription>
                
                {status === "unauthenticated" && (
                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full rounded-full bg-orange-600 hover:bg-orange-500 text-lg h-12">
                            <Link href="/registro" onClick={() => setIsOpen(false)}>Registrarse</Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full rounded-full text-lg h-12 border-stone-300">
                            <Link href="/login" onClick={() => setIsOpen(false)}>Iniciar Sesión</Link>
                        </Button>
                    </div>
                )}

                {status === "authenticated" && (
                     <Button variant="outline" asChild className="w-full justify-start rounded-full h-12 text-lg border-stone-300 gap-3 pl-4 text-stone-700 hover:text-orange-600 hover:bg-orange-50">
                        <Link href="/perfil" onClick={() => setIsOpen(false)}>
                            <User className="h-5 w-5" />
                            Mi Perfil
                        </Link>
                     </Button>
                )}

                <Separator />

                <nav className="flex flex-col gap-2">
                    <Link 
                        href="/negocios" 
                        onClick={() => setIsOpen(false)}
                        className={mobileLinkClass}
                    >
                        <Store className="h-5 w-5" />
                        Negocios
                    </Link>
                    <Link 
                        href="/categorias" 
                        onClick={() => setIsOpen(false)}
                        className={mobileLinkClass}
                    >
                        <LayoutGrid className="h-5 w-5" />
                        Categorías
                    </Link>
                    <Link 
                        href="/empleos" 
                        onClick={() => setIsOpen(false)}
                        className={mobileLinkClass}
                    >
                        <Briefcase className="h-5 w-5" />
                        Empleos
                    </Link>
                    
                    <div className="my-2 border-t border-stone-100 mx-4" />

                    <Link 
                        href="/historia" 
                        onClick={() => setIsOpen(false)}
                        className={mobileLinkClass}
                    >
                        <BookOpen className="h-5 w-5" />
                        Historia de Tonila
                    </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}