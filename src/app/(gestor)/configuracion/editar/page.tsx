// En: app/(gestor)/configuracion/editar/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getNegocioById, getCategoriasGlobales } from "@/lib/db"; 
import { notFound, redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm";

export default async function PaginaEditarConfiguracion() {

  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login");

  const negocio = await getNegocioById(session.user.negocioId);
  if (!negocio) notFound();

  const todasLasCategorias = await getCategoriasGlobales();

  // + PROCESAMOS LAS CATEGORÍAS ACTUALES DEL NEGOCIO
  const plainCategoriasActualesIds = negocio.negocio_categoria.map(
    (nc) => nc.id_categoria_g
  );

  // Creamos un "objeto plano" (serializable)
  const plainNegocio = {
      ...negocio,
      // Convertimos los 'Decimal' a 'number' simples
      latitud: negocio.latitud ? Number(negocio.latitud) : null,
      longitud: negocio.longitud ? Number(negocio.longitud) : null,
      // Convertimos los JSON a strings
      horario: JSON.stringify(negocio.horario),
      galeria_fotos: JSON.stringify(negocio.galeria_fotos),
      url_redes_sociales: JSON.stringify(negocio.url_redes_sociales),
  };
  // @ts-ignore - 'negocio_categoria' no existe en el tipo 'plainNegocio', lo cual es correcto
  delete plainNegocio.negocio_categoria; 

  return (
      <div className="flex flex-col min-h-screen gap-6 overflow-y-auto">
          <ConfigForm 
            negocio={plainNegocio} 
            categoriasGlobales={todasLasCategorias}
            categoriasActualesIds={plainCategoriasActualesIds}
          />
      </div>
  );
}