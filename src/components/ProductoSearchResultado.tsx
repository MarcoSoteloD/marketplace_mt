import Link from "next/link";
import CloudinaryImage from "@/components/ui/cloudinary-image"; // Usamos tu wrapper
import { Card } from "@/components/ui/card";
import { ImageIcon, Store } from "lucide-react";
// CORREGIDO: Importamos 'productos' (el tipo del modelo) además de 'Prisma'
import { type Prisma, type productos } from "@prisma/client";

// Definimos un tipo para el producto que esperamos de la búsqueda
// CORREGIDO: Usamos 'productos' en lugar de 'Prisma.productos'
type ProductoConNegocio = productos & {
  negocios: {
    slug: string;
    nombre: string;
  };
};

interface ProductoSearchResultCardProps {
  producto: ProductoConNegocio;
}

function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(amount));
}

export function ProductoSearchResultCard({
  producto,
}: ProductoSearchResultCardProps) {
  return (
    <Link
      href={`/${producto.negocios.slug}`} // <-- CORREGIDO (era slug_negocio)
      className="group block"
    >
      <Card className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
        {/* Imagen */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {producto.url_foto ? (
            <CloudinaryImage
              src={producto.url_foto}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-stone-700 truncate group-hover:text-orange-600 transition-colors">
            {producto.nombre}
          </h4>
          <p className="font-bold text-sm text-primary">
            {formatCurrency(producto.precio)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Store className="h-3 w-3" />
            <span className="truncate">
              Vendido por: {producto.negocios.nombre}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}