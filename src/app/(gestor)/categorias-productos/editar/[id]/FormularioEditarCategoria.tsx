// app/(gestor)/categorias-producto/editar/[id]/FormularioEditarCategoria.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { updateCategoriaAction, CategoriaState } from '../../actions'; // Importamos la action
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useEffect } from 'react';
import type { categorias_producto } from '@prisma/client';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} className="w-full">
      {pending ? 'Guardando...' : 'Actualizar Categoría'}
    </Button>
  );
}

export function FormularioEditarCategoria({ 
  categoria 
}: { 
  categoria: categorias_producto 
}) {
  const router = useRouter();
  const initialState: CategoriaState = undefined;

  // Atamos el ID a la server action
  const updateActionWithId = updateCategoriaAction.bind(null, categoria.id_categoria);
  
  const [state, dispatch] = useFormState(updateActionWithId, initialState);
  const { toast } = useToast();

  // Efecto para mostrar Toasts y redirigir (como en el Admin)
  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });

      if (state.success) {
        const timer = setTimeout(() => {
          router.push('/categorias-productos');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input 
          id="nombre" 
          name="nombre" 
          defaultValue={categoria.nombre}
          required 
        />
        {state?.errors?.nombre && (
          <p className="text-sm text-red-500">{state.errors.nombre.join(', ')}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción (Opcional)</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={categoria.descripcion || ''}
          placeholder="¿De qué trata esta categoría?"
        />
      </div>

      {state?.errors?._form && (
         <p className="text-sm text-red-500">{state.errors._form[0]}</p>
      )}

      <SubmitButton />
    </form>
  );
}