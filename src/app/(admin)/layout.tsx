import { Toaster } from "@/components/ui/toaster";
import { AdminSidebar } from "./_components/Sidebar";
import { AdminMobileSidebar } from "./_components/MobileSidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtenemos la sesión para el saludo en el móvil
  const session = await getServerSession(authOptions);
  const adminName = session?.user?.name || "Administrador";

  return (
    // Ajustamos el contenedor principal
    <div className="fixed inset-0 flex flex-col md:flex-row w-full overflow-hidden bg-stone-50">
      
      {/* Sidebar Escritorio (Se oculta en móvil por su clase interna 'hidden md:block') */}
      <AdminSidebar />
      
      {/* Sidebar Móvil (Visible solo en móvil) */}
      <AdminMobileSidebar adminName={adminName} />
      
      {/* Contenido Principal (con scroll interno) */}
      <div className="flex flex-col flex-1 h-full overflow-y-auto">
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24">
          {children}
        </main>
      </div>

      {/* El Toaster para las notificaciones */}
      <Toaster />
    </div>
  );
}