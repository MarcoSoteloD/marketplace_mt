"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import { Prisma } from '@prisma/client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Phone } from "lucide-react";

// Helper para formatear el precio
function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(Number(amount));
}

// Definimos los tipos aquí (o impórtalos de tu archivo de tipos)
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

function formatDate(date: Date | null | string) {
    if (!date) return "";
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date));
}

export function PedidoDetalleModal({ pedido, isOpen, onClose }: PedidoDetalleModalProps) {
  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-full">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2 mb-2">
            {/* Logo del Negocio */}
            <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                {pedido.negocios?.url_logo ? (
                    <CloudinaryImage src={pedido.negocios.url_logo} alt="Logo" fill className="object-cover" />
                ) : (
                    <div className="bg-muted h-full w-full" />
                )}
            </div>

            <DialogTitle className="text-xl text-stone-700">{pedido.negocios?.nombre}</DialogTitle>

            {/* --- SECCIÓN DE CONTACTO --- */}
            {pedido.negocios?.telefono && (
                <Button variant="outline" size="sm" asChild className="rounded-full h-8 text-xs gap-2 text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900">
                    <a href={`tel:${pedido.negocios.telefono}`}>
                        <Phone className="h-3 w-3" />
                        {pedido.negocios.telefono}
                    </a>
                </Button>
            )}

            <DialogDescription>
                {formatDate(pedido.fecha_hora)}
            </DialogDescription>
            <Badge variant="outline" className="mt-1">
                {pedido.estado.replace(/_/g, ' ')}
            </Badge>
          </div>
        </DialogHeader>
        <Separator />
        {/* Lista de Productos */}
        <div className="space-y-4 py-2">
            <h4 className="font-semibold text-sm text-stone-700">Detalle de tu orden:</h4>
            {pedido.detalle_pedido.map((item, index) => (
                <div key={index} className="flex gap-3 items-start text-sm">
                    <div className="bg-muted h-6 w-6 flex items-center justify-center rounded text-xs font-bold text-stone-600 shrink-0">
                        {item.cantidad}x
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-stone-800">{item.productos.nombre}</p>
                        {item.comentarios && (
                            <p className="text-xs text-muted-foreground italic">Nota: {item.comentarios}</p>
                        )}
                    </div>
                    <p className="font-semibold text-stone-700">
                        {formatCurrency(Number(item.precio_unitario) * item.cantidad)}
                    </p>
                </div>
            ))}
        </div>
        <Separator />
        {/* Totales */}
        <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-lg text-orange-600">Total</span>
            <span className="font-bold text-xl text-orange-600">{formatCurrency(pedido.total)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}