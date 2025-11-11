// app/(gestor)/productos/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProductosByNegocioId, getCategoriasByNegocioId } from '@/lib/db';
import { redirect } from "next/navigation";
import { Prisma } from '@prisma/client';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';

// Importamos los componentes cliente
import { ProductoForm } from './ProductoForm'; // El formulario que ya creamos
import { ListaProductosAgrupados } from './ListaProductosAgrupados'; // El que vamos a crear
import { createProductoAction } from './actions';

// --- Definimos los tipos que necesitamos (la solución que encontramos) ---
type ProductosArray = Prisma.PromiseReturnType<typeof getProductosByNegocioId>;
type ProductoConCategoria = ProductosArray[number];
// ---

export default async function PaginaProductos() {

    const session = await getServerSession(authOptions);
    if (!session?.user?.negocioId) redirect("/login");

    const negocioId = session.user.negocioId;

    // 1. Obtenemos AMBOS datos en paralelo
    const [productos, categorias] = await Promise.all([
        getProductosByNegocioId(negocioId),
        getCategoriasByNegocioId(negocioId) // Para el dropdown del formulario
    ]);

    // 2. --- Lógica de Agrupación (Tu idea) ---
    // Creamos un objeto donde cada "key" es un nombre de categoría
    // y cada "value" es un array de productos.
    const productosAgrupados = productos.reduce((acc, producto) => {
        const categoriaNombre = producto.categorias_producto?.nombre || "Sin Categoría";

        if (!acc[categoriaNombre]) {
            acc[categoriaNombre] = []; // Inicializa el array si no existe
        }

        acc[categoriaNombre].push(producto);
        return acc;
    }, {} as Record<string, ProductoConCategoria[]>); // El tipo del acumulador

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">
                Gestión de Productos
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* --- Columna Izquierda: Formulario de Creación --- */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Crear Producto</CardTitle>
                            <CardDescription>
                                Añade un nuevo producto a tu menú o catálogo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Le pasamos las categorías, la action de CREAR, y el texto */}
                            <ProductoForm
                                categorias={categorias}
                                action={createProductoAction}
                                submitText="Crear Producto"
                            // No pasamos 'producto' (porque es nuevo)
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* --- Columna Derecha: Lista de Productos Agrupados --- */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mis Productos</CardTitle>
                            <CardDescription>
                                Lista de todos tus productos, agrupados por categoría.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Le pasamos los productos ya agrupados al componente cliente */}
                            <ListaProductosAgrupados
                                groupedProducts={productosAgrupados}
                                totalProducts={productos.length}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}