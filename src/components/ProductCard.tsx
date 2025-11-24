"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Plus } from "lucide-react";
import { ProductDetailModal } from "./ProductDetailModal";

// Helper rápido para moneda
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

interface ProductCardProps {
  producto: any;
  negocioId: number;
}

export function ProductCard({ producto, negocioId }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LÓGICA DE PRECIOS ---
  const tienePromo = producto.promo_activa;
  const precioRegular = Number(producto.precio);
  const precioFinal = tienePromo && producto.precio_promo 
      ? Number(producto.precio_promo) 
      : precioRegular;
  
  let porcentajeDescuento = 0;
  let promoLabel = "";
  
  if (tienePromo) {
      if (producto.tipo_promo === 'DOS_POR_UNO') promoLabel = "¡2x1!";
      else if (producto.tipo_promo === 'TRES_POR_DOS') promoLabel = "¡3x2!";
      else if (producto.tipo_promo === 'DESCUENTO_SIMPLE' && precioRegular > 0) {
          porcentajeDescuento = Math.round(((precioRegular - precioFinal) / precioRegular) * 100);
          if (porcentajeDescuento > 0) promoLabel = `-${porcentajeDescuento}%`;
      }
  }

  return (
    <>
      <Card 
          onClick={() => setIsModalOpen(true)}
          className="relative flex flex-col rounded-3xl h-full shadow-md group transition-all duration-300 hover:shadow-xl cursor-pointer border-transparent hover:border-orange-100 active:scale-95"
      >
          {/* --- BADGE --- */}
          {tienePromo && promoLabel && (
              <div className="absolute top-3 left-3 z-20">
                  <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 px-2 py-1 text-xs font-bold shadow-md rounded-full">
                      {promoLabel}
                  </Badge>
              </div>
          )}

          {/* --- IMAGEN --- */}
          <div className="relative h-48 w-full overflow-hidden rounded-t-3xl bg-white"> 
              {producto.url_foto ? (
                  <CloudinaryImage
                      src={producto.url_foto}
                      alt={producto.nombre}
                      fill
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                  />
              ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground/30 bg-muted">
                      <ImageIcon className="h-10 w-10" />
                  </div>
              )}
              
              {/* Overlay sutil al hover para indicar click */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>

          {/* --- INFO --- */}
          <div className="p-3 flex flex-col flex-1 justify-between"> 
              <div>
                  <h4 className="font-semibold text-stone-700 text-base leading-tight mb-1 line-clamp-2">
                    {producto.nombre}
                  </h4>
              </div>

              <div className="flex items-center justify-between mt-3">
                  <div className="flex flex-col">
                      {tienePromo && producto.tipo_promo === 'DESCUENTO_SIMPLE' && (
                          <span className="text-[10px] text-muted-foreground line-through">
                              {formatCurrency(precioRegular)}
                          </span>
                      )}
                      <p className={`font-bold ${tienePromo ? 'text-red-600' : 'text-stone-700'}`}>
                          {formatCurrency(precioFinal)}
                      </p>
                  </div>

                  {/* Botón visual "+" pequeño */}
                  <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <Plus className="h-5 w-5" />
                  </div>
              </div>
          </div>
      </Card>

      {/* --- EL MODAL --- */}
      <ProductDetailModal 
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        producto={producto}
        negocioId={negocioId}
      />
    </>
  );
}