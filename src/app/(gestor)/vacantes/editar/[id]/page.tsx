// app/(gestor)/vacantes/editar/[id]/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getVacanteById } from '@/lib/data/vacancies';
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FormularioEditarVacante } from './FormularioEditarVacante';

export default async function PaginaEditarVacante({
  params 
}: { 
  params: { id: string } 
}) {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  const id = Number(params.id);
  
  // Buscamos la vacante (solo si pertenece a este negocio)
  const vacante = await getVacanteById(id, session.user.negocioId);

  // Si no existe, 404
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
        {/* Pasamos la vacante al formulario cliente */}
        <FormularioEditarVacante vacante={vacante} />
      </CardContent>
    </Card>
  );
}