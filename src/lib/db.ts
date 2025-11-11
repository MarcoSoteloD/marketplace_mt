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
 * Obtiene UN negocio por su ID.
 * (Esta es la que faltaba para la página de configuración)
 */
export const getNegocioById = async (id: number) => {
  try {
    return await prisma.negocios.findUnique({
      where: { id_negocio: id },
    });
  } catch (error) {
    console.error('Error en getNegocioById:', error);
    return null;
  }
};

/**
 * Obtiene todos los productos de UN negocio específico.
 * @param negocioId - El ID del negocio del cual obtener los productos.
 */
export const getProductosByNegocioId = async (negocioId: number) => {
  try {
    return await prisma.productos.findMany({
      where: {
        id_negocio: negocioId,
      },
      include: {
        // Incluimos el modelo 'categorias_producto'
        categorias_producto: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  } catch (error) {
    console.error('Error en getProductosByNegocioId:', error);
    return [];
  }
};

/**
 * Actualiza genéricamente un negocio por su ID.
 * (Esta es la que faltaba para la Server Action)
 */
export const updateNegocio = async (id: number, data: Prisma.negociosUpdateInput) => {
  try {
    return await prisma.negocios.update({
      where: { id_negocio: id },
      data: data,
    });
  } catch (error) {
    // La Server Action se encargará de atrapar este error
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("Ese slug ya está en uso por otro negocio.");
    }
    console.error('Error en updateNegocio:', error);
    throw new Error("Error de base de datos al actualizar el negocio.");
  }
};

/**
 * -----------------------------------------------------------------
 * 📦 FUNCIONES DEL GESTOR (CATEGORÍAS DE PRODUCTOS)
 * -----------------------------------------------------------------
 */

/**
 * Obtiene todas las categorías de UN negocio específico.
 */
export const getCategoriasByNegocioId = async (negocioId: number) => {
  try {
    return await prisma.categorias_producto.findMany({
      where: {
        id_negocio: negocioId,
      },
      orderBy: [
        { orden: 'asc' }, // Ordena por el campo 'orden'
        { nombre: 'asc' }, // Luego por nombre
      ],
    });
  } catch (error) {
    console.error('Error en getCategoriasByNegocioId:', error);
    return [];
  }
};

/**
 * Crea una nueva categoría de producto para un negocio.
 */
export const createCategoriaProducto = async (data: Prisma.categorias_productoCreateInput) => {
  try {
    return await prisma.categorias_producto.create({
      data: data, // El 'id_negocio' debe venir en el objeto 'data'
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Manejamos si el nombre ya existe para ese negocio (si tuviéramos un constraint unique)
      throw new Error("Ya existe una categoría con este nombre.");
    }
    throw new Error("Error de base de datos al crear la categoría.");
  }
};

/**
 * Elimina una categoría de producto.
 * !! Requiere el negocioId para seguridad !!
 */
export const deleteCategoriaProducto = async (categoriaId: number, negocioId: number) => {
  try {
    // Esta es la clave de seguridad:
    // Solo borra si el ID de la categoría Y el ID del negocio coinciden.
    // Un gestor no puede borrar categorías de otro gestor.
    const result = await prisma.categorias_producto.deleteMany({
      where: {
        id_categoria: categoriaId,
        id_negocio: negocioId, // ¡Seguridad!
      },
    });

    if (result.count === 0) {
      throw new Error("No se encontró la categoría o no tienes permiso para eliminarla.");
    }
    return result;
  } catch (error) {
    console.error("Error en deleteCategoriaProducto:", error);
    throw new Error("Error de base de datos al eliminar.");
  }
};

/**
 * Obtiene UNA categoría de producto por su ID.
 * Requiere el negocioId para seguridad.
 */
export const getCategoriaProductoById = async (categoriaId: number, negocioId: number) => {
  try {
    return await prisma.categorias_producto.findFirst({
      where: {
        id_categoria: categoriaId,
        id_negocio: negocioId, // ¡Seguridad!
      },
    });
  } catch (error) {
    console.error('Error en getCategoriaProductoById:', error);
    return null;
  }
};

/**
 * Actualiza una categoría de producto.
 */
export const updateCategoriaProducto = async (
  categoriaId: number,
  negocioId: number,
  data: Prisma.categorias_productoUpdateInput
) => {
  try {
    const result = await prisma.categorias_producto.updateMany({
      where: {
        id_categoria: categoriaId,
        id_negocio: negocioId, // ¡Seguridad!
      },
      data: data,
    });
    if (result.count === 0) {
      throw new Error("No se encontró la categoría o no tienes permiso.");
    }
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("Ya existe una categoría con este nombre.");
    }
    throw new Error("Error de base de datos al actualizar.");
  }
};

/**
 * -----------------------------------------------------------------
 * 📦 FUNCIONES DEL GESTOR (PRODUCTOS)
 * -----------------------------------------------------------------
 */

/**
 * Crea un nuevo producto para un negocio.
 */
export const createProducto = async (data: Prisma.productosCreateInput) => {
  try {
    return await prisma.productos.create({
      data: data, // El 'id_negocio' y la conexión de categoría deben venir aquí
    });
  } catch (error) {
    console.error('Error en createProducto:', error);
    throw new Error("Error de base de datos al crear el producto.");
  }
};

/**
 * Obtiene UN producto específico por su ID.
 * (Necesario para el formulario de edición)
 */
export const getProductoById = async (productoId: number, negocioId: number) => {
  try {
    return await prisma.productos.findFirst({
      where: {
        id_producto: productoId,
        id_negocio: negocioId, // ¡Seguridad! Asegura que el gestor solo vea sus productos
      },
      include: {
        categorias_producto: true,
      },
    });
  } catch (error) {
    console.error('Error en getProductoById:', error);
    return null;
  }
};

/**
 * Actualiza un producto existente.
 */
export const updateProducto = async (
  productoId: number,
  negocioId: number,
  data: Prisma.productosUpdateInput
) => {
  try {
    // Usamos 'update' para poder modificar relaciones
    return await prisma.productos.update({
      where: {
        id_producto: productoId,
        // Y añadimos el 'id_negocio' al 'where' para seguridad.
        // Prisma solo actualizará si AMBAS condiciones se cumplen.
        id_negocio: negocioId,
      },
      data: data, // 'data' ya contiene la conexión a 'categorias_producto'
    });
  } catch (error) {
    // (Tu lógica de catch para P2002 y P2003 se queda igual)
    console.error('Error en updateProducto:', error);
    throw new Error("Error de base de datos al actualizar el producto.");
  }
};

/**
 * Elimina un producto.
 */
export const deleteProducto = async (productoId: number, negocioId: number) => {
  try {
    const result = await prisma.productos.deleteMany({
      where: {
        id_producto: productoId,
        id_negocio: negocioId, // ¡Seguridad!
      },
    });

    if (result.count === 0) {
      throw new Error("No se encontró el producto o no tienes permiso.");
    }
    return result;
  } catch (error) {
    // Manejar error si el producto está en un pedido (foreign key)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new Error("No se puede eliminar: Este producto ya está en un pedido.");
    }
    console.error('Error en deleteProducto:', error);
    throw new Error("Error de base de datos al eliminar.");
  }
};