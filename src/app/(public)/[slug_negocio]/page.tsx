//app/(public)/[slug_negocio]/page.tsx
import { getNegocioPublicoBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import { Prisma } from '@prisma/client';
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToCartButton } from "./AddToCartButton";
import {
    MapPin,
    Phone,
    Image as ImageIcon,
    Link as LinkIcon,
    type LucideIcon
} from "lucide-react";
import { type IconType } from "react-icons";
import { SiFacebook, SiInstagram, SiX, SiWhatsapp } from "react-icons/si";
import dynamic from 'next/dynamic';
import { checkOpenStatus } from "@/lib/time-helpers";
import { GoogleMapsButton } from './GoogleMapsButton';
import { NegocioGallery } from "./NegocioGallery";
import { NegocioLogo } from "./NegocioLogo";

const DisplayMap = dynamic(
    () => import('./DisplayMap').then(mod => mod.DisplayMap),
    {
        ssr: false,
        loading: () => <div className="h-[250px] w-full bg-muted animate-pulse rounded-2xl" />
    }
);

// Helpers
const socialIconMap: Record<string, IconType | LucideIcon> = {
    facebook: SiFacebook,
    instagram: SiInstagram,
    twitter: SiX,
    whatsapp: SiWhatsapp,
    default: LinkIcon,
};

const getSocialIcon = (plataforma: string): IconType | LucideIcon => {
    const key = plataforma.toLowerCase();
    return socialIconMap[key] || socialIconMap.default;
};

