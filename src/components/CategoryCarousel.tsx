"use client";

import * as React from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { getCategoryIcon } from "@/lib/icon-map";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

type Categoria = {
  id_categoria_g: number;
  nombre: string;
};

export function CategoryCarousel({ categorias }: { categorias: Categoria[] }) {

  // Creamos el plugin
  const plugin = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
    })
  );

  // Creamos un estado para guardar la API
  const [api, setApi] = React.useState<CarouselApi>();

  // Creamos los handlers (con useCallback para optimizar)
  const handleMouseEnter = React.useCallback(() => {
    // Si la API no existe, O no puede scrollear en NINGUNA dirección, salimos.
    if (!api || (!api.canScrollPrev() && !api.canScrollNext())) return;
    
    // Accedemos al plugin de autoplay DESDE la API y lo detenemos
    api.plugins()?.autoplay?.stop();

  }, [api]); // Depende de la API

  const handleMouseLeave = React.useCallback(() => {
    if (!api || (!api.canScrollPrev() && !api.canScrollNext())) return;
    
    // Accedemos al plugin de autoplay DESDE la API y lo reanudamos
    api.plugins()?.autoplay?.play();

  }, [api]); // Depende de la API


  return (
    <Carousel
      plugins={[plugin.current]} 
      className="w-full"
      // LE PASAMOS EL SETTER a shadcn/ui
      setApi={setApi}
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