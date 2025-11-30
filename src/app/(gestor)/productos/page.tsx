import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProductosByNegocioId, getCategoriasByNegocioId } from '@/lib/data/products';
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProductoForm } from './ProductoForm';
import { ListaProductosAgrupados } from './ListaProductosAgrupados';
import { createProductoAction } from './actions';

export default async function PaginaProductos() {

    const session = await getServerSession(authOptions);
    if (!session?.user?.negocioId) redirect("/login");

    const negocioId = session.user.negocioId;

    // Obtenemos datos ya limpios desde el servidor
    const [productos, categorias] = await Promise.all([
        getProductosByNegocioId(negocioId),
        getCategoriasByNegocioId(negocioId) 
    ]);

    // Agrupación por Categoría
    const productosAgrupados = productos.reduce((acc, producto) => {
        const categoriaNombre = producto.categorias_producto?.nombre || "Sin Categoría";

        if (!acc[categoriaNombre]) {
            acc[categoriaNombre] = [];
        }

        acc[categoriaNombre].push(producto);
        return acc;
    }, {} as Record<string, typeof productos>);

    return (
        <div className="flex flex-col gap-6 pb-24">
            <h1 className="text-3xl font-bold tracking-tight text-stone-800">Gestión de Productos</h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* --- Columna Izquierda: Formulario --- */}
                <div className="xl:col-span-1">
                    <Card className="sticky top-6 rounded-3xl shadow-sm border-stone-200">
                        <CardHeader className="bg-stone-50/50 pb-4 border-b">
                            <CardTitle className="text-xl text-stone-700">Nuevo Producto</CardTitle>
                            <CardDescription>
                                Agrega un platillo o artículo a tu menú.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ProductoForm
                                categorias={categorias}
                                action={createProductoAction}
                                submitText="Crear Producto"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* --- Columna Derecha: Lista --- */}
                <div className="xl:col-span-2">
                    <Card className="rounded-3xl shadow-sm border-stone-200 h-full">
                        <CardHeader className="bg-stone-50/50 pb-4 border-b">
                            <CardTitle className="text-xl text-stone-700">Tu Catálogo</CardTitle>
                            <CardDescription>
                                Tienes {productos.length} productos registrados.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
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