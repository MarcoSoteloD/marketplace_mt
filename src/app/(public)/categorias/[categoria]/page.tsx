import { getNegociosByCategoriaGlobal } from '@/lib/data/businesses';
import { NegocioCard } from '@/components/NegocioCard';
import { AlertTriangle } from 'lucide-react';

// Definimos la interfaz para los props
interface CategoriaDetallePageProps {
  params: {
    categoria: string; // Esto viene de la URL (ej. "restaurantes")
  };
}

// Exportamos los metadatos dinámicos
export async function generateMetadata({ params }: CategoriaDetallePageProps) {
  const nombreCategoria = decodeURIComponent(params.categoria);
  return {
    title: `Negocios de ${nombreCategoria} en Manos Tonilenses`,
    description: `Explora todos los negocios y servicios en la categoría ${nombreCategoria}.`,
  };
}

// --- El Componente de Página ---
export default async function CategoriaDetallePage({
  params,
}: CategoriaDetallePageProps) {
  
  // Decodificamos el nombre de la URL (ej. "restaurantes" -> "Restaurantes")
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const nombreCategoriaDecodificado = decodeURIComponent(params.categoria);
  const nombreCategoriaTitulo = capitalize(nombreCategoriaDecodificado);

  // Obtenemos los datos desde el servidor
  const negocios = await getNegociosByCategoriaGlobal(
    nombreCategoriaDecodificado
  );

  return (
    <div className="container py-12 md:py-16">
      
      {/* --- Encabezado --- */}
      <div className="flex flex-col items-center text-center mb-12">
        <p className="text-lg text-muted-foreground font-medium">Categoría</p>
        <h1 className="text-4xl md:text-5xl text-stone-700 font-bold tracking-tight mt-1">
          {nombreCategoriaTitulo}
        </h1>
      </div>

      {/* --- Cuadrícula de Negocios --- */}
      {negocios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {negocios.map((negocio) => (
            <NegocioCard key={negocio.id_negocio} negocio={negocio} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-16 px-4 max-w-lg mx-auto border-2 border-dashed border-stone-200 bg-stone-50/50 rounded-3xl">
          <div className="bg-white p-4 rounded-full shadow-sm mb-2">
            <AlertTriangle className="h-10 w-10 text-orange-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-stone-700">
            Sin resultados
          </h2>
          
          <p className="text-muted-foreground max-w-xs mx-auto">
            No encontramos negocios activos en la categoría <span className="font-medium text-stone-600">&quot;{nombreCategoriaTitulo}&quot;</span> por ahora.
          </p>
        </div>
      )}
    </div>
  );
}