function InfoItem({ label, value, icon: Icon }: {
    label: string,
    value: React.ReactNode,
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

function formatCurrency(amount: Prisma.Decimal | number | null | undefined) {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
        .format(Number(amount));
}

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

export default async function PaginaNegocio({ params }: { params: { slug_negocio: string } }) {

    const slug = params.slug_negocio;
    const negocio = await getNegocioPublicoBySlug(slug);
    if (!negocio) notFound();

    const direccion = [
        negocio.calle, negocio.num_ext, negocio.colonia, negocio.cp, negocio.municipio
    ].filter(Boolean).join(', ');

    const galeria = Array.isArray(negocio.galeria_fotos)
        ? negocio.galeria_fotos.filter(x => typeof x === "string")
        : [];

    const logoUrl = negocio.url_logo;

    const isOpen = checkOpenStatus(negocio.horario);
    const redes = negocio.url_redes_sociales && typeof negocio.url_redes_sociales === "object"
        ? negocio.url_redes_sociales
        : null;

    return (
        <div className="container py-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">

            {/* Columna Izquierda (LOGO + INFO + HORARIO) */}
            <aside className="md:col-span-1 lg:col-span-1 space-y-6">

                <NegocioLogo
                    logoUrl={logoUrl}
                    nombreNegocio={negocio.nombre}
                />

                {/* Info */}
                <Card className="shadow-lg rounded-3xl">
                    <CardHeader>
                        <div className="flex flex-col gap-4 items-start">
                            <h1 className="text-3xl font-bold text-stone-700 tracking-tight leading-none"> {/* Añadí leading-none para quitar espacio extra de la fuente si es necesario */}
                                {negocio.nombre}
                            </h1>
                            <Badge
                                variant={!negocio.activo ? "destructive" : (isOpen ? "default" : "outline")}
                                className={
                                    isOpen
                                        ? "bg-green-600 text-white border-transparent hover:bg-green-700 rounded-full"
                                        : "rounded-full"
                                }
                            >
                                {!negocio.activo ? "Inactivo" : (isOpen ? "Abierto ahora" : "Cerrado ahora")}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Separator />

                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-stone-700" />
                            <p className="font-medium text-stone-700">{direccion || "Sin dirección"}</p>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-stone-700" />
                            <p className="font-medium text-stone-700">{negocio.telefono || "Sin teléfono"}</p>
                        </div>

                        {redes && Object.keys(redes).length > 0 && (
                            <>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    {Object.entries(redes).map(([plataforma, url]) => {
                                        // Normaliza y valida: solo seguimos si es string y no está vacío
                                        if (!url || typeof url !== "string") return null;
                                        const Icono = getSocialIcon(plataforma);
                                        return (
                                            <Button
                                                key={plataforma}
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                                asChild
                                            >
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={plataforma}
                                                >
                                                    <Icono className="h-4 w-4 text-stone-700" />
                                                </a>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {negocio.latitud && negocio.longitud && (
                            <>
                                <Separator />
                                <DisplayMap
                                    lat={Number(negocio.latitud)}
                                    lng={Number(negocio.longitud)}
                                    popupText={negocio.nombre}
                                />
                                <GoogleMapsButton
                                    lat={Number(negocio.latitud)}
                                    lng={Number(negocio.longitud)}
                                    nombre={negocio.nombre}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Horario */}
                <Card className="sticky top-20 shadow-lg rounded-3xl text-stone-700">
                    <CardHeader><CardTitle>Horario</CardTitle></CardHeader>
                    <CardContent>
                        <DisplayHorario horario={negocio.horario} />
                    </CardContent>
                </Card>
            </aside>

            {/* Columna Derecha (GALERÍA + CATÁLOGO) */}
            <main className="md:col-span-2 lg:col-span-3 space-y-10">

                {/* Agrupamos Título + Galería para controlar el espaciado entre ellos */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-stone-700 tracking-tight">
                        Conoce de nosotros
                    </h2>

                    <NegocioGallery
                        galeria={galeria}
                        nombreNegocio={negocio.nombre}
                    />
                </section>

                {/* --- INICIO DEL REFACTOR DE CATÁLOGO --- */}
                <section className="space-y-10">
                    <h2 className="text-3xl font-bold text-stone-700 tracking-tight">Nuestros Productos</h2>

                    {negocio.categorias_producto.length > 0 ? (
                        negocio.categorias_producto.map(categoria => (
                            <section key={categoria.id_categoria} id={categoria.nombre} className="scroll-mt-20 text-stone-700">

                                <h3 className="text-2xl font-semibold mb-4">{categoria.nombre}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoria.productos.map(producto => (

                                        <Card
                                            key={producto.id_producto}
                                            className="relative flex flex-col rounded-3xl h-full shadow-lg group transition-all duration-300 hover:shadow-xl"
                                        >

                                            {/* 1. Contenedor de Imagen (SIN CAMBIOS, sigue 'overflow-hidden') */}
                                            <div className="relative h-48 w-full overflow-hidden rounded-t-3xl bg-white">
                                                {producto.url_foto ? (
                                                    <CloudinaryImage
                                                        src={producto.url_foto}
                                                        alt={producto.nombre}
                                                        fill
                                                        // 1. CAMBIO DE 'object-cover' A 'object-contain'
                                                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-muted">
                                                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 2. El botón: Tu lógica estaba perfecta. */}
                                            {/* 'top-48' (12rem) lo alinea con el div de la imagen (h-48) */}
                                            {/* '-translate-y-1/2' lo centra en la línea. */}
                                            <div className="absolute z-10 top-48 right-1 -translate-y-0">
                                                <AddToCartButton
                                                    producto={producto}
                                                    negocioId={negocio.id_negocio}
                                                />
                                            </div>

                                            {/* 3. El contenido: Tu lógica estaba perfecta. */}
                                            <div className="p-4 pt-8 flex flex-col flex-1">
                                                <div className="flex-1 space-y-1">
                                                    <h4 className="font-semibold text-stone-700 text-lg">{producto.nombre}</h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">
                                                        {producto.descripcion || ''}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 mt-2">
                                                    <p className="font-bold text-stone-700 text-lg">
                                                        {formatCurrency(producto.precio)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <Separator className="my-8" />
                            </section>
                        ))
                    ) : (
                        <p className="text-muted-foreground">Este negocio aún no tiene productos.</p>
                    )}
                </section>
                {/* --- FIN DEL REFACTOR --- */}
            </main>
        </div>
    );
}