// app/(gestor)/configuracion/editar/ConfigForm.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateNegocioConfig, ConfigNegocioState } from "../actions";
import type { negocios as PrismaNegocios, categorias_globales } from "@prisma/client";
import { useEffect, useState, useMemo } from "react"; // 'useMemo' no se usa, pero no estorba
import { CldImage } from "next-cloudinary";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, PlusCircle, X } from "lucide-react";
import dynamic from 'next/dynamic';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";

// 1. Definimos el "tipo" del objeto plano que nos pasa el servidor
type PlainNegocio = Omit<PrismaNegocios, 'latitud' | 'longitud' | 'horario' | 'galeria_fotos' | 'url_redes_sociales'> & {
  latitud: number | null;
  longitud: number | null;
  horario: string | null; // Ahora es un string JSON
  galeria_fotos: string | null; // Ahora es un string JSON
  url_redes_sociales: string | null; // Ahora es un string JSON
}

// 2. Carga dinámica del mapa
const MapSelector = dynamic(
  () => import('./MapSelector').then(mod => mod.MapSelector),
  {
    ssr: false,
    loading: () => <p className="text-center">Cargando mapa...</p>
  }
);

// --- Helper: Parsear Horario Guardado ---
const parseHorarioDefault = (horario: any) => {
  const dias = [
    "lunes", "martes", "miercoles", "jueves",
    "viernes", "sabado", "domingo"
  ];
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

// --- Helper: Formatear JSON para Textarea (¡Eliminado! Ya no se usa) ---
// function formatJsonForDisplay(value: any): string { ... }

// --- Componente: Botón de Submit ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {pending ? "Guardando..." : "Guardar Cambios"}
    </Button>
  );
}

// --- Componente: Fila de Horario (Separado) ---
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center p-3 border rounded-md">
      <Label className="md:col-span-1 font-semibold">{label}</Label>
      <div className="md:col-span-2 grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor={`horario_${dia}_apertura`} className="text-xs">Apertura</Label>
          <Input
            id={`horario_${dia}_apertura`}
            name={`horario_${dia}_apertura`}
            type="time"
            defaultValue={defaultState.apertura}
            disabled={isCerrado}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`horario_${dia}_cierre`} className="text-xs">Cierre</Label>
          <Input
            id={`horario_${dia}_cierre`}
            name={`horario_${dia}_cierre`}
            type="time"
            defaultValue={defaultState.cierre}
            disabled={isCerrado}
          />
        </div>
      </div>
      <div className="md:col-span-1 flex items-center justify-end space-x-2 pt-5">
        <Checkbox
          id={`horario_${dia}_cerrado`}
          name={`horario_${dia}_cerrado`}
          checked={isCerrado}
          onCheckedChange={(checked) => setIsCerrado(checked as boolean)}
        />
        <Label htmlFor={`horario_${dia}_cerrado`} className="text-sm">Cerrado</Label>
      </div>
      {error && (
        <p className="text-sm text-red-500 md:col-span-4">{error[0]}</p>
      )}
    </div>
  );
}

// --- Tipo y Helper para Redes Sociales ---
type RedSocial = {
  id: number;
  plataforma: string;
  url: string;
};

const parseRedesSocialesDefault = (redes: any): RedSocial[] => {
  if (!redes || typeof redes !== 'object' || Array.isArray(redes)) {
    return [];
  }
  return Object.entries(redes).map(([plataforma, url], index) => ({
    id: index,
    plataforma: plataforma,
    url: url as string,
  }));
};

// --- Helper para Galería ---
const parseGalleryDefault = (gallery: any): string[] => {
  if (Array.isArray(gallery)) {
    return gallery.filter(item => typeof item === 'string');
  }
  return [];
};

