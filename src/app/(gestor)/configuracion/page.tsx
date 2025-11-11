// app/(gestor)/configuracion/page.tsx
// (Este es un SERVER Component, no tiene 'use client')

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getNegocioById } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

// 1. Importa el NUEVO componente de display
import ConfigDisplay from "./ConfigDisplay"; 

// Definimos los tipos aquí también para el parseo
type Horario = Record<string, string>;
type Redes = Record<string, string>;
type Galeria = string[];

export default async function PaginaConfiguracion() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 
  
  const negocio = await getNegocioById(session.user.negocioId);
  if (!negocio) notFound();

  // --- Parseamos y preparamos los datos ---
  const direccion = [
    negocio.calle, 
    negocio.num_ext, 
    negocio.num_int ? `Int. ${negocio.num_int}` : null,
    negocio.colonia,
    negocio.cp,
    negocio.municipio,
    negocio.estado
  ].filter(Boolean).join(', ');

  const horario = (negocio.horario && typeof negocio.horario === 'object' && !Array.isArray(negocio.horario)) 
    ? negocio.horario as Horario 
    : null;
  
  const redes = (negocio.url_redes_sociales && typeof negocio.url_redes_sociales === 'object' && !Array.isArray(negocio.url_redes_sociales))
    ? negocio.url_redes_sociales as Redes
    : null;
  
  const galeria = (Array.isArray(negocio.galeria_fotos))
    ? negocio.galeria_fotos.map(String)
    : [];

  // 2. Creamos el objeto de props "plano"
  const negocioData = {
    nombre: negocio.nombre,
    activo: negocio.activo,
    url_logo: negocio.url_logo,
    slug: negocio.slug,
    descripcion: negocio.descripcion,
    telefono: negocio.telefono,
    direccion: direccion,
    horario: horario,
    redes: redes,
    galeria: galeria
  };
  
  // 3. Renderizamos el componente cliente pasándole los datos
  return <ConfigDisplay negocio={negocioData} />;
}