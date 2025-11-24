"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, ImageIcon } from "lucide-react";
import { useCartStore } from "@/store/cart-store"; 
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface ProductoModalProps {
  producto: any; 
  negocioId: number;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

export function ProductDetailModal({ producto, negocioId, isOpen, onClose }: ProductoModalProps) {
  const [cantidad, setCantidad] = useState(1);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  // --- Lógica de Precios ---
  const tienePromo = producto?.promo_activa;
  const precioRegular = Number(producto?.precio || 0);
  const precioFinal = tienePromo && producto?.precio_promo 
      ? Number(producto.precio_promo) 
      : precioRegular;

  const handleIncrement = () => setCantidad(prev => prev + 1);
  const handleDecrement = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    for (let i = 0; i < cantidad; i++) {
      addItem(producto, negocioId);
    }

    toast({
      variant: "success",
      title: "Agregado al carrito",
      description: `${cantidad}x ${producto.nombre} añadido.`,
    });
    
    setCantidad(1); 
    onClose(false); 
  };

  if (!producto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl gap-0">
        
        {/* --- IMAGEN GRANDE (Header) --- */}
        {/* CAMBIO: bg-white en lugar de bg-muted para que se vea limpia */}
        <div className="relative h-64 w-full bg-white">
          {producto.url_foto ? (
            <CloudinaryImage
              src={producto.url_foto}
              alt={producto.nombre}
              fill
              // CAMBIO: object-contain + p-4
              // - object-contain: Muestra la imagen completa sin recortes.
              // - p-4: Le da aire alrededor para que no toque los bordes.
              className="object-contain p-4"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-muted">
              <ImageIcon className="h-16 w-16 opacity-20" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* --- ENCABEZADO --- */}
          <div>
            <div className="flex justify-between items-start gap-2">
              <DialogTitle className="text-2xl font-bold text-stone-700 leading-tight">
                {producto.nombre}
              </DialogTitle>
              <div className="text-right shrink-0">
                 {/* Precio */}
                 <div className="flex flex-col items-end">
                    {tienePromo && producto.tipo_promo === 'DESCUENTO_SIMPLE' && (
                        <span className="text-sm text-muted-foreground line-through decoration-red-400 decoration-2">
                            {formatCurrency(precioRegular)}
                        </span>
                    )}
                    <span className={`text-xl font-bold ${tienePromo ? 'text-red-600' : 'text-stone-700'}`}>
                        {formatCurrency(precioFinal)}
                    </span>
                 </div>
              </div>
            </div>
            
            {/* Badges de Promo */}
            {tienePromo && (
               <div className="mt-2 flex gap-2">
                  {producto.tipo_promo === 'DOS_POR_UNO' && <Badge className="bg-red-600 hover:bg-red-700 text-white">¡2x1!</Badge>}
                  {producto.tipo_promo === 'TRES_POR_DOS' && <Badge className="bg-red-600 hover:bg-red-700 text-white">¡3x2!</Badge>}
               </div>
            )}
          </div>

          <Separator />

          {/* --- DESCRIPCIÓN COMPLETA --- */}
          <div className="max-h-[150px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200">
             <DialogDescription className="text-base text-stone-600 leading-relaxed">
                {producto.descripcion || "Sin descripción detallada."}
             </DialogDescription>
          </div>

          {/* --- CONTROLES DE CANTIDAD Y AGREGAR --- */}
          <DialogFooter className="pt-4 flex-row items-center gap-4 sm:justify-between">
             
             {/* Selector de Cantidad */}
             <div className="flex items-center gap-3 border rounded-full px-3 py-1 bg-stone-50 shrink-0">
                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-stone-200"
                  onClick={handleDecrement}
                  disabled={cantidad <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold text-lg w-6 text-center text-stone-700 tabular-nums">{cantidad}</span>
                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-stone-200"
                  onClick={handleIncrement}
                >
                  <Plus className="h-4 w-4" />
                </Button>
             </div>

             {/* Botón Agregar */}
             <Button 
                className="flex-1 rounded-full bg-orange-600 hover:bg-orange-500 text-white gap-2 h-12 text-base shadow-md hover:shadow-lg transition-all"
                onClick={handleAddToCart}
             >
                <ShoppingCart className="h-5 w-5" />
                <span>Agregar {formatCurrency(precioFinal * cantidad)}</span>
             </Button>
          </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
}