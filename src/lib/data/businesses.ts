import { Prisma, rol_usuario } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Obtiene todos los negocios que están marcados como 'activos'
 * para mostrarlos en la página principal.
 */
export const getNegociosActivos = async () => {
  try {
    return await prisma.negocios.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  } catch (error) {
    console.error('Error en getNegociosActivos:', error);
    return [];
  }
};

/**
 * Obtiene la información pública de un negocio por su SLUG.
 * Solo devuelve datos "activos".
 */
export const getNegocioPublicoBySlug = async (slug: string) => {
  try {
    const negocio = await prisma.negocios.findUnique({
      where: {
        slug: slug,
        activo: true, // El negocio debe estar activo
      },
      include: {
        // Incluimos sus categorías
        categorias_producto: {
          where: {
            activo: true, // Solo categorías activas
          },
          orderBy: {
            orden: 'asc', 
          },
          include: {
            // Incluimos los productos de CADA categoría
            productos: {
              where: {
                activo: true, // Solo productos activos
              },
              orderBy: {
                nombre: 'asc',
              },
            },
          },
        },
      },
    });
    
    if (!negocio) {
      return null;
    }
    
    return negocio;

  } catch (error) {
    console.error('Error en getNegocioPublicoBySlug:', error);
    return null;
  }
};

/**
 * Obtiene solo la información básica de un negocio por ID.
 */
export const getNegocioBasicoById = async (negocioId: number) => {
  try {
    return await prisma.negocios.findUnique({
      where: {
        id_negocio: negocioId,
        activo: true,
      },
      select: {
        nombre: true,
        slug: true,
      }
    });
  } catch (error) {
    console.error('Error en getNegocioBasicoById:', error);
    return null;
  }
};

/**
 * Obtiene todos los negocios activos asociados a una categoría global específica.
 */
export async function getNegociosByCategoriaGlobal(nombreCategoria: string) {
  try {
    const negocios = await prisma.negocios.findMany({
      where: {
        activo: true,
        negocio_categoria: {
          some: {
            categorias_globales: {
              nombre: {
                equals: nombreCategoria,
                mode: 'insensitive', 
              },
            },
          },
        },
      },
    });
    return negocios;
  } catch (error) {
    console.error('Error al obtener negocios por categoría:', error);
    return []; 
  }
}

/**
 * Obtiene todos los negocios activos, opcionalmente filtrados por categoría.
 */
export async function getActiveNegocios(categoriaNombre?: string) {
  try {
    const whereClause: Prisma.negociosWhereInput = {
      activo: true, 
    };

    if (categoriaNombre) {
      whereClause.negocio_categoria = {
        some: {
          categorias_globales: {
            nombre: {
              equals: categoriaNombre,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    const negocios = await prisma.negocios.findMany({
      where: whereClause,
      orderBy: {
        nombre: 'asc',
      },
    });

    return negocios;

  } catch (error) {
    console.error("Error en getActiveNegocios:", error);
    return [];
  }
}

/**
 * Obtiene todos los negocios registrados en la plataforma.
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

// Define el "tipo" de datos que la nueva función espera
export type CreateGestorYNegocioData = {
  gestor: {
    email: string;
    nombre: string;
    passwordHash: string;
    telefono?: string | null;
  };
  negocio: {
    nombre: string;
    slug: string;
    telefono?: string | null;
  };
};

/**
 * Crea un Negocio Y un Usuario Gestor LIGADO en una sola transacción.
 */
export const createGestorYNegocioInDb = async (data: CreateGestorYNegocioData) => {
  return prisma.$transaction(async (tx) => {

    // Crear el Negocio
    const newNegocio = await tx.negocios.create({
      data: {
        nombre: data.negocio.nombre,
        slug: data.negocio.slug,
        telefono: data.negocio.telefono,
        activo: true,
      }
    });

    // Crear el Usuario (Gestor) y ligarlo al negocio
    const newGestor = await tx.usuarios.create({
      data: {
        email: data.gestor.email,
        nombre: data.gestor.nombre,
        password: data.gestor.passwordHash,
        telefono: data.gestor.telefono,
        rol: rol_usuario.gestor,
        id_negocio: newNegocio.id_negocio,
        activo: true,
      }
    });

    return { newNegocio, newGestor };
  });
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
    // Actualizar el usuario (gestor)
    await tx.usuarios.update({
      where: { id_usuario: gestorId },
      data: { activo: newStatus },
    });

    // Actualizar el negocio
    await tx.negocios.update({
      where: { id_negocio: negocioId },
      data: { activo: newStatus },
    });
  });
};

/**
 * Elimina un Gestor Y su Negocio en una transacción.
 * Esto eliminará también todos los productos, pedidos, etc. (por el 'onDelete: Cascade')
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

    // Eliminar el Negocio (dispara Cascade)
    await tx.negocios.delete({
      where: { id_negocio: negocioId },
    });
  });
};

/**
 * Obtiene UN negocio por su ID.
 */
export const getNegocioById = async (id: number) => {
  try {
    return await prisma.negocios.findUnique({
      where: { id_negocio: id },
      include: {
        negocio_categoria: {
          select: { id_categoria_g: true }, // Solo necesitamos los IDs
        },
      },
    });
  } catch (error) {
    console.error('Error en getNegocioById:', error);
    return null;
  }
};

/**
 * Actualiza genéricamente un negocio por su ID.
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