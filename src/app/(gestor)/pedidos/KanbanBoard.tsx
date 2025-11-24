"use client";

import { useState, useMemo, useEffect } from 'react';
import type { PedidoConCliente } from './actions';
import { getPedidosAction, updatePedidoEstadoAction } from './actions';
import { estado_pedido } from '@prisma/client';
import useSWR from 'swr';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, Eye } from 'lucide-react';
import { PedidoGestorModal } from './PedidoGestorModal';

// --- Columnas del Tablero ---
const COLUMNAS = [
    { id: estado_pedido.Recibido, titulo: "Recibido", icon: <Eye className="h-5 w-5" /> },
    { id: estado_pedido.En_Preparaci_n, titulo: "En Preparación", icon: <Package className="h-5 w-5" /> },
    { id: estado_pedido.Listo_para_recoger, titulo: "Listo para Recoger", icon: <Truck className="h-5 w-5" /> },
];

type ColumnaId = estado_pedido;

// --- Helpers ---
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

    const totalItems = pedido.detalle_pedido.reduce((sum, item) => sum + item.cantidad, 0);

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="mb-3 touch-none cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
        >
            <CardHeader className="p-4">
                <CardTitle className="text-md flex justify-between items-center">
                    <span className="text-stone-700">#{pedido.id_pedido}</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(Number(pedido.total))}</span>
                </CardTitle>
                <div className="text-sm text-muted-foreground pt-1 space-y-1">
                    <p className="flex justify-between">
                        <span>Cliente:</span>
                        <span className="font-medium text-stone-800">{pedido.usuarios?.nombre || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Hora:</span>
                        <span className="font-medium text-stone-800">{formatDate(pedido.fecha_hora)}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Artículos:</span>
                        <span className="font-medium text-stone-800">{totalItems}</span>
                    </p>
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
            className="flex-1 min-w-[300px] md:min-w-0 flex flex-col h-full"
        >
            <Card className="bg-stone-50/80 h-full border-stone-200 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4 bg-white/50 rounded-t-xl">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-stone-700 truncate">
                        <div className="p-1.5 bg-white rounded-md border shadow-sm text-orange-600 shrink-0">
                            {columna.icon}
                        </div>
                        <span className="truncate">{columna.titulo}</span>
                    </CardTitle>
                    <Badge variant="secondary" className="text-sm font-bold bg-stone-200 text-stone-700 shrink-0">{pedidos.length}</Badge>
                </CardHeader>
                <CardContent className="p-3 flex-1 overflow-y-auto scrollbar-hide">
                    <SortableContext items={pedidosIds}>
                        {pedidos.length === 0 ? (
                            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg m-2">
                                <p className="text-sm">Sin pedidos</p>
                            </div>
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
    const [selectedPedido, setSelectedPedido] = useState<PedidoConCliente | null>(null);

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

    // --- LÓGICA DE DND ---
    const pedidosPorColumna = useMemo(() => {
        const grouped: Record<ColumnaId, PedidoConCliente[]> = {
            Recibido: [],
            En_Preparaci_n: [],
            Listo_para_recoger: [],
            Entregado: [],
            Cancelado: [],
        };

        pedidos.forEach(p => {
            if (grouped[p.estado] !== undefined) {
                grouped[p.estado].push(p);
            }
        });
        return grouped;
    }, [pedidos]);

    function onDragEnd(event: DragEndEvent) {
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
        <div className="h-full flex flex-col">
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                {/* overflow-x-auto se mantiene para móviles, pero en desktop ya no se activará */}
                <div className="flex-1 flex gap-4 h-full overflow-x-auto pb-4">
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
            </DndContext>

            <PedidoGestorModal 
                pedido={selectedPedido} 
                isOpen={!!selectedPedido} 
                onClose={() => setSelectedPedido(null)} 
            />
        </div>
    );
}