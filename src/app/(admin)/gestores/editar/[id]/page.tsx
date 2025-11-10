// app/(admin)/gestores/editar/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getGestorConNegocioById } from '@/lib/db'; // Importamos la función de DB
import { EditGestorForm } from './EditGestorForm'; // Importamos el formulario que crearemos

export default async function PaginaEditarGestor({
  params
}: {
  params: { id: string }
}) {
  
  const id = Number(params.id);
  
  // 1. Buscamos al gestor y su negocio en la BD
  const gestorConNegocio = await getGestorConNegocioById(id);

  // 2. Si no existe (o no es un 'gestor'), mostramos un 404
  if (!gestorConNegocio) {
    notFound();
  }

  // 3. Si existe, renderizamos el formulario cliente 
  //    y le pasamos todos los datos.
  return (
    <div className="max-w-3xl mx-auto">
      <EditGestorForm gestorConNegocio={gestorConNegocio} />
    </div>
  );
}