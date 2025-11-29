// app/(gestor)/configuracion/ConfigDisplay.tsx
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CldImage } from "next-cloudinary";
import { Store, MapPin, Phone, Clock, Link as LinkIcon, Pencil, Globe, Camera, FileText, type LucideIcon } from "lucide-react";

// --- Definimos los tipos que esperamos del servidor ---
type Horario = Record<string, string>;
type Redes = Record<string, string>;
type Galeria = string[];

interface NegocioData {
  nombre: string;
  activo: boolean | null;
  url_logo: string | null;
  slug: string;
  descripcion: string | null;
  telefono: string | null;
  direccion: string;
  horario: Horario | null;
  redes: Redes | null;
  galeria: Galeria;
}

// --- TODOS LOS HELPERS AHORA VIVEN EN EL CLIENTE ---

function InfoItem({ label, value, icon: Icon }: { 
  label: string, 
  value: React.ReactNode, // Acepta ReactNode para el 'No definido'
  icon?: LucideIcon 
}) {
  const displayValue = value || <span className="text-sm text-gray-400">No definido</span>;
  return (
    <div className="flex items-start gap-4">
      {Icon && <Icon className="h-5 w-5 text-primary flex-shrink-0" />}
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold">{displayValue}</p>
      </div>
    </div>
  );
}

function DisplayHorario({ horario }: { horario: Horario | null }) {
  if (!horario || Object.keys(horario).length === 0) {
    return <InfoItem label="Horario de Servicio" value={null} icon={Clock} />;
  }
  const diasOrdenados = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Clock className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm font-medium text-muted-foreground">Horario de Servicio</p>
      </div>
      <ul className="space-y-1 pl-9">
        {diasOrdenados.map(dia => (
          <li key={dia} className="flex justify-between text-sm">
            <span className="capitalize font-medium">{dia}:</span>
            <span className="text-muted-foreground">{horario[dia] || "No definido"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DisplayRedes({ redes }: { redes: Redes | null }) {
  if (!redes || Object.keys(redes).length === 0) {
    return <InfoItem label="Redes Sociales" value={null} icon={LinkIcon} />;
  }
  return (
     <div className="space-y-3">
      <div className="flex items-center gap-4">
        <LinkIcon className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm font-medium text-muted-foreground">Redes Sociales</p>
      </div>
      <div className="pl-9 flex flex-wrap gap-3">
        {Object.entries(redes).map(([plataforma, url]) => (
          <Button key={plataforma} variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize">
              {plataforma}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}

function DisplayGaleria({ galeria }: { galeria: Galeria }) {
  if (galeria.length === 0) {
    return <InfoItem label="Galería de Fotos" value={null} icon={Camera} />;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Camera className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm font-medium text-muted-foreground">Galería de Fotos</p>
      </div>
      <div className="pl-9 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2">
        {galeria.slice(0, 6).map((url, index) => (
          <CldImage
            key={index}
            src={url}
            width="100"
            height="100"
            alt={`Foto de galería ${index + 1}`}
            className="rounded-md object-cover aspect-square"
            crop={{ type: "fill", source: true }}
          />
        ))}
        {galeria.length > 6 && (
          <div className="flex items-center justify-center bg-muted rounded-md aspect-square">
            <p className="text-sm font-bold">+{galeria.length - 6} más</p>
          </div>
        )}
      </div>
    </div>
  );
}


// --- Componente Principal ---
export default function ConfigDisplay({ negocio }: { negocio: NegocioData }) {
  return (
    <div className="flex flex-col gap-6">
      
      {/* --- Encabezado --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {negocio.url_logo ? (
            <CldImage
              src={negocio.url_logo}
              width="56"
              height="56"
              alt="Logo"
              className="rounded-md object-cover"
              crop={{ type: "fill", source: true }}
            />
          ) : (
            <div className="h-14 w-14 flex items-center justify-center bg-muted rounded-md">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {negocio.nombre}
            </h1>
            <Badge variant={negocio.activo ? "secondary" : "destructive"}>
              {negocio.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
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

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <InfoItem label="Slug (URL)" value={negocio.slug} icon={Globe} />
              <Separator />
              <InfoItem label="Descripción" value={negocio.descripcion} icon={FileText} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Contacto y Ubicación</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <InfoItem label="Teléfono" value={negocio.telefono} icon={Phone} />
              <Separator />
              <InfoItem label="Dirección Completa" value={negocio.direccion || null} icon={MapPin} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Media y Enlaces</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <DisplayRedes redes={negocio.redes} />
              <Separator />
              <DisplayGaleria galeria={negocio.galeria} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Horario</CardTitle></CardHeader>
            <CardContent>
              <DisplayHorario horario={negocio.horario} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}