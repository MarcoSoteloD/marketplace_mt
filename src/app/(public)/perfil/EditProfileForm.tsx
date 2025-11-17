"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { updatePerfilAction, PerfilState } from './actions';
import { useSession, signOut } from 'next-auth/react'; // Para los valores por defecto
import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="rounded-full bg-orange-600 hover:bg-orange-500 w-full" aria-disabled={pending} disabled={pending}>{pending ? 'Guardando...' : 'Guardar Cambios'}</Button>;
}

export default function PerfilPage() { 
  const { data: session, status, update } = useSession(); // 'update' refresca la sesión
  const { toast } = useToast();
  
  // OBTENEMOS LA ACCIÓN DE LIMPIAR
  const clearCart = useCartStore((state) => state.clearCart);

  const initialState: PerfilState = undefined;
  const [state, dispatch] = useFormState(updatePerfilAction, initialState);

  // ACTUALIZAMOS EL HANDLER
  const handleLogout = () => {
    clearCart();
    signOut({ callbackUrl: '/' }); // Al salir, lo mandamos a la raíz pública
  };

  // Efecto para el toast
  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });
      // Si tuvo éxito, forzamos la actualización de la sesión
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
    // Quitamos el rounded-3xl de aquí, no es necesario
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <form action={dispatch}>
        {/* --- 1. AÑADIMOS LA CLASE AQUÍ --- */}
        <Card className="rounded-2xl"> 
          <CardHeader>
            <CardTitle className="text-stone-700">Datos Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-stone-700">Nombre Completo</Label>
              <Input 
                id="nombre" 
                name="nombre" 
                defaultValue={session?.user?.name || ''} 
                required 
                className="rounded-full"
              />
              {state?.errors?.nombre && <p className="text-sm text-red-500">{state.errors.nombre[0]}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-stone-700">Email (Solo lectura)</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                defaultValue={session?.user?.email || ''} 
                disabled
                className="rounded-full"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="telefono" className="text-stone-700">Teléfono (Opcional)</Label>
              <Input 
                id="telefono" 
                name="telefono" 
                type="tel" 
                defaultValue={(session?.user as any)?.telefono || ''}
                className="rounded-full"
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            {state?.errors?._form && <p className="text-sm text-red-500 mr-auto">{state.errors._form[0]}</p>}
            <SubmitButton/>
          </CardFooter>
        </Card>
      </form>
      
      {/* --- 2. Y AÑADIMOS LA CLASE AQUÍ --- */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-stone-700">Sesión</CardTitle>
          <CardDescription>
            Cierra tu sesión actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full rounded-full text-stone-700 hover:text-red-500" 
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}