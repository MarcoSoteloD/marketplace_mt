// app/(public)/registro/page.tsx
"use client";

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { createClienteAction, RegistroState } from './actions'; // Importamos la action
import { useEffect } from 'react';

// Componentes de Shadcn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast'; // Usando tu ruta de hooks

// Botón de Submit que muestra estado de carga
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-full bg-orange-600 hover:bg-orange-500" aria-disabled={pending} disabled={pending}>
      {pending ? 'Creando cuenta...' : 'Crear Cuenta'}
    </Button>
  );
}

export default function PaginaRegistro() {
  const initialState: RegistroState = undefined;
  const [state, dispatch] = useFormState(createClienteAction, initialState);
  const { toast } = useToast();

  // Efecto para mostrar toasts de error (no de éxito, porque redirige)
  useEffect(() => {
    if (state?.message && state.errors) {
      toast({
        variant: "destructive",
        title: "Error al crear la cuenta",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <main className="flex min-h-[calc(100vh-112px)] items-center justify-center py-12 px-4">
      {/* 112px = h-14 (navbar) + h-24 (footer-md) approx. */}
      
      <Card className="w-full max-w-md rounded-3xl">
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="text-2xl text-stone-700">Registrarse</CardTitle>
            <CardDescription>
              Ingresa tus datos para registrarte en la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Campo Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-stone-700">Nombre</Label>
              <Input id="nombre" name="nombre" placeholder="Tu nombre" className="rounded-full" required />
              {state?.errors?.nombre && (
                <p className="text-sm text-red-500">{state.errors.nombre[0]}</p>
              )}
            </div>

            {/* Campo Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-stone-700">Email</Label>
              <Input id="email" name="email" type="email" placeholder="tu@email.com" className="rounded-full" required />
              {state?.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-stone-700">Contraseña</Label>
              <Input id="password" name="password" type="password" className="rounded-full" required minLength={8} />
              {state?.errors?.password && (
                <p className="text-sm text-red-500">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-stone-700">Confirmar Contraseña</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" className="rounded-full" required />
              {state?.errors?.confirmPassword && (
                <p className="text-sm text-red-500">{state.errors.confirmPassword[0]}</p>
              )}
            </div>
            
            {/* Error general del formulario */}
            {state?.errors?._form && (
              <p className="text-sm text-red-500">{state.errors._form[0]}</p>
            )}

          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}