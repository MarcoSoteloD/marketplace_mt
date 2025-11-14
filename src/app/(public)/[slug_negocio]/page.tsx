// app/(public)/[slug_negocio]/page.tsx

import { getNegocioPublicoBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import { Prisma } from '@prisma/client';
import { CldImage } from "next-cloudinary";
import Link from "next/link";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToCartButton } from "./AddToCartButton";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
// Iconos
import {
    Store,
    MapPin,
    Phone,
    Clock,
    Globe,
    Pencil,
    Camera,
    ExternalLink,
    Image as ImageIcon,
    Link as LinkIcon, // El icono 'default'
    type LucideIcon // <-- ARREGLA EL ERROR DE 'LucideIcon'
} from "lucide-react";
import { type IconType } from "react-icons"; // <-- El NUEVO tipo
import { SiFacebook, SiInstagram, SiX, SiWhatsapp } from "react-icons/si";
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { checkOpenStatus } from "@/lib/time-helpers";

const DisplayMap = dynamic(
    () => import('./DisplayMap').then(mod => mod.DisplayMap),
    {
        ssr: false,
        loading: () => <div className="h-[250px] w-full bg-muted animate-pulse rounded-md" />
    }
);

// --- Helper para Iconos de Redes ---
const socialIconMap: Record<string, IconType | LucideIcon> = {
    facebook: SiFacebook,     // <-- Icono nuevo
    instagram: SiInstagram,   // <-- Icono nuevo
    twitter: SiX,     // <-- Icono nuevo
    whatsapp: SiWhatsapp,   // <-- Icono nuevo
    default: LinkIcon,        // <-- Usa el icono 'LinkIcon' importado de lucide
};

const getSocialIcon = (plataforma: string): IconType | LucideIcon => {
    const key = plataforma.toLowerCase();
    return socialIconMap[key] || socialIconMap.default;
};

