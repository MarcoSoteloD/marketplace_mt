// app/(gestor)/productos/ListaProductosAgrupados.tsx
"use client";

import Link from "next/link";
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { CldImage } from 'next-cloudinary';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

// --- ¡AQUÍ VAN TUS IMPORTS! ---
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteProductoAction } from './actions'; // La action de eliminar
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
// ---

// --- Definimos los tipos (la solución que encontramos) ---
type ProductosArray = Prisma.PromiseReturnType<typeof import('@/lib/db').getProductosByNegocioId>;
type ProductoConCategoria = ProductosArray[number];
// ---

// Helper para formatear el precio (con la corrección)
function formatCurrency(amount: number | null | undefined) {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(amount)); 
}

interface ListaProductosProps {
  groupedProducts: Record<string, ProductoConCategoria[]>;
  totalProducts: number;
}

export function ListaProductosAgrupados({ groupedProducts, totalProducts }: ListaProductosProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition(); // Hook de cliente

  const categorias = Object.keys(groupedProducts);

  // --- Lógica de Cliente para Eliminar ---
  const handleDelete = (productoId: number) => {
    startTransition(async () => {
      const result = await deleteProductoAction(productoId);
      toast({
        variant: result.success ? "success" : "destructive",
        title: result.success ? "¡Éxito!" : "Error",
        description: result.message,
      });
    });
  };

  if (totalProducts === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No has creado ningún producto todavía.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {categorias.map((categoriaNombre) => (
        <div key={categoriaNombre}>
          <h3 className="text-lg font-semibold mb-2">{categoriaNombre}</h3>
          
          <div className="divide-y border rounded-md">
            {groupedProducts[categoriaNombre].map((producto) => (
              <div 
                key={producto.id_producto} 
                className="flex items-center gap-4 p-3"
              >
                {/* Imagen (con el placeholder) */}
                {producto.url_foto ? (
                  <CldImage
                    src={producto.url_foto}
                    width="64" height="64" alt={producto.nombre}
                    className="rounded-md object-cover aspect-square bg-muted"
                    crop={{ type: "fill", source: true }}
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded-md">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="font-medium">{producto.nombre}</p>
                    <span className="text-sm text-muted-foreground">
                      {producto.categorias_producto?.nombre || 'Sin categoría'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="font-medium">{formatCurrency(Number(producto.precio))}</p>
                    <Badge variant={producto.activo ? "secondary" : "destructive"}>
                      {producto.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/productos/editar/${producto.id_producto}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    {/* --- BOTÓN DE ELIMINAR (CONECTADO) --- */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isPending} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el producto:
                            <span className="font-bold"> "{producto.nombre}"</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <form action={() => handleDelete(producto.id_producto)}>
                            <Button variant="destructive" type="submit" disabled={isPending}>
                              {isPending ? "Eliminando..." : "Eliminar"}
                            </Button>
                          </form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* --- FIN DEL BOTÓN --- */}
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-6 last:hidden" />
        </div>
      ))}
    </div>
  );
}