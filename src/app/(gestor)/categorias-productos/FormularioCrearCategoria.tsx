// app/(gestor)/categorias-producto/FormularioCrearCategoria.tsx
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { createCategoriaAction, CategoriaState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast"; // Usando tu ruta de hooks
import { useEffect, useRef } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} className="w-full">
      {pending ? 'Creando...' : 'Crear Categoría'}
    </Button>
  );
}

export function FormularioCrearCategoria() {
  const initialState: CategoriaState = undefined;
  const [state, dispatch] = useFormState(createCategoriaAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });
      // Si tuvo éxito, limpiamos el formulario
      if (state.success) {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-4">
      
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" placeholder="Coloca el nombre de la nueva categoría" required />
        {state?.errors?.nombre && (
          <p className="text-sm text-red-500">{state.errors.nombre.join(', ')}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción (Opcional)</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
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