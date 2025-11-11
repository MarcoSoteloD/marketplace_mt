// app/(gestor)/productos/actions.ts
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Importamos los helpers que ya tenemos
import { createProducto } from '@/lib/db'; 
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// --- Esquema de Validación de Zod ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const ProductoSchema = z.object({
  nombre: z.string().min(3, "El nombre es requerido"),
  descripcion: z.string().optional(),
  // Usamos 'coerce' para convertir el string del formulario a número
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
  const gestorId = session.user.id; // Para la carpeta de Cloudinary

  // Procesamos los datos manualmente (para manejar 'null' y 'File')
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
  
  const { url_foto, ...data } = validatedFields.data;

  try {
    let newFotoUrl: string | undefined = undefined;

    // 1. Subir la imagen (si existe)
    if (url_foto && url_foto.size > 0) {
      newFotoUrl = await uploadImageToCloudinary(
        url_foto,
        `negocios/${gestorId}/productos` // Carpeta: negocios/[id_gestor]/productos
      );
    }

    // 2. Preparar el objeto para Prisma
    const productoData: Prisma.productosCreateInput = {
      ...data,
      precio: new Prisma.Decimal(data.precio), // Convertimos 'number' a 'Decimal'
      url_foto: newFotoUrl,
      activo: true,
      
      // Conectar con el negocio
      negocios: {
        connect: { id_negocio: negocioId }
      },
      // Conectar con la categoría seleccionada
      categorias_producto: {
        connect: { id_categoria: data.id_categoria }
      }
    };

    // 3. Crear en la BD
    await createProducto(productoData);

  } catch (error) {
    console.error("Error en createProductoAction:", error);
    return {
      errors: { _form: [(error as Error).message || 'Error de base de datos.'] },
      message: "Error al crear el producto.",
      success: false,
    };
  }

  // 4. Éxito
  revalidatePath('/(gestor)/productos');
  redirect('/productos');
}