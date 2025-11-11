// app/(gestor)/productos/nuevo/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCategoriasByNegocioId } from '@/lib/db'; // ¡Importamos las categorías!
import { redirect } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ProductoForm } from '../ProductoForm'; // El formulario reutilizable que crearemos

export default async function PaginaNuevoProducto() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  // 1. Cargar las categorías de este gestor en el servidor
  const categorias = await getCategoriasByNegocioId(session.user.negocioId);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Crear Nuevo Producto</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Producto</CardTitle>
          <CardDescription>
            Completa la información de tu nuevo producto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 2. Pasamos las categorías al formulario cliente.
               No pasamos un 'producto' (porque es nuevo).
          */}
          <ProductoForm categorias={categorias} />
        </CardContent>
      </Card>
    </div>
  );
}