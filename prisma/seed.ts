// 1. Importamos el Cliente de Prisma y los tipos
import { PrismaClient, rol_usuario, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

// 2. Creamos una NUEVA instancia de Prisma, solo para este script
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el script de seed...');
  
  // --- 1. LIMPIEZA ---
  console.log('Limpiando datos antiguos...');
  try {
    await prisma.detalle_pedido.deleteMany();
    await prisma.pedidos.deleteMany();
    await prisma.productos.deleteMany();
    await prisma.categorias_producto.deleteMany();
    await prisma.usuarios.deleteMany({ where: { rol: { not: 'admin' } } }); 
    await prisma.negocios.deleteMany();
    await prisma.usuarios.deleteMany({ where: { email: 'admin@test.com' } });
  } catch (e) {
    console.warn('No se pudieron limpiar todos los datos (puede ser la primera ejecución).');
  }

  // --- 2. CREAR ADMIN (Fuera de la transacción) ---
  const adminEmail = 'admin@test.com';
  const adminPass = 'admin123';
  const hashedAdminPass = await bcrypt.hash(adminPass, 12);
  const adminUser = await prisma.usuarios.create({
    data: {
      email: adminEmail,
      nombre: 'Admin de Plataforma',
      password: hashedAdminPass,
      rol: rol_usuario.admin,
      activo: true,
    },
  });
  console.log('Usuario Admin creado:', adminUser.email);
  
  // --- 3. INICIAR TRANSACCIÓN PRINCIPAL ---
  console.log('Iniciando transacción para datos de prueba...');
  
  try {
    await prisma.$transaction(async (tx) => {
      
      // --- 3a. CREAR GESTOR Y NEGOCIO ---
      const gestorEmail = 'gestor@test.com';
      const gestorPass = 'gestor123';
      const negocioSlug = 'mi-primer-negocio';
      const hashedGestorPass = await bcrypt.hash(gestorPass, 12);
      
      const newNegocio = await tx.negocios.create({
        data: {
          nombre: 'Mi Primer Negocio',
          slug: negocioSlug,
          activo: true,
          descripcion: 'El mejor negocio de prueba.',
          telefono: '3121234567',
          calle: 'Av. Siempre Viva 123',
          colonia: 'Centro',
          municipio: 'Colima', // (Cambiado de 'Tonila' para el ejemplo)
          estado: 'Colima',
          cp: '28000',
        }
      });

      const newGestor = await tx.usuarios.create({
        data: {
          email: gestorEmail,
          nombre: 'Gestor de Negocio',
          password: hashedGestorPass,
          rol: rol_usuario.gestor,
          id_negocio: newNegocio.id_negocio,
          activo: true,
        }
      });
      console.log('Usuario Gestor creado:', newGestor.email);

      // --- 3b. CREAR CATEGORÍA Y PRODUCTO DE PRUEBA ---
      const categoriaPrueba = await tx.categorias_producto.create({
        data: {
          nombre: 'Bebidas',
          id_negocio: newNegocio.id_negocio,
        }
      });

      const productoPrueba = await tx.productos.create({
        data: {
          nombre: 'Agua de Horchata (Prueba)',
          precio: new Prisma.Decimal(25.00),
          id_negocio: newNegocio.id_negocio,
          id_categoria: categoriaPrueba.id_categoria,
        }
      });
      console.log('Producto de prueba creado:', productoPrueba.nombre);

      // --- 3c. CREAR CLIENTE DE PRUEBA ---
      const clienteEmail = 'cliente@test.com';
      const clientePass = 'cliente123';
      const hashedClientePass = await bcrypt.hash(clientePass, 12);
      const clienteUser = await tx.usuarios.create({
        data: {
          email: clienteEmail,
          nombre: 'Cliente de Prueba',
          password: hashedClientePass,
          rol: rol_usuario.cliente,
          activo: true,
        }
      });
      console.log('Usuario Cliente creado:', clienteUser.email);

      // --- 3d. CREAR PEDIDO DE PRUEBA ---
      const pedidoPrueba = await tx.pedidos.create({
        data: {
          id_usuario: clienteUser.id_usuario,
          id_negocio: newNegocio.id_negocio,
          estado: 'Recibido',
          total: new Prisma.Decimal(50.00),
          metodo_pago: 'efectivo',
        }
      });

      // --- 3e. CREAR DETALLE DE PEDIDO ---
      await tx.detalle_pedido.create({
        data: {
          id_pedido: pedidoPrueba.id_pedido,
          id_producto: productoPrueba.id_producto,
          cantidad: 2,
          precio_unitario: new Prisma.Decimal(25.00),
          comentarios: 'Con mucho hielo, por favor.'
        }
      });
      console.log('Pedido de prueba creado con ID:', pedidoPrueba.id_pedido);
    }); // <-- Fin de la transacción

    console.log('--- Resumen de Cuentas ---');
    console.log(`Admin: ${adminEmail} / (Pass: ${adminPass})`);
    console.log(`Gestor: gestor@test.com / (Pass: gestor123)`);
    console.log(`Cliente: cliente@test.com / (Pass: cliente123)`);

  } catch (error) {
    console.error("Falló la transacción del seed:", error);
    process.exit(1);
  }
}

// 3. Esta es tu lógica exacta, que está perfecta
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 4. Cerramos la conexión LOCAL que abrimos
    await prisma.$disconnect();
    console.log('Seed terminado.');
  });