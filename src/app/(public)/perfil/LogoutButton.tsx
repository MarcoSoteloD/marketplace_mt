"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export function LogoutButton() {
  const clearCart = useCartStore((state) => state.clearCart);

  const handleLogout = () => {
    clearCart(); // Limpiamos carrito local
    signOut({ callbackUrl: '/' });
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
      className="rounded-full border-stone-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors gap-2"
    >
      <LogOut className="w-4 h-4" />
      Cerrar Sesión
    </Button>
  );
}