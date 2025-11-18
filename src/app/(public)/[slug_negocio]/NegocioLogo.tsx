"use client";

import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Store } from "lucide-react";

interface NegocioLogoProps {
  logoUrl: string | null | undefined;
  nombreNegocio: string;
}

export function NegocioLogo({ logoUrl, nombreNegocio }: NegocioLogoProps) {
  return (
    <div className="flex w-full justify-center">
      <div className="relative h-40 w-40 md:h-48 md:w-48 bg-muted rounded-full border-4 border-background shadow-lg overflow-hidden">
        {logoUrl ? (
          <CloudinaryImage
            src={logoUrl}
            alt={`Logo de ${nombreNegocio}`}
            fill
            className="object-cover"
            sizes="200px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Store className="h-20 w-20 text-muted-foreground/50" />
          </div>
        )}
      </div>
    </div>
  );
}
