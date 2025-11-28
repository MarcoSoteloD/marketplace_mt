import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | Manos Tonilenses",
  description: "Cómo manejamos tus datos en Manos Tonilenses.",
};

export default function PrivacidadPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-16">
      
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-stone-500 hover:text-stone-900">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-stone-700 tracking-tight">Política de Privacidad</h1>
          <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Separator />

        <div className="prose prose-stone max-w-none text-stone-700 space-y-8 leading-relaxed">
          <section>
            <p>
              En <strong>Manos Tonilenses</strong>, valoramos tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestra plataforma municipal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">1. Información que Recopilamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de Registro:</strong> Al crear una cuenta, recopilamos tu nombre, correo electrónico y contraseña (encriptada).</li>
              <li><strong>Datos de Perfil:</strong> Información opcional como tu número de teléfono para facilitar la comunicación de los pedidos.</li>
              <li><strong>Datos de Uso:</strong> Información sobre cómo interactúas con la plataforma, como los negocios que visitas y los pedidos que realizas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">2. Uso de la Información</h2>
            <p>Utilizamos tus datos exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Proveer y mantener el servicio de marketplace.</li>
              <li>Gestionar tu cuenta y pedidos.</li>
              <li>Comunicarnos contigo sobre el estado de tus compras o actualizaciones del servicio.</li>
              <li>Mejorar la oferta de negocios locales mediante estadísticas anónimas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">3. Compartir Información</h2>
            <p>
              No vendemos tus datos personales. Solo compartimos la información estrictamente necesaria con:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Negocios Locales:</strong> Al realizar un pedido, el negocio recibe tu nombre y detalles del pedido para poder atenderte.</li>
              <li><strong>Autoridades:</strong> Si es requerido por ley para cumplir con obligaciones legales del Municipio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">4. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas (como encriptación SSL y hashing de contraseñas) para proteger tu información personal contra acceso no autorizado, alteración o destrucción.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">5. Tus Derechos ARCO</h2>
            <p>
              Como ciudadano, tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (ARCO) al tratamiento de tus datos personales. Puedes ejercer estos derechos desde tu perfil de usuario o contactándonos directamente.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <h3 className="font-semibold text-stone-700 mb-2">Contacto de Privacidad</h3>
            <p className="text-sm">
              Para cualquier asunto relacionado con tus datos personales, contacta a la unidad de transparencia del Ayuntamiento:
            </p>
            <a href="mailto:transparencia@tonila.gob.mx" className="text-orange-600 font-medium hover:underline mt-2 block">
              transparencia@tonila.gob.mx
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}