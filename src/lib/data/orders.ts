import { estado_pedido } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Obtiene todos los pedidos de UN cliente específico,
 * incluyendo detalles profundos para el recibo digital.
 */
export const getPedidosByClienteId = async (clienteId: number) => {
  try {
    return await prisma.pedidos.findMany({
      where: {
        id_usuario: clienteId,
      },
      include: {
        // Info del Negocio
        negocios: {
          select: {
            nombre: true,
            slug: true,
            telefono: true,
            url_logo: true,
          },
        },
        // Detalle de los platillos
        detalle_pedido: {
          include: {
            productos: {
              select: {
                nombre: true,
                url_foto: true,
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
 * Obtiene los detalles de un pedido SÓLO si le pertenece al cliente.
 */
export const getPedidoDetailsByClienteId = async (pedidoId: number, clienteId: number) => {
  try {
    return await prisma.pedidos.findFirst({
      where: {
        id_pedido: pedidoId,
        id_usuario: clienteId,
      },
      include: {
        negocios: { 
          select: {
            nombre: true,
            telefono: true,
            calle: true,
            colonia: true,
            slug: true,
            url_logo: true,
          }
        },
        detalle_pedido: { 
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
 * Obtiene los 5 pedidos más recientes de TODA la plataforma.
 * Para ver el movimiento en tiempo real en el Dashboard Admin.
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
 * Obtiene todos los pedidos de UN negocio específico.
 */
export const getPedidosByNegocioId = async (negocioId: number) => {
  try {
    return await prisma.pedidos.findMany({
      where: {
        id_negocio: negocioId,
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
        fecha_hora: 'desc',
      },
    });
  } catch (error) {
    console.error('Error en getPedidosByNegocioId:', error);
    return [];
  }
};

/**
 * Obtiene los detalles completos de UN pedido específico.
 */
export const getPedidoDetailsById = async (pedidoId: number, negocioId: number) => {
  try {
    return await prisma.pedidos.findFirst({
      where: {
        id_pedido: pedidoId,
        id_negocio: negocioId,
      },
      include: {
        usuarios: {
          select: {
            nombre: true,
            email: true,
            telefono: true,
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
      fecha_hora: 'asc',
    }
  });
};

/**
 * Actualiza el ESTADO de un pedido.
 */
export const updatePedidoEstado = async (
  pedidoId: number,
  negocioId: number,
  nuevoEstado: estado_pedido
) => {
  try {
    const result = await prisma.pedidos.updateMany({
      where: {
        id_pedido: pedidoId,
        id_negocio: negocioId,
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