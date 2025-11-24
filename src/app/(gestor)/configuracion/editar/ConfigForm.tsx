"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateNegocioConfig, ConfigNegocioState } from "../actions";
import type { negocios as PrismaNegocios, categorias_globales } from "@prisma/client";
import { useEffect, useState } from "react";
import { CldImage } from "next-cloudinary";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, X, Store, MapPin, Clock, Share2, Image as ImageIcon, Save } from "lucide-react";
import dynamic from 'next/dynamic';
import { Card, CardTitle, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

// Definimos el "tipo" del objeto plano que nos pasa el servidor
type PlainNegocio = Omit<PrismaNegocios, 'latitud' | 'longitud' | 'horario' | 'galeria_fotos' | 'url_redes_sociales'> & {
  latitud: number | null;
  longitud: number | null;
  horario: string | null;
  galeria_fotos: string | null;
  url_redes_sociales: string | null;
}

// Carga dinámica del mapa
const MapSelector = dynamic(
  () => import('./MapSelector').then(mod => mod.MapSelector),
  {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center">Cargando mapa...</div>
  }
);

// --- Helper: Parsear Horario Guardado ---
const parseHorarioDefault = (horario: any) => {
  const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  const initialState: Record<string, { apertura: string; cierre: string; cerrado: boolean }> = {};

  dias.forEach((dia) => {
    const valor = horario?.[dia];
    if (valor === "Cerrado") {
      initialState[dia] = { apertura: "", cierre: "", cerrado: true };
    } else if (typeof valor === "string" && valor.includes(" - ")) {
      const [apertura, cierre] = valor.split(" - ");
      initialState[dia] = { apertura: apertura || "", cierre: cierre || "", cerrado: false };
    } else {
      initialState[dia] = { apertura: "", cierre: "", cerrado: false };
    }
  });
  return initialState;
};

// --- Componente: Botón de Submit (Flotante o fijo) ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending} className="w-full md:w-auto rounded-full bg-orange-600 hover:bg-orange-500 min-w-[150px]">
      <Save className="w-4 h-4 mr-2" />
      {pending ? "Guardando..." : "Guardar Cambios"}
    </Button>
  );
}

// --- Componente: Fila de Horario (Compactado) ---
function HorarioDiaInput({
  dia,
  label,
  defaultState,
  error,
}: {
  dia: string;
  label: string;
  defaultState: { apertura: string; cierre: string; cerrado: boolean };
  error?: string[];
}) {
  const [isCerrado, setIsCerrado] = useState(defaultState.cerrado);

  return (
    <div className="space-y-2 pb-3 border-b last:border-0">
      <div className="flex items-center justify-between">
        <Label className="font-semibold capitalize text-sm">{label}</Label>
        <div className="flex items-center space-x-2">
            <Checkbox
                id={`horario_${dia}_cerrado`}
                name={`horario_${dia}_cerrado`}
                checked={isCerrado}
                onCheckedChange={(checked) => setIsCerrado(checked as boolean)}
            />
            <Label htmlFor={`horario_${dia}_cerrado`} className="text-xs text-muted-foreground cursor-pointer">Cerrado</Label>
        </div>
      </div>
      
      {!isCerrado && (
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
                <Input
                    id={`horario_${dia}_apertura`}
                    name={`horario_${dia}_apertura`}
                    type="time"
                    defaultValue={defaultState.apertura}
                    className="h-8 text-xs"
                />
            </div>
            <div className="relative">
                <Input
                    id={`horario_${dia}_cierre`}
                    name={`horario_${dia}_cierre`}
                    type="time"
                    defaultValue={defaultState.cierre}
                    className="h-8 text-xs"
                />
            </div>
          </div>
      )}
      {error && <p className="text-xs text-red-500">{error[0]}</p>}
    </div>
  );
}

// --- Helpers Redes y Galería ---
type RedSocial = { id: number; plataforma: string; url: string; };

const parseRedesSocialesDefault = (redes: any): RedSocial[] => {
  if (!redes || typeof redes !== 'object' || Array.isArray(redes)) return [];
  return Object.entries(redes).map(([plataforma, url], index) => ({
    id: index, plataforma: plataforma, url: url as string,
  }));
};

const parseGalleryDefault = (gallery: any): string[] => {
  if (Array.isArray(gallery)) return gallery.filter(item => typeof item === 'string');
  return [];
};

