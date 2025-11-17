// app/(gestor)/configuracion/actions.ts
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma'; // Importamos prisma solo para los tipos
import { Prisma, categorias_globales } from '@prisma/client';

// Importamos las funciones de DB
import { updateNegocio } from '@/lib/db';
// Importamos la sesión y las opciones de auth
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { uploadImageToCloudinary } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// 1. Esquema de validación con Zod (Campos del modelo 'negocios')
const NegocioConfigSchema = z.object({
  nombre: z.string().min(3, "El nombre del negocio es requerido"),
  slug: z.string()
    .min(3, "El slug es requerido")
    .regex(/^[a-z0-9-]+$/, "Slug inválido (solo minúsculas, números y guiones)"),
  descripcion: z.string().optional(),
  telefono: z.string().optional(),
  // Campos de dirección (todos opcionales)
  calle: z.string().optional(),
  num_ext: z.string().optional(),
  num_int: z.string().optional(),
  colonia: z.string().optional(),
  cp: z.string().optional(),
  municipio: z.string().optional(),
  estado: z.string().optional(),
  // Campos de Media y JSON (opcionales)
  url_logo: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE, {
      message: `El logo debe ser menor a 5MB.`
    })
    .refine((file) => !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Formato de imagen no válido (solo .jpg, .png, .webp)"
    }),
  // Para los JSON, los validamos como strings que luego parsearemos
  horario_lunes_cerrado: z.string().optional(),
  horario_lunes_apertura: z.string().optional(),
  horario_lunes_cierre: z.string().optional(),
  horario_martes_cerrado: z.string().optional(),
  horario_martes_apertura: z.string().optional(),
  horario_martes_cierre: z.string().optional(),
  horario_miercoles_cerrado: z.string().optional(),
  horario_miercoles_apertura: z.string().optional(),
  horario_miercoles_cierre: z.string().optional(),
  horario_jueves_cerrado: z.string().optional(),
  horario_jueves_apertura: z.string().optional(),
  horario_jueves_cierre: z.string().optional(),
  horario_viernes_cerrado: z.string().optional(),
  horario_viernes_apertura: z.string().optional(),
  horario_viernes_cierre: z.string().optional(),
  horario_sabado_cerrado: z.string().optional(),
  horario_sabado_apertura: z.string().optional(),
  horario_sabado_cierre: z.string().optional(),
  horario_domingo_cerrado: z.string().optional(),
  horario_domingo_apertura: z.string().optional(),
  horario_domingo_cierre: z.string().optional(),
  galeria_fotos_actuales: z.string().optional(),
  galeria_fotos_nuevas: z.array(z.instanceof(File))
    .optional()
    .refine((files) => !files || files.every(file => file.size <= MAX_FILE_SIZE), {
      message: `Cada imagen de la galería debe ser menor a 5MB.`
    })
    .refine((files) => !files || files.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)), {
      message: "Formato de imagen no válido para la galería."
    }),
  url_redes_sociales: z.string().optional(),
  // Campos de Mapa (opcionales, convertidos a Decimal)
  latitud: z.coerce.number().optional(), // z.coerce.number() convierte el string del form a número
  longitud: z.coerce.number().optional(),
  categorias_ids: z.string().optional(),
})

  // --- Validación de Horas (¡Tu idea!) ---
  .refine(data => !data.horario_lunes_apertura || !data.horario_lunes_cierre || data.horario_lunes_cierre > data.horario_lunes_apertura, {
    message: "Lunes: La hora de cierre debe ser mayor a la de apertura.", path: ["horario_lunes_cierre"],
  })
  .refine(data => !data.horario_martes_apertura || !data.horario_martes_cierre || data.horario_martes_cierre > data.horario_martes_apertura, {
    message: "Martes: La hora de cierre debe ser mayor a la de apertura.", path: ["horario_martes_cierre"],
  })
  // ... (Repetir .refine() para miércoles, jueves, viernes, sábado, domingo)
  .refine(data => !data.horario_miercoles_apertura || !data.horario_miercoles_cierre || data.horario_miercoles_cierre > data.horario_miercoles_apertura, {
    message: "Miércoles: La hora de cierre debe ser mayor a la de apertura.", path: ["horario_miercoles_cierre"],
  })
  .refine(data => !data.horario_jueves_apertura || !data.horario_jueves_cierre || data.horario_jueves_cierre > data.horario_jueves_apertura, {
    message: "Jueves: La hora de cierre debe ser mayor a la de apertura.", path: ["horario_jueves_cierre"],
  })
  .refine(data => !data.horario_viernes_apertura || !data.horario_viernes_cierre || data.horario_viernes_cierre > data.horario_viernes_apertura, {
    message: "Viernes: La hora de cierre debe ser mayor a la de apertura.", path: ["horario_viernes_cierre"],
  })
  .refine(data => !data.horario_sabado_apertura || !data.horario_sabado_cierre || data.horario_sabado_cierre > data.horario_sabado_apertura, {
    message: "Sábado: La hora de cierre debe ser mayor a la de apertura.", path: ["horario_sabado_cierre"],
  })
  .refine(data => !data.horario_domingo_apertura || !data.horario_domingo_cierre || data.horario_domingo_cierre > data.horario_domingo_apertura, {
    message: "Domingo: La hora de cierre debe ser mayor a la de apertura.", path: ["horario_domingo_cierre"],
  });



