// app/(gestor)/productos/ProductoForm.tsx
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { createProductoAction, ProductoState } from './actions'; // Importamos la de crear
import type { productos, categorias_producto } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // <-- ¡NUEVO! npx shadcn-ui@latest add select
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" aria-disabled={pending} disabled={pending}>{pending ? 'Guardando...' : text}</Button>;
}

interface ProductoFormProps {
  // Las categorías son obligatorias (para el dropdown)
  categorias: categorias_producto[];
  // El producto es opcional (solo existe si estamos 'editando')
  producto?: productos | null; 
}

export function ProductoForm({ categorias, producto }: ProductoFormProps) {
  
  // TODO: En el futuro, aquí elegiremos entre 'create' y 'update'
  const action = createProductoAction; 
  const initialState: ProductoState = undefined;
  
  const [state, dispatch] = useFormState(action, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });
      // Si tuvo éxito, no redirigimos (la action 'create' ya lo hace)
      // Si estuviéramos en 'update', nos quedaríamos aquí.
    }
  }, [state, toast]);

  return (
    <form action={dispatch} className="space-y-6">
      
      {/* Campo Nombre */}
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre del Producto</Label>
        <Input id="nombre" name="nombre" defaultValue={producto?.nombre || ''} required />
        {state?.errors?.nombre && <p className="text-sm text-red-500">{state.errors.nombre[0]}</p>}
      </div>

      {/* Campo Descripción */}
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción (Opcional)</Label>
        <Textarea id="descripcion" name="descripcion" defaultValue={producto?.descripcion || ''} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo Precio */}
        <div className="grid gap-2">
          <Label htmlFor="precio">Precio</Label>
          <Input 
            id="precio" 
            name="precio" 
            type="number" 
            step="0.01" // Para centavos
            defaultValue={producto?.precio?.toString() || ''} 
            required 
          />
          {state?.errors?.precio && <p className="text-sm text-red-500">{state.errors.precio[0]}</p>}
        </div>

        {/* Campo Categoría (Dropdown) */}
        <div className="grid gap-2">
          <Label htmlFor="id_categoria">Categoría</Label>
          <Select name="id_categoria" defaultValue={producto?.id_categoria?.toString() || ''} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.length === 0 ? (
                <SelectItem value="null" disabled>Primero crea una categoría</SelectItem>
              ) : (
                categorias.map(cat => (
                  <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                    {cat.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {state?.errors?.id_categoria && <p className="text-sm text-red-500">{state.errors.id_categoria[0]}</p>}
        </div>
      </div>

      {/* Campo Foto del Producto */}
      <div className="grid gap-2">
        <Label htmlFor="url_foto">Foto del Producto (Opcional)</Label>
        {producto?.url_foto && (
          <div className="my-2">
            <p className="text-sm text-muted-foreground mb-2">Imagen actual:</p>
            <CldImage
              src={producto.url_foto}
              width="100"
              height="100"
              alt="Foto actual"
              className="rounded-md object-cover"
              crop={{ type: "fill", source: true }}
            />
          </div>
        )}
        <Input id="url_foto" name="url_foto" type="file" accept="image/png, image/jpeg, image/webp" />
        <p className="text-sm text-muted-foreground">
          {producto?.url_foto ? "Sube una nueva foto para reemplazar la actual." : "Sube una foto (Max 5MB)."}
        </p>
        {state?.errors?.url_foto && <p className="text-sm text-red-500">{state.errors.url_foto[0]}</p>}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        {state?.errors?._form && (
          <p className="text-sm text-red-500 mr-auto">{state.errors._form[0]}</p>
        )}
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancelar
        </Button>
        <SubmitButton text={producto ? "Actualizar Producto" : "Crear Producto"} />
      </div>
    </form>
  );
}