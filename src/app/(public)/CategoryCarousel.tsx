"use client";

import * as React from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay"; // (Tu import)
import { getCategoryIcon } from "@/lib/icon-map";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi, // <-- 1. Importamos el TIPO de la API
} from "@/components/ui/carousel";

type Categoria = {
  id_categoria_g: number;
  nombre: string;
};

export function CategoryCarousel({ categorias }: { categorias: Categoria[] }) {

  // 2. Creamos el plugin (como ya lo tenías, esto está bien)
  const plugin = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
    })
  );

  // 3. Creamos un estado para guardar la API
  const [api, setApi] = React.useState<CarouselApi>();

  // 4. Creamos los handlers (con useCallback para optimizar)
  const handleMouseEnter = React.useCallback(() => {
    // --- ESTA ES LA LÍNEA CORREGIDA ---
    // Si la API no existe, O no puede scrollear en NINGUNA dirección, salimos.
    if (!api || (!api.canScrollPrev() && !api.canScrollNext())) return;
    
    // Accedemos al plugin de autoplay DESDE la API y lo detenemos
    api.plugins()?.autoplay?.stop();

  }, [api]); // Depende de la API

  const handleMouseLeave = React.useCallback(() => {
    // --- ESTA ES LA LÍNEA CORREGIDA ---
    if (!api || (!api.canScrollPrev() && !api.canScrollNext())) return;
    
    // Accedemos al plugin de autoplay DESDE la API y lo reanudamos
    api.plugins()?.autoplay?.play();

  }, [api]); // Depende de la API


  return (
    <Carousel
      plugins={[plugin.current]} 
      className="w-full"
      // 5. LE PASAMOS EL SETTER a shadcn/ui
      setApi={setApi} 
      // 6. Usamos nuestros nuevos handlers seguros
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      opts={{
        align: "start", 
        loop: true,
      }}
    >
      <CarouselContent>
        {categorias.map((cat) => {
          const Icono = getCategoryIcon(cat.nombre);
          return (
            <CarouselItem
              key={cat.id_categoria_g}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
            >
              <Link
                href={`/categorias/${encodeURIComponent(cat.nombre.toLowerCase())}`}
                className="group"
              >
                <div className="flex flex-col items-center justify-center gap-3 p-4 border rounded-full h-full transition-all hover:shadow-md hover:-translate-y-1 text-center bg-background">
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