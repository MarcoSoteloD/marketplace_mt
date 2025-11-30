import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getNegocioById } from "@/lib/data/businesses";
import { getCategoriasGlobales } from "@/lib/data/global-categories"; 
import { notFound, redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm";
import type { negocios as PrismaNegocios } from '@prisma/client';

type PlainNegocio = Omit<PrismaNegocios, 'latitud' | 'longitud' | 'horario' | 'galeria_fotos' | 'url_redes_sociales'> & {
    latitud: number | null;
    longitud: number | null;
    horario: string | null;
    galeria_fotos: string | null;
    url_redes_sociales: string | null;
};

export default async function PaginaEditarConfiguracion() {

  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login");

  const negocio = await getNegocioById(session.user.negocioId);
  if (!negocio) notFound();

  const todasLasCategorias = await getCategoriasGlobales();

  // Obtenemos los IDs y luego usamos destructuración inteligente
  const plainCategoriasActualesIds = negocio.negocio_categoria.map(
    (nc) => nc.id_categoria_g
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { negocio_categoria, ...datosNegocio } = negocio;

  // Creamos un "objeto plano" (serializable)
  const plainNegocio: PlainNegocio = {
      ...datosNegocio,
      latitud: negocio.latitud ? Number(negocio.latitud) : null,
      longitud: negocio.longitud ? Number(negocio.longitud) : null,
      horario: negocio.horario ? JSON.stringify(negocio.horario) : null,
      galeria_fotos: negocio.galeria_fotos ? JSON.stringify(negocio.galeria_fotos) : null,
      url_redes_sociales: negocio.url_redes_sociales ? JSON.stringify(negocio.url_redes_sociales) : null,
  };

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