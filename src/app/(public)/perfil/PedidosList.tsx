"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PedidoDetalleModal } from "@/components/PedidoDetalleModal";

// Helpers de formato (puedes importarlos si los tienes centralizados)
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
      <Card>
        <CardHeader>
          <CardTitle className="text-stone-700">Historial de Pedidos</CardTitle>
          <CardDescription>
            Aquí puedes ver todos los pedidos que has realizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pedidos.length > 0 ? (
            <ul className="divide-y">
              {pedidos.map((pedido) => (
                <li key={pedido.id_pedido} className="flex text-stone-700 items-center justify-between p-3 hover:bg-muted/30 transition-colors rounded-lg">
                  <div>
                    <p className="font-medium text-stone-700">
                      Pedido a <span className="font-bold">{pedido.negocios?.nombre || 'Negocio eliminado'}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(pedido.fecha_hora)}
                    </p>
                    <Badge variant="secondary" className="mt-1 rounded-full text-stone-700 bg-stone-100">
                      {formatEstado(pedido.estado)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatCurrency(pedido.total)}</p>
                    
                    {/* BOTÓN QUE ABRE EL MODAL */}
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-primary"
                        onClick={() => handleVerDetalle(pedido)}
                    >
                      Ver detalle
                    </Button>

                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">Aún no has realizado ningún pedido.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* El Modal vive aquí, oculto hasta que se active */}
      <PedidoDetalleModal 
        pedido={selectedPedido} 
        isOpen={isModalOpen} 
        onClose={setIsModalOpen} 
      />
    </>
  );
}