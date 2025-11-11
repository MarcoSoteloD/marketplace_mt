// app/(gestor)/categorias-productos/ListaCategorias.tsx
"use client";

import type { categorias_producto } from '@prisma/client';
import Link from 'next/link';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteCategoriaAction } from './actions';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
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

// Botón de eliminar (para manejar el estado 'pending')
function DeleteButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <AlertDialogAction
      disabled={isPending}
      onClick={(e) => {
        // Debemos pasar la acción al startTransition
        // El 'form' exterior se encargará de llamar a la action
      }}
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </AlertDialogAction>
  );
}

export function ListaCategorias({ categorias }: { categorias: categorias_producto[] }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition(); // Para el feedback

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
      <p className="text-center text-muted-foreground">
        No has creado ninguna categoría todavía.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {categorias.map((cat) => (
        <li
          key={cat.id_categoria}
          className="flex justify-between items-center p-3"
        >
          <div>
            <p className="font-medium">{cat.nombre}</p>
            <p className="text-sm text-muted-foreground">
              {cat.descripcion || 'Sin descripción'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/categorias-productos/editar/${cat.id_categoria}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará la categoría
                    <span className="font-bold"> "{cat.nombre}"</span>.
                    (Los productos en esta categoría no se borrarán, pero quedarán "sin categoría").
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  {/* Usamos un <form> para que el botón llame a la action */}
                  <form action={() => handleDelete(cat.id_categoria)}>
                    <Button variant="destructive" type="submit" disabled={isPending}>
                      {isPending ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </li>
      ))}
    </ul>
  );
}