"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { updatePerfilAction, PerfilState } from './actions';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Definimos la interfaz para el usuario
interface UserProfile {
  nombre?: string | null;
  name?: string | null;
  email?: string | null;
  telefono?: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="rounded-full bg-orange-600 hover:bg-orange-500 text-white px-8" aria-disabled={pending} disabled={pending}>
        {pending ? 'Guardando...' : 'Actualizar Información'}
    </Button>
  );
}

// Usamos la interfaz en las props
export default function EditProfileForm({ user }: { user: UserProfile }) { 
  const { toast } = useToast();
  
  const initialState: PerfilState = undefined;
  const [state, dispatch] = useFormState(updatePerfilAction, initialState);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Actualizado!" : "Error",
        description: state.message,
      });
      
      if (state.success) {
         window.location.reload(); 
      }
    }
  }, [state, toast]);

  return (
    <Card className="rounded-3xl border-stone-200 shadow-sm"> 
      <CardHeader>
        <CardTitle className="text-xl text-stone-700">Información Personal</CardTitle>
        <CardDescription>Actualiza tu nombre y teléfono de contacto.</CardDescription>
      </CardHeader>
      
      <form action={dispatch}>
        <CardContent className="space-y-5">
          
          <div className="grid gap-2">
            <Label htmlFor="nombre" className="text-stone-600">Nombre Completo</Label>
            <Input 
              id="nombre" 
              name="nombre" 
              defaultValue={user?.nombre || user?.name || ''} 
              required 
              className="rounded-xl bg-stone-50 border-stone-200 focus-visible:ring-orange-500"
            />
            {state?.errors?.nombre && <p className="text-sm text-red-500">{state.errors.nombre[0]}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-stone-600">Correo Electrónico</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              defaultValue={user?.email || ''} 
              disabled
              className="rounded-xl bg-stone-100 text-stone-500 border-transparent cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">El correo no se puede cambiar.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefono" className="text-stone-600">Teléfono</Label>
            <Input 
              id="telefono" 
              name="telefono" 
              type="tel" 
              defaultValue={user?.telefono || ''}
              placeholder="Ej. 312 123 4567"
              className="rounded-xl bg-stone-50 border-stone-200 focus-visible:ring-orange-500"
            />
          </div>

        </CardContent>
        <CardFooter className="justify-end border-t bg-stone-50/50 p-6 rounded-b-3xl">
          {state?.errors?._form && <p className="text-sm text-red-500 mr-auto">{state.errors._form[0]}</p>}
          <SubmitButton/>
        </CardFooter>
      </form>
    </Card>
  );
}