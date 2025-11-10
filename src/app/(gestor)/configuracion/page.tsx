// app/(gestor)/configuracion/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getNegocioById } from "@/lib/db"; // ¡Esta función ya la creamos!
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

// Componentes UI
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Iconos (instala 'lucide-react' si no lo tienes)
import { 
  Store, 
  MapPin, 
  Phone, 
  Image as ImageIcon, 
  Clock, 
  Link as LinkIcon,
  Pencil,
  Globe,
  type LucideIcon
} from "lucide-react";

// Helper para mostrar texto o un placeholder
function InfoItem({ label, value, icon: Icon }: { label: string, value: string | null | undefined, icon?: LucideIcon }) {
  const displayValue = value || <span className="text-gray-400">No definido</span>;
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-1" />}
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{displayValue}</p>
      </div>
    </div>
  );
}

export default async function PaginaConfiguracion() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 
  
  const negocio = await getNegocioById(session.user.negocioId);
  if (!negocio) notFound();

  // Construimos la dirección completa
  const direccion = [
    negocio.calle, 
    negocio.num_ext, 
    negocio.num_int ? `Int. ${negocio.num_int}` : null,
    negocio.colonia,
    negocio.cp,
    negocio.municipio,
    negocio.estado
  ].filter(Boolean).join(', '); // Filtra nulos/vacíos y une con comas

  return (
    <div className="flex flex-col gap-6">
      
      {/* --- Encabezado --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            {negocio.nombre}
          </h1>
          <Badge variant={negocio.activo ? "secondary" : "destructive"}>
            {negocio.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <Button asChild>
          <Link href="/configuracion/editar">
            <Pencil className="mr-2 h-4 w-4" />
            Editar Información
          </Link>
        </Button>
      </div>
      
      {/* --- Grid de Tarjetas --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- Columna 1: Info General y Ubicación --- */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Slug (URL)" value={negocio.slug} icon={Globe} />
              <InfoItem label="Descripción" value={negocio.descripcion} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Contacto y Ubicación</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Teléfono" value={negocio.telefono} icon={Phone} />
              <InfoItem label="Dirección Completa" value={direccion} icon={MapPin} />
            </CardContent>
          </Card>
        </div>

        {/* --- Columna 2: Media y Horarios --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Media y Enlaces</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="URL del Logo" value={negocio.url_logo} icon={ImageIcon} />
              {/* Mostraremos los JSON como "No definidos" por ahora */}
              <InfoItem label="Redes Sociales" value={negocio.url_redes_sociales ? "Configurado" : null} icon={LinkIcon} />
              <InfoItem label="Galería de Fotos" value={negocio.galeria_fotos ? "Configurada" : null} icon={ImageIcon} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Horario</CardTitle></CardHeader>
            <CardContent>
              <InfoItem label="Horario de Servicio" value={negocio.horario ? "Configurado" : null} icon={Clock} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}