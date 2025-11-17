import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface GoogleMapsButtonProps {
  lat: number;
  lng: number;
  nombre: string;
}

export function GoogleMapsButton({ lat, lng, nombre }: GoogleMapsButtonProps) {
  
  // --- LA URL CORREGIDA ---
  // Este es el formato "Pin en (lat,lng) con etiqueta (Nombre)"
  const url = `https://www.google.com/maps?q=${lat},${lng} (${encodeURIComponent(nombre)})`;

  return (
    // Tu 'rounded-full' se respeta aquí
    <Button 
      asChild 
      className="w-full mt-4 rounded-full bg-orange-600 hover:bg-orange-500"
    >
      <a
        href={url}
        target="_blank" // Abre en una nueva pestaña
        rel="noopener noreferrer"
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Cómo llegar
      </a>
    </Button>
  );
}