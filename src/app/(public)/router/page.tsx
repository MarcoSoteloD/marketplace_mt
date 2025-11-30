// app/router/page.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { rol_usuario } from "@prisma/client";
import { Loader } from "@/components/ui/loader";

export default function RouterPage() {
  const { data: session, status } = useSession(); 
  const router = useRouter();

  // El hook 'useEffect' se ejecuta en el cliente
  useEffect(() => {
    
    // Si la sesión ya cargó (no está 'loading')
    if (status === "authenticated") {
      
      // Decidimos a dónde redirigir
      if (session?.user?.rol === rol_usuario.admin) {
        router.replace("/dashboard"); // Ruta de admin
      } else if (session?.user?.rol === rol_usuario.gestor) {
        router.replace("/pedidos"); // Ruta de gestor
      } else {
        router.replace("/"); // Ruta para clientes
      }
      
    } else if (status === "unauthenticated") {
      // Si por alguna razón llega aquí sin sesión, lo regresamos
      router.replace("/login");
    }

    // Si el 'status' es 'loading', el effect no hace nada
    // y la página sigue mostrando el spinner.
    
  }, [status, session, router]);

  // Por defecto, muestra el spinner
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader />
    </div>
  );
}