// app/(gestor)/productos/editar/[id]/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCategoriasByNegocioId, getProductoById } from '@/lib/db';
import { notFound, redirect } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ProductoForm } from '../../ProductoForm'; // Importamos el formulario
import { updateProductoAction } from '../../actions'; // Importamos la action de UPDATE

export default async function PaginaEditarProducto({ 
  params 
}: { 
  params: { id: string } 
}) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  const negocioId = session.user.negocioId;
  const productoId = Number(params.id);

  // 1. Obtenemos los datos en paralelo
  const [producto, categorias] = await Promise.all([
    getProductoById(productoId, negocioId), // Solo trae el producto de ESTE negocio
    getCategoriasByNegocioId(negocioId)
  ]);

  // 2. Si no se encontró el producto (o no es del gestor), 404
  if (!producto) {
    notFound();
  }

  // 3. "Atamos" el ID del producto a la Server Action
  const updateActionWithId = updateProductoAction.bind(null, producto.id_producto);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Editar Producto</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{producto.nombre}</CardTitle>
          <CardDescription>
            Modifica los detalles de tu producto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 4. Le pasamos al formulario:
            - Las categorías (para el dropdown)
            - El producto (para llenar los campos)
            - La action de 'update' (con el ID atado)
            - El texto del botón
          */}
          <ProductoForm 
            categorias={categorias} 
            producto={producto}
            action={updateActionWithId}
            submitText="Actualizar Producto"
          />
        </CardContent>
      </Card>
    </div>
  );
}