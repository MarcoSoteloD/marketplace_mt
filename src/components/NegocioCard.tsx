// src/components/NegocioCard.tsx

import Link from 'next/link';
import type { negocios } from '@prisma/client';
import { CldImage } from 'next-cloudinary';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin } from 'lucide-react';

// Definimos las props que recibirá el componente
interface NegocioCardProps {
  negocio: negocios;
}

export function NegocioCard({ negocio }: NegocioCardProps) {
  
  // Creamos una dirección corta (ej. "Colonia Centro, Colima")
  const direccionCorta = [negocio.colonia, negocio.municipio]
    .filter(Boolean) // Filtra nulos o strings vacíos
    .join(', ');

  return (
    <Link href={`/${negocio.slug}`} className="group">
      <Card className="w-full overflow-hidden transition-all duration-200 hover:shadow-lg">
        {/* --- IMAGEN --- */}
        <div className="relative h-48 w-full">
          {negocio.url_logo ? (
            <CldImage
              src={negocio.url_logo}
              alt={`Logo de ${negocio.nombre}`}
              fill // 'fill' hace que llene el div padre
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              crop={{ type: "fill", source: true }}
            />
          ) : (
            // Placeholder si no hay logo
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Store className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>
        
        {/* --- CONTENIDO --- */}
        <CardContent className="p-4 space-y-2">
          {/* Nombre y Badge de Activo (aunque siempre será true) */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold truncate" title={negocio.nombre}>
              {negocio.nombre}
            </h3>
            {negocio.activo && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">Abierto</Badge>
            )}
          </div>

          {/* Descripción (corta) */}
          <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">
            {negocio.descripcion || 'Este negocio aún no tiene una descripción.'}
          </p>

          {/* Dirección */}
          {direccionCorta && (
            <div className="flex items-center gap-1.5 pt-2">
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