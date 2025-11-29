// src/app/(public)/negocios/page.tsx

import { getActiveNegocios } from '@/lib/data/businesses';
import { NegocioCard } from '@/components/NegocioCard';
import { AlertTriangle } from 'lucide-react';

// Definimos la interfaz para los searchParams
interface NegociosPageProps {
  searchParams: {
    categoria?: string; // ej. "restaurantes"
  };
}

export default async function PaginaNegocios({ searchParams }: NegociosPageProps) {
  
  // Obtenemos la categoría de la URL (si existe)
  const categoria = searchParams.categoria 
    ? decodeURIComponent(searchParams.categoria) 
    : undefined;

  // Obtenemos los datos filtrados (o todos)
  const negocios = await getActiveNegocios(categoria);

  // Preparamos el título (dinámico)
  const titulo = categoria 
    ? `Negocios en "${categoria}"` 
    : "Todos los Negocios";
  
  const descripcion = categoria
    ? `Explora los negocios disponibles en la categoría ${categoria}.`
    : "Descubre todos los negocios y servicios disponibles en Manos Tonilenses.";

  return (
    <div className="container py-12 md:py-16">

      {/* --- Encabezado --- */}
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl md:text-5xl text-stone-700 font-bold tracking-tight">
          {titulo}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mt-4">
          {descripcion}
        </p>
      </div>

      {/* --- Cuadrícula de Negocios --- */}
      {negocios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Reutilizamos el mismo NegocioCard que usamos en el homepage */}
          {negocios.map((negocio) => (
            <NegocioCard key={negocio.id_negocio} negocio={negocio} />
          ))}

        </div>
      ) : (
        // --- Estado Vacío ---
        <div className="flex flex-col items-center justify-center text-center gap-4 py-16 max-w-lg mx-auto border bg-background rounded-lg shadow-sm">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-stone-700">
            Sin resultados
          </h2>
          <p className="text-muted-foreground">
            No se encontraron negocios activos que coincidan con tu filtro.
          </p>
        </div>
      )}
    </div>
  );
}