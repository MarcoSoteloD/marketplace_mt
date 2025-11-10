// src/components/ui/loader.tsx

import { Loader2 } from "lucide-react"; // Un buen ícono de spinner

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  );
}