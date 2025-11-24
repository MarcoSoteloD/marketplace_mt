"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { useSession } from "next-auth/react";
import { saveCartToDB, getCartFromDB } from "@/app/(public)/carrito/sync-actions";

export function CartSynchronizer() {
  const { data: session } = useSession();
  const { items, setItems } = useCartStore();
  
  // Usamos refs para evitar ciclos infinitos o guardar datos viejos
  const isFirstMount = useRef(true);

  // EFECTO DE CARGA INICIAL (Al loguearse o recargar)
  useEffect(() => {
    async function loadCart() {
      if (session?.user) {
        const dbItems = await getCartFromDB();
        
        // ESTRATEGIA DE FUSIÓN:
        // Si el carrito local está vacío y hay datos en BD -> Usamos BD.
        // Si el carrito local TIENE datos (usuario compraba como invitado) -> Mantenemos local y luego sobrescribirá BD.
        if (items.length === 0 && dbItems.length > 0) {
          setItems(dbItems);
        }
      }
    }
    
    if (session?.user) {
      loadCart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]); // Solo ejecutamos cuando cambia el usuario (Login)

  // EFECTO DE GUARDADO (Cada vez que el carrito cambia)
  useEffect(() => {
    // Evitamos guardar en el primer render para no borrar datos remotos con un array vacío inicial
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (session?.user) {
        // Guardamos silenciosamente en el fondo
        saveCartToDB(items);
      }
    }, 1000); // Debounce de 1s para no saturar la BD mientras escribes o das click rápido

    return () => clearTimeout(timer);
  }, [items, session]);

  return null; // Este componente no pinta nada visualmente
}