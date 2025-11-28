// src/app/(public)/perfil/PedidosList.tsx

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PedidoDetalleModal } from "@/components/PedidoDetalleModal";
import { Package, CheckCircle2, ShoppingBag } from "lucide-react";

// Helpers de formato
function formatCurrency(amount: any) {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount));
}
function formatDate(date: any) {
  if (!date) return "Fecha desconocida";
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date));
}
function formatEstado(estado: string) {
  return estado.replace(/_/g, ' ');
}

interface PedidosListProps {
  pedidos: any[];
}

export function PedidosList({ pedidos }: PedidosListProps) {
  
  // Estado para controlar el modal
  const [selectedPedido, setSelectedPedido] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerDetalle = (pedido: any) => {
    setSelectedPedido(pedido);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
         
         <div className="flex items-center justify-between px-2">
             <h2 className="text-xl font-semibold text-stone-700">Historial Reciente</h2>
             <Badge variant="outline" className="text-stone-500">{pedidos.length} pedidos</Badge>
         </div>

         {pedidos.length > 0 ? (
            <div className="grid gap-4">
              {pedidos.map((pedido) => (
                // Convertimos cada item de la lista en una tarjeta individual flotante
                <Card key={pedido.id_pedido} className="group overflow-hidden rounded-2xl border-stone-200 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                      
                      {/* Info Izquierda */}
                      <div className="flex items-start gap-4">
                         {/* Icono Estado */}
                         <div className={`p-3 rounded-full ${pedido.estado === 'Entregado' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                             {pedido.estado === 'Entregado' ? <CheckCircle2 className="w-5 h-5"/> : <Package className="w-5 h-5"/>}
                         </div>
                         <div>
                            <p className="font-bold text-stone-800 text-lg">
                                {pedido.negocios?.nombre || 'Negocio desconocido'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span>{formatDate(pedido.fecha_hora)}</span>
                                <span>•</span>
                                <span>#{pedido.id_pedido}</span>
                            </div>
                         </div>
                      </div>

                      {/* Info Derecha + Acciones */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                          <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total</p>
                              <p className="text-lg font-bold text-stone-800">{formatCurrency(pedido.total)}</p>
                          </div>
                          
                          <Button 
                              variant="secondary" 
                              className="rounded-full px-6 bg-stone-100 hover:bg-stone-200 text-stone-700"
                              onClick={() => handleVerDetalle(pedido)}
                          >
                            Ver Detalles
                          </Button>
                      </div>
                   </div>
                   
                   {/* Barra de estado inferior colorida */}
                   <div className={`h-1.5 w-full ${pedido.estado === 'Entregado' ? 'bg-green-500' : 'bg-orange-500'}`} />
                </Card>
              ))}
            </div>
          ) : (
            // Estado Vacío
            <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 bg-stone-50/50 rounded-3xl">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <ShoppingBag className="h-10 w-10 text-stone-300" />
                </div>
                <h3 className="text-lg font-semibold text-stone-600">No tienes pedidos aún</h3>
                <p className="text-muted-foreground max-w-xs mt-2">¡Explora los negocios locales y haz tu primer pedido!</p>
            </Card>
          )}
      </div>

      <PedidoDetalleModal 
        pedido={selectedPedido} 
        isOpen={isModalOpen} 
        onClose={setIsModalOpen} 
      />
    </>
  );
}