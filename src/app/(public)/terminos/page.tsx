import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Términos de Servicio | Manos Tonilenses",
  description: "Condiciones de uso para la plataforma Manos Tonilenses.",
};

export default function TerminosPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-16">
      
      {/* Botón de regreso */}
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-stone-500 hover:text-stone-900">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-stone-700 tracking-tight">Términos de Servicio</h1>
          <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Separator />

        <div className="prose prose-stone max-w-none text-stone-700 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">1. Aceptación de los Términos</h2>
            <p>
              Bienvenido a <strong>Manos Tonilenses</strong>. Al acceder y utilizar nuestra plataforma, aceptas cumplir con estos Términos de Servicio. 
              Esta plataforma es una iniciativa del <strong>H. Ayuntamiento de Tonila</strong> para fomentar el comercio local. Si no estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">2. Uso de la Plataforma</h2>
            <p>
              Nuestra plataforma actúa como un intermediario digital para conectar a negocios locales con consumidores. 
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Debes tener al menos 18 años para registrarte como Gestor de Negocio.</li>
              <li>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</li>
              <li>Te comprometes a proporcionar información veraz y actualizada.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">3. Pedidos y Pagos</h2>
            <p>
              Manos Tonilenses facilita la comunicación del pedido, pero la transacción final y el pago se realizan directamente entre el Cliente y el Negocio (pago contra entrega o en local), salvo que se indique lo contrario.
            </p>
            <p className="mt-2">
              El Ayuntamiento no se hace responsable por la calidad de los productos, tiempos de entrega o disputas monetarias entre las partes, aunque actuará como mediador en casos necesarios para mantener la calidad del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">4. Propiedad Intelectual</h2>
            <p>
              El contenido, características y funcionalidad de la plataforma son propiedad exclusiva del Gobierno Municipal de Tonila y están protegidos por leyes de derechos de autor. Las marcas y logos de los negocios pertenecen a sus respectivos dueños.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">5. Cancelación y Suspensión</h2>
            <p>
              Nos reservamos el derecho de suspender o cancelar tu cuenta inmediatamente, sin previo aviso, si violas estos Términos (ej. publicaciones ofensivas, fraude, o mal uso del sistema).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-700 mb-3">6. Cambios en los Términos</h2>
            <p>
              Podemos actualizar estos términos periódicamente. Te notificaremos de cualquier cambio publicando los nuevos términos en esta página.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <h3 className="font-semibold text-stone-700 mb-2">¿Tienes dudas?</h3>
            <p className="text-sm">
              Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en:
            </p>
            <a href="mailto:contacto@tonila.gob.mx" className="text-orange-600 font-medium hover:underline mt-2 block">
              contacto@tonila.gob.mx
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}