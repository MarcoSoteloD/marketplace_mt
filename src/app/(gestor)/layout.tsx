import { Toaster } from "@/components/ui/toaster";
import { GestorSidebar } from "./_components/Sidebar"; 
import { GestorMobileSidebar } from "./_components/MobileSidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- Obtener datos para el Navbar Móvil (Server-Side) ---
  const session = await getServerSession(authOptions);
  let negocioNombre = "Mi Negocio";
  
  if (session?.user?.negocioId) {
    const negocio = await prisma.negocios.findUnique({
      where: { id_negocio: session.user.negocioId },
      select: { nombre: true }
    });
    if (negocio) negocioNombre = negocio.nombre;
  }
  const gestorNombre = session?.user?.name || "Gestor";

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row w-full overflow-hidden bg-stone-50">
      
      {/* Sidebar de Escritorio (Se oculta en móvil por su propia clase 'hidden md:block') */}
      <GestorSidebar />
      
      {/* Navbar Móvil (Visible solo en móvil) */}
      <GestorMobileSidebar negocioNombre={negocioNombre} gestorNombre={gestorNombre} />
      
      {/* Contenido Principal (con scroll interno) */}
      <div className="flex flex-col flex-1 h-full overflow-y-auto">
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}