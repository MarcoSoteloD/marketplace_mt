import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 
import type { productos } from '@prisma/client';

export type CartItem = productos & {
  quantity: number;
  comentarios?: string;
};

interface CartState {
  items: CartItem[];
  
  addItem: (producto: productos, negocioIdDelProducto: number) => void;
  removeItem: (productoId: number) => void;
  updateItemQuantity: (productoId: number, newQuantity: number) => void;
  updateItemComment: (productoId: number, comment: string) => void;
  clearItemsByNegocio: (negocioId: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (newItems) => {
        set({ items: newItems });
      },

      addItem: (producto) => {
        const { items } = get(); 
        const existingItem = items.find(item => item.id_producto === producto.id_producto);

        if (existingItem) {
          const updatedItems = items.map(item =>
            item.id_producto === producto.id_producto
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: updatedItems });
        } else {
          set({
            items: [...items, { ...producto, quantity: 1, comentarios: "" }], 
          });
        }
      },

      updateItemQuantity: (productoId, newQuantity) => {
        set((state) => ({
          items: state.items
            .map(item =>
              item.id_producto === productoId
                ? { ...item, quantity: newQuantity }
                : item
            )
            .filter(item => item.quantity > 0),
        }));
      },

      updateItemComment: (productoId, comment) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id_producto === productoId
              ? { ...item, comentarios: comment }
              : item
          ),
        }));
      },

      removeItem: (productoId) => {
        set((state) => ({
          items: state.items.filter(item => item.id_producto !== productoId),
        }));
      },

      clearItemsByNegocio: (negocioId) => {
        set((state) => ({
          items: state.items.filter(item => item.id_negocio !== negocioId),
        }));
      },

      clearCart: () => {
        set({ items: [] }); 
      },
    }),
    {
      name: 'cart-storage', 
    }
  )
);