// app/(gestor)/categorias-producto/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCategoriasByNegocioId } from '@/lib/db';
import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

// Importamos los componentes cliente que crearemos a continuación
import { FormularioCrearCategoria } from './FormularioCrearCategoria';
import { ListaCategorias } from './ListaCategorias';

export default async function PaginaCategoriasProducto() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  // Obtenemos las categorías que SÓLO pertenecen a este negocio
  const categorias = await getCategoriasByNegocioId(session.user.negocioId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        Categorías de Productos
      </h1>
      <p className="text-muted-foreground">
        En estas categorías podrás meter tus productos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Formulario de Creación */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Categoría</CardTitle>
              <CardDescription>
                Crea una nueva categoría para tu negocio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioCrearCategoria />
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Lista de Categorías */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mis Categorías</CardTitle>
              <CardDescription>
                Lista de todas las categorías de tu negocio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pasamos las categorías al componente cliente */}
              <ListaCategorias categorias={categorias} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}