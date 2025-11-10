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
 * Obtiene las estadísticas principales para el Dashboard de Admin.
 * (Versión actualizada SIN 'totalGestores')
 */
export const getAdminDashboardStats = async () => {
  try {
    // Corremos las 3 consultas en paralelo
    const [
      totalNegocios,
      totalClientes,
      totalCategorias
    ] = await prisma.$transaction([
      prisma.negocios.count(),
      prisma.usuarios.count({ where: { rol: rol_usuario.cliente } }),
      prisma.categorias_globales.count()
    ]);
  
    // Devolvemos solo los 3 valores
    return { totalNegocios, totalClientes, totalCategorias };

  } catch (error) {
    console.error("Error en getAdminDashboardStats:", error);
    // Devuelve 0 en caso de error
    return { totalNegocios: 0, totalClientes: 0, totalCategorias: 0 };
  }
};

/**
 * Obtiene los 5 gestores más recientes (para el "feed" de actividad).
 */
export const getRecentGestores = async (limit: number = 5) => {
  try {
    return await prisma.usuarios.findMany({
      where: { rol: rol_usuario.gestor },
      orderBy: { fecha_registro: 'desc' }, // Ordena por fecha de registro
      take: limit, // Toma solo los 5 más nuevos
      include: { negocios: true }, // Incluye su negocio
    });
  } catch (error) {
    console.error('Error en getRecentGestores:', error);
    return [];
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
 * Obtiene un Gestor (usuario) y su Negocio asociado por el ID del Gestor.
 */
export const getGestorConNegocioById = async (gestorId: number) => {
    try {
        return await prisma.usuarios.findUnique({
            where: {
                id_usuario: gestorId,
                rol: 'gestor', // Asegurarnos de que solo traiga gestores
            },
            include: {
                negocios: true, // Incluye el negocio asociado
            },
        });
    } catch (error) {
        console.error('Error en getGestorConNegocioById:', error);
        return null;
    }
};

/**
 * Actualiza ÚNICAMENTE la información de un usuario gestor.
 */
export const updateGestorInfoInDb = async (
    gestorId: number,
    data: Prisma.usuariosUpdateInput
) => {
    try {
        return await prisma.usuarios.update({
            where: { id_usuario: gestorId },
            data: data,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error("Ese email ya está en uso por otro usuario.");
        }
        console.error("Error en updateGestorInfoInDb:", error);
        throw new Error("Error de base de datos al actualizar el gestor.");
    }
};

/**
 * Activa o Desactiva un Gestor Y su Negocio asociado.
 */
export const toggleGestorStatusInDb = async (
    gestorId: number,
    negocioId: number,
    newStatus: boolean
) => {
    // Usamos una transacción para asegurar que ambos se actualicen
    return prisma.$transaction(async (tx) => {
        // 1. Actualizar el usuario (gestor)
        await tx.usuarios.update({
            where: { id_usuario: gestorId },
            data: { activo: newStatus },
        });

        // 2. Actualizar el negocio
        await tx.negocios.update({
            where: { id_negocio: negocioId },
            data: { activo: newStatus },
        });
    });
};

/**
 * Elimina un Gestor Y su Negocio en una transacción.
 * ¡Esto eliminará también todos los productos, pedidos, etc. (por el 'onDelete: Cascade')!
 */
export const deleteGestorYNegocioInDb = async (
    gestorId: number,
    negocioId: number
) => {
    return prisma.$transaction(async (tx) => {
        // Es importante eliminar al usuario primero si hay 'foreign keys'
        // que impidan borrar el negocio mientras el usuario exista.
        await tx.usuarios.delete({
            where: { id_usuario: gestorId },
        });

        // 2. Eliminar el Negocio (dispara Cascade)
        await tx.negocios.delete({
            where: { id_negocio: negocioId },
        });
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