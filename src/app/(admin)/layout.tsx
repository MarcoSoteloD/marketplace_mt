// app/(admin)/layout.tsx
import { Toaster } from "@/components/ui/toaster";
import { AdminSidebar } from "./_components/Sidebar"; // Importamos el Sidebar

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      
      {/* 1. Sidebar Fijo */}
      <AdminSidebar />
      
      {/* 2. Contenido Principal (con scroll) */}
      <div className="flex flex-col flex-1 overflow-auto">

        {/* 2. Contenido de la página (ej. /categorias) */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* El Toaster para las notificaciones */}
      <Toaster />
    </div>
  );
}