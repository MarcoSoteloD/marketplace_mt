import { searchPlataforma } from "@/lib/data/search";
import type { searchPlataforma as searchPlataformaType } from "@/lib/data/search";
import { NegocioCard } from "@/components/NegocioCard";
import { ProductoSearchResultCard } from "@/components/ProductoSearchResultado";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Package, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function PaginaBuscar({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  
  let negocios: Awaited<ReturnType<typeof searchPlataformaType>>["negocios"] = [];
  let productos: Awaited<ReturnType<typeof searchPlataformaType>>["productos"] = [];

  if (query) {
    const results = await searchPlataforma(query);
    negocios = results.negocios;
    productos = results.productos;
  }

  const totalResultados = negocios.length + productos.length;

  return (
    <div className="container py-12 md:py-16">
      {/* --- Encabezado y Barra de Búsqueda --- */}
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl md:text-5xl text-stone-700 font-bold tracking-tight">
          {query
            ? `Resultados para "${query}"`
            : "Realiza una búsqueda"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mt-4">
          {query
            ? `Encontramos ${totalResultados} resultados.`
            : "Encuentra negocios y productos en un solo lugar."}
        </p>

        {/* Repetimos la barra aquí para conveniencia */}
        <form
          className="mt-6 flex w-full max-w-lg items-center space-x-2 "
          action="/buscar"
          method="GET"
        >
          <Input
            type="search"
            name="q"
            defaultValue={query} // Ponemos la búsqueda actual
            placeholder="¿Qué estás buscando? (Ej. tacos, peluquería...)"
            className="h-12 text-base text-stone-700 flex-1 rounded-full"
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 flex-shrink-0 bg-orange-600 hover:bg-orange-500 rounded-full"
          >
            <Search className="h-5 w-5 " />
          </Button>
        </form>
      </div>

      {/* --- Pestañas de Resultados --- */}
      {!query ? (
        <p className="text-center text-muted-foreground">
            Escribe algo en la barra de búsqueda para empezar.
        </p>
      ) : totalResultados === 0 ? (
        // --- Estado Vacío (Si hubo búsqueda pero sin resultados) ---
        <div className="flex flex-col items-center justify-center text-center gap-4 py-16 max-w-lg mx-auto border bg-background rounded-2xl shadow-sm">
          <SearchX className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-stone-700">
            No encontramos nada
          </h2>
          <p className="text-muted-foreground">
            Intenta con otras palabras clave.
          </p>
        </div>
      ) : (
        // --- Pestañas con Resultados ---
        <Tabs defaultValue="negocios" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 rounded-full">
            <TabsTrigger value="negocios" className="h-10 rounded-full">
              <Building className="h-4 w-4 mr-2" />
              Negocios ({negocios.length})
            </TabsTrigger>
            <TabsTrigger value="productos" className="h-10 rounded-full">
              <Package className="h-4 w-4 mr-2" />
              Productos ({productos.length})
            </TabsTrigger>
          </TabsList>

          {/* Contenido Pestaña Negocios */}
          <TabsContent value="negocios" className="mt-8">
            {negocios.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {negocios.map((negocio) => (
                  // Dejamos 'as any' aquí porque NegocioCard espera el modelo COMPLETO,
                  // pero nuestra consulta 'select' solo trae los campos que usa.
                  <NegocioCard key={negocio.id_negocio} negocio={negocio as any} /> 
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No se encontraron negocios con ese nombre.
              </p>
            )}
          </TabsContent>

          {/* Contenido Pestaña Productos */}
          <TabsContent value="productos" className="mt-8">
            {productos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productos.map((producto) => (
                  <ProductoSearchResultCard
                    key={producto.id_producto}
                    producto={producto} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No se encontraron productos con ese nombre.
              </p>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}