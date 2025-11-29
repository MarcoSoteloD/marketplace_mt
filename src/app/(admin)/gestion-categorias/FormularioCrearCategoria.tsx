// app/(admin)/gestion-categorias/FormularioCrearCategoria.tsx

"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { createCategoriaGlobal, State } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

// Componente para el botón de Submit (para mostrar estado 'pending')
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} className="w-full">
      {pending ? 'Creando...' : 'Crear Categoría'}
    </Button>
  );
}

export function FormularioCrearCategoria() {
  const initialState: State = undefined;
  const [state, dispatch] = useFormState(createCategoriaGlobal, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state?.message && state.message !== lastMessage) {
      setLastMessage(state.message); // Evita toasts duplicados
      if (state.errors) {
        // Hubo un error
        toast({
          variant: "destructive",
          title: "Error al crear",
          description: state.message,
        });
      } else {
        // Fue exitoso
        toast({
          title: "¡Éxito!",
          description: state.message,
        });
        formRef.current?.reset(); // Limpia el formulario
      }
    }
  }, [state, toast, lastMessage]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-4">
      
      {/* Campo Nombre */}
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" placeholder="Coloca el nombre de la categoría" required />
        {state?.errors?.nombre && (
          <p className="text-sm text-red-500">{state.errors.nombre.join(', ')}</p>
        )}
      </div>

      {/* Campo Descripción */}
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción (Opcional)</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          placeholder="¿De qué trata esta categoría?"
        />
      </div>

      <SubmitButton />
      
    </form>
  );
}