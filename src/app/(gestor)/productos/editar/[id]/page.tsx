import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCategoriasByNegocioId, getProductoById } from '@/lib/data/products';
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProductoForm } from '../../ProductoForm';
import { updateProductoAction } from '../../actions';

export default async function PaginaEditarProducto({ 
  params 
}: { 
  params: { id: string }
}) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  const negocioId = session.user.negocioId;
  const productoId = Number(params.id);

  // Obtenemos los datos en paralelo
  const [productoRaw, categorias] = await Promise.all([
    getProductoById(productoId, negocioId), 
    getCategoriasByNegocioId(negocioId)
  ]);

  // Si no se encontró el producto (o no es del gestor), 404
  if (!productoRaw) {
    notFound();
  }

  // TRANSFORMACIÓN DE DATOS
  const producto = {
    ...productoRaw,
    precio: Number(productoRaw.precio),
    precio_promo: productoRaw.precio_promo ? Number(productoRaw.precio_promo) : null,
  };

  // "Atamos" el ID del producto a la Server Action
  const updateActionWithId = updateProductoAction.bind(null, producto.id_producto);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-semibold text-stone-800">Editar Producto</h1>
            <p className="text-sm text-muted-foreground">Modifica los detalles de tu producto.</p>
        </div>
      </div>
      
      <Card className="rounded-3xl shadow-sm border-stone-200">
        <CardHeader className="bg-stone-50/50 pb-4 border-b">
          <CardTitle className="text-xl text-stone-700">{producto.nombre}</CardTitle>
          <CardDescription>
            ID: {producto.id_producto}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
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