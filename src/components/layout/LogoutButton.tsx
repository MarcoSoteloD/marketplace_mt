"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export function LogoutButton() {
  // OBTENEMOS LA ACCIÓN
  const clearCart = useCartStore((state) => state.clearCart);

  // CREAMOS EL HANDLER
  const handleLogout = () => {
    clearCart(); // Limpiamos el carrito
    signOut({ callbackUrl: '/login' }); // Cerramos sesión
  };

  return (
    <Button
      variant="ghost" 
      className="w-full justify-start text-gray-200 transition-all hover:text-white hover:bg-destructive/20 hover:text-destructive-foreground px-4 py-2 rounded-none h-10 text-base"
      onClick={handleLogout} // <-- Usamos el handler
    >
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar Sesión
    </Button>
  );
}