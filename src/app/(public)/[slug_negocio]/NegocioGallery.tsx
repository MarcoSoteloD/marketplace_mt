"use client";

import { useState, useRef, useCallback } from "react";
import CloudinaryImage from "@/components/ui/cloudinary-image";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Store } from "lucide-react";
import ImageViewer from "@/components/ui/ImageViewer";

interface NegocioGalleryProps {
  galeria: string[];
  nombreNegocio: string;
}

export function NegocioGallery({ galeria, nombreNegocio }: NegocioGalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);
  
  // --- INICIO LÓGICA AUTOPLAY ---
  const [api, setApi] = useState<CarouselApi>();

  const plugin = useRef(
    Autoplay({
      delay: 4000, 
      stopOnInteraction: true,
    })
  );

  const handleMouseEnter = useCallback(() => {
    if (!api) return;
    api.plugins()?.autoplay?.stop();
  }, [api]);

  const handleMouseLeave = useCallback(() => {
    if (!api) return;
    api.plugins()?.autoplay?.play();
  }, [api]);

  return (
    <>
      <section className="w-full" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {galeria.length > 0 ? (
          <Carousel 
            className="w-full" 
            opts={{ 
                loop: true,
                align: "start"
            }}
            plugins={[plugin.current]}
            setApi={setApi}
          >
            <CarouselContent className="-ml-4">
              {galeria.map((url, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-full md:basis-1/2"
                >
                  <div 
                    className="relative h-72 w-full cursor-pointer rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all"
                    onClick={() => setSelected(url)}
                  >
                    <CloudinaryImage
                      src={url}
                      alt={`Foto de ${nombreNegocio} ${index + 1}`}
                      fill
                      // object-cover llena el contenedor
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      priority={index < 2} // Priorizamos las primeras 2 imágenes
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    
                    {/* Overlay sutil al hacer hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Flechas de navegación (Ocultas en móvil para limpieza, visibles en md) */}
            <div className="hidden md:block">
                <CarouselPrevious className="absolute -left-4 h-10 w-10 border-stone-200 bg-white/90 hover:bg-white text-stone-700 shadow-md" />
                <CarouselNext className="absolute -right-4 h-10 w-10 border-stone-200 bg-white/90 hover:bg-white text-stone-700 shadow-md" />
            </div>
          </Carousel>
        ) : (
          // Estado vacío (Placeholder elegante)
          <div className="flex h-64 w-full items-center justify-center bg-muted rounded-2xl border-2 border-dashed border-stone-200">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                <Store className="h-16 w-16" />
                <span className="text-sm font-medium">Sin fotos disponibles</span>
            </div>
          </div>
        )}
      </section>

      {/* Visor a pantalla completa */}
      {selected && (
        <ImageViewer
          url={selected}
          alt={nombreNegocio}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}