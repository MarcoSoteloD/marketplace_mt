"use client";

import type { vacantes } from '@prisma/client';
import Link from 'next/link';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteVacanteAction } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, DollarSign, Calendar, Phone, Mail } from 'lucide-react'; 
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Helper para formatear el precio
function formatCurrency(amount: number | null | undefined) {
  if (!amount) return null;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(amount));
}

// Helper para formatear la fecha
function formatDate(date: Date | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(date);
}

export function ListaVacantes({ vacantes }: { vacantes: vacantes[] }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (vacanteId: number) => {
    startTransition(async () => {
      const result = await deleteVacanteAction(vacanteId);
      toast({
        variant: result.success ? "success" : "destructive",
        title: result.success ? "¡Éxito!" : "Error",
        description: result.message,
      });
    });
  };

  if (vacantes.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No has publicado ninguna vacante todavía.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {vacantes.map((vacante) => (
        <li 
          key={vacante.id_vacante} 
          className="flex flex-col md:flex-row justify-between gap-4 p-4"
        >
          {/* Info Principal */}
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-lg">{vacante.titulo}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {vacante.descripcion}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {vacante.salario && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> {formatCurrency(Number(vacante.salario))}
                </span>
              )}
              {vacante.fecha_publicacion && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Publicado: {formatDate(vacante.fecha_publicacion)}
                </span>
              )}

              {vacante.contacto && (
                <span className="flex items-center gap-1">
                  {/* Detecta si es email o teléfono */}
                  {vacante.contacto.includes('@') ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  {vacante.contacto}
                </span>
              )}

            </div>
          </div>
          
          {/* Acciones y Estado */}
          <div className="flex flex-col items-start md:items-end justify-between gap-2">
            <Badge variant={vacante.activo ? "secondary" : "destructive"}>
              {vacante.activo ? "Activa" : "Inactiva"}
            </Badge>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link href={`/vacantes/editar/${vacante.id_vacante}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isPending} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminará la vacante <span className="font-bold">"{vacante.titulo}"</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <form action={() => handleDelete(vacante.id_vacante)}>
                      <Button variant="destructive" type="submit" disabled={isPending}>
                        {isPending ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}