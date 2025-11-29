// src/lib/time-helpers.ts
import type { Prisma } from '@prisma/client';

type Horario = Record<string, string>;

// Helper para obtener el día de la semana en español (para la zona de Colima)
function getCurrentDayInColima(): keyof Horario {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    timeZone: 'America/Mexico_City', // ¡La clave!
  };
  // Usamos 'es-MX' para que nos dé "lunes", "martes", etc.
  const dayName = new Intl.DateTimeFormat('es-MX', options).format(new Date());
  
  // Convertimos a minúsculas y sin tildes para que coincida con nuestras keys JSON
  return dayName
    .toLowerCase()
    .replace('miércoles', 'miercoles')
    .replace('sábado', 'sabado') as keyof Horario;
}

// Helper para obtener la hora actual en formato HH:MM (24h)
function getCurrentTimeInColima(): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Mexico_City',
  };
  return new Intl.DateTimeFormat('en-GB', options).format(new Date()); // 'en-GB' da formato HH:MM
}

/**
 * Función principal que exportaremos.
 * Recibe el objeto 'horario' de la base de datos y determina si está abierto.
 */
export function checkOpenStatus(horario: Prisma.JsonValue | null): boolean {
  // Validar que el horario exista y sea un objeto
  if (!horario || typeof horario !== 'object' || Array.isArray(horario)) {
    return false; // Si no hay horario, está cerrado
  }

  // Obtener el día y la hora actual
  const diaActual = getCurrentDayInColima(); // ej: "viernes"
  const horaActual = getCurrentTimeInColima(); // ej: "14:30"
  
  // Obtener el string del horario para hoy
  const horarioDeHoy = (horario as Horario)[diaActual]; // ej: "09:00 - 18:00"

  // Validar el string
  if (!horarioDeHoy || horarioDeHoy.toLowerCase() === 'cerrado' || !horarioDeHoy.includes(' - ')) {
    return false; // Si dice "Cerrado" o está vacío, está cerrado
  }

  // Comparar las horas
  try {
    const [horaApertura, horaCierre] = horarioDeHoy.split(' - ');
    
    // (Asumimos que no hay horarios que crucen la medianoche, ej. 20:00-03:00)
    if (horaActual >= horaApertura && horaActual < horaCierre) {
      return true; // ¡Está Abierto!
    }
    
    return false; // Está fuera del rango

  } catch (error) {
    console.error("Error parseando el horario:", error);
    return false; // Si el formato está mal, asumimos cerrado
  }
}