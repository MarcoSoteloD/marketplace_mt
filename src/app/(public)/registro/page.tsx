"use client";

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { createClienteAction, RegistroState } from './actions';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react'; 

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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.message && state.errors) {
      toast({
        variant: "destructive",
        title: "Atención",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <main className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-start pt-12 md:pt-16 px-4 pb-12 bg-stone-50/30">
      
      <Card className="w-full max-w-md rounded-3xl shadow-lg border-stone-100">
        <form action={dispatch}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-stone-700">Crear Cuenta</CardTitle>
            <CardDescription>
              Únete a Manos Tonilenses para empezar a pedir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Campo Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-stone-700">Nombre Completo</Label>
              <Input id="nombre" name="nombre" placeholder="Ej. Juan Pérez" className="rounded-full" required />
              {state?.errors?.nombre && (
                <p className="text-xs text-red-500 ml-2">{state.errors.nombre[0]}</p>
              )}
            </div>

            {/* Campo Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-stone-700">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="tu@email.com" className="rounded-full" required />
              {state?.errors?.email && (
                <p className="text-xs text-red-500 ml-2">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-stone-700">Contraseña</Label>
              <div className="relative">
                <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    className="rounded-full pr-10" 
                    required 
                    minLength={8} 
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground ml-2">
                Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.
              </p>
              {state?.errors?.password && (
                <p className="text-xs text-red-500 ml-2">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-stone-700">Confirmar Contraseña</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type={showPassword ? "text" : "password"} 
                className="rounded-full" 
                required 
              />
              {state?.errors?.confirmPassword && (
                <p className="text-xs text-red-500 ml-2">{state.errors.confirmPassword[0]}</p>
              )}
            </div>
            
            {state?.errors?._form && (
              <p className="text-sm text-red-500 text-center">{state.errors._form[0]}</p>
            )}

          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-0"> 
            <SubmitButton />
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="font-medium text-orange-600 hover:underline">
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}