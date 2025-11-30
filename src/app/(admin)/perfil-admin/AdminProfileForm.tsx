"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { updatePerfilAction, PerfilState } from '../../(public)/perfil/actions';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface AdminUser {
  nombre: string | null;
  email: string;
  telefono: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save className="w-4 h-4 mr-2" />
      {pending ? 'Guardando...' : 'Guardar Cambios'}
    </Button>
  );
}

// Usamos la interfaz en las props
export default function AdminProfileForm({ user }: { user: AdminUser }) { 
  const { toast } = useToast();
  
  const initialState: PerfilState = undefined;
  const [state, dispatch] = useFormState(updatePerfilAction, initialState);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "default" : "destructive",
        title: state.success ? "Actualizado" : "Error",
        description: state.message,
      });
      
      if (state.success) {
         window.location.reload(); 
      }
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Personales</CardTitle>
        <CardDescription>Información básica de tu cuenta de administrador.</CardDescription>
      </CardHeader>
      
      <form action={dispatch}>
        <CardContent className="space-y-4">
          
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input 
              id="nombre" 
              name="nombre" 
              defaultValue={user?.nombre || ''} 
              required 
            />
            {state?.errors?.nombre && <p className="text-sm text-red-500">{state.errors.nombre[0]}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              defaultValue={user?.email || ''} 
              disabled 
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input 
              id="telefono" 
              name="telefono" 
              type="tel" 
              defaultValue={user?.telefono || ''}
            />
          </div>

        </CardContent>
        <CardFooter className="border-t px-6 py-4 justify-end">
          {state?.errors?._form && <p className="text-sm text-red-500 mr-auto">{state.errors._form[0]}</p>}
          <SubmitButton/>
        </CardFooter>
      </form>
    </Card>
  );
}