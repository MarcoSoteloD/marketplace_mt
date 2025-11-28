"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Prisma } from '@prisma/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Phone, Calendar, ShoppingBag } from "lucide-react";

// Helper para formatear el precio
function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(Number(amount));
}

function formatDate(date: Date | null | string) {
    if (!date) return "";
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date));
}

// Definimos los tipos
interface Producto {
  nombre: string;
  url_foto: string | null;
}

interface Detalle {
  id_producto: number;
  cantidad: number;
  precio_unitario: any;
  comentarios: string | null;
  productos: Producto;
}

interface PedidoCompleto {
  id_pedido: number;
  total: any;
  estado: string;
  fecha_hora: Date | null;
  negocios: { nombre: string; url_logo: string | null; telefono: string | null } | null;
  detalle_pedido: Detalle[];
}

interface PedidoDetalleModalProps {
  pedido: PedidoCompleto | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export function PedidoDetalleModal({ pedido, isOpen, onClose }: PedidoDetalleModalProps) {
  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl bg-stone-50 border-0 shadow-2xl">
        
        {/* --- HEADER ESTILO PERFIL --- */}
        <div className="bg-white p-6 pb-8 flex flex-col items-center text-center shadow-sm z-10">
            {/* Logo con borde y sombra */}
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-stone-50 shadow-md mb-3">
                {pedido.negocios?.url_logo ? (
                    <CloudinaryImage src={pedido.negocios.url_logo} alt="Logo" fill className="object-cover" />
                ) : (
                    <div className="bg-orange-100 h-full w-full flex items-center justify-center text-orange-500">
                        <ShoppingBag size={24} />
                    </div>
                )}
            </div>

            <DialogTitle className="text-2xl font-bold text-stone-800 mb-1">
                {pedido.negocios?.nombre}
            </DialogTitle>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(pedido.fecha_hora)}</span>
            </div>

            {/* Badge y Botón de Llamada */}
            <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-1 rounded-full font-medium">
                    {pedido.estado.replace(/_/g, ' ')}
                </Badge>
                
                {pedido.negocios?.telefono && (
                    <Button asChild size="sm" variant="outline" className="rounded-full h-7 text-xs border-stone-200 gap-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-50">
                        <a href={`tel:${pedido.negocios.telefono}`}>
                            <Phone className="w-3 h-3" />
                            Llamar
                        </a>
                    </Button>
                )}
            </div>
        </div>

        {/* --- LISTA DE PRODUCTOS --- */}
        <div className="p-6 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200">
             <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 pl-1">
                Detalle de la orden
             </h4>
             
             <div className="space-y-4">
                {pedido.detalle_pedido.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 group">
                        {/* Badge de Cantidad */}
                        <div className="flex items-center justify-center h-6 w-6 rounded-md bg-orange-100 text-orange-700 text-xs font-bold shrink-0 mt-0.5">
                            {item.cantidad}x
                        </div>
                        
                        {/* Info Producto */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                                <p className="text-sm font-semibold text-stone-700 leading-snug">
                                    {item.productos.nombre}
                                </p>
                                <p className="text-sm font-medium text-stone-900">
                                    {formatCurrency(Number(item.precio_unitario) * item.cantidad)}
                                </p>
                            </div>
                            
                            {/* Comentarios destacados */}
                            {item.comentarios && (
                                <div className="mt-1.5 inline-block px-2 py-1 rounded-md bg-white border border-stone-200 text-xs text-stone-500 italic">
                                    "{item.comentarios}"
                                </div>
                            )}
                        </div>
                    </div>
                ))}
             </div>
        </div>

        {/* --- FOOTER CON TOTAL --- */}
        <div className="p-6 bg-white border-t border-stone-100">
            <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium text-sm uppercase tracking-wide">Total</span>
                <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(pedido.total)}
                </span>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}