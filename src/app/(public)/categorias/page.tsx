// app/(public)/categorias/page.tsx

import { getCategoriasGlobales } from '@/lib/db';
import { getCategoryIcon } from '@/lib/icon-map'; // Reutilizamos nuestro helper
import Link from 'next/link';
import type { categorias_globales } from '@prisma/client'; // Importamos el tipo para el map

export default async function PaginaCategoriasPublicas() {
  
  // 1. Obtenemos los datos desde el servidor
  const categorias = await getCategoriasGlobales();

  return (
    // Usamos 'container' para que se alinee con tu Navbar y Footer
    <div className="container py-12 md:py-16">
      
      {/* --- Encabezado --- */}
      <div className="flex flex-col items-center text-center mb-12">
         <h1 className="text-4xl md:text-5xl text-stone-700 font-bold tracking-tight">
           Explora por Categoría
         </h1>
         <p className="text-lg text-muted-foreground max-w-2xl mt-4">
           Encuentra lo que necesitas, organizado para ti.
         </p>
      </div>
      
      {/* --- Cuadrícula de Categorías --- */}
      {categorias.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categorias.map((cat: categorias_globales) => {
            const Icono = getCategoryIcon(cat.nombre);
            return (
              <Link
                // TODO: Esta es la página que nos falta crear
                href={`/categorias/${encodeURIComponent(cat.nombre.toLowerCase())}`} 
                key={cat.id_categoria_g}
                className="group"
              >
                {/* Usamos el mismo estilo del carrusel, 
                  pero con un padding (p-6) e ícono (h-10) más grandes 
                  para que se vean mejor en una página dedicada.
                */}
                <div className="flex flex-col items-center justify-center gap-3 p-6 border rounded-xl h-full transition-all hover:shadow-lg hover:-translate-y-1 text-center bg-background">
                  <Icono className="h-10 w-10 text-stone-700" /> 
                  <p className="font-semibold text-stone-700 text-lg">{cat.nombre}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
         <p className="text-center text-muted-foreground py-16">
           No hay categorías disponibles en este momento.
         </p>
      )}
    </div>
  );
}