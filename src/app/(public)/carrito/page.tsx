//src/app/public/carrito/page.tsx

"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useTransition } from 'react';
import { useCartStore } from '@/store/cart-store';
import { getNegocioDelCarritoAction, createPedidoAction } from './actions';
import useSWR from 'swr';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart, Loader2, ImageIcon } from 'lucide-react';
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
    const searchParams = useSearchParams(); 
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
    const { data: negocio, isLoading: isLoadingNegocio } = useSWR(
        negocioId ? `negocio-${negocioId}` : null, 
        () => getNegocioDelCarritoAction(negocioId!)
    );

    // --- Manejador de Checkout ---
    const handleCheckout = () => {
        startTransition(async () => {
            const result = await createPedidoAction(items, negocioId!, subtotal);
            if (result.success) {
                toast({
                    variant: "success",
                    title: "¡Pedido Realizado!",
                    description: "Tu pedido ha sido enviado al negocio.",
                });
                clearCart(); 
                router.push(`/pedido-exitoso/${result.pedidoId}`);
            } else {
                if (result.message === "Usuario no autenticado") {
                    router.push('/login?callbackUrl=/carrito');
                } else {
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

    // Estado 1: Carrito Vacío
    if (items.length === 0 && !isPending) {
        return (
            <div className="container flex flex-col items-center justify-center py-24 text-center">
                <ShoppingCart className="h-16 w-16 text-stone-700" />
                <h1 className="mt-4 text-2xl text-stone-700 font-semibold">Tu carrito está vacío</h1>
                <p className="mt-2 text-muted-foreground">
                    Parece que aún no has añadido ningún producto.
                </p>
                <Button asChild className="mt-6 rounded-full bg-orange-600 hover:bg-orange-500">
                    <Link href="/">Volver a la plataforma</Link>
                </Button>
            </div>
        );
    }

    // Estado 2: Carrito con productos
    return (
        <div className="container py-12">
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-stone-700">Tu Carrito</h1>
                <div className="p-3 rounded-full">
                    <ShoppingCart className="h-8 w-8 text-stone-700" strokeWidth={3} />
                </div>
                
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* --- Columna Izquierda: Lista de Productos --- */}
                <div className="md:col-span-2">
                    <Card className="rounded-2xl"> 
                        <CardHeader>
                            <CardTitle>
                                {isLoadingNegocio ? (
                                    <span className="h-6 w-1/2 bg-muted animate-pulse rounded-md" />
                                ) : (
                                    <Link href={`/${negocio?.slug || ''}`} className="hover:underline text-stone-700">
                                        Pedido de: {negocio?.nombre || 'Tu Negocio'}
                                    </Link>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {items.map(item => (
                                <div key={item.id_producto} className="flex items-center gap-4 py-4">
                                    {item.url_foto ? (
                                        <CloudinaryImage
                                            src={item.url_foto}
                                            width="80"
                                            height="80"
                                            alt={item.nombre}
                                            className="rounded-xl object-cover aspect-square bg-muted"
                                        />
                                    ) : (
                                        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-xl bg-muted aspect-square flex-shrink-0">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium text-stone-700">{item.nombre}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(item.precio)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItemQuantity(item.id_producto, parseInt(e.target.value))}
                                            className="w-20 rounded-full text-stone-700"
                                            aria-label="Cantidad"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id_producto)}
                                            aria-label="Eliminar item"
                                            className="rounded-full"
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
                    <Card className="sticky top-20 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-stone-700">Resumen del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium text-stone-700">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Servicio</span>
                                <span className="font-medium text-stone-700">Gratis</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg text-stone-700 font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button
                                className="w-full rounded-full bg-orange-600 hover:bg-orange-500"
                                onClick={handleCheckout}
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Realizar Pedido"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full text-stone-700 hover:text-red-500"
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