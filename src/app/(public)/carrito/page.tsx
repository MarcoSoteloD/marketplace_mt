"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useTransition, Suspense } from 'react';
import { useCartStore, CartItem } from '@/store/cart-store';
import { getNegociosDelCarritoAction, createPedidoAction } from './actions';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingCart, Loader2, ImageIcon, MessageSquare, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// COMPONENTE INTERNO
function CarritoContent() {
    const router = useRouter();
    const searchParams = useSearchParams(); 
    const { toast } = useToast();

    const { items, removeItem, updateItemQuantity, updateItemComment, clearItemsByNegocio } = useCartStore();
    const [isPending, startTransition] = useTransition();

    // --- AGRUPAR ITEMS POR NEGOCIO ---
    const itemsPorNegocio = useMemo(() => {
        const grouped: Record<number, CartItem[]> = {};
        items.forEach(item => {
            if (!grouped[item.id_negocio]) {
                grouped[item.id_negocio] = [];
            }
            grouped[item.id_negocio].push(item);
        });
        return grouped;
    }, [items]);

    const negociosIds = Object.keys(itemsPorNegocio).map(Number);

    // --- OBTENER DATOS DE LOS NEGOCIOS ---
    const { data: negociosInfo } = useSWR(
        negociosIds.length > 0 ? `negocios-${negociosIds.join('-')}` : null,
        () => getNegociosDelCarritoAction(negociosIds)
    );

    // --- MANEJADOR DE CHECKOUT (POR NEGOCIO) ---
    const handleCheckout = (negocioId: number) => {
        const itemsDelNegocio = itemsPorNegocio[negocioId];
        const totalDelNegocio = itemsDelNegocio.reduce((acc, item) => acc + (Number(item.precio) * item.quantity), 0);

        startTransition(async () => {
            const result = await createPedidoAction(itemsDelNegocio, negocioId, totalDelNegocio);
            
            if (result.success) {
                toast({
                    variant: "success",
                    title: "¡Pedido Enviado!",
                    description: `Tu pedido para este negocio ha sido registrado.`,
                });
                
                // Limpiamos SOLO los items de este negocio
                clearItemsByNegocio(negocioId);
                
                // Redirigimos al éxito
                router.push(`/pedido-exitoso/${result.pedidoId}`);
            } else {
                if (result.message === "Usuario no autenticado") {
                    router.push('/login?callbackUrl=/carrito');
                } else {
                    toast({ variant: "destructive", title: "Error", description: result.message });
                }
            }
        });
    };

    // --- Manejador de Errores URL ---
    useEffect(() => {
        if (searchParams.get('error') === 'NoSePudoCrearElPedido') {
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear el pedido." });
        }
    }, [searchParams, toast]);

    // Estado Vacío
    if (items.length === 0) {
        return (
            <div className="container flex flex-col items-center justify-center py-24 text-center">
                <ShoppingCart className="h-16 w-16 text-stone-300" />
                <h1 className="mt-4 text-2xl text-stone-700 font-semibold">Tu carrito está vacío</h1>
                <Button asChild className="mt-6 rounded-full bg-orange-600 hover:bg-orange-500">
                    <Link href="/">Ir a comprar</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-4xl">
            
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-orange-100 p-3 rounded-full">
                    <ShoppingCart className="h-8 w-8 text-orange-600" strokeWidth={3} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-stone-700">Tu Carrito</h1>
                    <p className="text-muted-foreground text-sm">
                        Tienes productos de {Object.keys(itemsPorNegocio).length} negocio(s).
                    </p>
                </div>
            </div>

            {/* --- LISTA DE GRUPOS (TARJETAS POR NEGOCIO) --- */}
            <div className="space-y-10">
                {Object.entries(itemsPorNegocio).map(([strNegocioId, businessItems]) => {
                    const negocioId = Number(strNegocioId);
                    const negocioInfo = negociosInfo?.find(n => n.id_negocio === negocioId);
                    const subtotalNegocio = businessItems.reduce((acc, item) => acc + (Number(item.precio) * item.quantity), 0);

                    return (
                        <Card key={negocioId} className="rounded-3xl border-stone-200 shadow-md overflow-hidden">
                            
                            {/* Header del Negocio */}
                            <div className="bg-stone-50 border-b p-4 flex items-center gap-3">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden border bg-white">
                                    {negocioInfo?.url_logo ? (
                                        <CloudinaryImage src={negocioInfo.url_logo} fill alt="Logo" className="object-cover" />
                                    ) : (
                                        <Store className="h-6 w-6 m-2 text-stone-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-stone-800">
                                        {negocioInfo ? negocioInfo.nombre : "Cargando negocio..."}
                                    </h2>
                                    {negocioInfo && (
                                        <Link href={`/${negocioInfo.slug}`} className="text-xs text-orange-600 hover:underline">
                                            Ver menú / Agregar más
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <CardContent className="divide-y p-0">
                                {businessItems.map(item => (
                                    <div key={item.id_producto} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:bg-stone-50/50 transition-colors">
                                        
                                        {/* Imagen */}
                                        <div className="flex items-start gap-4">
                                            {item.url_foto ? (
                                                <CloudinaryImage
                                                    src={item.url_foto}
                                                    width="80" height="80" alt={item.nombre}
                                                    className="rounded-xl object-cover aspect-square bg-white border shadow-sm shrink-0"
                                                />
                                            ) : (
                                                <div className="flex h-[80px] w-[80px] items-center justify-center rounded-xl bg-muted aspect-square shrink-0">
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info y Controles */}
                                        <div className="flex-1 w-full space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-stone-700 text-lg">{item.nombre}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-muted-foreground">{formatCurrency(Number(item.precio))}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <p className="font-bold text-stone-800">{formatCurrency(Number(item.precio) * item.quantity)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 justify-between">
                                                {/* Comentarios */}
                                                <div className="relative flex-1 min-w-[200px]">
                                                    <MessageSquare className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input 
                                                        placeholder="Nota (ej. Sin cebolla)" 
                                                        value={item.comentarios || ""} 
                                                        onChange={(e) => updateItemComment(item.id_producto, e.target.value)}
                                                        className="h-9 text-sm bg-white border-stone-200 pl-9 rounded-full focus-visible:ring-orange-500"
                                                    />
                                                </div>

                                                {/* Cantidad y Borrar */}
                                                <div className="flex items-center gap-2 bg-white border rounded-full p-1 shadow-sm">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemQuantity(item.id_producto, parseInt(e.target.value))}
                                                        className="w-12 h-7 border-0 text-center p-0 focus-visible:ring-0 bg-transparent font-bold text-stone-700"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(item.id_producto)}
                                                        className="rounded-full h-7 w-7 hover:bg-red-100 hover:text-red-600 text-stone-400"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>

                            {/* Footer del Negocio (Subtotal y Checkout) */}
                            <CardFooter className="bg-stone-50 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm text-muted-foreground">Total a pagar en este lugar:</span>
                                    <span className="text-2xl font-bold text-stone-800">{formatCurrency(subtotalNegocio)}</span>
                                </div>
                                
                                <Button 
                                    size="lg"
                                    className="w-full sm:w-auto rounded-full bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-200 font-bold px-8"
                                    onClick={() => handleCheckout(negocioId)}
                                    disabled={isPending}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Realizar Pedido ({businessItems.reduce((acc, i) => acc + i.quantity, 0)} items)
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

// COMPONENTE DEFAULT QUE ENVUELVE EN SUSPENSE
export default function CarritoPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        }>
            <CarritoContent />
        </Suspense>
    );
}