// --- Componente Principal ---
export function ConfigForm({
  negocio,
  categoriasGlobales,
  categoriasActualesIds
}: {
  negocio: PlainNegocio,
  categoriasGlobales: categorias_globales[],
  categoriasActualesIds: number[]
}) {
  const initialState: ConfigNegocioState = undefined;
  const [state, dispatch] = useFormState(updateNegocioConfig, initialState);
  const { toast } = useToast();
  const router = useRouter(); // Para redirigir

  const [defaultHorarios] = useState(() => parseHorarioDefault(JSON.parse(negocio.horario || "null")));
  const [redes, setRedes] = useState(() => parseRedesSocialesDefault(JSON.parse(negocio.url_redes_sociales || "null")));
  const [gallery, setGallery] = useState(() => parseGalleryDefault(JSON.parse(negocio.galeria_fotos || "null")));
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(categoriasActualesIds);

  const getRedesJsonString = () => {
    const jsonObject = redes.reduce((acc, red) => {
      if (red.plataforma && red.url) acc[red.plataforma.toLowerCase()] = red.url;
      return acc;
    }, {} as Record<string, string>);
    return JSON.stringify(jsonObject, null, 2);
  };

  const addRedSocial = () => setRedes([...redes, { id: Date.now(), plataforma: '', url: '' }]);
  const removeRedSocial = (id: number) => setRedes(redes.filter(red => red.id !== id));
  const updateRedSocial = (id: number, field: 'plataforma' | 'url', value: string) => {
    setRedes(redes.map(red => red.id === id ? { ...red, [field]: value } : red));
  };

  const removeGalleryImage = (urlToRemove: string) => setGallery(gallery.filter(url => url !== urlToRemove));

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setSelectedCategoryIds((prevIds) =>
      checked ? [...prevIds, categoryId] : prevIds.filter((id) => id !== categoryId)
    );
  };

  // --- EFECTO: Manejo de Éxito y Redirección ---
  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });

      // Si todo salió bien, redirigimos a la vista principal de configuración
      if (state.success) {
        const timer = setTimeout(() => {
            router.push('/configuracion');
            router.refresh(); // Actualizamos los datos de la página destino
        }, 500); // Pequeño delay para ver el toast
        return () => clearTimeout(timer);
      }
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="space-y-8 pb-24"> {/* Padding bottom extra para móvil */}
      
      {/* Header con Botón de Guardar (Visible en Desktop) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">Editar Negocio</h1>
            <p className="text-muted-foreground">Actualiza la información de tu establecimiento.</p>
        </div>
        <div className="hidden md:block">
            <SubmitButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- COLUMNA IZQUIERDA (Principal - 8/12) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* 1. PERFIL */}
            <Card className="rounded-3xl shadow-sm border-stone-200 overflow-hidden">
                <CardHeader className="bg-stone-50/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl text-stone-700">
                        <Store className="w-5 h-5 text-orange-600" />
                        Información General
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre del Negocio</Label>
                            <Input id="nombre" name="nombre" defaultValue={negocio.nombre} required className="bg-stone-50 border-stone-200" />
                            {state?.errors?.nombre && (<p className="text-sm text-red-500">{state.errors.nombre[0]}</p>)}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <div className="flex items-center">
                                <span className="text-sm text-muted-foreground mr-2 bg-stone-100 px-3 py-2 rounded-l-md border border-r-0 h-10 flex items-center">/negocio/</span>
                                <Input id="slug" name="slug" defaultValue={negocio.slug} required className="rounded-l-none border-stone-200" />
                            </div>
                            {state?.errors?.slug && (<p className="text-sm text-red-500">{state.errors.slug[0]}</p>)}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea id="descripcion" name="descripcion" defaultValue={negocio.descripcion || ""} placeholder="Describe tu negocio..." className="min-h-[100px] bg-stone-50 border-stone-200" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" name="telefono" type="tel" defaultValue={negocio.telefono || ""} className="bg-stone-50 border-stone-200 max-w-md" />
                    </div>

                    <div className="space-y-3 pt-2">
                        <Label className="text-base font-semibold">Categorías</Label>
                        <CardDescription>Selecciona las categorías que te definen.</CardDescription>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-stone-200 rounded-2xl bg-stone-50/30">
                            {categoriasGlobales.map((categoria) => (
                                <div key={categoria.id_categoria_g} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`cat-${categoria.id_categoria_g}`}
                                        checked={selectedCategoryIds.includes(categoria.id_categoria_g)}
                                        onCheckedChange={(checked) => handleCategoryChange(categoria.id_categoria_g, checked as boolean)}
                                    />
                                    <Label htmlFor={`cat-${categoria.id_categoria_g}`} className="font-normal cursor-pointer text-stone-600 text-sm">
                                        {categoria.nombre}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <input type="hidden" name="categorias_ids" value={JSON.stringify(selectedCategoryIds)} />
                        {state?.errors?.categorias_ids && (<p className="text-sm text-red-500">{state.errors.categorias_ids[0]}</p>)}
                    </div>
                </CardContent>
            </Card>

            {/* 2. UBICACIÓN */}
            <Card className="rounded-3xl shadow-sm border-stone-200 overflow-hidden">
                <CardHeader className="bg-stone-50/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl text-stone-700">
                        <MapPin className="w-5 h-5 text-orange-600" />
                        Ubicación
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="calle">Calle</Label>
                            <Input id="calle" name="calle" defaultValue={negocio.calle || ""} className="bg-stone-50 border-stone-200"/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="num_ext">Num. Exterior</Label>
                            <Input id="num_ext" name="num_ext" defaultValue={negocio.num_ext || ""} className="bg-stone-50 border-stone-200"/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="colonia">Colonia</Label>
                            <Input id="colonia" name="colonia" defaultValue={negocio.colonia || ""} className="bg-stone-50 border-stone-200"/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cp">C.P.</Label>
                            <Input id="cp" name="cp" defaultValue={negocio.cp || ""} className="bg-stone-50 border-stone-200"/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="municipio">Municipio</Label>
                            <Input id="municipio" name="municipio" defaultValue={negocio.municipio || ""} className="bg-stone-50 border-stone-200"/>
                        </div>
                    </div>

                    <div className="border border-stone-200 rounded-2xl overflow-hidden">
                        <div className="bg-stone-100 p-2 text-xs text-center text-muted-foreground border-b">
                            Arrastra el marcador o haz clic para ajustar la ubicación exacta.
                        </div>
                        <MapSelector defaultLat={negocio.latitud} defaultLng={negocio.longitud} />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* --- COLUMNA DERECHA (Secundaria - 4/12) --- */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* 3. MULTIMEDIA */}
            <Card className="rounded-3xl shadow-sm border-stone-200 overflow-hidden">
                <CardHeader className="bg-stone-50/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl text-stone-700">
                        <ImageIcon className="w-5 h-5 text-orange-600" />
                        Multimedia
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-3">
                        <Label className="text-base font-semibold text-stone-600">Logo</Label>
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center group cursor-pointer hover:border-orange-400 transition-colors">
                            {negocio.url_logo ? (
                                <CldImage src={negocio.url_logo} fill alt="Logo" className="object-cover" />
                            ) : (
                                <Store className="w-10 h-10 text-stone-300" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                <span className="text-white text-xs font-bold">Cambiar</span>
                            </div>
                            <Input id="url_logo" name="url_logo" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        {state?.errors?.url_logo && (<p className="text-sm text-red-500">{state.errors.url_logo[0]}</p>)}
                    </div>

                    <Separator />

                    {/* Galería */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold text-stone-600">Galería</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {gallery.map((url, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-stone-200">
                                    <CldImage src={url} fill alt="Galeria" className="object-cover" />
                                    <button type="button" onClick={() => removeGalleryImage(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {/* Botón Fake de subir */}
                            <div className="aspect-square rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 bg-stone-50 relative hover:bg-orange-50 hover:border-orange-300 hover:text-orange-500 transition-all cursor-pointer">
                                <PlusCircle className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-medium">Añadir</span>
                                <Input id="galeria_fotos_nuevas" name="galeria_fotos_nuevas" type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                    <input type="hidden" name="galeria_fotos_actuales" value={JSON.stringify(gallery)} />
                </CardContent>
            </Card>

            {/* 4. HORARIOS */}
            <Card className="rounded-3xl shadow-sm border-stone-200 overflow-hidden">
                <CardHeader className="bg-stone-50/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl text-stone-700">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Horarios
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map(dia => (
                            <HorarioDiaInput 
                                key={dia} 
                                dia={dia} 
                                label={dia} 
                                defaultState={defaultHorarios[dia]} 
                                error={(state?.errors as any)?.[`horario_${dia}_cierre`]} 
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 5. REDES SOCIALES */}
            <Card className="rounded-3xl shadow-sm border-stone-200 overflow-hidden">
                <CardHeader className="bg-stone-50/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl text-stone-700">
                        <Share2 className="w-5 h-5 text-orange-600" />
                        Redes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    {redes.map((red) => (
                        <div key={red.id} className="flex gap-2 items-start">
                            <div className="grid gap-2 flex-1">
                                <Input 
                                    placeholder="Facebook..." 
                                    value={red.plataforma} 
                                    onChange={(e) => updateRedSocial(red.id, 'plataforma', e.target.value)} 
                                    className="h-8 text-xs bg-stone-50"
                                />
                                <Input 
                                    placeholder="URL..." 
                                    value={red.url} 
                                    onChange={(e) => updateRedSocial(red.id, 'url', e.target.value)} 
                                    className="h-8 text-xs bg-stone-50"
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeRedSocial(red.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addRedSocial} className="w-full rounded-full text-xs h-8 border-dashed border-stone-300 text-stone-600 hover:text-orange-600 hover:border-orange-300">
                        <PlusCircle className="h-3 w-3 mr-2" />
                        Añadir Red Social
                    </Button>
                    <input type="hidden" name="url_redes_sociales" value={getRedesJsonString()} />
                </CardContent>
            </Card>

        </div>
      </div>

      {/* Footer flotante en móviles para guardar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-stone-200 md:hidden z-50 flex justify-end shadow-2xl">
          <SubmitButton />
      </div>
    </form>
  );
}