//src/components/NegocioCard.tsx

import Link from 'next/link';
import type { negocios } from '@prisma/client';
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin } from 'lucide-react';
import { checkOpenStatus } from "@/lib/time-helpers";

// Definimos las props que recibirá el componente
interface NegocioCardProps {
  negocio: negocios;
}

export function NegocioCard({ negocio }: NegocioCardProps) {
  
  // Creamos una dirección corta (ej. "Colonia Centro, Colima")
  const direccionCorta = [negocio.colonia, negocio.municipio]
    .filter(Boolean) // Filtra nulos o strings vacíos
    .join(', ');

  // Calculamos el estado real basado en el horario JSON
  const isOpen = checkOpenStatus(negocio.horario);

  return (
    <Link href={`/${negocio.slug}`} className="group">
      <Card className="w-full overflow-hidden transition-all duration-200 hover:shadow-lg rounded-3xl h-full flex flex-col">
        {/* --- IMAGEN --- */}
        <div className="relative h-60 w-full shrink-0">
          {negocio.url_logo ? (
            <CloudinaryImage
              src={negocio.url_logo}
              alt={`Logo de ${negocio.nombre}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            // Placeholder si no hay logo
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Store className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>
        
        {/* --- CONTENIDO --- */}
        <CardContent className="p-4 space-y-2 flex flex-col flex-1">
          {/* Nombre y Badge de Estado */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg text-stone-700 font-semibold truncate flex-1" title={negocio.nombre}>
              {negocio.nombre}
            </h3>
            
            {/* Badge Dinámico */}
            <Badge 
              variant="secondary" // Usamos secondary base para sobreescribirlo con clases
              className={
                isOpen
                  ? "bg-green-600 text-white hover:bg-green-700 border-transparent rounded-full px-2 py-0.5 text-xs whitespace-nowrap"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200 border-transparent rounded-full px-2 py-0.5 text-xs whitespace-nowrap"
              }
            >
              {isOpen ? "Abierto ahora" : "Cerrado ahora"}
            </Badge>
          </div>

          {/* Descripción (corta) */}
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {negocio.descripcion || 'Este negocio aún no tiene una descripción.'}
          </p>

          {/* Dirección (corta) */}
          {direccionCorta && (
            <div className="flex items-center gap-1.5 pt-2 mt-auto">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground truncate">
                {direccionCorta}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}