// prisma/seed.ts
import { PrismaClient, rol_usuario } from '@prisma/client';
import bcrypt from 'bcrypt';

// Importamos nuestro cliente singleton
// (Asegúrate que la ruta sea correcta desde la raíz)
import { prisma } from '../src/lib/prisma'; 

async function main() {
  console.log('Iniciando el script de seed...');

  const email = 'admin@test.com';
  const nombre = 'Admin de Plataforma';
  const password = 'admin123'; // La contraseña en texto plano

  // 1. Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 12);

  // 2. Borrar al usuario si ya existe
  try {
    await prisma.usuarios.delete({
      where: { email: email },
    });
    console.log('Usuario admin anterior eliminado.');
  } catch (error) {
    // Ignora el error si el usuario no existía
  }

  // 3. Crear el nuevo usuario admin
  const adminUser = await prisma.usuarios.create({
    data: {
      email: email,
      nombre: nombre,
      password: hashedPassword,
      rol: rol_usuario.admin, // ¡Importante!
      activo: true,
      // id_negocio se deja como null (es un admin de plataforma)
    },
  });

  console.log('¡Usuario Admin creado con éxito!');
  console.log({
    id: adminUser.id_usuario,
    email: adminUser.email,
    rol: adminUser.rol,
  });
  console.log('Contraseña: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seed terminado. Desconectado de la BD.');
  });