// --- Componente Principal: El Formulario ---
export function ConfigForm({
  negocio,
  categoriasGlobales,
  categoriasActualesIds
}: {
  negocio: PlainNegocio,
  categoriasGlobales: categorias_globales[], // + PROP NUEVO
  categoriasActualesIds: number[]            // + PROP NUEVO
}) {
  const initialState: ConfigNegocioState = undefined;
  const [state, dispatch] = useFormState(updateNegocioConfig, initialState);
  const { toast } = useToast();

  const [defaultHorarios] = useState(() => parseHorarioDefault(JSON.parse(negocio.horario || "null")));
  const [redes, setRedes] = useState(() => parseRedesSocialesDefault(JSON.parse(negocio.url_redes_sociales || "null")));
  const [gallery, setGallery] = useState(() => parseGalleryDefault(JSON.parse(negocio.galeria_fotos || "null")));

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(categoriasActualesIds);

  const getRedesJsonString = () => {
    const jsonObject = redes.reduce((acc, red) => {
      if (red.plataforma && red.url) {
        acc[red.plataforma.toLowerCase()] = red.url;
      }
      return acc;
    }, {} as Record<string, string>);
    return JSON.stringify(jsonObject, null, 2);
  };

  const addRedSocial = () => {
    setRedes([...redes, { id: Date.now(), plataforma: '', url: '' }]);
  };

  const removeRedSocial = (id: number) => {
    setRedes(redes.filter(red => red.id !== id));
  };

  const updateRedSocial = (id: number, field: 'plataforma' | 'url', value: string) => {
    setRedes(redes.map(red =>
      red.id === id ? { ...red, [field]: value } : red
    ));
  };

  const removeGalleryImage = (urlToRemove: string) => {
    setGallery(gallery.filter(url => url !== urlToRemove));
  };

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setSelectedCategoryIds((prevIds) =>
      checked
        ? [...prevIds, categoryId] // Añadir ID
        : prevIds.filter((id) => id !== categoryId) // Quitar ID
    );
  };

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.success ? "success" : "destructive",
        title: state.success ? "¡Éxito!" : "Error",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={dispatch}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* --- INFO BÁSICA --- */}
          <CardTitle>Información Básica</CardTitle>
          {/* ... (inputs de nombre, slug, descripcion, telefono) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Negocio</Label>
              <Input id="nombre" name="nombre" defaultValue={negocio.nombre} required />
              {state?.errors?.nombre && (<p className="text-sm text-red-500">{state.errors.nombre[0]}</p>)}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" defaultValue={negocio.slug} required />
              {state?.errors?.slug && (<p className="text-sm text-red-500">{state.errors.slug[0]}</p>)}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" defaultValue={negocio.descripcion || ""} placeholder="Describe tu negocio..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" type="tel" defaultValue={negocio.telefono || ""} />
          </div>

          <CardTitle className="pt-4">Categorías</CardTitle>
          <CardDescription>
            Selecciona las categorías que mejor describen tu negocio.
            Esto ayuda a los clientes a encontrarte.
          </CardDescription>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md">
            {categoriasGlobales.map((categoria) => (
              <div
                key={categoria.id_categoria_g}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`cat-${categoria.id_categoria_g}`}
                  // Comprobamos si el ID está en nuestro state
                  checked={selectedCategoryIds.includes(categoria.id_categoria_g)}
                  // Usamos el handler para actualizar el state
                  onCheckedChange={(checked) => {
                    handleCategoryChange(categoria.id_categoria_g, checked as boolean);
                  }}
                />
                <Label
                  htmlFor={`cat-${categoria.id_categoria_g}`}
                  className="font-normal"
                >
                  {categoria.nombre}
                </Label>
              </div>
            ))}
          </div>
          {/* Guardamos el state en un input oculto, igual que haces con redes y galería */}
          <input
            type="hidden"
            name="categorias_ids"
            value={JSON.stringify(selectedCategoryIds)}
          />
          {state?.errors?.categorias_ids && (<p className="text-sm text-red-500">{state.errors.categorias_ids[0]}</p>)}

          {/* --- DIRECCIÓN --- */}
          <CardTitle className="pt-4">Dirección</CardTitle>
          {/* ... (inputs de calle, num_ext, num_int, colonia, cp, municipio, estado) ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="calle">Calle</Label>
              <Input id="calle" name="calle" defaultValue={negocio.calle || ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="num_ext">Num. Exterior</Label>
              <Input id="num_ext" name="num_ext" defaultValue={negocio.num_ext || ""} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="num_int">Num. Interior (Opcional)</Label>
              <Input id="num_int" name="num_int" defaultValue={negocio.num_int || ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="colonia">Colonia</Label>
              <Input id="colonia" name="colonia" defaultValue={negocio.colonia || ""} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="cp">Código Postal</Label>
              <Input id="cp" name="cp" defaultValue={negocio.cp || ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="municipio">Municipio</Label>
              <Input id="municipio" name="municipio" defaultValue={negocio.municipio || ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" name="estado" defaultValue={negocio.estado || ""} />
            </div>
          </div>

          {/* --- MAPA --- */}
          <CardTitle className="pt-4">Ubicación en el Mapa</CardTitle>
          <CardDescription>
            Haz clic en el mapa para mover el marcador a la ubicación exacta de tu negocio.
          </CardDescription>
          <MapSelector
            defaultLat={negocio.latitud}
            defaultLng={negocio.longitud}
          />

          {/* --- MEDIA Y JSON --- */}
          <CardTitle className="pt-4">Media y Enlaces</CardTitle>
          {/* ... (Input de Logo) ... */}
          <div className="grid gap-2">
            <Label htmlFor="url_logo">Logo del Negocio</Label>
            {negocio.url_logo && (
              <div className="my-2">
                <p className="text-sm text-muted-foreground mb-2">Logo actual:</p>
                <CldImage src={negocio.url_logo} width="100" height="100" alt="Logo actual" className="rounded-md object-cover" crop={{ type: "fill", source: true }} />
              </div>
            )}
            <Input id="url_logo" name="url_logo" type="file" accept="image/png, image/jpeg, image/webp" />
            <p className="text-sm text-muted-foreground">Sube un nuevo logo (Max 5MB). Si no seleccionas uno, se conservará el actual.</p>
            {state?.errors?.url_logo && (<p className="text-sm text-red-500">{state.errors.url_logo[0]}</p>)}
          </div>

          {/* --- HORARIO --- */}
          <CardTitle className="pt-4">Horario</CardTitle>
          <CardDescription>
            Define tus horas de apertura y cierre. Marca "Cerrado" si no abres.
          </CardDescription>
          <div className="space-y-4">
            <HorarioDiaInput dia="lunes" label="Lunes" defaultState={defaultHorarios.lunes} error={state?.errors?.horario_lunes_cierre} />
            <HorarioDiaInput dia="martes" label="Martes" defaultState={defaultHorarios.martes} error={state?.errors?.horario_martes_cierre} />
            <HorarioDiaInput dia="miercoles" label="Miércoles" defaultState={defaultHorarios.miercoles} error={state?.errors?.horario_miercoles_cierre} />
            <HorarioDiaInput dia="jueves" label="Jueves" defaultState={defaultHorarios.jueves} error={state?.errors?.horario_jueves_cierre} />
            <HorarioDiaInput dia="viernes" label="Viernes" defaultState={defaultHorarios.viernes} error={state?.errors?.horario_viernes_cierre} />
            <HorarioDiaInput dia="sabado" label="Sábado" defaultState={defaultHorarios.sabado} error={state?.errors?.horario_sabado_cierre} />
            <HorarioDiaInput dia="domingo" label="Domingo" defaultState={defaultHorarios.domingo} error={state?.errors?.horario_domingo_cierre} />
          </div>

          {/* --- REDES SOCIALES --- */}
          <CardTitle className="pt-4">Redes Sociales</CardTitle>
          <CardDescription>
            Añade enlaces a tus redes sociales.
          </CardDescription>
          <div className="space-y-4">
            {redes.map((red) => (
              <div key={red.id} className="flex items-center gap-3 p-3 border rounded-md">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`red_plataforma_${red.id}`} className="text-xs">Plataforma</Label>
                    <Input id={`red_plataforma_${red.id}`} placeholder="Ej: facebook" value={red.plataforma} onChange={(e) => updateRedSocial(red.id, 'plataforma', e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`red_url_${red.id}`} className="text-xs">URL</Label>
                    <Input id={`red_url_${red.id}`} type="url" placeholder="https://..." value={red.url} onChange={(e) => updateRedSocial(red.id, 'url', e.target.value)} />
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRedSocial(red.id)} aria-label="Eliminar red social">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRedSocial}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Red Social
            </Button>
            <input type="hidden" name="url_redes_sociales" value={getRedesJsonString()} />
          </div>

          {/* --- GALERÍA DE FOTOS --- */}
          <CardTitle className="pt-4">Galería de Fotos</CardTitle>
          <CardDescription>
            Sube nuevas imágenes para tu galería. Las imágenes existentes se pueden eliminar.
          </CardDescription>
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {gallery.map((url, index) => (
                <div key={index} className="relative group">
                  <CldImage src={url} width="150" height="150" alt={`Imagen de galería ${index + 1}`} className="rounded-md object-cover w-full h-full aspect-square" crop={{ type: "fill", source: true }} />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeGalleryImage(url)} aria-label="Eliminar imagen">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {gallery.length === 0 && (
            <p className="text-sm text-muted-foreground">Tu galería está vacía.</p>
          )}
          <input type="hidden" name="galeria_fotos_actuales" value={JSON.stringify(gallery)} />
          <div className="grid gap-2">
            <Label htmlFor="galeria_fotos_nuevas">Añadir nuevas imágenes</Label>
            <Input id="galeria_fotos_nuevas" name="galeria_fotos_nuevas" type="file" multiple accept="image/png, image/jpeg, image/webp" />
            {state?.errors?.galeria_fotos_nuevas && (<p className="text-sm text-red-500">{state.errors.galeria_fotos_nuevas[0]}</p>)}
          </div>
        </CardContent>

        <CardFooter className="border-t px-6 py-4 justify-end">
          {state?.errors?._form && (
            <p className="text-sm text-red-500 mr-auto">
              {state.errors._form[0]}
            </p>
          )}
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}