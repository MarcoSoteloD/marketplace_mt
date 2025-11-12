// app/(gestor)/vacantes/FormularioCrearVacante.tsx
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { createVacanteAction, VacanteState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} className="w-full">
      {pending ? 'Publicando...' : 'Publicar Vacante'}
    </Button>
  );
}

export function FormularioCrearVacante() {
  const initialState: VacanteState = undefined;
  const [state, dispatch] = useFormState(createVacanteAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });
      if (state.success) {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-4">
      
      <div className="grid gap-2">
        <Label htmlFor="titulo">Título de la Vacante</Label>
        <Input id="titulo" name="titulo" placeholder="Ej: Mesero" required />
        {state?.errors?.titulo && (
          <p className="text-sm text-red-500">{state.errors.titulo[0]}</p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="puesto">Puesto (Opcional)</Label>
        <Input id="puesto" name="puesto" placeholder="Ej: Tiempo Completo" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="salario">Salario (Opcional)</Label>
        <Input id="salario" name="salario" type="number" step="0.01" placeholder="Ej: 8000.00" />
        {state?.errors?.salario && (
          <p className="text-sm text-red-500">{state.errors.salario[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          placeholder="Responsabilidades, requisitos, etc."
          required
        />
        {state?.errors?.descripcion && (
          <p className="text-sm text-red-500">{state.errors.descripcion[0]}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="activo" name="activo" defaultChecked={true} />
        <Label htmlFor="activo">Marcar como activa al publicar</Label>
      </div>

      {state?.errors?._form && (
         <p className="text-sm text-red-500">{state.errors._form[0]}</p>
      )}
      
      <SubmitButton />
    </form>
  );
}