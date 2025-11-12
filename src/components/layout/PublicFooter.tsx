// src/components/layout/PublicFooter.tsx
import Link from "next/link";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-700 bg-stone-900 text-stone-300 overflow-x-hidden">
      {/* CAMBIOS:
        - bg-muted/40 -> bg-stone-900 (fondo marrón oscuro)
        - border-t -> border-t border-stone-700 (borde superior más sutil)
        - (Añadido) text-stone-300 (color de texto base claro)
      */}
      <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-between gap-4 py-10 px-4 sm:px-6 md:h-24 md:flex-row md:py-0">
        
        {/* Copyright (texto más claro) */}
        <div className="text-center text-sm leading-loose text-stone-400 md:text-left">
          © {currentYear} Marketplace MT. Todos los derechos reservados.
        </div>

        {/* Links (colores claros y hover blanco) */}
        <nav className="flex gap-4 sm:gap-6 text-sm">
          <Link 
            href="/terminos" 
            className="text-stone-400 transition-colors hover:text-white"
          >
            Términos de Servicio
          </Link>
          <Link 
            href="/privacidad" 
            className="text-stone-400 transition-colors hover:text-white"
          >
            Política de Privacidad
          </Link>
        </nav>

      </div>
    </footer>
  );
}