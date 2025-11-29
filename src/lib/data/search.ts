import { prisma } from '../prisma';

/**
 * Busca negocios y productos en la plataforma.
 * @param query El término de búsqueda del usuario.
 */
export async function searchPlataforma(query: string) {
  // Buscar Negocios
  const negociosPromise = prisma.negocios.findMany({
    where: {
      activo: true, 
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        { descripcion: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id_negocio: true,
      nombre: true,
      descripcion: true, 
      url_logo: true,
      slug: true, 
      colonia: true, 
      municipio: true, 
      activo: true, 
    },
  });

  // Buscar Productos
  const productosPromise = prisma.productos.findMany({
    where: {
      negocios: {
        activo: true,
      },
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        { descripcion: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      negocios: {
        select: {
          slug: true,
          nombre: true,
        },
      },
    },
    take: 50, // Limitar resultados para no sobrecargar
  });

  // Ejecutar ambas búsquedas en paralelo
  try {
    const [negocios, productos] = await Promise.all([
      negociosPromise,
      productosPromise,
    ]);
    return { negocios, productos };
  } catch (error) {
    console.error("Error en searchPlataforma:", error);
    return { negocios: [], productos: [] };
  }
}