// prisma/seed.ts
import { PrismaClient, rol_usuario } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma'; // Importa tu singleton

async function main() {
  console.log('Iniciando el script de seed...');
  
  // --- 1. CREAR ADMIN ---
  const adminEmail = 'admin@test.com';
  const adminPass = 'admin123';
  
  // Borrar admin si existe
  try {
    await prisma.usuarios.delete({ where: { email: adminEmail } });
    console.log('Usuario admin anterior eliminado.');
  } catch (e) { /* Ignora si no existe */ }

  // Crear admin
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
  
  
  // --- 2. CREAR GESTOR Y NEGOCIO (¡NUEVO!) ---
  const gestorEmail = 'gestor@test.com';
  const gestorPass = 'gestor123';
  const negocioSlug = 'mi-primer-negocio';

  // Borrar gestor y negocio si existen para evitar conflictos
  try {
    // Borramos el gestor (lo que debería borrar el negocio por la transacción)
    // O borramos el negocio (lo que debería borrar el gestor por 'onDelete: Cascade')
    // Para estar seguros, borramos por slug (que es 'unique')
    const existingNegocio = await prisma.negocios.findUnique({
      where: { slug: negocioSlug },
    });
    if (existingNegocio) {
      // Usamos la misma lógica transaccional de la app
      await prisma.$transaction(async (tx) => {
        await tx.usuarios.deleteMany({ where: { id_negocio: existingNegocio.id_negocio }});
        await tx.negocios.delete({ where: { id_negocio: existingNegocio.id_negocio }});
      });
      console.log('Gestor y negocio anteriores eliminados.');
    }
  } catch (e) { /* Ignora si no existe */ }

  // Crear el nuevo negocio y gestor en una transacción
  const hashedGestorPass = await bcrypt.hash(gestorPass, 12);
  
  await prisma.$transaction(async (tx) => {
    const newNegocio = await tx.negocios.create({
      data: {
        nombre: 'Mi Primer Negocio',
        slug: negocioSlug,
        activo: true,
      }
    });

    const newGestor = await tx.usuarios.create({
      data: {
        email: gestorEmail,
        nombre: 'Gestor de Negocio',
        password: hashedGestorPass,
        rol: rol_usuario.gestor,
        id_negocio: newNegocio.id_negocio, // Ligamos el negocio
        activo: true,
      }
    });
    console.log('Usuario Gestor creado:', newGestor.email);
    console.log('Negocio asociado creado:', newNegocio.nombre);
  });
  
  console.log('--- Resumen de Cuentas ---');
  console.log(`Admin: ${adminEmail} / (Pass: ${adminPass})`);
  console.log(`Gestor: ${gestorEmail} / (Pass: ${gestorPass})`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seed terminado.');
  });