// app/(gestor)/vacantes/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getVacantesByNegocioId } from '@/lib/data/vacancies';
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Importamos los componentes cliente que crearemos
import { FormularioCrearVacante } from './FormularioCrearVacante';
import { ListaVacantes } from './ListaVacantes';

export default async function PaginaVacantes() {
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.negocioId) redirect("/login"); 

  // Obtenemos las vacantes que SÓLO pertenecen a este negocio
  const vacantes = await getVacantesByNegocioId(session.user.negocioId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        Gestión de Vacantes
      </h1>
      <p className="text-muted-foreground">
        Publica las oportunidades de empleo de tu negocio.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Formulario de Creación */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Vacante</CardTitle>
              <CardDescription>
                Publica una nueva vacante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioCrearVacante />
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Lista de Vacantes */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vacantes Publicadas</CardTitle>
              <CardDescription>
                Lista de todas las vacantes de tu negocio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ListaVacantes vacantes={vacantes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}