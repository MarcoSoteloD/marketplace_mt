"use client";

import { useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CldImage } from 'next-cloudinary';
import { CheckCircle, XCircle, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updatePedidoEstadoAction, type PedidoConCliente } from './actions';
import { estado_pedido } from '@prisma/client';

// Helper de moneda
function formatCurrency(amount: number | null | undefined) {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount));
}

interface PedidoGestorModalProps {
    pedido: PedidoConCliente | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PedidoGestorModal({ pedido, isOpen, onClose }: PedidoGestorModalProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    if (!pedido) return null;

    // Función interna para actualizar estado
    const handleUpdateEstado = (nuevoEstado: estado_pedido) => {
        startTransition(async () => {
            const result = await updatePedidoEstadoAction(pedido.id_pedido, nuevoEstado);
            
            if (result.success) {
                toast({ 
                    variant: "success", 
                    title: nuevoEstado === estado_pedido.Cancelado ? "Pedido Cancelado" : "¡Pedido Entregado!",
                    description: `El pedido #${pedido.id_pedido} ha sido actualizado.`
                });
                onClose(); // Cerramos el modal al terminar
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.message
                });
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl text-stone-700">
                        Detalle del Pedido #{pedido.id_pedido}
                    </DialogTitle>
                    <DialogDescription>
                        Cliente: <span className="font-medium text-stone-900">{pedido.usuarios?.nombre || 'N/A'}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    
                    {/* --- LISTA DE PRODUCTOS --- */}
                    <div>
                        <h4 className="font-semibold text-stone-700 mb-3">Productos</h4>
                        <ul className="divide-y border rounded-xl overflow-hidden">
                            {pedido.detalle_pedido.map(item => (
                                <li key={item.id_producto} className="flex items-start gap-4 p-3 bg-stone-50/50">
                                    
                                    {/* Imagen */}
                                    <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden border bg-white">
                                        {item.productos?.url_foto ? (
                                            <CldImage
                                                src={item.productos.url_foto}
                                                width="48" height="48"
                                                alt={item.productos.nombre}
                                                className="object-cover h-full w-full"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-sm text-stone-800">
                                                {item.cantidad}x {item.productos?.nombre || "Producto eliminado"}
                                            </p>
                                            <p className="font-semibold text-sm text-stone-700">
                                                {formatCurrency(Number(item.precio_unitario) * item.cantidad)}
                                            </p>
                                        </div>
                                        
                                        {/* --- AQUÍ MOSTRAMOS LOS COMENTARIOS --- */}
                                        {item.comentarios && (
                                            <div className="mt-1 text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded-md border border-yellow-100 inline-block">
                                                <span className="font-bold">Nota:</span> {item.comentarios}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* --- TOTALES --- */}
                    <div className="flex justify-end items-center gap-4 text-lg border-t pt-4">
                        <span className="font-medium text-stone-500">Total:</span>
                        <span className="text-2xl font-bold text-stone-800">
                            {formatCurrency(Number(pedido.total))}
                        </span>
                    </div>

                    <Separator />

                    {/* --- ACCIONES --- */}
                    {/* Solo mostramos acciones si el pedido NO está finalizado ni cancelado */}
                    {pedido.estado !== estado_pedido.Entregado && pedido.estado !== estado_pedido.Cancelado && (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                disabled={isPending}
                                onClick={() => {
                                    if (window.confirm("¿Seguro que deseas CANCELAR este pedido?")) {
                                        handleUpdateEstado(estado_pedido.Cancelado);
                                    }
                                }}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar Pedido
                            </Button>

                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                disabled={isPending}
                                onClick={() => handleUpdateEstado(estado_pedido.Entregado)}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar Entregado
                            </Button>
                        </div>
                    )}
                    
                    {/* Si ya está finalizado, mostramos un badge informativo */}
                    {(pedido.estado === estado_pedido.Entregado || pedido.estado === estado_pedido.Cancelado) && (
                        <div className="flex justify-center">
                            <Badge variant={pedido.estado === estado_pedido.Entregado ? "default" : "destructive"} className="text-sm px-3 py-1">
                                Pedido {pedido.estado === estado_pedido.Entregado ? "Entregado" : "Cancelado"}
                            </Badge>
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}