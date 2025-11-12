// app/(gestor)/pedidos/KanbanBoard.tsx
"use client";

import { useState, useMemo, useEffect, useTransition } from 'react';
import type { PedidoConCliente } from './actions'; // Importamos el tipo FIJO
import { getPedidosAction, updatePedidoEstadoAction } from './actions';
import { estado_pedido } from '@prisma/client'; // <-- ¡IMPORTANTE!
import useSWR from 'swr';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { CldImage } from 'next-cloudinary';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, Eye, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// --- Columnas del Tablero ---
const COLUMNAS = [
    { id: estado_pedido.Recibido, titulo: "Recibido", icon: <Eye className="h-5 w-5" /> },
    { id: estado_pedido.En_Preparaci_n, titulo: "En Preparación", icon: <Package className="h-5 w-5" /> },
    { id: estado_pedido.Listo_para_recoger, titulo: "Listo para Recoger", icon: <Truck className="h-5 w-5" /> },
];
// --- CORRECCIÓN DE TIPO ---
type ColumnaId = estado_pedido;

// --- Helpers (con corrección de 'Number()') ---
function formatCurrency(amount: number | null | undefined) {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount));
}
function formatDate(date: Date | null | undefined) {
    if (!date) return "Fecha desconocida";
    return new Intl.DateTimeFormat('es-MX', { timeStyle: 'short' }).format(date);
}

// --- Componente de Tarjeta de Pedido (Draggable) ---
function OrderCard({ pedido }: { pedido: PedidoConCliente }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: pedido.id_pedido,
        data: { type: "Order", pedido },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    // --- CORRECCIÓN (Ahora 'detalle_pedido' existe) ---
    const totalItems = pedido.detalle_pedido.reduce((sum, item) => sum + item.cantidad, 0);

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="mb-3 touch-none"
        >
            <CardHeader className="p-4">
                <CardTitle className="text-md flex justify-between items-center">
                    <span>Pedido #{pedido.id_pedido}</span>
                    {/* --- CORRECCIÓN (Añadido Number()) --- */}
                    <span className="text-lg font-bold">{formatCurrency(Number(pedido.total))}</span>
                </CardTitle>
                <div className="text-sm text-muted-foreground pt-1">
                    <p>Cliente: <span className="font-medium text-foreground">{pedido.usuarios?.nombre || 'N/A'}</span></p>
                    <p>Hora: <span className="font-medium text-foreground">{formatDate(pedido.fecha_hora)}</span></p>
                    <p>Artículos: <span className="font-medium text-foreground">{totalItems}</span></p>
                </div>
            </CardHeader>
        </Card>
    );
}

