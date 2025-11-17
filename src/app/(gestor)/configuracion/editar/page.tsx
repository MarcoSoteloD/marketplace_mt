// En: app/(gestor)/configuracion/editar/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// + AÑADIR 'getCategoriasGlobales'
import { getNegocioById, getCategoriasGlobales } from "@/lib/db"; 
import { notFound, redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PaginaEditarConfiguracion() {

  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login");

  const negocio = await getNegocioById(session.user.negocioId);
  if (!negocio) notFound();

  // + AÑADIMOS LA CARGA DE TODAS LAS CATEGORÍAS
  const todasLasCategorias = await getCategoriasGlobales();

  // + PROCESAMOS LAS CATEGORÍAS ACTUALES DEL NEGOCIO (gracias al 'include' del paso 1)
  const plainCategoriasActualesIds = negocio.negocio_categoria.map(
    (nc) => nc.id_categoria_g
  );

  // 1. Creamos un "objeto plano" (serializable)
  const plainNegocio = {
      ...negocio,
      // 2. Convertimos los 'Decimal' a 'number' simples
      latitud: negocio.latitud ? Number(negocio.latitud) : null,
      longitud: negocio.longitud ? Number(negocio.longitud) : null,
      // 3. Convertimos los JSON a strings
      horario: JSON.stringify(negocio.horario),
      galeria_fotos: JSON.stringify(negocio.galeria_fotos),
      url_redes_sociales: JSON.stringify(negocio.url_redes_sociales),
      
      // - (La propiedad 'negocio_categoria' no se pasa, 
      // - ya la procesamos en 'plainCategoriasActualesIds')
  };
  // @ts-ignore - 'negocio_categoria' no existe en el tipo 'plainNegocio', lo cual es correcto
  delete plainNegocio.negocio_categoria; 

  return (
      <div className="flex flex-col min-h-screen gap-6 overflow-y-auto">
          {/* ... (tu encabezado 'Editar Información') ... */}

          {/* + ACTUALIZAMOS LOS PROPS DEL FORMULARIO */}
          <ConfigForm 
            negocio={plainNegocio} 
            categoriasGlobales={todasLasCategorias}
            categoriasActualesIds={plainCategoriasActualesIds}
          />
      </div>
  );
}