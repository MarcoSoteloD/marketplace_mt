// app/(public)/carrito/page.tsx
"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useTransition } from 'react';
import { useCartStore, CartItem } from '@/store/cart-store';
import { getNegocioDelCarritoAction, createPedidoAction } from './actions';
import useSWR from 'swr';
import { Prisma } from '@prisma/client';

// Componentes UI
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
    CardDescription
} from '@/components/ui/card';
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/ui/loader'; // El spinner
import { Trash2, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Helper para formatear el precio
function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(Number(amount));
}

export default function CarritoPage() {
    const router = useRouter();
    const searchParams = useSearchParams(); // Para leer errores de la URL
    const { toast } = useToast();

    // --- Estado del Carrito (Zustand) ---
    const { items, negocioId, removeItem, updateItemQuantity, clearCart } = useCartStore();

    // --- Estado de Carga (Server Action) ---
    const [isPending, startTransition] = useTransition();

    // --- Calcular Total (Memoizado) ---
    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => acc + (Number(item.precio) * item.quantity), 0);
    }, [items]);

    // --- Obtener Info del Negocio (SWR) ---
    // Llama a la Server Action 'getNegocioDelCarritoAction'
    const { data: negocio, isLoading: isLoadingNegocio } = useSWR(
        negocioId ? `negocio-${negocioId}` : null, // Key única (solo se ejecuta si hay negocioId)
        () => getNegocioDelCarritoAction(negocioId!)
    );

    // --- Manejador de Checkout ---
    const handleCheckout = () => {
        startTransition(async () => {

            // 1. Llamamos a la action
            const result = await createPedidoAction(items, negocioId!, subtotal);

            // 2. Verificamos la respuesta
            if (result.success) {
                // ¡ÉXITO!
                toast({
                    variant: "success",
                    title: "¡Pedido Realizado!",
                    description: "Tu pedido ha sido enviado al negocio.",
                });
                clearCart(); // <-- 3. Limpiamos el carrito
                router.push(`/pedido-exitoso/${result.pedidoId}`); // <-- 4. Redirigimos

            } else {
                // FALLO
                if (result.message === "Usuario no autenticado") {
                    // Si no está logueado, lo mandamos al login
                    router.push('/login?callbackUrl=/carrito');
                } else {
                    // Otro error (ej. base de datos)
                    toast({
                        variant: "destructive",
                        title: "Error Inesperado",
                        description: result.message,
                    });
                }
            }
        });
    };

    // --- Manejador de Errores de URL ---
    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'NoSePudoCrearElPedido') {
            toast({
                variant: "destructive",
                title: "Error Inesperado",
                description: "No se pudo crear tu pedido. Por favor, inténtalo de nuevo.",
            });
        }
    }, [searchParams, toast]);

    // --- Renderizado ---

    // Estado 1: Carrito Vacío
    if (items.length === 0 && !isPending) {
        return (
            <div className="container flex flex-col items-center justify-center py-24 text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-semibold">Tu carrito está vacío</h1>
                <p className="mt-2 text-muted-foreground">
                    Parece que aún no has añadido ningún producto.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/">Volver a la tienda</Link>
                </Button>
            </div>
        );
    }

    // Estado 2: Carrito Lleno
    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Tu Carrito</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* --- Columna Izquierda: Lista de Productos --- */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {isLoadingNegocio ? (
                                    <span className="h-6 w-1/2 bg-muted animate-pulse rounded-md" />
                                ) : (
                                    <Link href={`/${negocio?.slug || ''}`} className="hover:underline">
                                        Pedido de: {negocio?.nombre || 'Tu Negocio'}
                                    </Link>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {items.map(item => (
                                <div key={item.id_producto} className="flex items-center gap-4 py-4">
                                    <CloudinaryImage
                                        src={item.url_foto || 'v1621532000/placeholder_image'}
                                        width="80"
                                        height="80"
                                        alt={item.nombre}
                                        className="rounded-md object-cover aspect-square bg-muted"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium">{item.nombre}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(item.precio)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItemQuantity(item.id_producto, parseInt(e.target.value))}
                                            className="w-20"
                                            aria-label="Cantidad"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id_producto)}
                                            aria-label="Eliminar item"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* --- Columna Derecha: Resumen del Pedido --- */}
                <div className="md:col-span-1">
                    <Card className="sticky top-20"> {/* Se queda fijo al hacer scroll */}
                        <CardHeader>
                            <CardTitle>Resumen del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Envío / Servicio</span>
                                <span className="font-medium">Gratis</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button
                                className="w-full"
                                onClick={handleCheckout}
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Realizar Pedido"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={clearCart}
                                disabled={isPending}
                            >
                                Vaciar Carrito
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    );
}