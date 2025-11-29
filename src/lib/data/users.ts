import { Prisma, rol_usuario } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Busca un usuario por su email.
 * (Usado para verificar duplicados en el registro y en el login)
 */
export const getUserByEmail = async (email: string) => {
  try {
    return await prisma.usuarios.findUnique({
      where: { email: email },
    });
  } catch (error) {
    console.error("Error en getUserByEmail:", error);
    return null;
  }
};

/**
 * Crea un nuevo usuario con rol 'cliente'.
 */
export const createClienteUser = async (
  data: Prisma.usuariosCreateInput
) => {
  try {
    return await prisma.usuarios.create({
      data: data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // P2002 es error de 'unique constraint' (email duplicado)
      throw new Error("Este email ya está registrado.");
    }
    console.error("Error en createClienteUser:", error);
    throw new Error("Error de base de datos al crear el cliente.");
  }
};

/**
 * Obtiene los 5 gestores más recientes
 */
export const getRecentGestores = async (limit: number = 5) => {
  try {
    return await prisma.usuarios.findMany({
      where: { rol: rol_usuario.gestor },
      orderBy: { fecha_registro: 'desc' }, 
      take: limit, 
      include: { negocios: true }, 
    });
  } catch (error) {
    console.error('Error en getRecentGestores:', error);
    return [];
  }
};

/**
 * Obtiene todos los usuarios con rol 'gestor' y su negocio asociado.
 */
export const getGestoresConNegocio = async () => {
  try {
    const gestores = await prisma.usuarios.findMany({
      where: {
        rol: rol_usuario.gestor,
      },
      include: {
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

/**
 * Obtiene un Gestor (usuario) y su Negocio asociado por el ID del Gestor.
 */
export const getGestorConNegocioById = async (gestorId: number) => {
  try {
    return await prisma.usuarios.findUnique({
      where: {
        id_usuario: gestorId,
        rol: 'gestor',
      },
      include: {
        negocios: true,
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
 * Actualiza la información del perfil (nombre y teléfono) de un usuario.
 */
export const updateUsuarioPerfil = async (userId: number, data: { nombre?: string; telefono?: string | null }) => {
  try {
    return await prisma.usuarios.update({
      where: { id_usuario: userId },
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
      },
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw new Error("No se pudo actualizar el perfil.");
  }
};

/**
 * Helper para obtener usuario fresco (usado en PerfilPage)
 */
export const getUsuarioById = async (id: number) => {
  try {
    return await prisma.usuarios.findUnique({
      where: { id_usuario: id },
    });
  } catch (error) {
    return null;
  }
};