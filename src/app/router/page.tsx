// app/router/page.tsx
"use client"; // <-- ¡El paso más importante!

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { rol_usuario } from "@prisma/client";

// Importamos el spinner que acabamos de crear
import { Loader } from "@/components/ui/loader";

export default function RouterPage() {
  const { data: session, status } = useSession() as { data: any; status: string };
  const router = useRouter();

  // 1. El hook 'useEffect' se ejecuta en el cliente
  useEffect(() => {
    
    // 2. Si la sesión ya cargó (no está 'loading')
    if (status === "authenticated") {
      
      // 3. Decidimos a dónde redirigir
      if (session?.user?.rol === rol_usuario.admin) {
        router.replace("/dashboard"); // (Tu ruta de admin)
      } else if (session?.user?.rol === rol_usuario.gestor) {
        router.replace("/configuracion"); // (Tu ruta de gestor)
      } else {
        router.replace("/"); // Ruta para 'clientes'
      }
      
    } else if (status === "unauthenticated") {
      // 4. Si por alguna razón llega aquí sin sesión, lo regresamos
      router.replace("/login");
    }

    // 5. Si el 'status' es 'loading', el effect no hace nada
    //    y la página sigue mostrando el spinner.
    
  }, [status, session, router]);

  // 6. Por defecto, muestra el spinner
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader />
    </div>
  );
}