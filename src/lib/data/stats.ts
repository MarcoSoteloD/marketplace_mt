import { rol_usuario } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Obtiene las estadísticas principales para el Dashboard de Admin.
 * Incluye: Total de ventas ($) y Total de pedidos (#).
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