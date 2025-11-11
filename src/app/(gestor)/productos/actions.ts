// app/(gestor)/productos/actions.ts
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Importamos los helpers que ya tenemos
import { createProducto, getProductoById, updateProducto, deleteProducto } from '@/lib/db'; 
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// --- Esquema de Validación de Zod ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const ProductoSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  descripcion: z.string().optional(),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  id_categoria: z.coerce.number().int().positive("Debes seleccionar una categoría"),
  url_foto: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE, {
      message: `La foto debe ser menor a 5MB.`
    })
    .refine((file) => !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Formato de imagen no válido."
    }),
});

// --- Tipo de Estado del Formulario ---
export type ProductoState = {
  errors?: {
    nombre?: string[];
    descripcion?: string[];
    precio?: string[];
    id_categoria?: string[];
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
  
  // Usamos la corrección que encontramos (sacar id_categoria)
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
      ...data,
      precio: new Prisma.Decimal(data.precio),
      url_foto: newFotoUrl,
      activo: true,
      negocios: {
        connect: { id_negocio: negocioId }
      },
      categorias_producto: {
        connect: { id_categoria: id_categoria } // Usamos la variable corregida
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

  revalidatePath('/(gestor)/productos');
  redirect('/productos');
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
      ...data,
      precio: new Prisma.Decimal(data.precio),
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


// --- Server Action: ELIMINAR PRODUCTO ---
export async function deleteProductoAction(productoId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) {
    return { success: false, message: "No autorizado." };
  }
  const negocioId = session.user.negocioId;

  try {
    await deleteProducto(productoId, negocioId); 
    revalidatePath('/(gestor)/productos');
    return { success: true, message: "Producto eliminado." };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}