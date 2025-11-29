import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Obtiene todas las categorías globales de la plataforma.
 */
export const getCategoriasGlobales = async () => {
  try {
    return await prisma.categorias_globales.findMany({
      orderBy: {
        nombre: 'asc',
      },
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("Ya existe una categoría con este nombre.");
    }
    console.error("Error en createCategoriaInDb:", error);
    throw new Error("Error de base de datos al crear.");
  }
};

/**
 * Actualiza una categoría global por su ID.
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
 */
export const deleteCategoriaInDb = async (id: number) => {
  try {
    return await prisma.categorias_globales.delete({
      where: { id_categoria_g: id },
    });
  } catch (error) {
    console.error("Error en deleteCategoriaInDb:", error);
    throw new Error("Error de base de datos al eliminar.");
  }
};