// --- Componente de Columna (Droppable) ---
function KanbanColumn({
    columna,
    pedidos,
    onCardClick
}: {
    columna: typeof COLUMNAS[number];
    pedidos: PedidoConCliente[];
    onCardClick: (pedido: PedidoConCliente) => void;
}) {
    const { setNodeRef } = useSortable({
        id: columna.id,
        data: { type: "Column", columna },
    });

    const pedidosIds = useMemo(() => pedidos.map(p => p.id_pedido), [pedidos]);

    return (
        <div
            ref={setNodeRef}
            className="w-full md:w-1/3 flex-shrink-0"
        >
            <Card className="bg-muted/50 h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {columna.icon}
                        {columna.titulo}
                    </CardTitle>
                    <Badge variant="secondary" className="text-lg">{pedidos.length}</Badge>
                </CardHeader>
                <CardContent className="p-4 h-full overflow-y-auto">
                    <SortableContext items={pedidosIds}>
                        {pedidos.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center pt-10">
                                Sin pedidos en esta columna.
                            </p>
                        ) : (
                            pedidos.map(pedido => (
                                <div key={pedido.id_pedido} onClick={() => onCardClick(pedido)}>
                                    <OrderCard pedido={pedido} />
                                </div>
                            ))
                        )}
                    </SortableContext>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Componente Principal del Tablero ---
export function KanbanBoard({ initialPedidos }: { initialPedidos: PedidoConCliente[] }) {

    const [pedidos, setPedidos] = useState(initialPedidos);
    const [activePedido, setActivePedido] = useState<PedidoConCliente | null>(null);
    const [selectedPedido, setSelectedPedido] = useState<PedidoConCliente | null>(null);

    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 10 },
    }));

    const { data: polledData } = useSWR(
        'get-pedidos-key',
        getPedidosAction,
        { refreshInterval: 15000 }
    );

    useEffect(() => {
        if (polledData) {
            setPedidos(polledData);
        }
    }, [polledData]);

    // --- LÓGICA DE DND (CORREGIDA) ---
    const pedidosPorColumna = useMemo(() => {
        // 1. Inicializa el 'grouped' con TODAS las keys del enum
        const grouped: Record<ColumnaId, PedidoConCliente[]> = {
            Recibido: [],
            En_Preparaci_n: [],
            Listo_para_recoger: [],
            Entregado: [], // <-- Ahora es una key válida
            Cancelado: [], // <-- Ahora es una key válida
        };

        pedidos.forEach(p => {
            // 2. 'p.estado' ahora puede indexar 'grouped' sin error
            if (grouped[p.estado] !== undefined) {
                grouped[p.estado].push(p);
            }
        });
        return grouped;
    }, [pedidos]);

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Order") {
            setActivePedido(event.active.data.current.pedido);
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActivePedido(null);
        const { active, over } = event;
        if (!over || !active.data.current?.pedido) return;

        const pedido = active.data.current.pedido as PedidoConCliente;
        const columnaDestinoId = over.id as ColumnaId;

        if (pedido.estado !== columnaDestinoId) {
            setPedidos(prev =>
                prev.map(p =>
                    p.id_pedido === pedido.id_pedido ? { ...p, estado: columnaDestinoId } : p
                )
            );
            updatePedidoEstadoAction(pedido.id_pedido, columnaDestinoId);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex-1 flex gap-4 h-full pb-4">
                <SortableContext items={COLUMNAS.map(c => c.id)}>
                    {COLUMNAS.map(col => (
                        <KanbanColumn
                            key={col.id}
                            columna={col}
                            pedidos={pedidosPorColumna[col.id]}
                            onCardClick={(pedido) => setSelectedPedido(pedido)}
                        />
                    ))}
                </SortableContext>
            </div>

            {/* --- EL MODAL (CORREGIDO) --- */}
            <Dialog
                open={!!selectedPedido}
                onOpenChange={(isOpen) => !isOpen && setSelectedPedido(null)}
            >
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Detalle del Pedido #{selectedPedido?.id_pedido}</DialogTitle>
                        <DialogDescription>
                            Cliente: {selectedPedido?.usuarios?.nombre || 'N/A'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                        <h4 className="font-semibold">Resumen del Pedido</h4>
                        <ul className="divide-y">
                            {/* 3. 'detalle_pedido' ahora existe */}
                            {selectedPedido?.detalle_pedido.map(item => (
                                <li key={item.id_producto} className="flex items-center gap-4 py-3">
                                    {item.productos?.url_foto ? (
                                        <CldImage
                                            src={item.productos.url_foto}
                                            width="48" height="48" alt={item.productos.nombre}
                                            className="rounded-md object-cover aspect-square bg-muted"
                                            crop={{ type: "fill", source: true }}
                                        />
                                    ) : (
                                        <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-md">
                                            <ImageIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{item.productos?.nombre || "N/A"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.cantidad} x {formatCurrency(Number(item.precio_unitario))} {/* 4. Añadido Number() */}
                                        </p>
                                        {item.comentarios && (
                                            <p className="text-sm text-primary italic">"{item.comentarios}"</p>
                                        )}
                                    </div>
                                    <p className="font-semibold">
                                        {formatCurrency(Number(item.precio_unitario) * item.cantidad)} {/* 4. Añadido Number() */}
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <Separator />
                        <div className="grid grid-cols-2 gap-3">
                            {/* Botón de Cancelar Pedido */}
                            <Button
                                variant="destructive"
                                className="w-full"
                                disabled={isPending}
                                onClick={() => {
                                    if (window.confirm("¿Seguro que deseas CANCELAR este pedido? Esta acción no se puede deshacer.")) {
                                        startTransition(async () => {
                                            const result = await updatePedidoEstadoAction(selectedPedido!.id_pedido, estado_pedido.Cancelado);
                                            toast({ variant: "default", title: "Pedido Cancelado" });
                                            setSelectedPedido(null); // Cierra el modal
                                        });
                                    }
                                }}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar Pedido
                            </Button>

                            {/* Botón de Marcar como Entregado */}
                            <Button
                                variant="default" // (Necesitarás añadir esta variante a tu shadcn/button, o usa "default")
                                className="w-full bg-green-600 hover:bg-green-700 text-white" // <-- O usa esto
                                disabled={isPending}
                                onClick={() => {
                                    startTransition(async () => {
                                        const result = await updatePedidoEstadoAction(selectedPedido!.id_pedido, estado_pedido.Entregado);
                                        toast({ variant: "success", title: "¡Pedido Entregado!" });
                                        setSelectedPedido(null); // Cierra el modal
                                    });
                                }}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como Entregado
                            </Button>
                        </div>
                        <div className="flex justify-end items-center gap-4 text-lg">
                            <span className="font-medium">Total:</span>
                            {/* 4. Añadido Number() */}
                            <span className="text-2xl font-bold">{formatCurrency(Number(selectedPedido?.total))}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DndContext>
    );
}