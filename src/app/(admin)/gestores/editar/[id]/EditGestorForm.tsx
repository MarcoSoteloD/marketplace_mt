// app/(admin)/gestores/editar/[id]/EditGestorForm.tsx
"use client";

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

// Importamos TODAS las actions que usaremos
import {
  updateGestorInfoAction,
  UpdateGestorState,
  toggleGestorStatusAction,
  deleteGestorYNegocioAction
} from '../../actions';

// Importamos los tipos de Prisma
import type { usuarios, negocios } from '@prisma/client';

// Componentes de Shadcn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch'; // El nuevo switch
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Para eliminar
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Tipo para los props (el gestor con su negocio anidado)
type GestorConNegocio = usuarios & {
  negocios: negocios | null;
};

// ----- Componentes de Botones con Estado -----
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" aria-disabled={pending} disabled={pending}>{pending ? 'Guardando...' : text}</Button>;
}
function DeleteButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="destructive" aria-disabled={pending} disabled={pending}>{pending ? 'Eliminando...' : 'Eliminar Permanentemente'}</Button>;
}
// ----- Fin de Botones -----


export function EditGestorForm({ gestorConNegocio }: { gestorConNegocio: GestorConNegocio }) {
  const { toast } = useToast();
  const router = useRouter();
  
  // Estado de transición para los botones (switch y eliminar) que no usan useFormState
  const [isPending, startTransition] = useTransition();

  // --- Lógica para Formulario 1: Actualizar Info Gestor ---
  const initialState: UpdateGestorState = undefined;
  const updateActionWithId = updateGestorInfoAction.bind(null, gestorConNegocio.id_usuario);
  const [state, dispatch] = useFormState(updateActionWithId, initialState);

  // Efecto para los toasts de éxito/error del Form 1
  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "default" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });
      // (No redirigimos, nos quedamos en la página)
    }
  }, [state, toast]);

  // --- Lógica para Card 3: Activar/Desactivar ---
  const handleToggleStatus = async (newStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleGestorStatusAction(
        gestorConNegocio.id_usuario,
        gestorConNegocio.id_negocio!,
        newStatus
      );
      
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "¡Éxito!" : "Error",
        description: result.message,
      });
      // Si el estado se actualiza, Next.js revalidará los datos
      // y el 'gestorConNegocio.activo' se refrescará
    });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* --- Card 1: Editar Datos del Gestor --- */}
      <form action={dispatch}>
        <Card>
          <CardHeader>
            <CardTitle>1. Datos del Gestor</CardTitle>
            <CardDescription>
              Actualiza el nombre, email o teléfono del usuario gestor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="gestorNombre">Nombre Completo</Label>
              <Input id="gestorNombre" name="gestorNombre" defaultValue={gestorConNegocio.nombre} required />
              {state?.errors?.gestorNombre && <p className="text-sm text-red-500">{state.errors.gestorNombre[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gestorEmail">Email</Label>
              <Input id="gestorEmail" name="gestorEmail" type="email" defaultValue={gestorConNegocio.email} required />
              {state?.errors?.gestorEmail && <p className="text-sm text-red-500">{state.errors.gestorEmail[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gestorTelefono">Teléfono (Opcional)</Label>
              <Input id="gestorTelefono" name="gestorTelefono" type="tel" defaultValue={gestorConNegocio.telefono || ''} />
            </div>
            {state?.errors?._form && <p className="text-sm text-red-500">{state.errors._form[0]}</p>}
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton text="Actualizar Gestor" />
          </CardFooter>
        </Card>
      </form>

      {/* --- Card 2: Datos del Negocio (Solo Lectura) --- */}
      <Card>
        <CardHeader>
          <CardTitle>2. Datos del Negocio</CardTitle>
          <CardDescription>
            La información del negocio solo puede ser editada por el propio gestor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Nombre del Negocio</Label>
            <Input defaultValue={gestorConNegocio.negocios?.nombre || 'N/A'} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Slug (URL)</Label>
            <Input defaultValue={gestorConNegocio.negocios?.slug || 'N/A'} disabled />
          </div>
        </CardContent>
      </Card>

      {/* --- Card 3: Acciones de Cuenta (Activar/Desactivar) --- */}
      <Card>
        <CardHeader>
          <CardTitle>3. Acciones de Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activar/Desactivar Cuenta */}
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div className="flex flex-col">
              <Label htmlFor="status-switch" className="font-medium">
                Estado de la Cuenta
              </Label>
              <span className="text-sm text-muted-foreground">
                Activa o desactiva al gestor y su negocio.
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={gestorConNegocio.activo ? "default" : "destructive"}>
                {gestorConNegocio.activo ? "Activo" : "Inactivo"}
              </Badge>
              <Switch
                id="status-switch"
                checked={gestorConNegocio.activo || false}
                onCheckedChange={handleToggleStatus}
                disabled={isPending || !gestorConNegocio.id_negocio}
              />
            </div>
          </div>

          {/* Futuro: Reseteo de Contraseña */}
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div className="flex flex-col">
              <Label className="font-medium">Reestablecer Contraseña</Label>
              <span className="text-sm text-muted-foreground">
                Envía un email al gestor para reestablecer su contraseña (función futura).
              </span>
            </div>
            <Button variant="outline" disabled>Enviar Email</Button>
          </div>
        </CardContent>
      </Card>

      {/* --- Card 4: Zona de Peligro (Eliminar) --- */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">4. Zona de Peligro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Eliminar este gestor es una acción permanente. 
            Se borrará su cuenta de usuario y el negocio asociado
            (incluyendo todos sus productos, pedidos y vacantes).
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto" disabled={isPending || !gestorConNegocio.id_negocio}>
                Eliminar Gestor y Negocio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente 
                  al gestor <span className="font-bold">{gestorConNegocio.nombre}</span> 
                  y su negocio <span className="font-bold">{gestorConNegocio.negocios?.nombre}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <form action={() => startTransition(async () => {
                  await deleteGestorYNegocioAction(
                    gestorConNegocio.id_usuario, 
                    gestorConNegocio.id_negocio!
                  );
                })}>
                  <AlertDialogAction asChild>
                    <DeleteButton />
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
        </CardContent>
      </Card>
      
      <Button variant="outline" asChild className="mt-4">
        <Link href="/gestores">← Volver a la lista de gestores</Link>
      </Button>
    </div>
  );
}