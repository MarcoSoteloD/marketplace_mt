import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Obtiene TODAS las vacantes activas de TODOS los negocios activos.
 */
export async function getAllActiveVacantes() {
  try {
    const vacantes = await prisma.vacantes.findMany({
      where: {
        activo: true,
        negocios: {
          activo: true,
        },
      },
      include: {
        negocios: {
          select: {
            nombre: true,
            url_logo: true,
            slug: true, 
          },
        },
      },
      orderBy: {
        fecha_publicacion: 'desc', 
      },
    });
    return vacantes;
  } catch (error) {
    console.error('Error en getAllActiveVacantes:', error);
    return [];
  }
}

/**
 * Obtiene todas las vacantes de UN negocio específico.
 */
export const getVacantesByNegocioId = async (negocioId: number) => {
  try {
    return await prisma.vacantes.findMany({
      where: { id_negocio: negocioId },
      orderBy: { fecha_publicacion: 'desc' },
    });
  } catch (error) {
    console.error('Error en getVacantesByNegocioId:', error);
    return [];
  }
};

/**
 * Obtiene UNA vacante específica.
 */
export const getVacanteById = async (vacanteId: number, negocioId: number) => {
  try {
    return await prisma.vacantes.findFirst({
      where: {
        id_vacante: vacanteId,
        id_negocio: negocioId,
      },
    });
  } catch (error) {
    console.error('Error en getVacanteById:', error);
    return null;
  }
};

/**
 * Crea una nueva vacante para un negocio.
 */
export const createVacante = async (data: Prisma.vacantesCreateInput) => {
  try {
    return await prisma.vacantes.create({
      data: data,
    });
  } catch (error) {
    console.error('Error en createVacante:', error);
    throw new Error("Error de base de datos al crear la vacante.");
  }
};

/**
 * Actualiza una vacante existente.
 */
export const updateVacante = async (
  vacanteId: number,
  negocioId: number,
  data: Prisma.vacantesUpdateInput
) => {
  try {
    const result = await prisma.vacantes.updateMany({
      where: {
        id_vacante: vacanteId,
        id_negocio: negocioId,
      },
      data: data,
    });
    if (result.count === 0) {
      throw new Error("No se encontró la vacante o no tienes permiso.");
    }
    return result;
  } catch (error) {
    console.error('Error en updateVacante:', error);
    throw new Error("Error de base de datos al actualizar.");
  }
};

/**
 * Elimina una vacante.
 */
export const deleteVacante = async (vacanteId: number, negocioId: number) => {
  try {
    const result = await prisma.vacantes.deleteMany({
      where: {
        id_vacante: vacanteId,
        id_negocio: negocioId,
      },
    });
    if (result.count === 0) {
      throw new Error("No se encontró la vacante o no tienes permiso.");
    }
    return result;
  } catch (error) {
    console.error('Error en deleteVacante:', error);
    throw new Error("Error de base de datos al eliminar.");
  }
};