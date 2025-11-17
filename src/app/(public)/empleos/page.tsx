import { getAllActiveVacantes } from '@/lib/db';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CloudinaryImage from "@/components/ui/cloudinary-image"; 
import { Briefcase, DollarSign, AlertTriangle, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- (Helpers de formato se quedan igual) ---
const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 'No especificado';
  const amount = Number(value);
  if (isNaN(amount)) return 'No especificado';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

const formatDate = (date: Date | string | null) => {
  if (!date) return '';
  const cleanDate = typeof date === 'string' ? new Date(date) : date;
  return format(cleanDate, "d 'de' MMMM, yyyy", { locale: es });
};

const ContactInfo = ({ contacto }: { contacto: string | null | undefined }) => {
  if (!contacto) return null;
  const isEmail = contacto.includes('@');
  const Icon = isEmail ? Mail : Phone;
  const href = isEmail ? `mailto:${contacto}` : `tel:${contacto}`;
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium pt-2">
      <Icon className="h-4 w-4" />
      <a href={href} className="hover:underline">
        {contacto}
      </a>
    </div>
  );
};

export default async function PaginaEmpleos() {
  
  const vacantes = await getAllActiveVacantes();

  return (
    <div className="container py-12 md:py-16">
      
      {/* --- Encabezado --- */}
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl md:text-5xl text-stone-700 font-bold tracking-tight">
          Bolsa de Empleo
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mt-4">
          Encuentra oportunidades laborales en nuestros negocios de Tonila.
        </p>
      </div>

      {/* --- Cuadrícula de Vacantes --- */}
      {vacantes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {vacantes.map((vacante) => (
            <Card 
              key={vacante.id_vacante} 
              className="h-full flex flex-col rounded-3xl"
            >
              <CardHeader className="flex flex-row items-start gap-4">
                
                {/* --- AQUÍ ESTÁ LA CORRECCIÓN --- */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border flex-shrink-0">
                  {vacante.negocios.url_logo ? (
                    <CloudinaryImage
                      src={vacante.negocios.url_logo} // Ahora SÓLO se llama si existe
                      fill
                      alt={`Logo de ${vacante.negocios.nombre}`}
                      className="object-cover"
                    />
                  ) : (
                    // Fallback de UI (un div con un ícono)
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      {/* Reutilizamos el ícono 'Briefcase' que ya está importado */}
                      <Briefcase className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                {/* --- FIN DE LA CORRECCIÓN --- */}

                <div className="flex-1">
                  <CardTitle className="text-lg text-stone-700">
                    {vacante.titulo}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {vacante.negocios.nombre}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 flex-1">
                {/* Puesto */}
                {vacante.puesto && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{vacante.puesto}</span>
                  </div>
                )}
                {/* Salario */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatCurrency(Number(vacante.salario))}</span>
                </div>
                
                {/* --- CAMPO DE CONTACTO --- */}
                <ContactInfo contacto={vacante.contacto} />

              </CardContent>
              
              <CardFooter className="text-xs text-muted-foreground justify-end">
                Publicado: {formatDate(vacante.fecha_publicacion)}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // --- Estado Vacío ---
        <div className="flex flex-col items-center justify-center text-center gap-4 py-16 max-w-lg mx-auto border bg-background rounded-lg shadow-sm">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-stone-700">
            Sin Empleos Disponibles
          </h2>
          <p className="text-muted-foreground">
            No hay vacantes activas en este momento. Vuelve a intentarlo más tarde.
          </p>
        </div>
      )}
    </div>
  );
}