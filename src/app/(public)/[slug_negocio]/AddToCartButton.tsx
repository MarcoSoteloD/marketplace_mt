// app/(public)/[slug_negocio]/AddToCartButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/cart-store"; // Importamos nuestro store
import type { productos } from "@prisma/client";
import { Plus } from "lucide-react";

interface AddToCartButtonProps {
  producto: productos;
  negocioId: number;
}

export function AddToCartButton({ producto, negocioId }: AddToCartButtonProps) {
  const { toast } = useToast();
  
  // 1. Obtenemos la acción 'addItem' de nuestro store
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // 2. Llamamos a la acción con el producto y el ID del negocio
    addItem(producto, negocioId);

    // 3. Mostramos una notificación de éxito
    toast({
      title: "¡Producto añadido!",
      description: `Se añadió "${producto.nombre}" a tu carrito.`,
      variant: "success", // (Tu toast verde)
    });
  };

  return (
    <Button 
      size="icon" 
      className="absolute bg-orange-600 hover:bg-orange-500 bottom-2 right-2 h-8 w-8" // Posición y tamaño
      onClick={handleAddToCart}
      aria-label="Añadir al carrito"
    >
      <Plus className="h-4 w-4" />
    </Button>
  );
}