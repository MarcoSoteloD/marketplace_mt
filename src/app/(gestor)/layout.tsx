import { Toaster } from "@/components/ui/toaster";
import { GestorSidebar } from "./_components/Sidebar"; 

export default function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // CAMBIO: 'fixed inset-0' en lugar de 'h-screen'.
    // Esto "congela" el body y evita que aparezca la barra de scroll del navegador.
    <div className="fixed inset-0 flex w-full overflow-hidden bg-stone-50">
      
      {/* 1. Sidebar Fijo del Gestor */}
      <GestorSidebar />
      
      {/* 2. Contenido Principal (con scroll interno) */}
      {/* 'overflow-y-auto' aquí maneja el único scroll que existirá */}
      <div className="flex flex-col flex-1 h-full overflow-y-auto">
        
        {/* Añadimos 'pb-24' para asegurar que el contenido final no quede tapado en móviles */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}