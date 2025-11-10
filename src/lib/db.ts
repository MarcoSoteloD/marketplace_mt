// src/lib/db.ts

import { Prisma, rol_usuario } from '@prisma/client';
// Importamos la instancia ÚNICA de Prisma desde el archivo que creamos
import { prisma } from './prisma';

/**
 * -----------------------------------------------------------------
 * 🔒 FUNCIONES DEL ADMIN (PLATAFORMA)
 * -----------------------------------------------------------------
 */

/**
 * Obtiene todos los negocios registrados en la plataforma.
 * (La usaremos para la página /negocios)
 */
export const getNegocios = async () => {
    try {
        const negocios = await prisma.negocios.findMany({
            orderBy: { nombre: 'asc' },
        });
        return negocios;
    } catch (error) {
        console.error('Error en getNegocios:', error);
        return [];
    }
};

/**
 * Obtiene todas las categorías globales de la plataforma.
 * (La que acabamos de añadir para la página /categorias)
 */
export const getCategoriasGlobales = async () => {
    try {
        return await prisma.categorias_globales.findMany({
            orderBy: { nombre: 'asc' },
        });
    } catch (error) {
        console.error('Error en getCategoriasGlobales:', error);
        return [];
    }
};

/**
 * Obtiene una categoría global por su ID.
 */
export const getCategoriaGlobalById = async (id: number) => {
    try {
        return await prisma.categorias_globales.findUnique({
            where: { id_categoria_g: id },
        });
    } catch (error) {
        console.error('Error en getCategoriaGlobalById:', error);
        return null;
    }
};

/**
 * Crea una nueva categoría global.
 * (Esta es la función que faltaba)
 */
export const createCategoriaInDb = async (data: { nombre: string, descripcion?: string | null }) => {
    try {
        return await prisma.categorias_globales.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion || null,
            },
        });
    } catch (error) {
        // Manejo de errores (ej. duplicado)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error("Ya existe una categoría con este nombre.");
        }
        console.error("Error en createCategoriaInDb:", error);
        throw new Error("Error de base de datos al crear.");
    }
};

/**
 * Actualiza una categoría global por su ID.
 * (Esta es la función que faltaba)
 */
export const updateCategoriaInDb = async (id: number, data: { nombre: string, descripcion?: string | null }) => {
    try {
        return await prisma.categorias_globales.update({
            where: { id_categoria_g: id },
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion || null,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error("Ya existe otra categoría con este nombre.");
        }
        console.error("Error en updateCategoriaInDb:", error);
        throw new Error("Error de base de datos al actualizar.");
    }
};

/**
 * Elimina una categoría global por su ID.
 * (Esta es la función que faltaba)
 */
export const deleteCategoriaInDb = async (id: number) => {
    try {
        return await prisma.categorias_globales.delete({
            where: { id_categoria_g: id },
        });
    } catch (error) {
        console.error("Error en deleteCategoriaInDb:", error);
        // Podríamos chequear P2003 (foreign key constraint) si un negocio la está usando
        throw new Error("Error de base de datos al eliminar.");
    }
};

/**
 * -----------------------------------------------------------------
 * 🔒 FUNCIONES DEL ADMIN (GESTORES Y NEGOCIOS)
 * -----------------------------------------------------------------
 */

export const getGestoresConNegocio = async () => {
  try {
    const gestores = await prisma.usuarios.findMany({
      where: {
        rol: 'gestor',
      },
      include: {
        // Incluimos el modelo 'negocios' basado en la relación 
        // que definimos en el schema.prisma
        negocios: true, 
      },
      orderBy: {
        nombre: 'asc',
      },
    });
    return gestores;
  } catch (error) {
    console.error('Error en getGestoresConNegocio:', error);
    return [];
  }
};

// 2. Define el "tipo" de datos que la nueva función espera
export type CreateGestorYNegocioData = {
  gestor: {
    email: string;
    nombre: string;
    passwordHash: string; // Recibe la contraseña YA hasheada
    telefono?: string | null;
  };
  negocio: {
    nombre: string;
    slug: string;
    telefono?: string | null;
    // (Aquí puedes añadir más campos del negocio si los pides en el formulario)
  };
};

/**
 * Crea un Negocio Y un Usuario Gestor LIGADO en una sola transacción.
 */
export const createGestorYNegocioInDb = async (data: CreateGestorYNegocioData) => {
  // prisma.$transaction asegura que ambas operaciones fallen o tengan éxito juntas
  return prisma.$transaction(async (tx) => {
    
    // Paso 1: Crear el Negocio
    const newNegocio = await tx.negocios.create({
      data: {
        nombre: data.negocio.nombre,
        slug: data.negocio.slug,
        telefono: data.negocio.telefono,
        activo: true, // Lo activamos por defecto
      }
    });

    // Paso 2: Crear el Usuario (Gestor) y ligarlo al negocio
    const newGestor = await tx.usuarios.create({
      data: {
        email: data.gestor.email,
        nombre: data.gestor.nombre,
        password: data.gestor.passwordHash,
        telefono: data.gestor.telefono,
        rol: rol_usuario.gestor, // Asignamos el rol
        id_negocio: newNegocio.id_negocio, // ¡La conexión clave!
        activo: true,
      }
    });

    return { newNegocio, newGestor };
  });
};

/**
 * -----------------------------------------------------------------
 * 📦 FUNCIONES DEL GESTOR (NEGOCIO)
 * -----------------------------------------------------------------
 */

// (Estas son funciones que crearemos en la Fase 2,
//  las dejamos como plantilla)

/**
 * Obtiene todos los productos de UN negocio específico.
 * @param negocioId - El ID del negocio del cual obtener los productos.
 */
export const getProductosByNegocioId = async (negocioId: number) => {
    try {
        const productos = await prisma.productos.findMany({
            where: {
                id_negocio: negocioId,
            },
            orderBy: {
                nombre: 'asc',
            },
        });
        return productos;
    } catch (error) {
        console.error('Error en getProductosByNegocioId:', error);
        return [];
    }
};

// ... Aquí irán getPedidosByNegocioId, getVacantesByNegocioId, etc. ...