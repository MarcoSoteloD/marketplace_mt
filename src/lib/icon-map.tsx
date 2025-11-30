// src/lib/icon-map.tsx

import {
  LucideIcon,
  ForkKnife,    // Para Restaurante
  Scissors,       // Para Peluquería
  Tag,            // Icono por defecto
  ShoppingBasket,   // Para Tiendas
  Shirt,          // Para Ropa
  Hammer          // Para Ferretería
  // ... (importen todos los iconos de lucide-react que requieran)
} from "lucide-react";

/**
 * Este es nuestro "mapa".
 * La clave DEBE estar en minúsculas para que las comparaciones no fallen.
 */
const iconMap: Record<string, LucideIcon> = {
  "restaurante": ForkKnife,
  "restaurantes": ForkKnife,
  "comida": ForkKnife,
  "peluquería": Scissors,
  "estética": Scissors,
  "barbería": Scissors,
  "tienda": ShoppingBasket,
  "ropa": Shirt,
  "ferretería": Hammer,
};

// Este es el icono que se usará si no encontramos una coincidencia
const DefaultIcon = Tag; 

/**
 * Esta es la función que usarás en toda tu aplicación.
 * Recibe un nombre de categoría y devuelve el componente de icono correcto.
 */
export function getCategoryIcon(name: string): LucideIcon {
  if (!name) return DefaultIcon;
  
  // Convertimos el nombre a minúsculas para buscar en el mapa
  const key = name.toLowerCase();
  
  // Buscamos en el mapa. Si no lo encuentra, devuelve el icono por defecto.
  return iconMap[key] || DefaultIcon;
}