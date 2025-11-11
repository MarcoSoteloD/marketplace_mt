// app/(gestor)/configuracion/editar/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getNegocioById } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm"; // El formulario que crearemos
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PaginaEditarConfiguracion() {

    const session = await getServerSession(authOptions);
    if (!session?.user?.negocioId) redirect("/login");

    const negocio = await getNegocioById(session.user.negocioId);
    if (!negocio) notFound();

    // 1. Creamos un "objeto plano" (serializable)
    const plainNegocio = {
        ...negocio,
        // 2. Convertimos los 'Decimal' a 'number' simples
        latitud: negocio.latitud ? Number(negocio.latitud) : null,
        longitud: negocio.longitud ? Number(negocio.longitud) : null,

        // 3. (Mejor práctica) Convertimos los JSON a strings
        //    Aunque Next.js suele manejarlos, es más seguro así.
        horario: JSON.stringify(negocio.horario),
        galeria_fotos: JSON.stringify(negocio.galeria_fotos),
        url_redes_sociales: JSON.stringify(negocio.url_redes_sociales),
    };

    return (
        <div className="flex flex-col min-h-screen gap-6 overflow-y-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    Editar Información del Negocio
                </h1>
                <Button variant="outline" asChild>
                    <Link href="/configuracion">← Volver (sin guardar)</Link>
                </Button>
            </div>

            <ConfigForm negocio={plainNegocio} />
        </div>
    );
}