// src/lib/db.ts

import { Prisma, rol_usuario, estado_pedido } from '@prisma/client';
// Importamos la instancia ÚNICA de Prisma desde el archivo que creamos
import { prisma } from './prisma';

/**
 * -----------------------------------------------------------------
 * 🌎 FUNCIONES PÚBLICAS (CLIENTE)
 * -----------------------------------------------------------------
 */

/**
 * Obtiene todos los negocios que están marcados como 'activos'
 * para mostrarlos en la página principal.
 */
export const getNegociosActivos = async () => {
  try {
    return await prisma.negocios.findMany({
      where: {
        activo: true, // ¡La clave! Solo trae negocios activos
      },
      orderBy: {
        nombre: 'asc', // Orden alfabético
      },
      // (En el futuro, podríamos añadir 'include' para traer sus categorías globales)
    });
  } catch (error) {
    console.error('Error en getNegociosActivos:', error);
    return [];
  }
};

/**
 * Busca un usuario por su email.
 * (Usado para verificar duplicados en el registro)
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
 * Obtiene todos los pedidos de UN cliente específico,
 * incluyendo detalles profundos para el recibo digital (Modal).
 */
export const getPedidosByClienteId = async (clienteId: number) => {
  try {
    return await prisma.pedidos.findMany({
      where: {
        id_usuario: clienteId,
      },
      include: {
        // 1. Info del Negocio (Añadimos url_logo)
        negocios: {
          select: {
            nombre: true,
            telefono: true,
            url_logo: true, // <--- IMPORTANTE: Necesario para el header del modal
          },
        },
        // 2. Detalle de los platillos (Vital para el modal)
        detalle_pedido: {
          include: {
            productos: {
              select: {
                nombre: true,   // Qué comió
                url_foto: true, // Foto pequeñita (opcional pero se ve bien)
              },
            },
          },
        },
      },
      orderBy: {
        fecha_hora: 'desc',
      },
    });
  } catch (error) {
    console.error('Error en getPedidosByClienteId:', error);
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
        activo: true, // 1. El negocio debe estar activo
      },
      include: {
        // 2. Incluimos sus categorías
        categorias_producto: {
          where: {
            activo: true, // 3. Solo categorías activas
          },
          orderBy: {
            orden: 'asc', // (Si implementamos 'orden' después)
          },
          include: {
            // 4. Incluimos los productos de CADA categoría
            productos: {
              where: {
                activo: true, // 5. Solo productos activos
              },
              orderBy: {
                nombre: 'asc',
              },
            },
          },
        },
      },
    });
    
    // Si no encontramos el negocio (o no estaba activo), devolvemos null
    if (!negocio) {
      return null;
    }
    
    // (Opcional) Filtrar categorías que quedaron vacías
    // const negocioFiltrado = {
    //   ...negocio,
    //   categorias_producto: negocio.categorias_producto.filter(cat => cat.productos.length > 0)
    // };
    // return negocioFiltrado;
    
    return negocio;

  } catch (error) {
    console.error('Error en getNegocioPublicoBySlug:', error);
    return null;
  }
};

/**
 * Obtiene solo la información básica de un negocio por ID.
 * (Usado por la página del carrito).
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
 * Obtiene los detalles de un pedido SÓLO si le pertenece al cliente.
 * (Usado para la página de "Pedido Exitoso")
 */
export const getPedidoDetailsByClienteId = async (pedidoId: number, clienteId: number) => {
  try {
    return await prisma.pedidos.findFirst({
      where: {
        id_pedido: pedidoId,
        id_usuario: clienteId, // ¡Seguridad!
      },
      include: {
        negocios: { // El negocio al que le compró
          select: {
            nombre: true,
            telefono: true,
            calle: true,
            colonia: true,
          }
        },
        detalle_pedido: { // Los productos
          include: {
            productos: {
              select: {
                nombre: true,
              }
            }
          }
        }
      },
    });
  } catch (error) {
    console.error('Error en getPedidoDetailsByClienteId:', error);
    return null;
  }
};

/**
 * Obtiene todos los negocios activos asociados a una categoría global específica.
 * @param nombreCategoria El nombre de la categoría (ej. "Restaurantes")
 */
