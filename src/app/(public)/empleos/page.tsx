import { getAllActiveVacantes } from '@/lib/data/vacancies';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CloudinaryImage from "@/components/ui/cloudinary-image"; 
import { Briefcase, DollarSign, AlertTriangle, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Helpers ---
const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 'A tratar';
  const amount = Number(value);
  if (isNaN(amount) || amount === 0) return 'A tratar';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date | string | null) => {
  if (!date) return '';
  const cleanDate = typeof date === 'string' ? new Date(date) : date;
  return format(cleanDate, "d 'de' MMM", { locale: es });
};

// Componente de Botón de Contacto
const ContactButton = ({ contacto }: { contacto: string | null | undefined }) => {
  if (!contacto) return (
    <Button disabled variant="outline" className="w-full rounded-full opacity-50">
        Sin contacto
    </Button>
  );

  const isEmail = contacto.includes('@');
  const Icon = isEmail ? Mail : Phone;
  const href = isEmail ? `mailto:${contacto}` : `tel:${contacto}`;
  const label = isEmail ? "Enviar Correo" : "Llamar ahora";

  return (
    <Button asChild className="w-full rounded-full bg-orange-600 hover:bg-orange-500 text-white gap-2 shadow-sm">
      <a href={href}>
        <Icon className="h-4 w-4" />
        {label}
      </a>
    </Button>
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
          Encuentra tu próximo trabajo en los negocios de Tonila.
        </p>
      </div>

      {/* --- Cuadrícula de Vacantes --- */}
      {vacantes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {vacantes.map((vacante) => (
            <Card 
              key={vacante.id_vacante} 
              className="group h-full flex flex-col rounded-3xl border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    {/* Info del Negocio */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border flex-shrink-0 bg-white">
                            {vacante.negocios.url_logo ? (
                                <CloudinaryImage
                                    src={vacante.negocios.url_logo}
                                    fill
                                    alt={vacante.negocios.nombre}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                    <Briefcase className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-stone-600 leading-tight">
                                {vacante.negocios.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Tonila
                            </p>
                        </div>
                    </div>
                    {/* Fecha (Badge sutil) */}
                    <Badge variant="secondary" className="bg-stone-100 text-stone-500 font-normal text-[10px]">
                        {formatDate(vacante.fecha_publicacion)}
                    </Badge>
                </div>
                
                {/* Título Grande */}
                <CardTitle className="text-xl font-bold text-stone-800 pt-2 leading-snug">
                  {vacante.titulo}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-1">
                
                {/* Badges de Info (Salario y Puesto) */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-md border-green-200 bg-green-50 text-green-700 gap-1 px-2 py-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatCurrency(Number(vacante.salario))}
                    </Badge>
                    {vacante.puesto && (
                        <Badge variant="outline" className="rounded-md border-blue-200 bg-blue-50 text-blue-700 gap-1 px-2 py-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {vacante.puesto}
                        </Badge>
                    )}
                </div>

                {/* Descripción */}
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {vacante.descripcion}
                </p>

              </CardContent>
              
              <CardFooter className="pt-0 flex flex-col gap-3">
                 <div className="w-full h-px bg-stone-100 mb-2" />
                 <ContactButton contacto={vacante.contacto} />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // --- Estado Vacío ---
        <div className="flex flex-col items-center justify-center text-center gap-4 py-16 px-4 max-w-lg mx-auto border-2 border-dashed border-stone-200 bg-stone-50/50 rounded-3xl">
          <div className="bg-white p-4 rounded-full shadow-sm mb-2">
            <AlertTriangle className="h-10 w-10 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-700">
            Sin vacantes por ahora
          </h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            No hay ofertas de empleo activas en este momento. ¡Date una vuelta más tarde!
          </p>
        </div>
      )}
    </div>
  );
}