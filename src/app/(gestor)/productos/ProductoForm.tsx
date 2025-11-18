// app/(gestor)/productos/ProductoForm.tsx
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { ProductoState } from './actions'; 
import type { productos, categorias_producto } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
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
} from "@/components/ui/select";
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" aria-disabled={pending} disabled={pending}>{pending ? 'Guardando...' : text}</Button>;
}

interface ProductoFormProps {
  categorias: categorias_producto[];
  producto?: productos | null;
  action: (prevState: ProductoState, formData: FormData) => Promise<ProductoState>;
  submitText: string;
}

export function ProductoForm({ categorias, producto, action, submitText }: ProductoFormProps) {
  
  const initialState: ProductoState = undefined;
  const [state, dispatch] = useFormState(action, initialState);
  const { toast } = useToast();
  const router = useRouter();

  // Usamos useRef
  const formRef = useRef<HTMLFormElement>(null);

  // Estado EXCLUSIVO para limpiar el Select de Shadcn
  const [selectResetKey, setSelectResetKey] = useState(0);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });

      // Lógica de limpieza
      if (state.success && !producto) {
        // A) Limpia inputs nativos (Texto, Precio, Archivo)
        formRef.current?.reset(); 
        
        // B) Fuerza al Select a redibujarse desde cero (limpiando la selección visual)
        setSelectResetKey(prev => prev + 1); 
      }
    }
  }, [state, toast, producto]);

  return (
    // Conectamos el ref al form
    <form ref={formRef} action={dispatch} className="space-y-6">
      
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
            step="0.01" 
            defaultValue={producto?.precio?.toString() || ''} 
            required 
          />
          {state?.errors?.precio && <p className="text-sm text-red-500">{state.errors.precio[0]}</p>}
        </div>

        {/* Campo Categoría */}
        <div className="grid gap-2 w-full max-w-full"> 
          <Label htmlFor="id_categoria">Categoría</Label>
          
          <Select 
            key={selectResetKey} 
            name="id_categoria" 
            defaultValue={producto?.id_categoria?.toString() || ''} 
            required
          >
            <SelectTrigger className="w-full overflow-hidden">
              <span className="truncate text-left w-full block">
                <SelectValue placeholder="Selecciona una categoría" />
              </span>
            </SelectTrigger>
            <SelectContent>
              {categorias.length === 0 ? (
                <SelectItem value="null" disabled>Primero crea una categoría</SelectItem>
              ) : (
                categorias.map(cat => (
                  <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                     <span className="truncate block max-w-[250px]">
                        {cat.nombre}
                     </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {state?.errors?.id_categoria && <p className="text-sm text-red-500">{state.errors.id_categoria[0]}</p>}
        </div>
      </div>

      {/* Campo Foto */}
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

      <div className="flex justify-end gap-4">
        {state?.errors?._form && (
          <p className="text-sm text-red-500 mr-auto">{state.errors._form[0]}</p>
        )}
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancelar
        </Button>
        <SubmitButton text={submitText} />
      </div>
    </form>
  );
}