import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Obtiene todos los productos de UN negocio específico.
 * Ordenados por estado (Activos primero) y luego por nombre.
 * @param negocioId - El ID del negocio del cual obtener los productos.
 */
export const getProductosByNegocioId = async (negocioId: number) => {
  try {
    return await prisma.productos.findMany({
      where: {
        id_negocio: negocioId,
        // No filtramos activo: true aquí, porque el Gestor debe ver TODO (incluso lo eliminado)
      },
      include: {
        categorias_producto: true,
      },
      orderBy: [
        { activo: 'desc' }, // true (Activos) primero, false (Inactivos) al final
        { nombre: 'asc' },  // Alfabéticamente
      ],
    });
  } catch (error) {
    console.error('Error en getProductosByNegocioId:', error);
    return [];
  }
};

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
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
    });
  } catch (error) {
    console.error('Error en getCategoriasByNegocioId:', error);
    return [];
  }
};

/**
 * Reordena las categorías en una transacción atómica.
 * Esta función recibe el array de cambios y los aplica todos juntos.
 */
export const reorderCategorias = async (items: { id_categoria: number; orden: number }[], negocioId: number) => {
    return await prisma.$transaction(
        items.map((item) =>
            prisma.categorias_producto.update({
                where: { 
                    id_categoria: item.id_categoria, 
                    id_negocio: negocioId
                },
                data: { orden: item.orden },
            })
        )
    );
};

/**
 * Crea una nueva categoría de producto para un negocio.
 */
export const createCategoriaProducto = async (data: Prisma.categorias_productoCreateInput) => {
  try {
    return await prisma.categorias_producto.create({
      data: data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error("Ya existe una categoría con este nombre.");
    }
    throw new Error("Error de base de datos al crear la categoría.");
  }
};

/**
 * Elimina una categoría de producto.
 * Requiere el negocioId para seguridad
 */
export const deleteCategoriaProducto = async (categoriaId: number, negocioId: number) => {
  try {
    const result = await prisma.categorias_producto.deleteMany({
      where: {
        id_categoria: categoriaId,
        id_negocio: negocioId,
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
        id_negocio: negocioId,
      },
    });
  } catch (error) {
    console.error('Error en getCategoriaProductoById:', error);
    return null;
  }
};

/**
 * Crea un nuevo producto para un negocio.
 */
export const createProducto = async (data: Prisma.productosCreateInput) => {
  try {
    return await prisma.productos.create({
      data: data, 
    });
  } catch (error) {
    console.error('Error en createProducto:', error);
    throw new Error("Error de base de datos al crear el producto.");
  }
};

/**
 * Obtiene UN producto específico por su ID.
 * Incluye validación de seguridad por negocioId.
 */
export const getProductoById = async (productoId: number, negocioId: number) => {
  try {
    return await prisma.productos.findFirst({
      where: {
        id_producto: productoId,
        id_negocio: negocioId,
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
    // Verificación de seguridad: ¿El producto pertenece al negocio?
    const producto = await prisma.productos.findFirst({
        where: { id_producto: productoId, id_negocio: negocioId }
    });

    if (!producto) {
        throw new Error("No se encontró el producto o no tienes permiso.");
    }

    // Actualización segura por ID
    return await prisma.productos.update({
      where: { id_producto: productoId },
      data: data,
    });
  } catch (error) {
    console.error('Error en updateProducto:', error);
    throw new Error("Error de base de datos al actualizar el producto.");
  }
};

/**
 * Realiza un "Soft Delete" (desactivación) del producto.
 */
export const deleteProducto = async (productoId: number, negocioId: number) => {
  try {
    const result = await prisma.productos.updateMany({
      where: {
        id_producto: productoId,
        id_negocio: negocioId,
      },
      data: {
        activo: false,
      }
    });

    if (result.count === 0) {
      throw new Error("No se encontró el producto o no tienes permiso.");
    }
    
    return result;
  } catch (error) {
    console.error('Error en deleteProducto:', error);
    throw new Error("Error al desactivar el producto.");
  }
};

/**
 * Reactiva un producto previamente desactivado.
 */
export const reactivateProducto = async (productoId: number, negocioId: number) => {
  try {
    const result = await prisma.productos.updateMany({
      where: {
        id_producto: productoId,
        id_negocio: negocioId,
      },
      data: {
        activo: true,
      }
    });

    if (result.count === 0) {
      throw new Error("No se encontró el producto o no tienes permiso.");
    }
    
    return result;
  } catch (error) {
    console.error('Error en reactivateProducto:', error);
    throw new Error("Error al reactivar el producto.");
  }
};

/**
 * Actualiza una categoría existente.
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
        id_negocio: negocioId,
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