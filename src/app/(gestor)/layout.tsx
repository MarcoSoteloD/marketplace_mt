// app/(gestor)/layout.tsx
import { Toaster } from "@/components/ui/toaster";
import { GestorSidebar } from "./_components/Sidebar"; // Importamos el NUEVO sidebar

export default function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      
      {/* 1. Sidebar Fijo del Gestor */}
      <GestorSidebar />
      
      {/* 2. Contenido Principal (con scroll) */}
      <div className="flex flex-col flex-1 overflow-auto">

        {/* (Podríamos añadir un Header/Navbar simple aquí si quisiéramos) */}
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}