export async function getNegociosByCategoriaGlobal(nombreCategoria: string) {
  try {
    const negocios = await prisma.negocios.findMany({
      where: {
        // Solo mostrar negocios que estén marcados como activos
        activo: true,
        
        // Aquí filtramos por la relación en la tabla pivote
        negocio_categoria: {
          some: {
            categorias_globales: {
              // Comparamos el nombre, ignorando mayúsculas/minúsculas
              nombre: {
                equals: nombreCategoria,
                mode: 'insensitive', 
              },
            },
          },
        },
      },
      // Al no tener un 'select', Prisma trae TODOS los campos del modelo 'negocios',
      // que es lo que tu NegocioCard espera.
    });

    return negocios;
  } catch (error) {
    console.error('Error al obtener negocios por categoría:', error);
    return []; // Devolver un array vacío en caso de error
  }
}

/**
 * Obtiene todos los negocios activos, opcionalmente filtrados por categoría.
 * @param categoriaNombre (Opcional) El nombre de la categoría global.
 */
export async function getActiveNegocios(categoriaNombre?: string) {
  try {
    // Construimos el 'where' dinámicamente
    const whereClause: Prisma.negociosWhereInput = {
      activo: true, // Siempre mostrar solo negocios activos
    };

    // Si nos pasan una categoría, la añadimos al filtro
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
      // No necesitamos 'include' porque tu NegocioCard
      // (según el error que me pasaste) espera el objeto 'negocios' completo.
      // Si esto es muy pesado, podemos añadir un 'select' con todos los campos.
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
 * Obtiene TODAS las vacantes activas de TODOS los negocios activos.
 * Para la página pública de /empleos
 */
export async function getAllActiveVacantes() {
  try {
    const vacantes = await prisma.vacantes.findMany({
      where: {
        activo: true, // La vacante debe estar activa
        negocios: {  // El negocio que la publicó debe estar activo
          activo: true,
        },
      },
      include: {
        negocios: {
          select: {
            nombre: true,
            url_logo: true,
            slug: true, // Útil si queremos enlazar al negocio
          },
        },
      },
      orderBy: {
        fecha_publicacion: 'desc', // Las más nuevas primero
      },
    });
    return vacantes;
  } catch (error) {
    console.error('Error en getAllActiveVacantes:', error);
    return [];
  }
}

/**
 * Busca negocios y productos en la plataforma.
 * @param query El término de búsqueda del usuario.
 */
export async function searchPlataforma(query: string) {
  // 1. Buscar Negocios
  // Seleccionamos los campos que NegocioCard necesita
  const negociosPromise = prisma.negocios.findMany({
    where: {
      activo: true, // Solo negocios activos
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        // CORREGIDO: Buscamos en 'descripcion' en lugar de 'descripcion_corta'
        { descripcion: { contains: query, mode: "insensitive" } },
      ],
    },
    // CORREGIDO: Ajustamos el 'select' para que coincida 100% con NegocioCard
    select: {
      id_negocio: true,
      nombre: true,
      descripcion: true, // <-- CORREGIDO
      url_logo: true,
      slug: true, // <-- CORREGIDO (antes 'slug_negocio')
      colonia: true, // <-- AÑADIDO
      municipio: true, // <-- AÑADIDO
      activo: true, // <-- AÑADIDO
    },
  });

  // 2. Buscar Productos
  // Incluimos el slug y nombre del negocio al que pertenecen
  const productosPromise = prisma.productos.findMany({
    where: {
      negocios: {
        activo: true, // Solo de negocios activos
      },
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        { descripcion: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      negocios: {
        select: {
          slug: true, // Este está bien, lo usa ProductoSearchResultCard
          nombre: true,
        },
      },
    },
    take: 50, // Limitar resultados para no sobrecargar
  });

  // 3. Ejecutar ambas búsquedas en paralelo
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
 * AHORA INCLUYE: Total de ventas ($) y Total de pedidos (#).
 */
export const getAdminDashboardStats = async () => {
  try {
    // Corremos las consultas en paralelo
    const [
      totalNegocios,
      totalClientes,
      totalCategorias,
      totalPedidos,
      sumaVentas
    ] = await prisma.$transaction([
      prisma.negocios.count(),
      prisma.usuarios.count({ where: { rol: rol_usuario.cliente } }),
      prisma.categorias_globales.count(),
      prisma.pedidos.count(),
      // Suma total de todos los pedidos (Volumen bruto de mercancía)
      prisma.pedidos.aggregate({
        _sum: { total: true }
      })
    ]);

    return { 
        totalNegocios, 
        totalClientes, 
        totalCategorias, 
        totalPedidos,
        totalVentas: sumaVentas._sum.total || 0 // Si es null, devuelve 0
    };

  } catch (error) {
    console.error("Error en getAdminDashboardStats:", error);
    return { totalNegocios: 0, totalClientes: 0, totalCategorias: 0, totalPedidos: 0, totalVentas: 0 };
  }
};

/**
 * Obtiene los 5 gestores más recientes (Mantenemos tu función)
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
 * NUEVA: Obtiene los 5 pedidos más recientes de TODA la plataforma.
 * Para ver el movimiento en tiempo real.
 */
export const getRecentGlobalOrders = async (limit: number = 5) => {
  try {
    return await prisma.pedidos.findMany({
      orderBy: { fecha_hora: 'desc' },
      take: limit,
      include: {
        negocios: { select: { nombre: true, url_logo: true } },
        usuarios: { select: { nombre: true, email: true } }
      }
    });
  } catch (error) {
    console.error('Error en getRecentGlobalOrders:', error);
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
      // + AÑADE ESTE 'include'
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
 * Obtiene todos los productos de UN negocio específico.
 * Ordenados por estado (Activos primero) y luego por nombre.
 * @param negocioId - El ID del negocio del cual obtener los productos.
 */
export const getProductosByNegocioId = async (negocioId: number) => {
  try {
    return await prisma.productos.findMany({
      where: {
        id_negocio: negocioId,
        // Nota: NO filtramos activo: true aquí, porque el Gestor debe ver TODO (incluso lo eliminado)
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
        { orden: 'asc' }, // Primero por el orden manual
        { nombre: 'asc' }, // Luego alfabéticamente
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
    // Usamos $transaction para asegurar que todos los cambios de orden se apliquen o ninguno
    return await prisma.$transaction(
        items.map((item) =>
            prisma.categorias_producto.update({
                where: { 
                    id_categoria: item.id_categoria, 
                    id_negocio: negocioId // Candado de seguridad: solo si pertenece al negocio
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
 * Realiza un "Soft Delete" (desactivación) del producto.
 * Esto evita romper el historial de pedidos.
 */
export const deleteProducto = async (productoId: number, negocioId: number) => {
  try {
    // EN LUGAR DE DELETE, HACEMOS UPDATE (Soft Delete)
    // Usamos updateMany para asegurarnos de que coincida ID y Negocio (seguridad)
    const result = await prisma.productos.updateMany({
      where: {
        id_producto: productoId,
        id_negocio: negocioId, // ¡Seguridad!
      },
      data: {
        activo: false, // Lo marcamos como inactivo (eliminado lógicamente)
      }
    });

    if (result.count === 0) {
      throw new Error("No se encontró el producto o no tienes permiso.");
    }
    
    return result;
  } catch (error) {
    console.error('Error en deleteProducto (soft delete):', error);
    throw new Error("Error al desactivar el producto.");
  }
};

/**
 * Reactiva un producto previamente desactivado (Soft Delete).
 */
export const reactivateProducto = async (productoId: number, negocioId: number) => {
  try {
    const result = await prisma.productos.updateMany({
      where: {
        id_producto: productoId,
        id_negocio: negocioId, // Seguridad
      },
      data: {
        activo: true, // Lo volvemos a activar
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
 * -----------------------------------------------------------------
 * 📦 FUNCIONES DEL GESTOR (PEDIDOS)
 * -----------------------------------------------------------------
 */

/**
 * Obtiene todos los pedidos de UN negocio específico,
 * incluyendo el nombre del cliente Y los detalles/productos del pedido.
 */
export const getPedidosByNegocioId = async (negocioId: number) => {
  try {
    return await prisma.pedidos.findMany({
      where: {
        id_negocio: negocioId,
      },
      include: {
        // 1. Incluir el usuario (cliente)
        usuarios: {
          select: {
            nombre: true,
            email: true,
          }
        },
        // --- INICIO DE LA CORRECCIÓN ---
        // 2. Incluir la lista de productos del pedido
        detalle_pedido: {
          include: {
            // 3. Por cada item, incluir la info del producto
            productos: {
              select: {
                nombre: true,
                url_foto: true,
              }
            }
          }
        }
        // --- FIN DE LA CORRECCIÓN ---
      },
      orderBy: {
        fecha_hora: 'desc', // Los más nuevos primero
      },
    });
  } catch (error) {
    console.error('Error en getPedidosByNegocioId:', error);
    return [];
  }
};

/**
 * Obtiene los detalles completos de UN pedido específico.
 * Incluye el cliente y la lista de productos (detalle_pedido).
 * Requiere el negocioId para seguridad.
 */
export const getPedidoDetailsById = async (pedidoId: number, negocioId: number) => {
  try {
    return await prisma.pedidos.findFirst({
      where: {
        id_pedido: pedidoId,
        id_negocio: negocioId, // ¡Seguridad!
      },
      include: {
        // 1. Incluir el usuario (cliente)
        usuarios: {
          select: {
            nombre: true,
            email: true,
            telefono: true,
          }
        },
        // 2. Incluir la lista de productos del pedido
        detalle_pedido: {
          include: {
            // 3. Por cada item, incluir la info del producto
            productos: {
              select: {
                nombre: true,
                url_foto: true,
              }
            }
          }
        }
      },
    });
  } catch (error) {
    console.error('Error en getPedidoDetailsById:', error);
    return null;
  }
};

/**
 * Obtiene los pedidos activos para el tablero Kanban.
 * Filtra por estados relevantes y ordena por fecha (FIFO).
 */
export const getKanbanPedidos = async (negocioId: number) => {
  return await prisma.pedidos.findMany({
    where: {
      id_negocio: negocioId,
      estado: {
        in: [estado_pedido.Recibido, estado_pedido.En_Preparaci_n, estado_pedido.Listo_para_recoger]
      }
    },
    include: {
      usuarios: {
        select: {
          nombre: true,
          email: true,
        }
      },
      detalle_pedido: {
        include: {
          productos: {
            select: {
              nombre: true,
              url_foto: true,
            }
          }
        }
      }
    },
    orderBy: {
      fecha_hora: 'asc', // Los más viejos primero (FIFO)
    }
  });
};

/**
 * Actualiza el ESTADO de un pedido.
 * Requiere el negocioId para seguridad.
 */
export const updatePedidoEstado = async (
  pedidoId: number,
  negocioId: number,
  nuevoEstado: estado_pedido // Usamos el enum de Prisma
) => {
  try {
    const result = await prisma.pedidos.updateMany({
      where: {
        id_pedido: pedidoId,
        id_negocio: negocioId, // ¡Seguridad!
      },
      data: {
        estado: nuevoEstado,
      },
    });

    if (result.count === 0) {
      throw new Error("No se encontró el pedido o no tienes permiso.");
    }
    return result;
  } catch (error) {
    console.error('Error en updatePedidoEstado:', error);
    throw new Error("Error de base de datos al actualizar el estado.");
  }
};

/**
 * -----------------------------------------------------------------
 * 📦 FUNCIONES DEL GESTOR (VACANTES)
 * -----------------------------------------------------------------
 */

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
 * Obtiene UNA vacante específica (para el formulario de edición).
 */
export const getVacanteById = async (vacanteId: number, negocioId: number) => {
  try {
    return await prisma.vacantes.findFirst({
      where: {
        id_vacante: vacanteId,
        id_negocio: negocioId, // ¡Seguridad!
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
      data: data, // La 'action' se encargará de incluir la conexión al negocio
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
        id_negocio: negocioId, // ¡Seguridad!
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
        id_negocio: negocioId, // ¡Seguridad!
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

/**
 * -----------------------------------------------------------------
 * 👤 FUNCIONES DE USUARIOS (Generales)
 * -----------------------------------------------------------------
 */

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

// Helper para obtener usuario fresco (usado en PerfilPage)
export const getUsuarioById = async (id: number) => {
  try {
    return await prisma.usuarios.findUnique({
      where: { id_usuario: id },
    });
  } catch (error) {
    return null;
  }
};