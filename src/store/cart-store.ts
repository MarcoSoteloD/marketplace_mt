// src/store/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // (Opcional, pero genial para que el carrito sobreviva si refrescas la página)
import type { productos } from '@prisma/client';

/**
 * Definimos el tipo para un item DENTRO del carrito.
 * Es el producto de Prisma + la cantidad.
 */
export type CartItem = productos & {
  quantity: number;
};

/**
 * Definimos la forma (el "State") de nuestro almacén
 */
interface CartState {
  items: CartItem[];
  negocioId: number | null; // <-- ¡La regla de "un solo negocio"!
  
  // Acciones (los "setters")
  addItem: (producto: productos, negocioIdDelProducto: number) => void;
  removeItem: (productoId: number) => void;
  updateItemQuantity: (productoId: number, newQuantity: number) => void;
  clearCart: () => void;
}

/**
 * ¡Aquí creamos el store!
 * Implementamos la lógica que discutimos.
 */
export const useCartStore = create<CartState>()(
  // 'persist' (opcional) guarda el carrito en localStorage
  persist(
    (set, get) => ({
      // --- ESTADO INICIAL ---
      items: [],
      negocioId: null,

      // --- ACCIÓN: AÑADIR ITEM ---
      addItem: (producto, negocioIdDelProducto) => {
        const { items, negocioId } = get(); // Obtiene el estado actual
        
        // --- REGLA DE NEGOCIO: Carrito de otro negocio ---
        // Si el 'negocioId' guardado es diferente al del nuevo producto...
        if (negocioId !== null && negocioId !== negocioIdDelProducto) {
          // ¡VACIAR EL CARRITO! Y empezar uno nuevo.
          set({
            items: [{ ...producto, quantity: 1 }],
            negocioId: negocioIdDelProducto,
          });
          return; // Termina la función
        }

        // --- Lógica normal: Mismo negocio o carrito vacío ---
        const existingItem = items.find(item => item.id_producto === producto.id_producto);

        if (existingItem) {
          // Si el item ya existe, solo incrementa la cantidad
          const updatedItems = items.map(item =>
            item.id_producto === producto.id_producto
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: updatedItems });
        } else {
          // Si es un item nuevo, lo añade al array
          set({
            items: [...items, { ...producto, quantity: 1 }],
            negocioId: negocioIdDelProducto, // Asigna el ID si era el primer item
          });
        }
      },

      // --- ACCIÓN: ACTUALIZAR CANTIDAD (ej. 1 -> 3) ---
      updateItemQuantity: (productoId, newQuantity) => {
        set((state) => ({
          items: state.items
            .map(item =>
              item.id_producto === productoId
                ? { ...item, quantity: newQuantity }
                : item
            )
            // Si la cantidad es 0 o menos, lo filtramos (es lo mismo que 'removeItem')
            .filter(item => item.quantity > 0),
        }));
      },

      // --- ACCIÓN: ELIMINAR ITEM (botón de 'X') ---
      removeItem: (productoId) => {
        set((state) => ({
          items: state.items.filter(item => item.id_producto !== productoId),
        }));
      },

      // --- ACCIÓN: VACIAR CARRITO ---
      clearCart: () => {
        set({ items: [], negocioId: null });
      },
    }),
    {
      name: 'cart-storage', // Nombre de la cookie en localStorage
    }
  )
);