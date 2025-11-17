// app/(public)/CategoryCarousel.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay"; // 1. Importamos el plugin
import { getCategoryIcon } from "@/lib/icon-map";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// 2. Definimos el tipo de 'cat' (mejor que 'any')
type Categoria = {
  id_categoria_g: number;
  nombre: string;
};

export function CategoryCarousel({ categorias }: { categorias: Categoria[] }) {
  
  // 3. Configuramos el plugin de autoplay
  const plugin = React.useRef(
    Autoplay({ 
      delay: 3000,                // 3 segundos por slide
      stopOnInteraction: true,  // Se detiene si el usuario interactúa
    })
  );

  return (
    <Carousel
      plugins={[plugin.current]} // 4. Añadimos el plugin al carrusel
      className="w-full"
      onMouseEnter={() => plugin.current.stop()} // <-- CORREGIDO
      onMouseLeave={() => plugin.current.play()} // <-- CORREGIDO
      opts={{
        align: "start", // Alinea el scroll al inicio (evita que queden mochas)
        loop: true,     // Asegura que el autoplay sea un bucle infinito
      }}
    >
      <CarouselContent>
        {categorias.map((cat) => {
          const Icono = getCategoryIcon(cat.nombre);
          return (
            // 5. Definimos cuántos items mostrar
            <CarouselItem 
              key={cat.id_categoria_g} 
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
            >
              <Link
                href={`/categorias/${encodeURIComponent(cat.nombre.toLowerCase())}`}
                className="group"
              >
                <div className="flex flex-col items-center justify-center gap-3 p-4 border rounded-3xl h-full transition-all hover:shadow-md hover:-translate-y-1 text-center bg-background">
                  <Icono className="h-8 w-8 text-primary text-stone-700" />
                  <p className="font-medium text-stone-700">{cat.nombre}</p>
                </div>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="ml-3" />
      <CarouselNext className="mr-3" />
    </Carousel>
  );
}