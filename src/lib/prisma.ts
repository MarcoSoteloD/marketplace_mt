// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Declaramos 'prisma' en el ámbito global para que no se vea afectado 
// por el "hot-reload" de Next.js en desarrollo.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Exportamos 'prisma'. Si ya existe en global, lo reutilizamos.
// Si no, creamos un nuevo cliente.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'warn', 'error'], // Opcional: para ver queries en la terminal
  });

// En desarrollo, guardamos el cliente en 'globalThis'
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}