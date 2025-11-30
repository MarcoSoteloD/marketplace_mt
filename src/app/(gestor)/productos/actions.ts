"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Prisma, tipo_promocion } from '@prisma/client'; 
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createProducto, updateProducto, deleteProducto, reactivateProducto } from '@/lib/data/products'; 
import { uploadImageToCloudinary } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const ProductoSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  descripcion: z.string().optional(),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  id_categoria: z.coerce.number().int().positive("Debes seleccionar una categoría"),
  promo_activa: z.coerce.boolean().optional(),
  tipo_promo: z.nativeEnum(tipo_promocion).optional(),
  precio_promo: z.coerce.number().min(0).optional(),
  url_foto: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE, {
      message: `La foto debe ser menor a 5MB.`
    })
    .refine((file) => !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Formato de imagen no válido."
    }),
}).refine((data) => {
  // REGLA DE NEGOCIO: Si la promo está activa, DEBE haber un precio promo definido.
  if (data.promo_activa && (data.precio_promo === undefined || data.precio_promo === null)) {
    return false;
  }
  return true;
}, {
  message: "Si activas la promoción, debes definir un precio promocional.",
  path: ["precio_promo"],
});

export type ProductoState = {
  errors?: {
    nombre?: string[];
    descripcion?: string[];
    precio?: string[];
    id_categoria?: string[];
    promo_activa?: string[];
    tipo_promo?: string[];
    precio_promo?: string[];
    url_foto?: string[];
    _form?: string[]; 
  };
  message?: string;
  success?: boolean;
} | undefined;


// --- Server Action: CREAR PRODUCTO ---
export async function createProductoAction(prevState: ProductoState, formData: FormData) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId || !session?.user?.id) {
    return { message: "Error de autenticación.", success: false };
  }
  const negocioId = session.user.negocioId;
  const gestorId = session.user.id; 

  const newFotoFile = formData.get('url_foto') as File;
  
  const parsedData = {
    nombre: formData.get('nombre') || undefined,
    descripcion: formData.get('descripcion') || undefined,
    precio: formData.get('precio') || undefined,
    id_categoria: formData.get('id_categoria') || undefined,
    promo_activa: formData.get('promo_activa') === 'on', 
    tipo_promo: formData.get('tipo_promo') as tipo_promocion || undefined,
    precio_promo: formData.get('precio_promo') || undefined,
    url_foto: (newFotoFile && newFotoFile.size > 0) ? newFotoFile : undefined,
  };

  const validatedFields = ProductoSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<ProductoState>["errors"],
      message: "Error de validación. Revisa los campos.",
      success: false,
    };
  }
  
  const { url_foto, id_categoria, ...data } = validatedFields.data;

  try {
    let newFotoUrl: string | undefined = undefined;

    if (url_foto && url_foto.size > 0) {
      newFotoUrl = await uploadImageToCloudinary(
        url_foto,
        `negocios/${gestorId}/productos`
      );
    }

    const productoData: Prisma.productosCreateInput = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: new Prisma.Decimal(data.precio),
      promo_activa: data.promo_activa || false,
      tipo_promo: data.tipo_promo || 'DESCUENTO_SIMPLE', 
      precio_promo: data.precio_promo ? new Prisma.Decimal(data.precio_promo) : null,
      url_foto: newFotoUrl,
      activo: true,
      negocios: {
        connect: { id_negocio: negocioId }
      },
      categorias_producto: {
        connect: { id_categoria: id_categoria }
      }
    };

    await createProducto(productoData);

  } catch (error) {
    return {
      errors: { _form: [(error as Error).message || 'Error de base de datos.'] },
      message: "Error al crear el producto.",
      success: false,
    };
  }

  revalidatePath('/productos');
  return {
    success: true,
    message: "Producto creado correctamente."
  };
}

// --- Server Action: ACTUALIZAR PRODUCTO ---
export async function updateProductoAction(
  productoId: number,
  prevState: ProductoState, 
  formData: FormData
) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId || !session?.user?.id) {
    return { message: "Error de autenticación.", success: false };
  }
  const negocioId = session.user.negocioId;
  const gestorId = session.user.id;

  const newFotoFile = formData.get('url_foto') as File;
  
  const parsedData = {
    nombre: formData.get('nombre') || undefined,
    descripcion: formData.get('descripcion') || undefined,
    precio: formData.get('precio') || undefined,
    id_categoria: formData.get('id_categoria') || undefined,
    promo_activa: formData.get('promo_activa') === 'on',
    tipo_promo: formData.get('tipo_promo') as tipo_promocion || undefined,
    precio_promo: formData.get('precio_promo') || undefined,

    url_foto: (newFotoFile && newFotoFile.size > 0) ? newFotoFile : undefined,
  };

  const validatedFields = ProductoSchema.safeParse(parsedData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as NonNullable<ProductoState>["errors"],
      message: "Error de validación.",
      success: false,
    };
  }
  
  const { url_foto, id_categoria, ...data } = validatedFields.data;

  try {
    const productoData: Prisma.productosUpdateInput = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: new Prisma.Decimal(data.precio),
      promo_activa: data.promo_activa,
      tipo_promo: data.tipo_promo,
      precio_promo: data.precio_promo ? new Prisma.Decimal(data.precio_promo) : null,
      categorias_producto: {
        connect: { id_categoria: id_categoria }
      }
    };

    if (url_foto && url_foto.size > 0) {
      productoData.url_foto = await uploadImageToCloudinary(
        url_foto,
        `negocios/${gestorId}/productos`
      );
    }

    await updateProducto(productoId, negocioId, productoData);

  } catch (error) {
    return {
      errors: { _form: [(error as Error).message || 'Error de base de datos.'] },
      message: "Error al actualizar el producto.",
      success: false,
    };
  }

  revalidatePath('/(gestor)/productos');
  revalidatePath(`/productos/editar/${productoId}`);
  return { message: "Producto actualizado con éxito.", success: true };
}

// --- Server Action: ELIMINAR PRODUCTO (Soft Delete) ---
export async function deleteProductoAction(productoId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { success: false, message: "No autorizado." };
  }
  const negocioId = session.user.negocioId;

  try {
    await deleteProducto(productoId, negocioId); 
    revalidatePath('/(gestor)/productos');
    return { success: true, message: "Producto desactivado." };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

// --- Server Action: REACTIVAR PRODUCTO ---
export async function reactivateProductoAction(productoId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { success: false, message: "No autorizado." };
  }
  const negocioId = session.user.negocioId;

  try {
    await reactivateProducto(productoId, negocioId); 
    revalidatePath('/(gestor)/productos');
    return { success: true, message: "Producto reactivado con éxito." };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}