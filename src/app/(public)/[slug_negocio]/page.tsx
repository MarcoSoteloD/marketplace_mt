import { getNegocioPublicoBySlug } from "@/lib/data/businesses";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Link as LinkIcon, type LucideIcon } from "lucide-react";
import { type IconType } from "react-icons";
import { SiFacebook, SiInstagram, SiX, SiWhatsapp } from "react-icons/si";
import dynamic from 'next/dynamic';
import { checkOpenStatus } from "@/lib/time-helpers";
import { GoogleMapsButton } from './GoogleMapsButton';
import { NegocioGallery } from "./NegocioGallery";
import { NegocioLogo } from "./NegocioLogo";
import { ProductCard } from "@/components/ProductCard";

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
    
    // Obtenemos los datos "crudos" de la DB (vienen con Decimal)
    const negocioRaw = await getNegocioPublicoBySlug(slug); 
    
    if (!negocioRaw) notFound();

    // TRANSFORMACIÓN DE DATOS
    const negocio = {
        ...negocioRaw,
        latitud: negocioRaw.latitud ? Number(negocioRaw.latitud) : null,
        longitud: negocioRaw.longitud ? Number(negocioRaw.longitud) : null,
        
        categorias_producto: negocioRaw.categorias_producto.map(cat => ({
            ...cat,
            productos: cat.productos.map(prod => ({
                ...prod,
                precio: Number(prod.precio),
                precio_promo: prod.precio_promo ? Number(prod.precio_promo) : null,
            }))
        }))
    };

    const direccion = [
        negocio.calle, negocio.num_ext, negocio.colonia, negocio.cp, negocio.municipio
    ].filter(Boolean).join(', ');

    const galeria = Array.isArray(negocio.galeria_fotos)
        ? (negocio.galeria_fotos as string[]).filter(x => typeof x === "string")
        : [];

    const logoUrl = negocio.url_logo;

    const isOpen = checkOpenStatus(negocio.horario);
    const redes = negocio.url_redes_sociales && typeof negocio.url_redes_sociales === "object"
        ? negocio.url_redes_sociales
        : null;

    return (
        <div className="container py-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">

            {/* Columna Izquierda (INFO) */}
            <aside className="md:col-span-1 lg:col-span-1 space-y-6">
                <NegocioLogo logoUrl={logoUrl} nombreNegocio={negocio.nombre} />
                <Card className="shadow-lg rounded-3xl">
                    <CardHeader>
                        <div className="flex flex-col gap-4 items-start">
                            <h1 className="text-3xl font-bold text-stone-700 tracking-tight leading-none">
                                {negocio.nombre}
                            </h1>
                            <Badge
                                variant={!negocio.activo ? "destructive" : (isOpen ? "default" : "outline")}
                                className={isOpen ? "bg-green-600 text-white border-transparent hover:bg-green-700 rounded-full" : "rounded-full"}
                            >
                                {!negocio.activo ? "Inactivo" : (isOpen ? "Abierto ahora" : "Cerrado ahora")}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Separator />
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-stone-700 shrink-0 mt-0.5" />
                            <p className="font-medium text-stone-700">{direccion || "Sin dirección"}</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-stone-700 shrink-0 mt-0.5" />
                            <p className="font-medium text-stone-700">{negocio.telefono || "Sin teléfono"}</p>
                        </div>
                        {redes && Object.keys(redes).length > 0 && (
                            <>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    {Object.entries(redes).map(([plataforma, url]) => {
                                        if (!url || typeof url !== "string") return null;
                                        const Icono = getSocialIcon(plataforma);
                                        return (
                                            <Button key={plataforma} variant="ghost" size="icon" className="rounded-full" asChild>
                                                <a href={url} target="_blank" rel="noopener noreferrer" aria-label={plataforma}>
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
                                <DisplayMap lat={negocio.latitud} lng={negocio.longitud} popupText={negocio.nombre} />
                                <GoogleMapsButton lat={negocio.latitud} lng={negocio.longitud} nombre={negocio.nombre} />
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="sticky top-20 shadow-lg rounded-3xl text-stone-700">
                    <CardHeader><CardTitle>Horario</CardTitle></CardHeader>
                    <CardContent>
                        <DisplayHorario horario={negocio.horario} />
                    </CardContent>
                </Card>
            </aside>

            {/* Columna Derecha (GALERÍA + PRODUCTOS) */}
            <main className="md:col-span-2 lg:col-span-3 space-y-10">
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold text-stone-700 tracking-tight">Conócenos</h2>
                    <NegocioGallery galeria={galeria} nombreNegocio={negocio.nombre} />
                </section>

                <section className="space-y-10">
                    <h2 className="text-3xl font-bold text-stone-700 tracking-tight">Te ofrecemos</h2>

                    {negocio.categorias_producto.length > 0 ? (
                        negocio.categorias_producto.map(categoria => (
                            <section key={categoria.id_categoria} id={categoria.nombre} className="scroll-mt-20 text-stone-700">
                                <h3 className="text-2xl font-semibold mb-4">{categoria.nombre}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoria.productos.map(producto => (
                                        <ProductCard 
                                            key={producto.id_producto}
                                            producto={producto}
                                            negocioId={negocio.id_negocio}
                                        />
                                    ))}
                                </div>
                                <Separator className="my-8" />
                            </section>
                        ))
                    ) : (
                        <p className="text-muted-foreground">Este negocio aún no tiene productos.</p>
                    )}
                </section>
            </main>
        </div>
    );
}