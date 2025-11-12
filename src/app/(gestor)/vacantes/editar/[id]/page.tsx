// app/(gestor)/vacantes/editar/[id]/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getVacanteById } from '@/lib/db'; // Importamos la función de DB
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
// Importamos el formulario que crearemos a continuación
import { FormularioEditarVacante } from './FormularioEditarVacante';


export default async function PaginaEditarVacante({
  params 
}: { 
  params: { id: string } 
}) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  const id = Number(params.id);
  
  // 1. Buscamos la vacante (solo si pertenece a este negocio)
  const vacante = await getVacanteById(id, session.user.negocioId);

  // 2. Si no existe, 404
  if (!vacante) {
    notFound();
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Vacante</CardTitle>
        <CardDescription>
          Modifica los detalles de la vacante.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 3. Pasamos la vacante al formulario cliente */}
        <FormularioEditarVacante vacante={vacante} />
      </CardContent>
    </Card>
  );
}