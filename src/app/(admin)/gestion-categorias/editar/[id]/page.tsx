// app/(admin)/gestion-categorias/editar/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getCategoriaGlobalById } from '@/lib/db';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { FormularioEditarCategoria } from './FormularioEditarCategoria'; // Lo crearemos ahora

// Esta página recibe 'params' con el [id] de la URL
export default async function PaginaEditarCategoria({ 
  params 
}: { 
  params: { id: string } 
}) {
  
  const id = Number(params.id);
  
  // 1. Buscamos la categoría en la BD
  const categoria = await getCategoriaGlobalById(id);

  // 2. Si no existe, mostramos un 404
  if (!categoria) {
    notFound();
  }

  // 3. Si existe, renderizamos el formulario y le pasamos los datos
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Categoría Global</CardTitle>
        <CardDescription>
          Modifica el nombre o la descripción de la categoría.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Le pasamos la 'categoria' al formulario cliente */}
        <FormularioEditarCategoria categoria={categoria} />
      </CardContent>
    </Card>
  );
}