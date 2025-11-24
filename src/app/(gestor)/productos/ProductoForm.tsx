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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import { TicketPercent } from 'lucide-react';

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

  // --- Controla si se muestra la sección de promos ---
  const [isPromoActive, setIsPromoActive] = useState(producto?.promo_activa || false);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });

      if (state.success) {
        if (!producto) {
          // --- CASO CREAR: Limpiamos el formulario ---
          formRef.current?.reset(); 
          setSelectResetKey(prev => prev + 1); 
          setIsPromoActive(false);
        } else {
          // --- CASO EDITAR: Redirigimos ---
          // Damos un pequeño delay para que el usuario alcance a ver el mensaje de éxito
          const timer = setTimeout(() => {
            router.push('/productos'); // Regresa a la lista
            router.refresh(); // Asegura que la lista muestre los datos nuevos
          }, 500); // Medio segundo es suficiente para ver el check verde

          return () => clearTimeout(timer); // Limpieza del timer si el componente se desmonta
        }
      }
    }
  }, [state, toast, producto, router]);

  return (
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
          <Label htmlFor="precio">Precio Regular</Label>
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

      {/* --- SECCIÓN DE PROMOCIONES --- */}
      <div className="border rounded-xl p-4 bg-orange-50/50 space-y-4 transition-all">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="promo_activa" 
            name="promo_activa" 
            checked={isPromoActive}
            onCheckedChange={(checked) => setIsPromoActive(checked as boolean)}
          />
          <Label 
            htmlFor="promo_activa" 
            className="text-stone-700 font-semibold cursor-pointer flex items-center gap-2 select-none"
          >
            <TicketPercent className="h-4 w-4 text-orange-600" />
            Activar Promoción para este producto
          </Label>
        </div>

        {/* Renderizado Condicional de los campos de promo */}
        {isPromoActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* Tipo de Promo */}
            <div className="grid gap-2 w-full max-w-full">
              <Label htmlFor="tipo_promo">Tipo de Promoción</Label>
              <Select name="tipo_promo" defaultValue={producto?.tipo_promo || "DESCUENTO_SIMPLE"}>
                <SelectTrigger className="w-full overflow-hidden">
                  <span className="truncate text-left w-full block">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </span>
                </SelectTrigger>
                
                <SelectContent>
                  <SelectItem value="DESCUENTO_SIMPLE">
                    <span className="truncate block max-w-[280px] md:max-w-full">
                        Descuento Simple (Precio rebajado)
                    </span>
                  </SelectItem>
                  <SelectItem value="DOS_POR_UNO">
                    <span className="truncate block max-w-[280px] md:max-w-full">
                        2x1 (Dos productos por un precio)
                    </span>
                  </SelectItem>
                  <SelectItem value="TRES_POR_DOS">
                    <span className="truncate block max-w-[280px] md:max-w-full">
                        3x2 (Tres productos por el precio de dos)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Precio Promo */}
            <div className="grid gap-2 w-full max-w-full">
              <Label htmlFor="precio_promo">
                Precio Final de la Promo 
                <span className="text-xs text-muted-foreground ml-1 font-normal">(Lo que paga el cliente)</span>
              </Label>
              <Input 
                id="precio_promo" 
                name="precio_promo" 
                type="number" 
                step="0.01" 
                defaultValue={producto?.precio_promo?.toString() || ''} 
                placeholder="Ej. 80.00"
                required={isPromoActive}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Si es 2x1, escribe el precio total del combo.
              </p>
              {state?.errors?.precio_promo && <p className="text-sm text-red-500">{state.errors.precio_promo[0]}</p>}
            </div>
          </div>
        )}
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