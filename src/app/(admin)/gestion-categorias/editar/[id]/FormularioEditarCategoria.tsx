// app/(admin)/gestion-categorias/editar/[id]/FormularioEditarCategoria.tsx

"use client";

import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { deleteCategoriaGlobal, State, updateCategoriaGlobal } from '../../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from 'react';
import type { categorias_globales } from '@prisma/client'; // Importamos el tipo

// Botón de Submit (reutilizable)
function SubmitButton({ variant = "default", text }: { variant?: any, text: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" aria-disabled={pending} variant={variant} className="w-full">
            {pending ? 'Guardando...' : text}
        </Button>
    );
}

// Botón de Eliminar (reutilizable)
function DeleteButton({ text }: { text: string }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            variant="destructive"
            aria-disabled={pending}
            className="w-full"
        >
            {pending ? 'Eliminando...' : text}
        </Button>
    );
}

// El formulario principal
export function FormularioEditarCategoria({
    categoria
}: {
    categoria: categorias_globales
}) {

    const router = useRouter();
    const initialState: State = undefined;

    // --- Lógica de Actions ---
    // Necesitamos "atar" el ID a la server action
    const updateActionWithId = updateCategoriaGlobal.bind(null, categoria.id_categoria_g);
    const deleteActionWithId = deleteCategoriaGlobal.bind(null, categoria.id_categoria_g);

    const [state, dispatch] = useFormState(updateActionWithId, initialState);
    const { toast } = useToast();

    // Efecto para mostrar Toasts de éxito o error
    useEffect(() => {
        // 1. Solo actúa si 'state' existe y tiene un mensaje
        //    (esto evita que se dispare en la carga inicial)
        if (state?.message) {

            // 2. Muestra el toast
            toast({
                variant: state.success ? "success" : "destructive",
                title: state.success ? "¡Éxito!" : "Error",
                description: state.message,
            });

            // 3. Si fue exitoso, inicia el timer para redirigir
            if (state.success) {
                const timer = setTimeout(() => {
                    router.push('/gestion-categorias');
                }, 1500);

                // Limpia el timer si el componente se desmonta
                return () => clearTimeout(timer);
            }
        }

        // 4. El array de dependencias ahora es más simple
    }, [state, toast, router]);

    return (
        <div className="flex flex-col gap-8">

            {/* --- FORMULARIO DE ACTUALIZAR --- */}
            <form action={dispatch} className="flex flex-col gap-4">
                <input type="hidden" name="id" value={categoria.id_categoria_g} />

                {/* Campo Nombre */}
                <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                        id="nombre"
                        name="nombre"
                        defaultValue={categoria.nombre}
                        required
                    />
                    {state?.errors?.nombre && (
                        <p className="text-sm text-red-500">{state.errors.nombre.join(', ')}</p>
                    )}
                </div>

                {/* Campo Descripción */}
                <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                    <Textarea
                        id="descripcion"
                        name="descripcion"
                        defaultValue={categoria.descripcion || ''}
                        placeholder="¿De qué trata esta categoría?"
                    />
                </div>

                <SubmitButton text="Actualizar Categoría" />
            </form>

            {/* --- FORMULARIO DE ELIMINAR --- */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-destructive mb-2">Zona de Peligro</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Eliminar esta categoría es una acción permanente. No se puede deshacer.
                </p>
                <form
                    action={async () => {
                        if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
                            await deleteActionWithId();
                        }
                    }}
                >
                    <DeleteButton text="Eliminar Categoría" />
                </form>
            </div>
        </div>
    );
}