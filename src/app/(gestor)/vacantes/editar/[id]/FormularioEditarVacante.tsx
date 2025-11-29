"use client";

import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { updateVacanteAction, VacanteState } from '../../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { useEffect } from 'react';
import type { vacantes } from '@prisma/client';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} className="w-full">
      {pending ? 'Actualizando...' : 'Actualizar Vacante'}
    </Button>
  );
}

export function FormularioEditarVacante({ 
  vacante 
}: { 
  vacante: vacantes 
}) {
  const router = useRouter();
  const initialState: VacanteState = undefined;

  // Atamos el ID de la vacante a la server action
  const updateActionWithId = updateVacanteAction.bind(null, vacante.id_vacante);
  
  const [state, dispatch] = useFormState(updateActionWithId, initialState);
  const { toast } = useToast();

  // Efecto para mostrar Toasts y redirigir
  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });

      // Si fue exitoso, esperamos y redirigimos a la lista
      if (state.success) {
        const timer = setTimeout(() => {
          router.push('/vacantes');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      
      <div className="grid gap-2">
        <Label htmlFor="titulo">Título de la Vacante</Label>
        <Input 
          id="titulo" 
          name="titulo" 
          defaultValue={vacante.titulo}
          required 
        />
        {state?.errors?.titulo && (
          <p className="text-sm text-red-500">{state.errors.titulo[0]}</p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="puesto">Puesto (Opcional)</Label>
        <Input 
          id="puesto" 
          name="puesto" 
          defaultValue={vacante.puesto || ''}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="salario">Salario (Opcional)</Label>
        <Input 
          id="salario" 
          name="salario" 
          type="number" 
          step="0.01" 
          defaultValue={vacante.salario?.toString() || ''}
        />
        {state?.errors?.salario && (
          <p className="text-sm text-red-500">{state.errors.salario[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contacto">Información de Contacto (Opcional)</Label>
        <Input 
          id="contacto" 
          name="contacto" 
          placeholder="Ej: 312-555-0199 o empleos@minegocio.com"
          defaultValue={vacante.contacto || ''} 
        />
        <p className="text-xs text-muted-foreground">
          El email o teléfono que verán los interesados.
        </p>
        {state?.errors?.contacto && (
          <p className="text-sm text-red-500">{state.errors.contacto[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={vacante.descripcion}
          required
        />
        {state?.errors?.descripcion && (
          <p className="text-sm text-red-500">{state.errors.descripcion[0]}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="activo" 
          name="activo" 
          defaultChecked={vacante.activo || false} 
        />
        <Label htmlFor="activo">Vacante activa</Label>
      </div>

      {state?.errors?._form && (
         <p className="text-sm text-red-500">{state.errors._form[0]}</p>
      )}
      
      <SubmitButton />
    </form>
  );
}