function InfoItem({ label, value, icon: Icon }: {
    label: string,
    value: React.ReactNode, // <-- Tipo cambiado a ReactNode (más flexible)
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

// --- Definimos los tipos (la solución que recordamos) ---
type NegocioPublico = Prisma.PromiseReturnType<typeof getNegocioPublicoBySlug>;
// ---

// --- Helpers (formatCurrency, DisplayHorario) se quedan igual ---
function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(Number(amount));
}
type Horario = Record<string, string>;

function DisplayHorario({ horario }: { horario: any }) {
    const diasOrdenados = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    if (!horario || typeof horario !== 'object' || Array.isArray(horario)) {
        return <p className="text-sm text-muted-foreground">Horario no disponible.</p>;
    }
    return (
        <ul className="space-y-1">
            {diasOrdenados.map(dia => (
                <li key={dia} className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{dia}:</span>
                    <span className="text-muted-foreground">{horario[dia] || "Cerrado"}</span>
                </li>
            ))}
        </ul>
    );
}
// --- Fin Helpers ---


export default async function PaginaNegocio({
    params
}: {
    params: { slug_negocio: string }
}) {

    const slug = params.slug_negocio;
    const negocio = await getNegocioPublicoBySlug(slug);

    if (!negocio) {
        notFound();
    }

    // Construimos la dirección
    const direccion = [
        negocio.calle, negocio.num_ext, negocio.colonia, negocio.cp, negocio.municipio
    ].filter(Boolean).join(', ');

    // --- 1. LÓGICA DE IMÁGENES (CORREGIDA) ---
    // La galería SÓLO usa la galería de fotos
    const galeria = (Array.isArray(negocio.galeria_fotos))
        ? negocio.galeria_fotos.map(String)
        : [];

    // El logo se guarda por separado
    const logoUrl = negocio.url_logo;
    // --- FIN DE LA LÓGICA ---

    const horario = (negocio.horario && typeof negocio.horario === 'object' && !Array.isArray(negocio.horario))
        ? negocio.horario
        : null;

    // --- AÑADE ESTA LÍNEA ---
    const isOpen = checkOpenStatus(horario);

    type Redes = Record<string, string>;
    const redes = (negocio.url_redes_sociales && typeof negocio.url_redes_sociales === 'object' && !Array.isArray(negocio.url_redes_sociales))
        ? negocio.url_redes_sociales as Redes
        : null;

    return (
        <div className="flex flex-col">

            {/* --- 1. FOTO DE PORTADA (El Carrusel de la Galería) --- */}
            <section className="relative h-[35vh] w-full bg-muted">
                {galeria.length > 0 ? (
                    <Carousel className="w-full h-full" opts={{ loop: true }}>
                        <CarouselContent className="h-full">
                            {galeria.map((url, index) => (
                                <CarouselItem key={index} className="h-full">
                                    <CldImage
                                        src={url}
                                        alt={`Foto de ${negocio.nombre} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        crop={{ type: "fill", source: true }}
                                        priority={index === 0}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-4" />
                        <CarouselNext className="absolute right-4" />
                    </Carousel>
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Store className="h-32 w-32 text-muted-foreground/30" />
                    </div>
                )}
            </section>

            {/* --- 2. Contenido Principal (Info y Menú) --- */}
            {/* Este contenedor se jala hacia arriba -mt-20 para superponerse */}
            <div className="container relative z-10 -mt-20 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-24">

                {/* --- Columna Lateral (Izquierda): Info del Negocio --- */}
                <aside className="md:col-span-1 lg:col-span-1 space-y-6">

                    {/* --- 2a. EL LOGO (FOTO DE PERFIL) --- */}
                    <div className="relative h-32 w-32 md:h-40 md:w-40 bg-muted rounded-full border-4 border-background shadow-lg overflow-hidden">
                        {logoUrl ? (
                            <CldImage
                                src={logoUrl}
                                alt={`Logo de ${negocio.nombre}`}
                                fill
                                className="object-cover"
                                crop={{ type: "fill", source: true }}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <Store className="h-16 w-16 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>

                    {/* --- 2b. TARJETA DE INFO (Debajo del logo) --- */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {negocio.nombre}
                                </h1>

                                {/* --- INICIO DE LA CORRECCIÓN --- */}
                                {/* Primero revisa si el admin lo desactivó ('!negocio.activo') */}
                                {/* Si está activo, ENTONCES revisa si está abierto ('isOpen') */}
                                <Badge
                                    // 1. Usa 'default' (que SÍ existe) en lugar de 'success'
                                    variant={!negocio.activo ? "destructive" : (isOpen ? "default" : "outline")}
                                    // 2. Si está abierto, SOBREESCRIBE las clases de 'default' con las de verde
                                    className={
                                        isOpen
                                            ? "bg-green-600 text-white border-transparent hover:bg-green-700"
                                            : ""
                                    }
                                >
                                    {!negocio.activo ? "Inactivo" : (isOpen ? "Abierto ahora" : "Cerrado")}
                                </Badge>
                                {/* --- FIN DE LA CORRECCIÓN --- */}

                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Separator />
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <p className="font-medium">{direccion || "Dirección no disponible."}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                                <p className="font-medium">{negocio.telefono || "Teléfono no disponible."}</p>
                            </div>
                            {redes && Object.keys(redes).length > 0 && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        {Object.entries(redes).map(([plataforma, url]) => {
                                            const Icono = getSocialIcon(plataforma);
                                            return (
                                                <Button key={plataforma} variant="ghost" size="icon" asChild>
                                                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={plataforma}>
                                                        <Icono className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                            {/* Solo muestra el mapa SI tenemos latitud y longitud */}
                            {negocio.latitud && negocio.longitud && (
                                <>
                                    <Separator />
                                    <DisplayMap
                                        lat={Number(negocio.latitud)}
                                        lng={Number(negocio.longitud)}
                                        popupText={negocio.nombre}
                                    />

                                    {/* --- BOTÓN AÑADIDO --- */}
                                    <Button asChild className="w-full mt-4">
                                        <a
                                            href={`https://maps.google.com/?q=LAT,LNG(${encodeURIComponent(negocio.nombre)})@${Number(negocio.latitud)},${Number(negocio.longitud)}`}
                                            target="_blank" // Abre en una nueva pestaña
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Cómo llegar
                                        </a>
                                    </Button>
                                    {/* --- FIN DEL BOTÓN --- */}
                                </>
                            )}
                            {/* --- FIN DEL MAPA AÑADIDO --- */}
                        </CardContent>
                    </Card>

                    {/* Tarjeta de Horario */}
                    <Card className="sticky top-20 shadow-lg">
                        <CardHeader><CardTitle>Horario</CardTitle></CardHeader>
                        <CardContent>
                            <DisplayHorario horario={negocio.horario} />
                        </CardContent>
                    </Card>
                </aside>

                {/* --- Columna Principal (Derecha): Menú/Productos --- */}
                {/* Le damos un padding-top para que inicie debajo del logo/info */}
                <main className="md:col-span-2 lg:col-span-3 space-y-8 md:pt-44">
                    <h2 className="text-3xl font-bold tracking-tight">Menú</h2>

                    {negocio.categorias_producto.length > 0 ? (
                        negocio.categorias_producto.map(categoria => (
                            <section key={categoria.id_categoria} className="scroll-mt-20" id={categoria.nombre}>
                                <h3 className="text-2xl font-semibold mb-4">{categoria.nombre}</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {categoria.productos.map(producto => (
                                        <Card key={producto.id_producto} className="flex flex-row overflow-hidden">
                                            <div className="flex-1 p-4 space-y-1">
                                                <h4 className="font-semibold">{producto.nombre}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">
                                                    {producto.descripcion || ''}
                                                </p>
                                                <p className="font-bold pt-2">{formatCurrency(producto.precio)}</p>
                                            </div>

                                            <div className="relative h-32 w-32 flex-shrink-0">
                                                {producto.url_foto ? (
                                                    <CldImage
                                                        src={producto.url_foto}
                                                        alt={producto.nombre}
                                                        fill
                                                        className="object-cover"
                                                        crop={{ type: "fill", source: true }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-muted">
                                                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                                    </div>
                                                )}
                                                <AddToCartButton
                                                    producto={producto}
                                                    negocioId={negocio.id_negocio}
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                <Separator className="my-8" />
                            </section>
                        ))
                    ) : (
                        <p className="text-muted-foreground">Este negocio aún no tiene productos para mostrar.</p>
                    )}

                </main>
            </div>

        </div>
    );
}