// 2. Tipo de estado para el feedback del formulario
// --- 2. Tipo de estado COMPLETO (¡Aquí está la solución que recordamos!) ---
export type ConfigNegocioState = {
  errors?: {
    nombre?: string[];
    slug?: string[];
    descripcion?: string[];
    telefono?: string[];
    calle?: string[];
    num_ext?: string[];
    num_int?: string[];
    colonia?: string[];
    cp?: string[];
    municipio?: string[];
    estado?: string[];
    url_logo?: string[];
    horario_lunes_cierre?: string[];
    horario_martes_cierre?: string[];
    horario_miercoles_cierre?: string[];
    horario_jueves_cierre?: string[];
    horario_viernes_cierre?: string[];
    horario_sabado_cierre?: string[];
    horario_domingo_cierre?: string[];
    galeria_fotos_actuales?: string[];
    galeria_fotos_nuevas?: string[];
    url_redes_sociales?: string[];
    latitud?: string[];
    longitud?: string[];
    categorias_ids?: string[];
    _form?: string[]; // Errores generales
  };
  message?: string;
  success?: boolean;
} | undefined;


// 3. La Server Action principal
export async function updateNegocioConfig(prevState: ConfigNegocioState, formData: FormData) {

  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { message: "Error de autenticación.", success: false };
  }
  const negocioId = session.user.negocioId;
  const gestorId = session.user.id;

  const newLogoFile = formData.get('url_logo') as File;
  const newGalleryFiles = formData.getAll('galeria_fotos_nuevas') as File[];

  // --- INICIO DE LA CORRECCIÓN ---
  // Convertimos 'null' a 'undefined' para que Zod (.optional()) los acepte
  const parsedData = {
    nombre: formData.get('nombre') || undefined,
    slug: formData.get('slug') || undefined,
    descripcion: formData.get('descripcion') || undefined,
    telefono: formData.get('telefono') || undefined,
    calle: formData.get('calle') || undefined,
    num_ext: formData.get('num_ext') || undefined,
    num_int: formData.get('num_int') || undefined,
    colonia: formData.get('colonia') || undefined,
    cp: formData.get('cp') || undefined,
    municipio: formData.get('municipio') || undefined,
    estado: formData.get('estado') || undefined,
    
    // Campos de horario (aquí estaba el error)
    horario_lunes_cerrado: formData.get('horario_lunes_cerrado') || undefined,
    horario_lunes_apertura: formData.get('horario_lunes_apertura') || undefined,
    horario_lunes_cierre: formData.get('horario_lunes_cierre') || undefined,
    horario_martes_cerrado: formData.get('horario_martes_cerrado') || undefined,
    horario_martes_apertura: formData.get('horario_martes_apertura') || undefined,
    horario_martes_cierre: formData.get('horario_martes_cierre') || undefined,
    horario_miercoles_cerrado: formData.get('horario_miercoles_cerrado') || undefined,
    horario_miercoles_apertura: formData.get('horario_miercoles_apertura') || undefined,
    horario_miercoles_cierre: formData.get('horario_miercoles_cierre') || undefined,
    horario_jueves_cerrado: formData.get('horario_jueves_cerrado') || undefined,
    horario_jueves_apertura: formData.get('horario_jueves_apertura') || undefined,
    horario_jueves_cierre: formData.get('horario_jueves_cierre') || undefined,
    horario_viernes_cerrado: formData.get('horario_viernes_cerrado') || undefined,
    horario_viernes_apertura: formData.get('horario_viernes_apertura') || undefined,
    horario_viernes_cierre: formData.get('horario_viernes_cierre') || undefined,
    horario_sabado_cerrado: formData.get('horario_sabado_cerrado') || undefined,
    horario_sabado_apertura: formData.get('horario_sabado_apertura') || undefined,
    horario_sabado_cierre: formData.get('horario_sabado_cierre') || undefined,
    horario_domingo_cerrado: formData.get('horario_domingo_cerrado') || undefined,
    horario_domingo_apertura: formData.get('horario_domingo_apertura') || undefined,
    horario_domingo_cierre: formData.get('horario_domingo_cierre') || undefined,
    
    // Campos JSON (string)
    url_redes_sociales: formData.get('url_redes_sociales') || undefined,
    galeria_fotos_actuales: formData.get('galeria_fotos_actuales') || undefined,
    
    // Campos numéricos
    latitud: formData.get('latitud') ? Number(formData.get('latitud')) : undefined,
    longitud: formData.get('longitud') ? Number(formData.get('longitud')) : undefined,
    
    // Campos de Archivos
    url_logo: (newLogoFile && newLogoFile.size > 0) ? newLogoFile : undefined,
    galeria_fotos_nuevas: (newGalleryFiles.length > 0 && newGalleryFiles[0].size > 0) ? newGalleryFiles : undefined,
    categorias_ids: formData.get('categorias_ids') || undefined,
  };
  // --- FIN DE LA CORRECCIÓN ---


  // --- VALIDACIÓN CON ZOD ---
  const validatedFields = NegocioConfigSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    // ... (El resto del return de error de Zod se queda igual)
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<ConfigNegocioState>["errors"],
      message: "Error de validación. Revisa los campos.",
      success: false,
    };
  }

  // ... (El resto de la función: desestructuración, parseo de JSON, lógica de horario,
  //      lógica de subida de archivos, y el try/catch de la BD se quedan exactamente igual)
  const { 
    url_logo, 
    galeria_fotos_actuales, 
    galeria_fotos_nuevas,
    horario_lunes_cerrado, horario_lunes_apertura, horario_lunes_cierre,
    horario_martes_cerrado, horario_martes_apertura, horario_martes_cierre,
    horario_miercoles_cerrado, horario_miercoles_apertura, horario_miercoles_cierre,
    horario_jueves_cerrado, horario_jueves_apertura, horario_jueves_cierre,
    horario_viernes_cerrado, horario_viernes_apertura, horario_viernes_cierre,
    horario_sabado_cerrado, horario_sabado_apertura, horario_sabado_cierre,
    horario_domingo_cerrado, horario_domingo_apertura, horario_domingo_cierre,
    categorias_ids,
    ...data 
  } = validatedFields.data;

  const parseJsonField = (jsonString: string | undefined): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput => {
    if (!jsonString || jsonString.trim() === "") return Prisma.JsonNull;
    try { return JSON.parse(jsonString); } 
    catch (e) { throw new Error(`El JSON proporcionado no es válido.`); }
  };

  const horarioData = {
    lunes: horario_lunes_cerrado === "on" ? "Cerrado" : `${horario_lunes_apertura || ''} - ${horario_lunes_cierre || ''}`,
    martes: horario_martes_cerrado === "on" ? "Cerrado" : `${horario_martes_apertura || ''} - ${horario_martes_cierre || ''}`,
    miercoles: horario_miercoles_cerrado === "on" ? "Cerrado" : `${horario_miercoles_apertura || ''} - ${horario_miercoles_cierre || ''}`,
    jueves: horario_jueves_cerrado === "on" ? "Cerrado" : `${horario_jueves_apertura || ''} - ${horario_jueves_cierre || ''}`,
    viernes: horario_viernes_cerrado === "on" ? "Cerrado" : `${horario_viernes_apertura || ''} - ${horario_viernes_cierre || ''}`,
    sabado: horario_sabado_cerrado === "on" ? "Cerrado" : `${horario_sabado_apertura || ''} - ${horario_sabado_cierre || ''}`,
    domingo: horario_domingo_cerrado === "on" ? "Cerrado" : `${horario_domingo_apertura || ''} - ${horario_domingo_cierre || ''}`,
  };

  let redesJson;
  try {
    redesJson = parseJsonField(data.url_redes_sociales);
  } catch (error) {
    return { errors: { _form: [(error as Error).message] }, message: "Error de JSON.", success: false };
  }

  const negocioData: Prisma.negociosUpdateInput = {
    ...data,
    horario: horarioData,
    url_redes_sociales: redesJson,
  };

  try {
    // Parseamos el array de IDs que viene del hidden input
    const categoriaIdsArray: number[] = categorias_ids ? JSON.parse(categorias_ids) : [];

    // Añadimos la operación anidada de M-N a 'negocioData'
    // Esto se ejecutará dentro de la misma transacción de 'update'
    negocioData.negocio_categoria = {
      deleteMany: {}, // Borra todas las relaciones existentes
      create: categoriaIdsArray.map(id_g => ({ // Crea las nuevas
        id_categoria_g: id_g,
      })),
    };

  } catch (error) {
    return { errors: { _form: ['Error al procesar las categorías.'] }, message: "Error de JSON.", success: false };
  }

  try {
    let currentGalleryUrls: string[] = [];
    if (galeria_fotos_actuales) {
      currentGalleryUrls = JSON.parse(galeria_fotos_actuales);
    }

    const newGalleryUrls: string[] = [];
    if (galeria_fotos_nuevas && galeria_fotos_nuevas.length > 0) {
      const uploadPromises = galeria_fotos_nuevas.map(file => {
        return uploadImageToCloudinary(
          file,
          `negocios/${gestorId}/galeria`
        );
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      newGalleryUrls.push(...uploadedUrls);
    }

    const finalGallery = [...currentGalleryUrls, ...newGalleryUrls];
    negocioData.galeria_fotos = finalGallery.length > 0 ? finalGallery : Prisma.JsonNull;

    if (url_logo && url_logo.size > 0) {
      const newLogoUrl = await uploadImageToCloudinary(
        url_logo,
        `negocios/${gestorId}/logos`
      );
      negocioData.url_logo = newLogoUrl;
    }

    await updateNegocio(negocioId, negocioData);

    revalidatePath('/(gestor)/configuracion');
    revalidatePath('/(gestor)/configuracion/editar');
    revalidatePath('/(public)/categorias', 'layout');

    return {
      message: "¡Configuración guardada con éxito!",
      success: true
    };

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { errors: { slug: ['Este slug ya está en uso.'] }, message: "Error al guardar.", success: false };
    }
    return {
      errors: { _form: [(error as Error).message || 'Error de base de datos.'] },
      message: "Error al guardar.", success: false,
    };
  }
}