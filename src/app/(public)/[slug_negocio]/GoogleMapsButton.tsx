// app/(public)/[slug_negocio]/GoogleMapsButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface GoogleMapsButtonProps {
  lat: number;
  lng: number;
  nombre: string;
}

export function GoogleMapsButton({ lat, lng, nombre }: GoogleMapsButtonProps) {
  
  const handleClick = () => {
    // 1. Construimos la URL de "Search Query" (la que sí funciona)
    const url = `https-www.google.com/maps/search/?api=1&query=$${encodeURIComponent(nombre)}@${lat},${lng}`;
    
    // 2. Usamos window.open para forzar la apertura en una nueva pestaña
    // Esto evita 100% que el router de Next.js interfiera.
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button className="w-full mt-4" onClick={handleClick}>
      <ExternalLink className="mr-2 h-4 w-4" />
      Cómo llegar
    </Button>
  );
}