// app/(public)/page.tsx
import { getNegociosActivos, getCategoriasGlobales } from "@/lib/db";
import { NegocioCard } from "@/components/NegocioCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { CategoryCarousel } from './CategoryCarousel';

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let negocios: any[] = [];
  let categorias: any[] = [];

  try {
    [negocios, categorias] = await Promise.all([
      getNegociosActivos(),
      getCategoriasGlobales(),
    ]);
  } catch (err) {
    console.error("Error cargando datos de inicio:", err);
  }

  // URL de imagen de fondo para el Hero
  const heroImageUrl = "/images/hero-tonila.jpg";

  return (
    <div className="flex flex-col gap-16 md:gap-20">

      {/* --- 1. Hero --- */}
      <section
        className="relative bg-muted/40 py-16 md:py-24 min-h-[500px] overflow-hidden flex flex-col justify-center"
        style={{
          backgroundImage: `url('${heroImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Capa de superposición para mejorar la legibilidad del texto */}
        <div className="absolute inset-0 bg-black/40 z-0"></div> {/* Oscurece la imagen un poco */}
        <div className="container relative z-10 flex flex-col items-center text-center text gap-4 text-white"> {/* Texto blanco para contraste */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Descubre lo mejor de Tonila
          </h1>
          <p className="text-lg max-w-2xl">
            Encuentra restaurantes, tiendas y servicios locales. Todo en un solo lugar.
          </p>
          <form
            className="mt-4 flex w-full max-w-lg items-center space-x-2 "
            action="/buscar"
            method="GET"
          >
            <Input
              type="search"
              name="q"
              placeholder="¿Qué estás buscando? (Ej. tacos, peluquería...)"
              className="h-12 text-base flex-1 rounded-full bg-white" // Asegura que el texto de búsqueda sea legible
            />
            <Button type="submit" size="icon" className="h-12 w-12 flex-shrink-0 bg-orange-600 hover:bg-orange-500 rounded-full">
              <Search className="h-5 w-5 " />
            </Button>
          </form>
        </div>
      </section>

      {/* --- 2. Categorías --- */}
      <section className="container">
        <h2 className="text-2xl text-stone-700 font-semibold tracking-tight mb-6">
          Explora nuestras Categorías
        </h2>
        <CategoryCarousel categorias={categorias} />
      </section>

      {/* --- 3. Negocios --- */}
      <section className="container pb-24">
        <h2 className="text-2xl text-stone-700 font-semibold tracking-tight mb-6">
          Explora los Negocios
        </h2>
        {negocios.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {negocios.map((negocio) => (
              <NegocioCard key={negocio.id_negocio} negocio={negocio} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">
            Aún no hay negocios activos en la plataforma. ¡Vuelve pronto!
          </p>
        )}
      </section>
    </div>
  );
}