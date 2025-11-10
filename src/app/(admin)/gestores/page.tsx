// app/(admin)/gestores/page.tsx

import Link from 'next/link';
import { getGestoresConNegocio } from '@/lib/db'; // Importamos la nueva función
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // npx shadcn-ui@latest add badge

export default async function PaginaGestores() {

  const gestores = await getGestoresConNegocio();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Administración de Gestores</h1>
        <Button className='bg-slate-900' asChild>
          <Link href="/gestores/nuevo">
            Nuevo Gestor
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestores Registrados</CardTitle>
          <CardDescription>
            Administra los gestores y los negocios de la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gestores.length > 0 ? (
            <ul className="divide-y">
              {gestores.map((gestor) => (
                <li
                  key={gestor.id_usuario}
                  className="flex flex-col md:flex-row justify-between md:items-center gap-2 p-4"
                >
                  {/* Info del Gestor */}
                  <div>
                    <p className="font-medium">{gestor.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {gestor.email}
                    </p>
                  </div>

                  {/* Info del Negocio */}
                  <div className="flex-1 text-left md:text-right md:mr-8">
                    {gestor.negocios ? (
                      <div>
                        <p className="font-medium">{gestor.negocios.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          Slug: {gestor.negocios.slug}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="destructive">Sin negocio asignado</Badge>
                    )}
                  </div>

                  {/* Agrupamos el Estado y el Botón */}
                  <div className="flex items-center gap-3 mt-2 md:mt-0 md:ml-4">

                    {/* 1. El nuevo Badge de Estado */}
                    <Badge
                      variant={gestor.activo ? "secondary" : "destructive"}
                      className="w-20 justify-center h-8 md:mr-2"
                    >
                      {gestor.activo ? "Activo" : "Inactivo"}
                    </Badge>

                    {/* 2. El Botón de Editar */}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/gestores/editar/${gestor.id_usuario}`}>
                        Editar
                      </Link>
                    </Button>
                  </div>
                  {/* --- FIN DEL CAMBIO --- */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground">
              No hay gestores registrados todavía.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}