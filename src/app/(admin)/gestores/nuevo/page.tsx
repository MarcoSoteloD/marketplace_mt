// app/(admin)/gestores/nuevo/page.tsx
"use client";

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { createGestorYNegocio, CreateGestorState } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

// Botón de Submit con estado de carga
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {pending ? 'Creando...' : 'Crear Gestor y Negocio'}
    </Button>
  );
}

export default function PaginaCrearGestor() {
  const initialState: CreateGestorState = undefined;
  const [state, dispatch] = useFormState(createGestorYNegocio, initialState);
  const { toast } = useToast();

  // Efecto para mostrar toasts de error
  useEffect(() => {
    if (state?.message && state.errors) {
      toast({
        variant: "destructive",
        title: "Error al crear",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={dispatch} className="flex flex-col gap-6 max-w-3xl mx-auto">
      
      <h1 className="text-2xl font-semibold">Crear Nuevo Gestor y Negocio</h1>
      
      {/* Card 1: Datos del Gestor */}
      <Card>
        <CardHeader>
          <CardTitle>1. Datos del Gestor</CardTitle>
          <CardDescription>
            Esta será la cuenta de usuario para administrar el negocio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="gestorNombre">Nombre</Label>
            <Input id="gestorNombre" name="gestorNombre" required />
            {state?.errors?.gestorNombre && (
              <p className="text-sm text-red-500">{state.errors.gestorNombre[0]}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gestorEmail">Email</Label>
              <Input id="gestorEmail" name="gestorEmail" type="email" required />
              {state?.errors?.gestorEmail && (
                <p className="text-sm text-red-500">{state.errors.gestorEmail[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gestorPassword">Contraseña</Label>
              <Input id="gestorPassword" name="gestorPassword" type="password" required minLength={8} />
              {state?.errors?.gestorPassword && (
                <p className="text-sm text-red-500">{state.errors.gestorPassword[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gestorTelefono">Teléfono (Opcional)</Label>
            <Input id="gestorTelefono" name="gestorTelefono" type="tel" />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Datos del Negocio */}
      <Card>
        <CardHeader>
          <CardTitle>2. Datos del Negocio</CardTitle>
          <CardDescription>
            Información pública del negocio que se creará.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="negocioNombre">Nombre del Negocio</Label>
            <Input id="negocioNombre" name="negocioNombre" required />
            {state?.errors?.negocioNombre && (
              <p className="text-sm text-red-500">{state.errors.negocioNombre[0]}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="negocioSlug">Slug (URL)</Label>
            <Input id="negocioSlug" name="negocioSlug" placeholder="ej: mi-negocio-favorito" required />
            <p className="text-sm text-muted-foreground">
              Solo minúsculas, números y guiones. Sin espacios.
            </p>
            {state?.errors?.negocioSlug && (
              <p className="text-sm text-red-500">{state.errors.negocioSlug[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="negocioTelefono">Teléfono del Negocio (Opcional)</Label>
            <Input id="negocioTelefono" name="negocioTelefono" type="tel" />
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        {state?.errors?._form && (
          <p className="text-sm text-red-500 my-auto mr-4">{state.errors._form[0]}</p>
        )}
        <Button variant="outline" asChild>
          <Link href="/gestores">Cancelar</Link>
        </Button>
        <SubmitButton />
      </div>

    </form>
  );
}