"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PedidoDetalleModal } from "@/components/PedidoDetalleModal";
import { Package, CheckCircle2 } from "lucide-react";

// Definimos la interfaz para el tipo de datos que recibimos
interface PedidoFrontend {
  id_pedido: number;
  total: number;
  estado: string;
  fecha_hora: Date | null;
  negocios: {
    nombre: string;
    url_logo: string | null;
    telefono: string | null;
  } | null;
  detalle_pedido: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    comentarios: string | null;
    productos: {
      nombre: string;
      url_foto: string | null;
    };
  }[];
}

// Helpers de formato
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

function formatDate(date: Date | string | null) {
  if (!date) return "Fecha desconocida";
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

function formatEstado(estado: string) {
  return estado.replace(/_/g, ' ');
}

interface PedidosListProps {
  pedidos: PedidoFrontend[];
}

export function PedidosList({ pedidos }: PedidosListProps) {
  
  const [selectedPedido, setSelectedPedido] = useState<PedidoFrontend | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerDetalle = (pedido: PedidoFrontend) => {
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
                <Card key={pedido.id_pedido} className="group overflow-hidden rounded-2xl border-stone-200 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                      
                      {/* Info Izquierda */}
                      <div className="flex items-start gap-4">
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
                            <Badge variant="secondary" className="mt-1 rounded-full text-stone-700 bg-stone-100">
                              {formatEstado(pedido.estado)}
                            </Badge>
                         </div>
                      </div>

                      {/* Info Derecha + Acciones */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                          <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total</p>
                              <p className="text-lg font-bold text-stone-800">{formatCurrency(pedido.total)}</p>
                          </div>
                          
                          <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-primary"
                              onClick={() => handleVerDetalle(pedido)}
                          >
                            Ver detalle
                          </Button>
                      </div>
                   </div>
                   
                   <div className={`h-1.5 w-full ${pedido.estado === 'Entregado' ? 'bg-green-500' : 'bg-orange-500'}`} />
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">Aún no has realizado ningún pedido.</p>
            </div>
          )}
      </div>

      {/* El Modal vive aquí */}
      <PedidoDetalleModal 
        pedido={selectedPedido} 
        isOpen={isModalOpen} 
        onClose={setIsModalOpen} 
      />
    </>
  );
}