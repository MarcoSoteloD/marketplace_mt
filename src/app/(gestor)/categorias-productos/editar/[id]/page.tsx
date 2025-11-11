// app/(gestor)/categorias-producto/editar/[id]/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCategoriaProductoById } from '@/lib/db';
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
// Importamos el formulario que crearemos a continuación
import { FormularioEditarCategoria } from './FormularioEditarCategoria';

export default async function PaginaEditarCategoriaProducto({ 
  params 
}: { 
  params: { id: string } 
}) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  const id = Number(params.id);
  
  // 1. Buscamos la categoría (solo si pertenece a este negocio)
  const categoria = await getCategoriaProductoById(id, session.user.negocioId);

  // 2. Si no existe, 404
  if (!categoria) {
    notFound();
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Categoría de Producto</CardTitle>
        <CardDescription>
          Modifica el nombre o la descripción de tu categoría.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 3. Pasamos la categoría al formulario cliente */}
        <FormularioEditarCategoria categoria={categoria} />
      </CardContent>
    </Card>
  );
}