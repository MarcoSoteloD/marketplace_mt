// app/(public)/page.tsx
import { getNegociosActivos, getCategoriasGlobales } from "@/lib/db";
import { getCategoryIcon } from "@/lib/icon-map";
import { NegocioCard } from "@/components/NegocioCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      
      {/* --- 1. Hero --- */}
      <section className="bg-muted/40 py-16 md:py-24">
        <div className="container flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Descubre lo mejor de Tonila
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Encuentra restaurantes, tiendas y servicios locales. Todo en un solo lugar.
          </p>
          <form
            className="mt-4 flex w-full max-w-lg items-center space-x-2"
            action="/buscar"
            method="GET"
          >
            <Input
              type="search"
              name="q"
              placeholder="¿Qué estás buscando? (Ej. tacos, peluquería...)"
              className="h-12 text-base flex-1"
            />
            <Button type="submit" size="icon" className="h-12 w-12 flex-shrink-0">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </section>

      {/* --- 2. Categorías --- */}
      <section className="container">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">
          Explorar por Categoría
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categorias.map((cat) => {
            const Icono = getCategoryIcon(cat.nombre);
            return (
              <Link
                href={`/categorias/${encodeURIComponent(cat.nombre.toLowerCase())}`}
                key={cat.id_categoria_g}
                className="group"
              >
                <div className="flex flex-col items-center justify-center gap-3 p-4 border rounded-lg transition-all hover:shadow-md hover:-translate-y-1 text-center bg-background">
                  <Icono className="h-8 w-8 text-primary" />
                  <p className="font-medium">{cat.nombre}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- 3. Negocios --- */}
      <section className="container pb-24">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">
          Negocios Destacados
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
