// En: src/app/(public)/categorias/[categoria]/page.tsx

import { getNegociosByCategoriaGlobal } from '@/lib/db';
import { NegocioCard } from '@/components/NegocioCard'; // 👈 Ajusta esta ruta
import { AlertTriangle } from 'lucide-react'; // Para el estado vacío

// Definimos la interfaz para los props
interface CategoriaDetallePageProps {
  params: {
    categoria: string; // Esto viene de la URL (ej. "restaurantes")
  };
}

// Exportamos los metadatos dinámicos (buena práctica para SEO)
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
  
  // 1. Decodificamos el nombre de la URL (ej. "restaurantes" -> "Restaurantes")
  // Usamos una función simple para capitalizar la primera letra para el título
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const nombreCategoriaDecodificado = decodeURIComponent(params.categoria);
  const nombreCategoriaTitulo = capitalize(nombreCategoriaDecodificado);

  // 2. Obtenemos los datos desde el servidor
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Aquí reutilizamos el mismo NegocioCard que usamos en el homepage.
            El componente 'horario' se pasará a la tarjeta
            para calcular si está abierto o cerrado.
          */}
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
            No se encontraron negocios activos en la categoría "
            {nombreCategoriaTitulo}".
          </p>
        </div>
      )}
    </div>
  );
}