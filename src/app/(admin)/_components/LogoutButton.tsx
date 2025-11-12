// app/(admin)/_components/LogoutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button
      variant="ghost" // Cambiamos de "outline" a "ghost"
      className="w-full justify-start text-gray-200 transition-all hover:text-white hover:bg-destructive/20 hover:text-destructive-foreground px-4 py-2 rounded-none h-10 text-base"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar Sesión
    </Button>
  );
}