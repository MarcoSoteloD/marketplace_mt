// app/(gestor)/perfil-gestor/page.tsx
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { updatePerfilAction, PerfilState } from './actions';
import { useSession } from 'next-auth/react'; // Para los valores por defecto
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader'; // El spinner que ya creamos

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" aria-disabled={pending} disabled={pending}>{pending ? 'Guardando...' : 'Guardar Cambios'}</Button>;
}

export default function PerfilPage() {
  const { data: session, status, update } = useSession(); // 'update' refresca la sesión
  const { toast } = useToast();
  
  const initialState: PerfilState = undefined;
  const [state, dispatch] = useFormState(updatePerfilAction, initialState);

  // Efecto para el toast
  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });
      // Si tuvo éxito, forzamos la actualización de la sesión
      // para que el nombre se refresque en el Sidebar
      if (state.success) {
        update(); 
      }
    }
  }, [state, toast, update]);

  // Muestra 'Cargando...' mientras se obtiene la sesión
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Mi Perfil</h1>
      <form action={dispatch}>
        <Card>
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input 
                id="nombre" 
                name="nombre" 
                defaultValue={session?.user?.name || ''} 
                required 
              />
              {state?.errors?.nombre && <p className="text-sm text-red-500">{state.errors.nombre[0]}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Solo lectura)</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                defaultValue={session?.user?.email || ''} 
                disabled 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono (Opcional)</Label>
              <Input 
                id="telefono" 
                name="telefono" 
                type="tel" 
                defaultValue={(session?.user as any)?.telefono || ''} // Usamos 'any' para un tipo simple
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            {state?.errors?._form && <p className="text-sm text-red-500 mr-auto">{state.errors._form[0]}</p>}
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}