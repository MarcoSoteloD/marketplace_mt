"use client";

import { useState, useEffect, useTransition } from 'react';
import type { categorias_producto } from '@prisma/client';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { deleteCategoriaAction, reorderCategoriasAction } from './actions';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

export function ListaCategorias({ categorias: initialCategorias }: { categorias: categorias_producto[] }) {
  // Estado local para manejo visual inmediato
  const [categorias, setCategorias] = useState(initialCategorias);
  
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Sincronizar si el servidor manda nuevos datos (ej. al crear una nueva)
  useEffect(() => {
    setCategorias(initialCategorias);
  }, [initialCategorias]);

  // --- Lógica de Reordenamiento ---
  const updateOrder = (newCategorias: categorias_producto[]) => {
    // Actualizamos visualmente ya
    setCategorias(newCategorias);

    // Preparamos el payload para el servidor (id y su nuevo índice)
    const updates = newCategorias.map((cat, index) => ({
        id_categoria: cat.id_categoria,
        orden: index // El índice del array es el nuevo orden
    }));

    // Guardamos en segundo plano (Optimistic UI)
    startTransition(async () => {
        await reorderCategoriasAction(updates);
        // No mostramos toast de éxito cada vez para no spamear, solo si falla
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return; // Ya es el primero
    const newCats = [...categorias];
    // Intercambiamos
    [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
    updateOrder(newCats);
  };

  const moveDown = (index: number) => {
    if (index === categorias.length - 1) return; // Ya es el último
    const newCats = [...categorias];
    // Intercambiamos
    [newCats[index + 1], newCats[index]] = [newCats[index], newCats[index + 1]];
    updateOrder(newCats);
  };

  // --- Lógica de Eliminar ---
  const handleDelete = (categoriaId: number) => {
    startTransition(async () => {
      const result = await deleteCategoriaAction(categoriaId);
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "Éxito" : "Error",
        description: result.message,
      });
    });
  };

  if (categorias.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
        <p className="text-muted-foreground">No has creado ninguna categoría todavía.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-medium text-muted-foreground">Orden de visualización</h3>
            {isPending && <span className="text-xs text-orange-600 animate-pulse">Guardando orden...</span>}
        </div>

        <ul className="divide-y border rounded-xl overflow-hidden bg-white shadow-sm">
        {categorias.map((cat, index) => (
            <li
            key={cat.id_categoria}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
            >
            {/* Columna Izquierda: Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 border-stone-200 text-stone-500">
                        {index + 1}
                    </Badge>
                    <p className="font-semibold text-stone-800">{cat.nombre}</p>
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                {cat.descripcion || <span className="italic opacity-50">Sin descripción</span>}
                </p>
            </div>

            {/* Columna Derecha: Controles */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                
                {/* Botones de Orden */}
                <div className="flex items-center bg-stone-100 rounded-md p-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-sm hover:bg-white hover:shadow-sm disabled:opacity-30"
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || isPending}
                        title="Subir"
                    >
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-sm hover:bg-white hover:shadow-sm disabled:opacity-30"
                        onClick={() => moveDown(index)}
                        disabled={index === categorias.length - 1 || isPending}
                        title="Bajar"
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                </div>

                <div className="h-4 w-px bg-stone-200 mx-1" />

                {/* Botones de Acción */}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Link href={`/categorias-productos/editar/${cat.id_categoria}`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>

                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isPending} className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará <b>"{cat.nombre}"</b>. Los productos pasarán a no tener categoría, pero no se borrarán.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <form action={() => handleDelete(cat.id_categoria)}>
                            <Button variant="destructive" type="submit" disabled={isPending}>
                            {isPending ? "Eliminando..." : "Eliminar"}
                            </Button>
                        </form>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            </li>
        ))}
        </ul>
    </div>
  );
}