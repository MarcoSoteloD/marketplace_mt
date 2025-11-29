// app/(admin)/gestion-categorias/editar/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getCategoriaGlobalById } from '@/lib/data/global-categories';
import { Card, CardHeader, CardTitle,  CardDescription, CardContent } from '@/components/ui/card';
import { FormularioEditarCategoria } from './FormularioEditarCategoria';

// Esta página recibe 'params' con el [id] de la URL
export default async function PaginaEditarCategoria({ 
  params 
}: { 
  params: { id: string } 
}) {
  
  const id = Number(params.id);
  
  // Buscamos la categoría en la BD
  const categoria = await getCategoriaGlobalById(id);

  // Si no existe, mostramos un 404
  if (!categoria) {
    notFound();
  }

  // Si existe, renderizamos el formulario y le pasamos los datos
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