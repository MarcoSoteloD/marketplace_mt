"use client";

import Link from "next/link";
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { CldImage } from 'next-cloudinary';
import { Edit, Trash2, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteProductoAction, reactivateProductoAction } from './actions';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type ProductosArray = Prisma.PromiseReturnType<typeof import('@/lib/db').getProductosByNegocioId>;
type ProductoConCategoria = ProductosArray[number];

function formatCurrency(amount: number | null | undefined | Prisma.Decimal) {
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
  const [isPending, startTransition] = useTransition();

  const categorias = Object.keys(groupedProducts);

  // --- Lógica para Eliminar (Desactivar) ---
  const handleDelete = (productoId: number) => {
    startTransition(async () => {
      const result = await deleteProductoAction(productoId);
      toast({
        variant: result.success ? "success" : "destructive",
        title: result.success ? "¡Desactivado!" : "Error",
        description: result.message,
      });
    });
  };

  // --- Lógica para Reactivar ---
  const handleReactivate = (productoId: number) => {
    startTransition(async () => {
      const result = await reactivateProductoAction(productoId);
      toast({
        variant: result.success ? "success" : "destructive",
        title: result.success ? "¡Reactivado!" : "Error",
        description: result.message,
      });
    });
  };

  if (totalProducts === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/50">
        <p className="text-muted-foreground">No has creado ningún producto todavía.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categorias.map((categoriaNombre) => (
        <div key={categoriaNombre}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-stone-700">
            {categoriaNombre}
            <Badge variant="outline" className="text-xs font-normal rounded-full px-2">
              {groupedProducts[categoriaNombre].length}
            </Badge>
          </h3>

          <div className="space-y-3">
            {groupedProducts[categoriaNombre].map((producto) => {
              // --- Lógica Visual de Promoción ---
              const tienePromo = producto.promo_activa;
              const precioRegular = Number(producto.precio);
              const precioPromo = producto.precio_promo ? Number(producto.precio_promo) : precioRegular;

              let promoLabel = "";
              if (tienePromo) {
                if (producto.tipo_promo === 'DOS_POR_UNO') promoLabel = "2x1";
                else if (producto.tipo_promo === 'TRES_POR_DOS') promoLabel = "3x2";
                else if (producto.tipo_promo === 'DESCUENTO_SIMPLE') {
                  if (precioRegular > precioPromo) {
                    const descuento = Math.round(((precioRegular - precioPromo) / precioRegular) * 100);
                    promoLabel = `-${descuento}%`;
                  } else {
                    promoLabel = "Oferta";
                  }
                }
              }

              return (
                <div
                  key={producto.id_producto}
                  className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-3 border rounded-xl bg-card shadow-sm transition-shadow ${!producto.activo ? 'opacity-60 bg-stone-50 border-dashed' : 'hover:shadow-md'}`}
                >
                  {/* Imagen */}
                  <div className="relative h-16 w-16 flex-shrink-0">
                    {producto.url_foto ? (
                      <CldImage
                        src={producto.url_foto}
                        fill
                        alt={producto.nombre}
                        className={`rounded-lg object-cover ${!producto.activo ? 'grayscale' : ''}`}
                        sizes="64px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}

                    {tienePromo && producto.activo && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <Badge className="bg-red-600 hover:bg-red-700 shadow-sm px-1.5 h-5 text-[10px] rounded-md">
                          {promoLabel}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info Principal */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-stone-800 truncate">{producto.nombre}</p>
                        {!producto.activo && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-stone-400 text-stone-500">Inactivo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {producto.descripcion || <span className="italic opacity-50">Sin descripción</span>}
                      </p>
                    </div>

                    {/* Precios */}
                    <div className="flex items-center md:justify-end gap-3">
                      <div className="flex flex-col items-start md:items-end min-w-[80px]">
                        {tienePromo && producto.activo ? (
                          <>
                            {producto.tipo_promo === 'DESCUENTO_SIMPLE' && precioRegular > precioPromo && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatCurrency(precioRegular)}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-red-600">
                                {formatCurrency(precioPromo)}
                              </span>
                              {producto.tipo_promo !== 'DESCUENTO_SIMPLE' && (
                                <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1 rounded uppercase">
                                  {promoLabel}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="font-medium text-stone-700">
                            {formatCurrency(precioRegular)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Separador móvil */}
                  <div className="h-px bg-border sm:hidden w-full my-1" />

                  {/* Acciones */}
                  <div className="flex items-center justify-end gap-1 sm:ml-auto">

                    {/* Botón Editar */}
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
                      <Link href={`/productos/editar/${producto.id_producto}`}>
                        <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Link>
                    </Button>

                    {/* --- LÓGICA CONDICIONAL: ELIMINAR vs REACTIVAR --- */}
                    {producto.activo ? (
                      // ESTADO ACTIVO: Muestra botón de eliminar (Desactivar)
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isPending} className="h-8 w-8 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Desactivar producto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              El producto <b>"{producto.nombre}"</b> dejará de estar visible para los clientes, pero permanecerá en tu historial.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <form action={() => handleDelete(producto.id_producto)}>
                              <Button variant="destructive" type="submit" disabled={isPending}>
                                {isPending ? "Desactivando..." : "Desactivar"}
                              </Button>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      // ESTADO INACTIVO: Muestra botón de Reactivar
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={() => handleReactivate(producto.id_producto)}
                        className="h-8 w-8 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Reactivar producto"
                      >
                        <RefreshCcw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}