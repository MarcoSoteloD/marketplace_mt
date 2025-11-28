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
      delay: 4000, // 4 segundos es buen tiempo para fotos grandes
      stopOnInteraction: true,
    })
  );

  const handleMouseEnter = useCallback(() => {
    if (!api) return;
    // Solo paramos si realmente hay scroll (más de 1 foto)
    // La comprobación api.canScroll... a veces da falso positivo en loop,
    // pero con api.plugins().autoplay.stop() es seguro intentarlo.
    api.plugins()?.autoplay?.stop();
  }, [api]);

  const handleMouseLeave = useCallback(() => {
    if (!api) return;
    api.plugins()?.autoplay?.play();
  }, [api]);

  return (
    <>
      <section className="relative h-[35vh] w-full bg-muted rounded-xl overflow-hidden">
        {galeria.length > 0 ? (
          <Carousel 
            className="w-full h-full" 
            opts={{ loop: true }}
            plugins={[plugin.current]}
            setApi={setApi}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CarouselContent className="h-full">
              {galeria.map((url, index) => (
                <CarouselItem
                  key={index}
                  className="relative h-[35vh] cursor-pointer"
                  onClick={() => setSelected(url)}
                >
                  <CloudinaryImage
                    src={url}
                    alt={`Foto de ${nombreNegocio} ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="absolute left-4 rounded-full bg-white/80 hover:bg-white border-0" />
            <CarouselNext className="absolute right-4 rounded-full bg-white/80 hover:bg-white border-0" />
          </Carousel>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Store className="h-32 w-32 text-muted-foreground/30" />
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