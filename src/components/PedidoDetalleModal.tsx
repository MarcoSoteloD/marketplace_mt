"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Prisma } from '@prisma/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Phone, Calendar, ShoppingBag, Receipt } from "lucide-react";

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
    return new Intl.DateTimeFormat('es-MX', { 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).format(new Date(date));
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
        
        {/* --- ENCABEZADO --- */}
        <div className="bg-white p-6 pb-8 flex flex-col items-center text-center shadow-sm z-10 relative">
            
            {/* Decoración superior */}
            <div className="absolute top-3 text-xs font-bold tracking-widest text-stone-300 uppercase">
                Recibo Digital
            </div>

            {/* Logo con sombra */}
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-stone-50 shadow-md mb-3 mt-4">
                {pedido.negocios?.url_logo ? (
                    <CloudinaryImage src={pedido.negocios.url_logo} alt="Logo" fill className="object-cover" />
                ) : (
                    <div className="bg-orange-100 h-full w-full flex items-center justify-center text-orange-500">
                        <ShoppingBag size={24} />
                    </div>
                )}
            </div>

            <DialogTitle className="text-2xl font-bold text-stone-800 leading-tight">
                {pedido.negocios?.nombre}
            </DialogTitle>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(pedido.fecha_hora)}</span>
            </div>

            {/* Badges de Estado y Acción */}
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-stone-50 text-stone-600 border-stone-200 px-3 py-1 rounded-full">
                    {pedido.estado.replace(/_/g, ' ')}
                </Badge>
                
                {pedido.negocios?.telefono && (
                    <Button asChild size="sm" variant="ghost" className="rounded-full h-7 text-xs gap-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100">
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
             <div className="flex items-center gap-2 mb-4 text-stone-400">
                <Receipt className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Detalle de la orden</h4>
             </div>
             
             <div className="space-y-4">
                {pedido.detalle_pedido.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 group bg-white p-3 rounded-2xl border border-stone-100 shadow-sm">
                        
                        {/* Cantidad */}
                        <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-orange-100 text-orange-700 text-sm font-bold shrink-0 mt-0.5">
                            {item.cantidad}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-semibold text-stone-700 leading-snug">
                                    {item.productos.nombre}
                                </p>
                                <p className="text-sm font-medium text-stone-900 whitespace-nowrap">
                                    {formatCurrency(Number(item.precio_unitario) * item.cantidad)}
                                </p>
                            </div>
                            
                            {/* Comentarios (Nota visual) */}
                            {item.comentarios && (
                                <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 px-2 py-1.5 rounded-lg border border-yellow-100 inline-block leading-relaxed">
                                    <span className="font-bold">Nota:</span> {item.comentarios}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
             </div>
        </div>

        {/* --- FOOTER (Total) --- */}
        <div className="p-6 bg-white border-t border-stone-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-stone-400 font-medium text-xs uppercase tracking-wide">Total</span>
                    <span className="text-xs text-muted-foreground">Incluye impuestos</span>
                </div>
                <span className="text-3xl font-extrabold text-stone-800 tracking-tight">
                    {formatCurrency(pedido.total)}
                </span>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}