// app/(admin)/categorias/page.tsx

import Link from 'next/link';
import { getCategoriasGlobales } from '@/lib/db'; // Importamos la función
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
// Importamos el formulario que crearemos a continuación
import { FormularioCrearCategoria } from './FormularioCrearCategoria';
import { getCategoryIcon } from '@/lib/icon-map';

export default async function PaginaCategorias() {

  // Obtenemos los datos en el servidor
  const categorias = await getCategoriasGlobales();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Administración de Categorías Globales</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Columna Izquierda: Formulario de Creación */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Categoría Global</CardTitle>
              <CardDescription>
                Crea una categoría que los negocios podrán usar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Usamos un Server Component (página) que contiene 
              un Client Component (formulario) para mejor UX.
            */}
              <FormularioCrearCategoria />
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Lista de Categorías */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Categorías Globales</CardTitle>
              <CardDescription>
                Lista de todas las categorías en la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categorias.length > 0 ? (
                <ul className="divide-y">
                  {categorias.map((cat) => {

                    // --- AÑADE ESTA LÍNEA ---
                    const Icono = getCategoryIcon(cat.nombre);
                    // --- FIN DE LA LÍNEA ---

                    return (
                      <li
                        key={cat.id_categoria_g}
                        className="flex justify-between items-center p-3"
                      >
                        <div className="flex items-center gap-3"> {/* Contenedor flex */}

                          {/* --- AÑADE EL ICONO --- */}
                          <Icono className="h-5 w-5 text-muted-foreground" />
                          {/* --- FIN DEL ICONO --- */}

                          <div>
                            <p className="font-medium">{cat.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              {cat.descripcion || 'Sin descripción'}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/categorias/editar/${cat.id_categoria_g}`}>
                            Editar
                          </Link>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground">
                  No hay categorías globales creadas.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}